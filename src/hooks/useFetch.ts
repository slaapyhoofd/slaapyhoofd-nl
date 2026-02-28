import { useState, useEffect, useEffectEvent } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

interface UseFetchResult<T> extends FetchState<T> {
  refetch: () => void;
}

function useFetch<T>(url: string, options?: RequestInit): UseFetchResult<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: '',
  });
  const [refetchKey, setRefetchKey] = useState(0);

  // useEffectEvent: captures latest setState without being a reactive dependency.
  // This prevents stale-closure issues without adding setState to the effect deps.
  const onFetched = useEffectEvent((data: T) => {
    setState({ data, loading: false, error: '' });
  });

  const onError = useEffectEvent((message: string) => {
    setState({ data: null, loading: false, error: message });
  });

  useEffect(() => {
    // AbortController cleanly cancels in-flight requests on url change or unmount
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: '' }));

    (async () => {
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const json: T = await response.json();
        onFetched(json);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        onError(err instanceof Error ? err.message : 'An error occurred');
      }
    })();

    return () => controller.abort();
  }, [url, refetchKey]); // options intentionally omitted — treat as stable at call site

  return { ...state, refetch: () => setRefetchKey((k) => k + 1) };
}

export { useFetch };
