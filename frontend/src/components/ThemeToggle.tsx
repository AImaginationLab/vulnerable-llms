import { useTheme } from './ThemeProvider';
import { Theme } from '../types';

const ThemeToggle = () => {
  const { theme, changeTheme } = useTheme();

  const themes = [
    { id: 'light', name: 'Light', icon: '☀️' },
    { id: 'dark', name: 'Dark', icon: '🌙' },
    { id: 'hacker', name: 'HACKER', icon: '💀' }
  ];

  return (
    <div className="theme-toggle">
      <div className="theme-selector">
        {themes.map((themeOption) => (
          <button
            key={themeOption.id}
            className={`theme-button ${theme === themeOption.id ? 'active' : ''}`}
            onClick={() => changeTheme(themeOption.id as Theme)}
            title={`Switch to ${themeOption.name} mode`}
          >
            <span className="theme-icon">{themeOption.icon}</span>
            <span className="theme-name">{themeOption.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeToggle;
