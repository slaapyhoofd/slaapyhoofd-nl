import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface CategoriesContextValue {
  categories: string[];
  selectedCategory: string;
  setCategories: (cats: string[]) => void;
  setSelectedCategory: (cat: string) => void;
  years: number[];
  selectedYear: number | null;
  setYears: (years: number[]) => void;
  setSelectedYear: (year: number | null) => void;
  availableMonths: number[];
  selectedMonth: number | null;
  setAvailableMonths: (months: number[]) => void;
  setSelectedMonth: (month: number | null) => void;
}

const CategoriesContext = createContext<CategoriesContextValue>({
  categories: [],
  selectedCategory: 'all',
  setCategories: () => {},
  setSelectedCategory: () => {},
  years: [],
  selectedYear: null,
  setYears: () => {},
  setSelectedYear: () => {},
  availableMonths: [],
  selectedMonth: null,
  setAvailableMonths: () => {},
  setSelectedMonth: () => {},
});

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [availableMonths, setAvailableMonths] = useState<number[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  return (
    <CategoriesContext
      value={{
        categories,
        selectedCategory,
        setCategories,
        setSelectedCategory,
        years,
        selectedYear,
        setYears,
        setSelectedYear,
        availableMonths,
        selectedMonth,
        setAvailableMonths,
        setSelectedMonth,
      }}
    >
      {children}
    </CategoriesContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCategories() {
  return useContext(CategoriesContext);
}
