<?php
require_once __DIR__ . '/includes/data.php';
require_once __DIR__ . '/includes/security.php';
sendSecurityHeaders();

try {
    $profile      = getProfile();
    $skillGroups  = getSkillsByCategory();
    $experience   = getWorkExperience();
    $education    = getEducation();
    $projects     = getFeaturedProjects();
    $testimonials = getTestimonials();
} catch (RuntimeException $e) {
    http_response_code(503);
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Temporarily Unavailable</title>
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
  <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;">
    <p style="font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);margin-bottom:1rem;">503</p>
    <h1 class="section-title" style="margin-bottom:1rem;">Site temporarily <em>unavailable.</em></h1>
    <p style="color:var(--text-2);">Please try again shortly.</p>
  </div>
</body>
</html>
    <?php
    exit;
}

$name     = htmlspecialchars($profile['full_name'] ?? 'Your Name',   ENT_QUOTES, 'UTF-8');
$tagline  = htmlspecialchars($profile['tagline']   ?? 'Developer',   ENT_QUOTES, 'UTF-8');
$bio      = htmlspecialchars($profile['bio']        ?? '',            ENT_QUOTES, 'UTF-8');
$location = htmlspecialchars($profile['location']   ?? '',            ENT_QUOTES, 'UTF-8');
$email    = htmlspecialchars($profile['email']       ?? '',           ENT_QUOTES, 'UTF-8');
$year     = date('Y');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="<?= $name ?> — <?= $tagline ?>">
  <title><?= $name ?></title>
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<!-- ══════════════════════════════════════════════════
     NAVIGATION
══════════════════════════════════════════════════ -->
<nav id="nav" aria-label="Primary navigation">
  <div class="container nav-inner">
    <a href="#hero" class="nav-logo"><?= explode(' ', $name)[0] ?><span>.</span></a>

    <ul class="nav-links" role="list">
      <li><a href="#about">About</a></li>
      <li><a href="#experience">Work</a></li>
      <li><a href="#hire">Why Me</a></li>
      <li><a href="#projects">Projects</a></li>
      <li><a href="#testimonials">Testimonials</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>

    <?php if (!empty($profile['resume_url'])): ?>
    <a href="<?= htmlspecialchars($profile['resume_url'], ENT_QUOTES, 'UTF-8') ?>" class="nav-cta" target="_blank" rel="noopener">
      Resume
    </a>
    <?php endif; ?>

    <button class="nav-hamburger" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<!-- Mobile overlay menu -->
<div class="nav-mobile" role="dialog" aria-label="Mobile navigation">
  <a href="#about">About</a>
  <a href="#experience">Work</a>
  <a href="#hire">Why Me</a>
  <a href="#projects">Projects</a>
  <a href="#testimonials">Testimonials</a>
  <a href="#contact">Contact</a>
</div>


<!-- ══════════════════════════════════════════════════
     HERO
══════════════════════════════════════════════════ -->
<section id="hero" aria-label="Introduction">
  <div class="hero-bg-lines" aria-hidden="true"></div>

  <?php if (!empty($profile['social_links'])): ?>
  <div class="hero-socials" aria-label="Social profiles">
    <?php foreach ($profile['social_links'] as $sl): ?>
      <a href="<?= htmlspecialchars($sl['url'], ENT_QUOTES, 'UTF-8') ?>" target="_blank" rel="noopener">
        <?= htmlspecialchars($sl['platform'], ENT_QUOTES, 'UTF-8') ?>
      </a>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>

  <div class="container">
    <div class="hero-inner">
      <div class="hero-content">
        <p class="hero-label reveal"><?= $tagline ?></p>
        <h1 class="hero-name reveal reveal-delay-1">
          <?php
            // $name is already HTML-escaped above — do not re-escape or entities double-encode.
            $parts = explode(' ', $name, 2);
            echo $parts[0];
            if (isset($parts[1])) echo '<em>' . $parts[1] . '</em>';
          ?>
        </h1>
        <p class="hero-bio reveal reveal-delay-2"><?= $bio ?></p>
        <div class="hero-actions reveal reveal-delay-3">
          <a href="#projects" class="btn-primary">View Work</a>
          <a href="#contact" class="btn-ghost">Get in Touch</a>
        </div>
      </div>

      <?php if (!empty($profile['avatar_url'])): ?>
      <div class="hero-photo reveal reveal-delay-2" aria-label="Portrait">
        <div class="hero-photo-frame">
          <img src="<?= htmlspecialchars($profile['avatar_url'], ENT_QUOTES, 'UTF-8') ?>"
               alt="<?= $name ?> portrait" loading="eager">
        </div>
      </div>
      <?php endif; ?>
    </div>
  </div>

  <p class="scroll-hint" aria-hidden="true">Scroll to explore</p>
