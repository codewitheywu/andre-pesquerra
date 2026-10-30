import TextLink from "./TextLink";

type LinkListProps = {
  links: { label: string; href: string }[];
  className?: string;
};

/** A row of mono text links: 44px touch targets below desktop, 24px (WCAG 2.5.8) on it. */
export default function LinkList({ links, className = "" }: LinkListProps) {
  return (
    <ul className={`flex flex-wrap gap-x-5 font-mono text-meta ${className}`}>
      {links.map((link) => (
        <li key={link.href}>
          <TextLink href={link.href} className="inline-flex min-h-11 items-center lg:min-h-6">
            {link.label}
          </TextLink>
        </li>
      ))}
    </ul>
  );
}
