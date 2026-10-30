"use client";

import type { ReactNode } from "react";
import ShortcutButton from "@/components/ui/ShortcutButton";
import { openCommandPalette } from "./CommandPalette";

type PaletteTriggerProps = {
  children: ReactNode;
  className?: string;
  showShortcut?: boolean;
};

export default function PaletteTrigger(props: PaletteTriggerProps) {
  return <ShortcutButton shortcut="K" onClick={openCommandPalette} {...props} />;
}