</section>


<!-- ══════════════════════════════════════════════════
     ABOUT / SKILLS
══════════════════════════════════════════════════ -->
<section id="about" aria-label="About me and skills">
  <div class="container">
    <div class="about-grid">
      <!-- LEFT: label + title + bio -->
      <div class="about-left">
        <div class="gold-rule reveal">
          <span></span><p>About</p>
        </div>
        <h2 class="section-title reveal reveal-delay-1">
          Crafting <em>digital experiences</em><br>with intent.
        </h2>
        <div class="about-text reveal reveal-delay-2">
          <p><?= $bio ?></p>
          <?php if ($location): ?>
          <p style="margin-top:2rem; font-size:0.8rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--text-3);">
            Based in <?= $location ?>
          </p>
          <?php endif; ?>
        </div>
      </div>

      <!-- RIGHT: skills — starts at same top as left column -->
      <div class="skills-list reveal reveal-delay-2">
        <?php foreach ($skillGroups as $category => $skills): ?>
        <div class="skill-category">
          <p class="skill-category-title"><?= htmlspecialchars($category, ENT_QUOTES, 'UTF-8') ?></p>
          <div class="skill-bars">
            <?php foreach ($skills as $skill): ?>
            <div class="skill-row">
              <div class="skill-meta">
                <span class="skill-name"><?= htmlspecialchars($skill['name'], ENT_QUOTES, 'UTF-8') ?></span>
                <span class="skill-pct"><?= (int)$skill['proficiency'] ?></span>
              </div>
              <div class="skill-bar-bg">
                <div class="skill-bar-fill" data-pct="<?= (int)$skill['proficiency'] ?>"></div>
              </div>
            </div>
            <?php endforeach; ?>
          </div>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</section>


<!-- ══════════════════════════════════════════════════
     WORK EXPERIENCE
══════════════════════════════════════════════════ -->
<section id="experience" aria-label="Work experience">
  <div class="container">
    <div class="gold-rule reveal">
      <span></span><p>Experience</p>
    </div>
    <h2 class="section-title reveal reveal-delay-1">
      Where I've <em>made an impact.</em>
    </h2>

    <div class="exp-list" style="margin-top:4rem;">
      <?php foreach ($experience as $i => $job): ?>
      <div class="exp-item reveal reveal-delay-<?= min($i + 1, 4) ?>">
        <div class="exp-meta">
          <p class="exp-dates">
            <?= $job['started_at'] ? date('M Y', strtotime($job['started_at'])) : '—' ?> —
            <?= $job['is_current'] ? 'Present' : ($job['ended_at'] ? date('M Y', strtotime($job['ended_at'])) : '—') ?>
          </p>
          <p class="exp-company"><?= htmlspecialchars($job['company'], ENT_QUOTES, 'UTF-8') ?></p>
          <?php if ($job['location']): ?>
          <p class="exp-location"><?= htmlspecialchars($job['location'], ENT_QUOTES, 'UTF-8') ?></p>
          <?php endif; ?>
        </div>

        <div class="exp-body">
          <p class="exp-role"><?= htmlspecialchars($job['role'], ENT_QUOTES, 'UTF-8') ?></p>
          <?php if ($job['description']): ?>
          <p class="exp-desc"><?= htmlspecialchars($job['description'], ENT_QUOTES, 'UTF-8') ?></p>
          <?php endif; ?>
          <?php if (!empty($job['highlights'])): ?>
          <ul class="exp-highlights">
            <?php foreach ($job['highlights'] as $bullet): ?>
            <li><?= htmlspecialchars($bullet, ENT_QUOTES, 'UTF-8') ?></li>
            <?php endforeach; ?>
          </ul>
          <?php endif; ?>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>


