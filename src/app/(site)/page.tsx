import Contact from "@/components/sections/Contact";
import Education from "@/components/sections/Education";
import Experience from "@/components/sections/Experience";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Stack from "@/components/sections/Stack";
import { getEducation, getExperience, getProjects } from "@/lib/queries";

// Re-fetch portfolio content from Supabase at most once a minute.
export const revalidate = 60;

export default async function HomePage() {
  const [projects, experience, education] = await Promise.all([
    getProjects(),
    getExperience(),
    getEducation(),
  ]);

  return (
    <div id="top" className="space-y-24 pb-8 lg:space-y-32">
      <Hero />
      <Projects projects={projects} />
      <Experience experience={experience} />
      <Education education={education} />
      <Stack />
      <Contact />
    </div>
  );
}
