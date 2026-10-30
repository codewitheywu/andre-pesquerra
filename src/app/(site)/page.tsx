import Certifications from "@/components/sections/Certifications";
import Contact from "@/components/sections/Contact";
import GitHubActivity from "@/components/sections/GitHubActivity";
import Experience from "@/components/sections/Experience";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Recommendations from "@/components/sections/Recommendations";
import { siteContent } from "@/data/content";
import { getContributions } from "@/lib/github";
import { getExperience, getProjects, getRecommendations } from "@/lib/queries";

// Re-fetch portfolio content from Supabase at most once a minute.
export const revalidate = 60;

export default async function HomePage() {
  const [projects, experience, recommendations, contributions] = await Promise.all([
    getProjects(),
    getExperience(),
    getRecommendations(),
    getContributions(siteContent.githubUser),
  ]);

  return (
    <div id="top" className="space-y-24 pb-8 lg:space-y-32">
      <Hero />
      <Projects projects={projects} />
      <Experience experience={experience} />
      <GitHubActivity calendar={contributions} />
      <Certifications />
      <Recommendations recommendations={recommendations} />
      <Contact />
    </div>
  );
}