<!-- ══════════════════════════════════════════════════
     WHY HIRE ME
══════════════════════════════════════════════════ -->
<section id="hire" aria-label="Why hire me">
  <div class="container">
    <div class="gold-rule reveal">
      <span></span><p>Why Me</p>
    </div>
    <h2 class="section-title reveal reveal-delay-1">
      Reasons to <em>work with me.</em>
    </h2>

    <div class="hire-grid">
      <div class="hire-item reveal reveal-delay-1">
        <span class="hire-num">01</span>
        <p class="hire-item-title">Full-Stack Ownership</p>
        <p class="hire-item-desc">I design the schema, write the backend, build the frontend, and ship to production myself — no hand-offs, no gaps. Four very different builds prove it: a database-driven web app, a persistent multiplayer game, a team-facing tool, and embedded hardware.</p>
      </div>
      <div class="hire-item reveal reveal-delay-2">
        <span class="hire-num">02</span>
        <p class="hire-item-title">Proven in Production</p>
        <p class="hire-item-desc">Not just coursework — gavinadental.online, gameseek.com/gs2, and devboard.infinityfreeapp.com are live systems real users touch today, backed by an ongoing freelance client relationship.</p>
      </div>
      <div class="hire-item reveal reveal-delay-3">
        <span class="hire-num">03</span>
        <p class="hire-item-title">Led a Team, Not Just Code</p>
        <p class="hire-item-desc">I directed three developers building DevBoard — architecture, conventions, code review, and the calls that kept us out of merge-conflict hell.</p>
      </div>
      <div class="hire-item reveal reveal-delay-4">
        <span class="hire-num">04</span>
        <p class="hire-item-title">Recognized For It</p>
        <p class="hire-item-desc">Best in Project Implementation award at my Capstone defense, TESDA NCII certified, and the client testimonials on this page aren't hypothetical.</p>
      </div>
    </div>
  </div>
</section>


<!-- ══════════════════════════════════════════════════
     PROJECTS
