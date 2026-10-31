import { ThemeMode, AccentColor } from "../types";

export const THEME_STORAGE_KEY = "athlynx_theme";
export const ACCENT_STORAGE_KEY = "athlynx_accent";

export interface AccentOption {
  id: AccentColor;
  label: string;
  tagline: string;
  hex: string;
  glow: string;
}

export const AVAILABLE_ACCENTS: AccentOption[] = [
  {
    id: "neon-blue",
    label: "Neon Blue",
    tagline: "Azul Neon Elétrico — alta visibilidade & impacto esportivo",
    hex: "#00d2ff",
    glow: "rgba(0, 210, 255, 0.4)",
  },
  {
    id: "cobalt-blue",
    label: "Cobalt Blue",
    tagline: "Azul Cobalto Hyper — estilo motorsport & atletismo pro",
    hex: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.4)",
  },
  {
    id: "ultra-violet",
    label: "Ultra Violet",
    tagline: "Violeta / Roxo Neon — energia futurista de alta voltagem",
    hex: "#a855f7",
    glow: "rgba(168, 85, 247, 0.4)",
  },
  {
    id: "hyper-orange",
    label: "Hyper Orange",
    tagline: "Laranja Hiper — intensidade máxima, adrenalina & cardio",
    hex: "#f97316",
    glow: "rgba(249, 115, 22, 0.4)",
  },
  {
    id: "neon-green",
    label: "Neon Green",
    tagline: "Verde Neon — estética original fluorescente",
    hex: "#10b981",
    glow: "rgba(16, 185, 129, 0.4)",
  },
];

export const themeService = {
  getTheme(): ThemeMode {
    if (typeof window === "undefined") return "dark";
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light-hc" || stored === "dark") {
        return stored;
      }
    } catch {
      // ignore storage access errors
    }
    return "dark";
  },

  setTheme(theme: ThemeMode): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage access errors
    }
    this.applyTheme(theme);
    window.dispatchEvent(
      new CustomEvent("athlynx_theme_change", { detail: { theme } })
    );
  },

  applyTheme(theme: ThemeMode): void {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "light-hc") {
      root.classList.remove("dark");
      root.classList.add("light-hc");
      root.setAttribute("data-theme", "light-hc");
    } else {
      root.classList.add("dark");
      root.classList.remove("light-hc");
      root.setAttribute("data-theme", "dark");
    }
  },

  getAccent(): AccentColor {
    if (typeof window === "undefined") return "neon-blue";
    try {
      const stored = localStorage.getItem(ACCENT_STORAGE_KEY) as AccentColor;
      if (
        stored === "neon-blue" ||
        stored === "cobalt-blue" ||
        stored === "ultra-violet" ||
        stored === "hyper-orange" ||
        stored === "neon-green"
      ) {
        return stored;
      }
    } catch {
      // ignore storage access errors
    }
    return "neon-blue"; // Default is now the striking Neon Blue requested by user!
  },

  setAccent(accent: AccentColor): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, accent);
    } catch {
      // ignore storage access errors
    }
    this.applyAccent(accent);
    window.dispatchEvent(
      new CustomEvent("athlynx_accent_change", { detail: { accent } })
    );
  },

  applyAccent(accent: AccentColor): void {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-accent", accent);
  },

  initTheme(): { theme: ThemeMode; accent: AccentColor } {
    const currentTheme = this.getTheme();
    const currentAccent = this.getAccent();
    this.applyTheme(currentTheme);
    this.applyAccent(currentAccent);
    return { theme: currentTheme, accent: currentAccent };
  },

  toggleTheme(): ThemeMode {
    const next: ThemeMode = this.getTheme() === "dark" ? "light-hc" : "dark";
    this.setTheme(next);
    return next;
  },
};
