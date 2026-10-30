"use client";

import { HotCoffeeIcon, IcedCoffeeIcon } from "@/components/ui/icons";
import { useTheme } from "@/hooks/usePreferences";
import { setTheme, type Theme } from "@/lib/theme";

const OPTIONS: { theme: Theme; label: string; Icon: typeof IcedCoffeeIcon }[] = [
  { theme: "light", label: "Iced coffee (light theme)", Icon: IcedCoffeeIcon },
  { theme: "dark", label: "Hot coffee (dark theme)", Icon: HotCoffeeIcon },
];

/** Two-button switch: iced coffee for light, hot coffee for dark. */
export default function ThemeToggle() {
  const active = useTheme();

  return (
    <div
      role="group"
      aria-label="Theme"
      // A ring, not a border, so the group is exactly as tall as its 44px buttons.
      className="inline-flex rounded-md bg-surface ring-1 ring-border lg:p-0.5"
    >
      {OPTIONS.map(({ theme, label, Icon }) => {
        const pressed = active === theme;
        return (
          <button
            key={theme}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={pressed}
            onClick={(event) => {
              const box = event.currentTarget.getBoundingClientRect();
              setTheme(theme, { x: box.left + box.width / 2, y: box.top + box.height / 2 });
            }}
            className={`press inline-flex size-11 items-center justify-center rounded-md transition-colors lg:size-8 lg:rounded-sm ${
              pressed ? "bg-surface-2 text-accent" : "text-muted hover:text-ink"
            }`}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}