══════════════════════════════════════════════════ -->
<section id="projects" aria-label="Featured projects">
  <div class="container">
    <div class="gold-rule reveal">
      <span></span><p>Work</p>
    </div>
    <h2 class="section-title reveal reveal-delay-1">
      Selected <em>projects.</em>
    </h2>
  </div>

  <?php if (!empty($projects)): ?>
  <div class="proj-carousel-wrap reveal reveal-delay-2">
    <?php if (count($projects) > 1): ?>
    <button type="button" class="proj-carousel-arrow proj-carousel-prev" aria-label="Previous project">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <?php endif; ?>

    <div class="proj-carousel-track" role="region" aria-roledescription="carousel" aria-label="Selected projects">
      <?php foreach ($projects as $i => $project): ?>
      <?php
        $label   = !empty($project['tags'][0]) ? $project['tags'][0] : ($project['is_featured'] ? 'Featured' : 'Project');
        $checks  = array_slice($project['tags'] ?? [], 0, 5);
        if (!$checks) $checks = array_slice(array_column($project['tech'] ?? [], 'tech_name'), 0, 5);
      ?>
      <article class="proj-fan-card" data-index="<?= $i ?>" aria-hidden="true">
        <div class="proj-fan-header">
          <p class="proj-fan-label"><?= htmlspecialchars($label, ENT_QUOTES, 'UTF-8') ?></p>
          <h3 class="proj-fan-title"><?= htmlspecialchars($project['title'], ENT_QUOTES, 'UTF-8') ?></h3>
          <?php if ($checks): ?>
          <ul class="proj-fan-list">
            <?php foreach ($checks as $item): ?>
            <li>
              <span class="proj-fan-check" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              </span>
              <?= htmlspecialchars($item, ENT_QUOTES, 'UTF-8') ?>
            </li>
            <?php endforeach; ?>
          </ul>
          <?php endif; ?>
          <?php if ($project['show_case_study_link']): ?>
          <a href="pages/project.php?slug=<?= urlencode($project['slug']) ?>" class="proj-fan-btn" tabindex="-1">
            View Case Study
          </a>
          <?php endif; ?>
        </div>
      </article>
      <?php endforeach; ?>
    </div>

    <?php if (count($projects) > 1): ?>
    <button type="button" class="proj-carousel-arrow proj-carousel-next" aria-label="Next project">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
    </button>
    <?php endif; ?>
  </div>

  <?php if (count($projects) > 1): ?>
  <div class="proj-carousel-dots" role="tablist" aria-label="Choose a project">
    <?php foreach ($projects as $i => $project): ?>
    <button type="button" class="proj-dot" data-index="<?= $i ?>" role="tab"
            aria-label="<?= htmlspecialchars($project['title'], ENT_QUOTES, 'UTF-8') ?>"></button>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>
  <?php else: ?>
  <div class="container" style="margin-top:4rem;">
    <p class="empty-state">Projects coming soon.</p>
  </div>
  <?php endif; ?>
</section>


<!-- ══════════════════════════════════════════════════
     TESTIMONIALS
══════════════════════════════════════════════════ -->
<?php if (!empty($testimonials)): ?>
<section id="testimonials" aria-label="Testimonials">
  <div class="container">
    <div class="gold-rule reveal">
      <span></span><p>Testimonials</p>
    </div>
    <h2 class="section-title reveal reveal-delay-1">
      Kind words from <em>great people.</em>
    </h2>

    <?php
      // One testimonial shown at a time. The track holds every real slide
      // plus a trailing clone of the first; advancing past the last slide
      // glides into that clone, and JS then snaps (no transition) back to
      // the real first slide — the loop point is never visible.
      $testiCount  = count($testimonials);
      $testiSlides = $testimonials;
      if ($testiCount > 1) {
        $testiSlides[] = $testimonials[0];
      }
    ?>
    <div class="testi-rotator reveal" aria-label="Testimonials carousel" style="margin-top:4rem;">
      <div class="testi-track" data-count="<?= $testiCount ?>" data-duration="8">
        <?php foreach ($testiSlides as $si => $t): ?>
        <div class="testi-slide"<?= $si >= $testiCount ? ' aria-hidden="true"' : '' ?>>
          <div class="testi-card">
            <div class="testi-quote-mark" aria-hidden="true">"</div>
            <blockquote class="testi-quote"><?= htmlspecialchars($t['quote'], ENT_QUOTES, 'UTF-8') ?></blockquote>
            <button type="button" class="testi-translate-btn" data-state="idle">Translate to English</button>
            <div class="testi-author">
              <div class="testi-avatar" aria-hidden="true">
                <?php if ($t['avatar_url']): ?>
                  <img src="<?= htmlspecialchars($t['avatar_url'], ENT_QUOTES, 'UTF-8') ?>"
                       alt="<?= htmlspecialchars($t['name'], ENT_QUOTES, 'UTF-8') ?>">
                <?php else: ?>
                  <?= htmlspecialchars(strtoupper(substr($t['name'], 0, 1)), ENT_QUOTES, 'UTF-8') ?>
                <?php endif; ?>
              </div>
              <div>
                <p class="testi-name"><?= htmlspecialchars($t['name'], ENT_QUOTES, 'UTF-8') ?></p>
                <p class="testi-title-co">
                  <?= htmlspecialchars($t['title'] ?? '', ENT_QUOTES, 'UTF-8') ?>
                  <?php if ($t['company']): ?>
                    · <?= htmlspecialchars($t['company'], ENT_QUOTES, 'UTF-8') ?>
                  <?php endif; ?>
                </p>
              </div>
              <div class="testi-stars" aria-label="<?= (int)$t['rating'] ?> stars">
                <?= str_repeat('★', (int)$t['rating']) ?>
              </div>
            </div>
          </div>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
    <?php if ($testiCount > 1): ?>
    <div class="testi-dots" role="tablist" aria-label="Choose testimonial">
      <?php for ($i = 0; $i < $testiCount; $i++): ?>
      <button type="button" class="testi-dot<?= $i === 0 ? ' is-active' : '' ?>" data-index="<?= $i ?>"
              role="tab" aria-selected="<?= $i === 0 ? 'true' : 'false' ?>"
              aria-label="Show testimonial <?= $i + 1 ?> of <?= $testiCount ?>"></button>
      <?php endfor; ?>
    </div>
    <div class="testi-progress" aria-hidden="true"><div class="testi-progress-fill"></div></div>
    <?php endif; ?>
  </div>
