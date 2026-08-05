import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { EnvironmentProvider } from './env/EnvironmentContext';
import { EnvironmentToggle } from './components/layout/EnvironmentToggle';
import { ThemeProvider } from './theme/ThemeContext';

// El toggle SANDBOX/PROD es una herramienta SOLO de desarrollo.
// Con import.meta.env.DEV se elimina del bundle de producción/Firebase.
const isDev = import.meta.env.DEV;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <EnvironmentProvider>
        <App />
        {isDev && <EnvironmentToggle />}
      </EnvironmentProvider>
    </ThemeProvider>
  </StrictMode>,
)