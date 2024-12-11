import { createContext, useContext } from 'react';
import { colors } from '../../tailwind.config';

type ThemeType = typeof colors.dark;

const ThemeContext = createContext<{
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}>({
  theme: colors.dark,
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);
export const ThemeProvider = ThemeContext.Provider;