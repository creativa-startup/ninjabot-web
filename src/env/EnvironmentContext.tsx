import { createContext, useContext, useState, useCallback, createElement, type ReactNode } from 'react';

export type AppEnvironment = 'sandbox' | 'production';

const STORAGE_KEY = 'ninjabot-environment';

interface EnvironmentContextValue {
  environment: AppEnvironment;
  setEnvironment: (env: AppEnvironment) => void;
  toggleEnvironment: () => void;
}

const EnvironmentContext = createContext(undefined as EnvironmentContextValue | undefined);

function getInitialEnvironment(): AppEnvironment {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'sandbox' || stored === 'production' ? stored : 'production';
}

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [environment, setEnvironmentState] = useState(getInitialEnvironment);

  const setEnvironment = useCallback((env: AppEnvironment) => {
    localStorage.setItem(STORAGE_KEY, env);
    setEnvironmentState(env);
  }, []);

  const toggleEnvironment = useCallback(() => {
    setEnvironmentState((prev) => {
      const next = prev === 'sandbox' ? 'production' : 'sandbox';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return createElement(
    EnvironmentContext.Provider,
    { value: { environment, setEnvironment, toggleEnvironment } },
    children
  );
}

export function useEnvironment(): EnvironmentContextValue {
  const ctx = useContext(EnvironmentContext);
  if (!ctx) {
    throw new Error('useEnvironment debe usarse dentro de EnvironmentProvider');
  }
  return ctx;
}
