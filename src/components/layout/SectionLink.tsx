"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

type SectionLinkProps = Omit<ComponentProps<"a">, "href"> & { id: string };

/**
 * Link to a section of the home page. On the home page it is a plain hash
 * link, which Lenis turns into a smooth scroll; from other routes (/stack)
 * it navigates home and lands on the section.
 */
export default function SectionLink({ id, ...props }: SectionLinkProps) {
  const onHome = usePathname() === "/";
  return onHome ? <a href={`#${id}`} {...props} /> : <Link href={`/#${id}`} {...props} />;
}
