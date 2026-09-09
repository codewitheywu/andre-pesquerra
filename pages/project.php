<?php
require_once __DIR__ . '/../includes/data.php';
require_once __DIR__ . '/../includes/security.php';
sendSecurityHeaders();

try {
    $slug    = trim($_GET['slug'] ?? '');
    $project = $slug ? getProjectBySlug($slug) : [];
} catch (RuntimeException $e) {
    http_response_code(503);
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Temporarily Unavailable</title>
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <link rel="stylesheet" href="../assets/css/style.css">
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

// 404 if not found
if (!$project) {
    http_response_code(404);
    $profile = getProfile();
    $name    = htmlspecialchars($profile['full_name'] ?? 'Portfolio', ENT_QUOTES, 'UTF-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Not Found: <?= $name ?></title>
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
  <nav id="nav" class="scrolled">
    <div class="container nav-inner">
      <a href="../index.php" class="nav-logo"><?= explode(' ', $name)[0] ?><span>.</span></a>
    </div>
  </nav>
  <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;">
    <p style="font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);margin-bottom:1rem;">404</p>
    <h1 class="section-title" style="margin-bottom:1.5rem;">Project <em>not found.</em></h1>
    <a href="../index.php#projects" class="btn-ghost">← Back to Projects</a>
  </div>
</body>
</html>
<?php
    exit;
}

$profile  = getProfile();
$adjacent = getAdjacentProjects((int)$project['id']);
$name     = htmlspecialchars($profile['full_name'] ?? 'Portfolio', ENT_QUOTES, 'UTF-8');
$title    = htmlspecialchars($project['title'], ENT_QUOTES, 'UTF-8');
$year     = date('Y');

// Group tech by category
$techGrouped = [];
foreach ($project['tech'] as $t) {
    $techGrouped[$t['category'] ?: 'Stack'][] = $t['tech_name'];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="<?= htmlspecialchars($project['summary'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
  <link rel="canonical" href="https://andre-pesquerra.vercel.app/pages/<?= htmlspecialchars($project['slug'], ENT_QUOTES, 'UTF-8') ?>.html">
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <title><?= $title ?>, <?= $name ?></title>

  <meta property="og:type" content="article">
  <meta property="og:url" content="https://andre-pesquerra.vercel.app/pages/<?= htmlspecialchars($project['slug'], ENT_QUOTES, 'UTF-8') ?>.html">
  <meta property="og:title" content="<?= $title ?>, <?= $name ?>">
  <meta property="og:description" content="<?= htmlspecialchars($project['summary'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
  <meta property="og:image" content="https://andre-pesquerra.vercel.app/assets/img/avatar/Pesquerra.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?= $title ?>, <?= $name ?>">
  <meta name="twitter:description" content="<?= htmlspecialchars($project['summary'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
  <meta name="twitter:image" content="https://andre-pesquerra.vercel.app/assets/img/avatar/Pesquerra.jpg">

  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/project.css">
</head>
<body>

<!-- ── Nav ──────────────────────────────────────────────────── -->
<nav id="nav" aria-label="Primary navigation">
  <div class="container nav-inner">
    <a href="../index.php" class="nav-logo"><?= explode(' ', $name)[0] ?><span>.</span></a>
    <a href="../index.php#projects" class="btn-ghost" style="font-size:0.72rem;padding:0.5rem 1.2rem;">
      ← All Projects
    </a>
  </div>
</nav>

<!-- ── Hero ──────────────────────────────────────────────────── -->
<section class="proj-hero">
  <div class="hero-bg-lines" aria-hidden="true"></div>
  <div class="container">
    <div class="proj-hero-inner">

      <?php if (!empty($project['tags'])): ?>
      <div class="proj-tags reveal">
        <?php foreach ($project['tags'] as $tag): ?>
        <span class="project-tag"><?= htmlspecialchars($tag, ENT_QUOTES, 'UTF-8') ?></span>
        <?php endforeach; ?>
      </div>
      <?php endif; ?>

      <h1 class="proj-title reveal reveal-delay-1"><?= $title ?></h1>

      <?php if ($project['summary']): ?>
      <p class="proj-summary reveal reveal-delay-2">
        <?= htmlspecialchars($project['summary'], ENT_QUOTES, 'UTF-8') ?>
      </p>
      <?php endif; ?>

      <div class="proj-hero-meta reveal reveal-delay-3">
        <!-- Tech stack pills -->
        <?php if (!empty($project['tech'])): ?>
        <div class="proj-tech-list">
          <?php foreach ($project['tech'] as $t): ?>
          <span class="proj-tech-pill">
            <?= htmlspecialchars($t['tech_name'], ENT_QUOTES, 'UTF-8') ?>
          </span>
          <?php endforeach; ?>
        </div>
        <?php endif; ?>

        <!-- Action links -->
        <div class="proj-actions">
          <?php if ($project['live_url']): ?>
          <a href="<?= htmlspecialchars($project['live_url'], ENT_QUOTES, 'UTF-8') ?>"
             class="btn-primary" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
            Live Site
          </a>
          <?php endif; ?>
          <?php if ($project['repo_url']): ?>
          <a href="<?= htmlspecialchars($project['repo_url'], ENT_QUOTES, 'UTF-8') ?>"
             class="btn-ghost" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>
            </svg>
            Source Code
          </a>
          <?php endif; ?>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ── Thumbnail ─────────────────────────────────────────────── -->
<?php if ($project['thumbnail_url']): ?>
<div class="proj-thumbnail reveal">
  <div class="container">
    <img src="<?= htmlspecialchars($project['thumbnail_url'], ENT_QUOTES, 'UTF-8') ?>"
         alt="<?= $title ?> preview" loading="lazy">
  </div>
</div>
<?php endif; ?>

<!-- ── Case Study Body ────────────────────────────────────────── -->
<div class="container">
  <div class="proj-body">

    <!-- Sidebar: tech breakdown -->
    <aside class="proj-sidebar reveal">
      <?php foreach ($techGrouped as $cat => $items): ?>
      <div class="proj-sidebar-block">
        <p class="proj-sidebar-label"><?= htmlspecialchars($cat, ENT_QUOTES, 'UTF-8') ?></p>
        <?php foreach ($items as $item): ?>
        <p class="proj-sidebar-item"><?= htmlspecialchars($item, ENT_QUOTES, 'UTF-8') ?></p>
        <?php endforeach; ?>
      </div>
      <?php endforeach; ?>

      <?php if ($project['live_url']): ?>
      <div class="proj-sidebar-block">
        <p class="proj-sidebar-label">Live URL</p>
        <a href="<?= htmlspecialchars($project['live_url'], ENT_QUOTES, 'UTF-8') ?>"
           class="proj-sidebar-link" target="_blank" rel="noopener">
          <?= htmlspecialchars((string)(parse_url($project['live_url'], PHP_URL_HOST) ?: $project['live_url']), ENT_QUOTES, 'UTF-8') ?>
        </a>
      </div>
      <?php endif; ?>
    </aside>

    <!-- Main content -->
    <div class="proj-content">

      <?php if ($project['case_study']): ?>
      <div class="proj-section reveal">
        <div class="gold-rule"><span></span><p>Overview</p></div>
        <div class="proj-prose">
          <?= nl2br(htmlspecialchars($project['case_study'], ENT_QUOTES, 'UTF-8')) ?>
        </div>
      </div>
      <?php endif; ?>

      <?php if ($project['challenges']): ?>
      <div class="proj-section reveal">
        <div class="gold-rule"><span></span><p>Challenges</p></div>
        <div class="proj-prose">
          <?= nl2br(htmlspecialchars($project['challenges'], ENT_QUOTES, 'UTF-8')) ?>
        </div>
      </div>
      <?php endif; ?>

      <?php if ($project['outcomes']): ?>
      <div class="proj-section reveal">
        <div class="gold-rule"><span></span><p>Outcomes</p></div>
        <div class="proj-prose">
          <?= nl2br(htmlspecialchars($project['outcomes'], ENT_QUOTES, 'UTF-8')) ?>
        </div>
      </div>
      <?php endif; ?>

      <!-- Gallery -->
      <?php if (!empty($project['images'])): ?>
      <div class="proj-section reveal">
        <div class="gold-rule"><span></span><p>Gallery</p></div>
        <div class="proj-gallery">
          <?php foreach ($project['images'] as $img): ?>
          <figure class="proj-gallery-item">
            <img src="<?= htmlspecialchars($img['image_url'], ENT_QUOTES, 'UTF-8') ?>"
                 alt="<?= htmlspecialchars($img['caption'] ?? $title, ENT_QUOTES, 'UTF-8') ?>" loading="lazy">
            <?php if ($img['caption']): ?>
            <figcaption><?= htmlspecialchars($img['caption'], ENT_QUOTES, 'UTF-8') ?></figcaption>
            <?php endif; ?>
          </figure>
          <?php endforeach; ?>
        </div>
      </div>
      <?php endif; ?>

    </div><!-- .proj-content -->
  </div><!-- .proj-body -->
</div>

<!-- ── Prev / Next ────────────────────────────────────────────── -->
<div class="proj-adjacent" aria-label="More projects">
  <div class="container">
    <div class="proj-adjacent-inner">
      <?php if ($adjacent['prev']): ?>
      <a href="project.php?slug=<?= urlencode($adjacent['prev']['slug']) ?>" class="adj-card adj-prev">
        <span class="adj-label">← Previous</span>
        <span class="adj-title"><?= htmlspecialchars($adjacent['prev']['title'], ENT_QUOTES, 'UTF-8') ?></span>
      </a>
      <?php else: ?>
      <div></div>
      <?php endif; ?>

      <a href="../index.php#projects" class="adj-all">All Projects</a>

      <?php if ($adjacent['next']): ?>
      <a href="project.php?slug=<?= urlencode($adjacent['next']['slug']) ?>" class="adj-card adj-next">
        <span class="adj-label">Next →</span>
        <span class="adj-title"><?= htmlspecialchars($adjacent['next']['title'], ENT_QUOTES, 'UTF-8') ?></span>
      </a>
      <?php else: ?>
      <div></div>
      <?php endif; ?>
    </div>
  </div>
</div>

<!-- ── Footer ────────────────────────────────────────────────── -->
<footer>
  <div class="container footer-inner">
    <div class="footer-left">
      <p class="footer-copy">© <?= $year ?> <?= $name ?>. All rights reserved.</p>
      <div class="footer-links">
        <a href="../privacy/">Privacy Policy</a>
        <a href="../terms/">Terms</a>
      </div>
    </div>
    <a href="#" class="footer-back-top" onclick="window.scrollTo({top:0,behavior:'smooth'});return false;">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="12" height="12" stroke="currentColor">
        <path d="M5 15l7-7 7 7"/>
      </svg>
      Back to top
    </a>
  </div>
</footer>

<div class="cookie-banner" id="cookie-banner" role="dialog" aria-label="Cookie consent">
  <p>This site uses minimal, privacy-friendly analytics and a small cookie to remember your choice. No ad trackers, ever. See the <a href="../privacy/">Privacy Policy</a> for details.</p>
  <div class="cookie-banner-actions">
    <button type="button" class="cookie-accept" id="cookie-accept">Accept</button>
    <button type="button" class="cookie-decline" id="cookie-decline">Decline</button>
  </div>
</div>

<script src="../assets/js/main.js" defer></script>
</body>
</html>