
const projects = [
  {
    number: "01",
    category: "Web Application · Capstone",
    title: "Gavina Noble Dental",
    description:
      "A web-based dental appointment system paired with a mobile application, designed to simplify patient scheduling and clinic workflows.",
    tags: ["PHP", "JavaScript", "MySQL"],
    year: "2025",
  },
  {
    number: "02",
    category: "Automation · Internship",
    title: "Report Automation",
    description:
      "A workflow that uses Google Forms and document automation to reduce repetitive paperwork and streamline report generation.",
    tags: ["Google Forms", "Autocrat", "Automation"],
    year: "2025",
  },
  {
    number: "03",
    category: "Personal Project · Portfolio",
    title: "My Digital Space",
    description:
      "A personal portfolio built to showcase my projects, technical growth, and approach to building useful digital experiences.",
    tags: ["Next.js", "React", "JavaScript"],
    year: "2026",
  },
];

const technologies = [
  { name: "HTML", icon: "/images/icons/html.png" },
  { name: "CSS", icon: "/images/icons/css.png" },
  { name: "JavaScript", icon: "/images/icons/js.png" },
  { name: "PHP", icon: "/images/icons/php.png" },
  { name: "MySQL", icon: "/images/icons/mysql.png" },
  { name: "C", icon: "/images/icons/c.png" },
  { name: "Figma", icon: "/images/icons/figma.png" },
  { name: "AI Tools", icon: "/images/icons/chatgpt.png" },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Andre Pequerra home">
          <span className="brand-mark">AP.</span>
          <span className="brand-name">ANDRE PEQUERRA</span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#experience">Experience</a>
          <a href="#contact">Contact</a>
        </nav>

        <a className="header-cta" href="#contact">
          Let&apos;s talk <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="hero section-wrap" id="home">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="status-dot" />
            AVAILABLE FOR OPPORTUNITIES
          </div>

          <h1>
            Building digital
            <br />
            experiences with
            <br />
            <span>purpose & detail.</span>
          </h1>

          <p className="hero-description">
            I&apos;m Andre Pequerra, a computer science graduate-in-progress
            passionate about web development, thoughtful design, and
            AI-assisted programming.
          </p>

          <div className="hero-actions">
            <a className="button button-dark" href="#projects">
              Explore my work <span aria-hidden="true">↘</span>
            </a>
            <a className="text-link" href="/files/resume.pdf" target="_blank">
              View résumé <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="hero-meta">
            <div>
              <span className="meta-label">FOCUS</span>
              <span className="meta-value">Web & Software Development</span>
            </div>
            <div>
              <span className="meta-label">BASED IN</span>
              <span className="meta-value">Philippines</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-topline">
            <span>PORTFOLIO / 2026</span>
            <span>01 — 07</span>
          </div>

          <div className="portrait-frame">
            <div className="portrait-backdrop" />
            <img
              className="hero-portrait"
              src="/images/avatar/Pesquerra.jpg"
              alt="Portrait of Andre Pequerra"
            />
            <div className="portrait-caption">
              <span>INDEPENDENT THINKER.</span>
              <span>CONTINUOUS BUILDER.</span>
            </div>
          </div>

          <div className="floating-note">
            <span className="note-symbol">✳</span>
            <span>
              Curious by nature.
              <br />
              Intentional by design.
            </span>
          </div>

          <div className="visual-footer">
            <span>DESIGN-MINDED DEVELOPER</span>
            <span>SCROLL TO DISCOVER ↓</span>
          </div>
        </div>

        <a className="scroll-indicator" href="#about" aria-label="Scroll to about">
          <span />
        </a>
      </section>

      <section className="intro-strip" aria-label="Introduction">
        <p>
          CODE WITH INTENTION <span>✳</span> DESIGN WITH CLARITY{" "}
          <span>✳</span> KEEP LEARNING <span>✳</span>
        </p>
      </section>

      <section className="about-section section-wrap" id="about">
        <div className="section-heading">
          <span className="section-index">01 / ABOUT ME</span>
          <span className="section-aside">A LITTLE ABOUT MY APPROACH</span>
        </div>

        <div className="about-grid">
          <h2>
            I like turning
            <br />
            <span>ideas into</span>
            <br />
            useful things.
          </h2>

          <div className="about-copy">
            <p>
              I&apos;m a computer science student focused on building
              practical web experiences. I enjoy bringing together
              functionality, clean interfaces, and problem-solving to
              create products that serve a real purpose.
            </p>
            <p>
              My experience spans web development, database-driven
              applications, and workflow automation. I also explore AI
              tools to support my development process while continuing to
              strengthen my fundamentals.
            </p>
            <a className="text-link" href="#experience">
              More about my journey <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="principles-grid">
          <article className="principle-card">
            <span className="principle-number">01</span>
            <h3>Function first</h3>
            <p>Build solutions that work well before adding unnecessary complexity.</p>
          </article>
          <article className="principle-card">
            <span className="principle-number">02</span>
            <h3>Details matter</h3>
            <p>Make interfaces clear, considered, and comfortable to use.</p>
          </article>
          <article className="principle-card">
            <span className="principle-number">03</span>
            <h3>Always learning</h3>
            <p>Stay curious, experiment, and improve with every project.</p>
          </article>
        </div>
      </section>

      <section className="projects-section" id="projects">
        <div className="section-wrap">
          <div className="section-heading">
            <span className="section-index">02 / SELECTED WORK</span>
            <span className="section-aside">A FEW THINGS I&apos;VE BUILT</span>
          </div>

          <div className="projects-title-row">
            <h2>
              Work in
              <br />
              <span>progress & purpose.</span>
            </h2>
            <p>
              A selection of projects and experiences that reflect how I
              learn, solve problems, and build.
            </p>
          </div>

          <div className="projects-list">
            {projects.map((project) => (
              <article className="project-card" key={project.number}>
                <div className="project-number">{project.number}</div>
                <div className="project-content">
                  <span className="project-category">{project.category}</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="project-tags">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="project-end">
                  <span>{project.year}</span>
                  <span className="project-arrow" aria-hidden="true">↗</span>
                </div>
              </article>
            ))}
          </div>
          <p className="project-note">
            Project descriptions and dates can be refined as we build the
            complete portfolio.
          </p>
        </div>
      </section>

      <section className="stack-section section-wrap" id="stack">
        <div className="section-heading">
          <span className="section-index">03 / TECH STACK</span>
          <span className="section-aside">TOOLS I WORK WITH</span>
        </div>

        <div className="stack-heading">
          <h2>
            Tools are useful.
            <br />
            <span>Knowing why is better.</span>
          </h2>
          <p>
            My current toolkit for building interfaces, working with data,
            and exploring more efficient ways to develop.
          </p>
        </div>

        <div className="tech-grid">
          {technologies.map((tech) => (
            <div className="tech-item" key={tech.name}>
              <img src={tech.icon} alt="" />
              <span>{tech.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="experience-section" id="experience">
        <div className="section-wrap">
          <div className="section-heading">
            <span className="section-index">04 / THE JOURNEY</span>
            <span className="section-aside">EXPERIENCE & EDUCATION</span>
          </div>

          <div className="journey-grid">
            <h2>
              Learning by
              <br />
              <span>doing.</span>
            </h2>

            <div className="journey-list">
              <article className="journey-item">
                <span className="journey-date">CAPSTONE PROJECT</span>
                <div>
                  <h3>Web Application Developer</h3>
                  <p>
                    Gavina Noble Dental Appointment System with Mobile
                    Application
                  </p>
                  <span className="journey-detail">
                    Front-end and back-end development · Team leadership
                  </span>
                </div>
              </article>

              <article className="journey-item">
                <span className="journey-date">INTERNSHIP</span>
                <div>
                  <h3>MISO — SBMA</h3>
                  <p>IT support and workflow automation</p>
                  <span className="journey-detail">
                    Google Forms reporting automation · Technical support
                  </span>
                </div>
              </article>

              <article className="journey-item">
                <span className="journey-date">EDUCATION</span>
                <div>
                  <h3>Bachelor of Science in Computer Science</h3>
                  <p>Undergraduate studies</p>
                  <span className="journey-detail">
                    Add your school name and graduation year when confirmed.
                  </span>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="beyond-section section-wrap" id="beyond">
        <div className="section-heading">
          <span className="section-index">05 / BEYOND THE CODE</span>
          <span className="section-aside">THE PERSON BEHIND THE PROJECTS</span>
        </div>
        <div className="beyond-card">
          <span className="beyond-mark">✳</span>
          <h2>
            Stay curious.
            <br />
            <span>Keep creating.</span>
          </h2>
          <p>
            I believe good developers never stop being students. Every
            challenge is an opportunity to ask better questions, learn
            something new, and build something better.
          </p>
        </div>
      </section>

      <footer className="contact-section" id="contact">
        <div className="section-wrap">
          <div className="section-heading">
            <span className="section-index">06 / GET IN TOUCH</span>
            <span className="section-aside">HAVE A PROJECT IN MIND?</span>
          </div>

          <h2>
            Let&apos;s make
            <br />
            something <span>meaningful.</span>
          </h2>

          <p>
            Interested in working together, discussing an opportunity, or
            sharing ideas? I&apos;d be glad to hear from you.
          </p>

          <a className="button button-light" href="mailto:">
            Start a conversation <span aria-hidden="true">↗</span>
          </a>

          <div className="footer-bottom">
            <a className="brand footer-brand" href="#home">
              <span className="brand-mark">AP.</span>
              <span className="brand-name">ANDRE PEQUERRA</span>
            </a>
            <span>DESIGNED WITH INTENTION · BUILT TO EVOLVE</span>
            <a href="#home">BACK TO TOP ↑</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
