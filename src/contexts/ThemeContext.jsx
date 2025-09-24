import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const defaultTheme = {
  primary: '32 95% 44%', // Orange
  secondary: '0 0% 16%', // Dark gray
  accent: '45 93% 47%', // Yellow
  background: '0 0% 9%', // Dark
  foreground: '0 0% 98%', // Light
  card: '0 0% 14%', // Dark card
  border: '0 0% 20%', // Dark border
  mode: 'dark',
  fontFamily: 'Inter',
  borderRadius: '0.75rem'
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);
  const [customSections, setCustomSections] = useState({
    menu: true,
    contact: true,
    about: false
  });

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    const savedSections = localStorage.getItem('customSections');
    
    if (savedTheme) {
      setTheme({ ...defaultTheme, ...JSON.parse(savedTheme) });
    }
    
    if (savedSections) {
      setCustomSections(JSON.parse(savedSections));
    }
  }, []);

  const updateTheme = (newTheme) => {
    const updatedTheme = { ...theme, ...newTheme };
    setTheme(updatedTheme);
    localStorage.setItem('theme', JSON.stringify(updatedTheme));
  };

  const updateSections = (sections) => {
    setCustomSections(sections);
    localStorage.setItem('customSections', JSON.stringify(sections));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    localStorage.setItem('theme', JSON.stringify(defaultTheme));
  };

  const value = {
    theme,
    customSections,
    updateTheme,
    updateSections,
    resetTheme
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};