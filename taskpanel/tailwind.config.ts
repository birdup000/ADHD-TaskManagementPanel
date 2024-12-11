import type { Config } from "tailwindcss";

export const colors = {
  dark: {
    primary: '#212121',
    secondary: '#2A2A2A',
    tertiary: '#333333',
    hover: '#383838',
    accent: {
      indigo: '#4F46E5',
      purple: '#7C3AED',
      blue: '#2563EB',
      green: '#059669',
      red: '#DC2626',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A3A3A3',
    }
  }
};

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
} satisfies Config;
