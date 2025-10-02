import React, { createContext, useState, ReactNode } from "react";

interface Theme {
  background: string;
  text: string;
}

interface ThemeContextType {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
  theme: Theme;
}

// ✅ Export ThemeContext để các màn hình import được
export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  setIsDark: () => {},
  theme: { background: "#fff", text: "#000" },
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  const theme: Theme = {
    background: isDark ? "#222" : "#fff",
    text: isDark ? "#fff" : "#000",
  };

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
