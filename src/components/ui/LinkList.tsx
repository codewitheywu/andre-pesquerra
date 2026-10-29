import TextLink from "./TextLink";

type LinkListProps = {
  links: { label: string; href: string }[];
  className?: string;
};

/** A row of mono text links; each is a 44px touch target below desktop. */
export default function LinkList({ links, className = "" }: LinkListProps) {
  return (
    <ul className={`flex flex-wrap gap-x-5 font-mono text-meta ${className}`}>
      {links.map((link) => (
        <li key={link.href}>
          <TextLink href={link.href} className="inline-flex min-h-11 items-center lg:min-h-0">
            {link.label}
          </TextLink>
        </li>
      ))}
    </ul>
  );
}
