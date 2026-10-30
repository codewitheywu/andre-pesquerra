"use client";

import { SoundIcon } from "@/components/ui/icons";
import { useSoundEnabled } from "@/hooks/usePreferences";
import { setSoundEnabled } from "@/lib/sound";

export default function SoundToggle() {
  const enabled = useSoundEnabled();
  const label = enabled ? "Sound effects on" : "Sound effects off";

  return (
    <button
      type="button"
      title={label}
      aria-label="Sound effects"
      aria-pressed={enabled}
      onClick={() => setSoundEnabled(!enabled)}
      className={`press inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface transition-colors lg:size-9 ${
        enabled ? "text-accent" : "text-muted hover:text-ink"
      }`}
    >
      <SoundIcon muted={!enabled} />
    </button>
  );
}
