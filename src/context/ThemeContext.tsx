'use client'
import React, { createContext, useState, useEffect, useContext } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Crear un contexto con valores predeterminados
const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  // Efecto para cargar el tema inicial
  useEffect(() => {
    // Evitar ejecución durante SSR
    if (typeof window === 'undefined') return;
    
    // Check if user has a saved theme preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    // Set theme based on saved preference or use dark as default
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    } else {
      // Comprobar preferencia del sistema si no hay tema guardado
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemPrefersDark ? 'dark' : 'light');
    }
    
    setMounted(true);
  }, []);

  // Efecto para aplicar el tema al DOM
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    // Aplicar el tema utilizando data-attribute en lugar de class
    document.documentElement.setAttribute('data-theme', theme);
    
    // También aplicar la clase 'dark' para compatibilidad con Tailwind
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Guardar preferencia de tema
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Valor del contexto
  const contextValue = {
    theme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
