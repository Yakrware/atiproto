import { useCallback, useEffect, useState } from "react";
import { getTheme, toggleTheme } from "~/lib/theme";
import { SunIcon } from "~/components/icons/SunIcon";
import { MoonIcon } from "~/components/icons/MoonIcon";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(getTheme());
  }, []);

  const handleToggle = useCallback(() => {
    setTheme(toggleTheme());
  }, []);

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg hover:bg-surface-alt dark:hover:bg-surface-alt-dark transition-colors"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "light" ? (
        <SunIcon className="w-5 h-5" />
      ) : (
        <MoonIcon className="w-5 h-5" />
      )}
    </button>
  );
}
