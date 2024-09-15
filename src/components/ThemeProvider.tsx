import { invoke, isTauri } from "@tauri-apps/api/core";
import { createContext, useContext, useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  isDark: false,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [webTheme, setWebTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const isDarkOS = useMediaQuery("(prefers-color-scheme: dark)", {
    initializeWithValue: true,
    defaultValue: false, // this value is ignored when initializeWithValue is true
  });

  const setTheme = (newTheme: Theme) => {
    if (isTauri()) {
      const newTauriTheme = newTheme === "system" ? "auto" : newTheme;
      invoke("plugin:theme|set_theme", { theme: newTauriTheme })
        .then(() => {
          localStorage.setItem(storageKey, "system");
          setWebTheme("system");
        })
        .catch(console.error);
    } else {
      localStorage.setItem(storageKey, newTheme);
      setWebTheme(newTheme);
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (webTheme === "system") {
      const systemTheme = isDarkOS ? "dark" : "light";
      root.classList.add(systemTheme);
      return;
    } else {
      root.classList.add(webTheme);
    }
  }, [webTheme, isDarkOS]);

  const value = {
    theme: webTheme,
    setTheme,
    isDark: webTheme === "dark" || (webTheme === "system" && isDarkOS),
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
