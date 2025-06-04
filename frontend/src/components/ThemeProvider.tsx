import { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProviderProps, ThemeContextType, Theme } from '../types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>('light'); // light, dark, hacker

  useEffect(() => {
    const savedTheme = (localStorage.getItem('app-theme') as Theme) || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme): void => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-hacker');
    
    // Apply new theme
    root.classList.add(`theme-${newTheme}`);
    
    // Set CSS variables for the theme
    switch (newTheme) {
      case 'dark':
        root.style.setProperty('--bg-primary', '#1a1a1a');
        root.style.setProperty('--bg-secondary', '#2d2d2d');
        root.style.setProperty('--bg-tertiary', '#3d3d3d');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#b0b0b0');
        root.style.setProperty('--text-muted', '#808080');
        root.style.setProperty('--border-color', '#444444');
        root.style.setProperty('--accent-color', '#007bff');
        root.style.setProperty('--danger-color', '#dc3545');
        root.style.setProperty('--success-color', '#28a745');
        root.style.setProperty('--warning-color', '#ffc107');
        break;
      case 'hacker':
        root.style.setProperty('--bg-primary', '#000000');
        root.style.setProperty('--bg-secondary', '#0a0a0a');
        root.style.setProperty('--bg-tertiary', '#1a1a1a');
        root.style.setProperty('--text-primary', '#00ff00');
        root.style.setProperty('--text-secondary', '#00cc00');
        root.style.setProperty('--text-muted', '#009900');
        root.style.setProperty('--border-color', '#00ff00');
        root.style.setProperty('--accent-color', '#00ffff');
        root.style.setProperty('--danger-color', '#ff0066');
        root.style.setProperty('--success-color', '#00ff00');
        root.style.setProperty('--warning-color', '#ffff00');
        break;
      default: // light
        root.style.setProperty('--bg-primary', '#ffffff');
        root.style.setProperty('--bg-secondary', '#f8f9fa');
        root.style.setProperty('--bg-tertiary', '#e9ecef');
        root.style.setProperty('--text-primary', '#333333');
        root.style.setProperty('--text-secondary', '#495057');
        root.style.setProperty('--text-muted', '#6c757d');
        root.style.setProperty('--border-color', '#e9ecef');
        root.style.setProperty('--accent-color', '#007bff');
        root.style.setProperty('--danger-color', '#dc3545');
        root.style.setProperty('--success-color', '#28a745');
        root.style.setProperty('--warning-color', '#ffc107');
        break;
    }
  };

  const changeTheme = (newTheme: Theme): void => {
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
