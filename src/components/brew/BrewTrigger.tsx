"use client";

import type { ReactNode } from "react";
import ShortcutButton from "@/components/ui/ShortcutButton";
import { openBrew } from "./BrewLauncher";

type BrewTriggerProps = {
  children: ReactNode;
  className?: string;
  showShortcut?: boolean;
};

export default function BrewTrigger(props: BrewTriggerProps) {
  return <ShortcutButton shortcut="G" onClick={openBrew} {...props} />;
}