</section>
<?php endif; ?>


<!-- ══════════════════════════════════════════════════
     CONTACT
══════════════════════════════════════════════════ -->
<section id="contact" aria-label="Contact">
  <div class="container">
    <div class="gold-rule reveal">
      <span></span><p>Contact</p>
    </div>
    <h2 class="section-title reveal reveal-delay-1">
      Let's build something <em>remarkable.</em>
    </h2>

    <div class="contact-grid" style="margin-top:4rem;">
      <div class="reveal reveal-delay-2">
        <p class="contact-lead">
          Have a project in mind or want to explore how we can work together?
          I'm always open to the right opportunity.
        </p>
        <div class="contact-detail">
          <?php if ($email): ?>
          <div class="contact-detail-row">
            <span class="contact-detail-label">Email</span>
            <a href="mailto:<?= $email ?>" style="color:var(--gold)"><?= $email ?></a>
          </div>
          <?php endif; ?>
          <?php if ($location): ?>
          <div class="contact-detail-row">
            <span class="contact-detail-label">Location</span>
            <?= $location ?>
          </div>
          <?php endif; ?>
        </div>
      </div>

      <div class="reveal reveal-delay-3">
        <form id="contact-form" novalidate>
          <input type="text" name="website" tabindex="-1" autocomplete="off"
                 style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"
                 aria-hidden="true">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="cf-name">Name</label>
              <input class="form-input" id="cf-name" name="name" type="text"
                     placeholder="Your name" required autocomplete="name">
            </div>
            <div class="form-group">
              <label class="form-label" for="cf-email">Email</label>
              <input class="form-input" id="cf-email" name="email" type="email"
                     placeholder="your@email.com" required autocomplete="email">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="cf-subject">Subject</label>
            <input class="form-input" id="cf-subject" name="subject" type="text"
                   placeholder="Project inquiry">
          </div>
          <div class="form-group">
            <label class="form-label" for="cf-message">Message</label>
            <textarea class="form-textarea" id="cf-message" name="message"
                      placeholder="Tell me about your project…" required></textarea>
          </div>
          <button type="submit" class="btn-submit">Send Message</button>
          <div id="form-msg" class="form-msg" role="alert" aria-live="polite"></div>
        </form>
      </div>
    </div>
  </div>
</section>


<!-- ══════════════════════════════════════════════════
     FOOTER
══════════════════════════════════════════════════ -->
<footer>
  <div class="container footer-inner">
    <p class="footer-copy">© <?= $year ?> <?= $name ?>. All rights reserved.</p>
    <a href="#hero" class="footer-back-top">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 15l7-7 7 7"/>
      </svg>
      Back to top
    </a>
  </div>
</footer>

<script src="assets/js/main.js" defer></script>
</body>
</html>