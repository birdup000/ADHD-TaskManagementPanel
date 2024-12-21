import { createContext, useContext } from 'react';
import { colors } from '../config/colors';

export type ThemeType = {
  primary: string;
  background: string;
  foreground: string;
  gray: {
    [key: string]: string;
  };
};

const defaultTheme: ThemeType = {
  primary: colors.primary.DEFAULT,
  background: colors.background,
  foreground: colors.foreground,
  gray: colors.gray
};

const ThemeContext = createContext<{
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}>({
  theme: defaultTheme,
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);
export const ThemeProvider = ThemeContext.Provider;
