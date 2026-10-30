import Certifications from "@/components/sections/Certifications";
import Contact from "@/components/sections/Contact";
import GitHubActivity from "@/components/sections/GitHubActivity";
import Experience from "@/components/sections/Experience";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import { siteContent } from "@/data/content";
import { getContributions } from "@/lib/github";
import { getExperience, getProjects } from "@/lib/queries";

// Re-fetch portfolio content from Supabase at most once a minute.
export const revalidate = 60;

export default async function HomePage() {
  const [projects, experience, contributions] = await Promise.all([
    getProjects(),
    getExperience(),
    getContributions(siteContent.githubUser),
  ]);

  return (
    <div id="top" className="space-y-24 pb-8 lg:space-y-32">
      <Hero />
      <Projects projects={projects} />
      <Experience experience={experience} />
      <GitHubActivity calendar={contributions} />
      <Certifications />
      <Contact />
    </div>
  );
}
