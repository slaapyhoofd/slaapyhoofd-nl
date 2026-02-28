const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const config = {
  apiBaseUrl: API_BASE_URL,
  postsPerPage: 10,
  siteName: 'Slaapyhoofd',
  siteDescription:
    'Blog about programming, LEGO, traveling, DIY, Home Assistant, home lab, and green energy',
  defaultAuthor: 'Admin',
} as const;
