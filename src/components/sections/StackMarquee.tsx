import Marquee from "@/components/ui/Marquee";
import { logoTools } from "@/data/stack";
import ToolLogo from "./ToolLogo";

export default function StackMarquee() {
  return (
    <Marquee label="Tools I work with" action={{ label: "view all", href: "/stack" }}>
      {logoTools.map((tool) => (
        <li key={tool.name} className="flex shrink-0 items-center gap-2 py-2 text-ink-2">
          <ToolLogo icon={tool.icon} />
          <span className="text-meta">{tool.name}</span>
        </li>
      ))}
    </Marquee>
  );
}
