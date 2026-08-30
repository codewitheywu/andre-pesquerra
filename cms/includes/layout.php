<?php
function cmsHead(string $pageTitle): void {
    $user = currentUser();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($pageTitle) ?> — Portfolio CMS</title>
  <link rel="stylesheet" href="<?= BASE_URL ?>assets/css/cms.css">
</head>
<body>

<div class="cms-shell">

  <div class="sidebar-backdrop" id="sidebarBackdrop"></div>

  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-brand">
      <span class="brand-dot"></span>
      <span class="brand-name">Portfolio<em>CMS</em></span>
    </div>

    <nav class="sidebar-nav" id="cmsSidebarNav" aria-label="CMS navigation">
      <p class="nav-group-label">Content</p>
      <a href="<?= BASE_URL ?>index.php"           class="nav-item <?= basename($_SERVER['PHP_SELF']) === 'index.php' ? 'active' : '' ?>">
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        Dashboard
      </a>
      <a href="<?= BASE_URL ?>pages/profile.php"   class="nav-item <?= basename($_SERVER['PHP_SELF']) === 'profile.php' ? 'active' : '' ?>">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        Profile
      </a>
      <a href="<?= BASE_URL ?>pages/skills.php"    class="nav-item <?= basename($_SERVER['PHP_SELF']) === 'skills.php' ? 'active' : '' ?>">
        <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        Skills
      </a>
      <a href="<?= BASE_URL ?>pages/experience.php" class="nav-item <?= basename($_SERVER['PHP_SELF']) === 'experience.php' ? 'active' : '' ?>">
        <svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
        Experience
      </a>
      <a href="<?= BASE_URL ?>pages/education.php" class="nav-item <?= basename($_SERVER['PHP_SELF']) === 'education.php' ? 'active' : '' ?>">
        <svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        Education
      </a>
      <a href="<?= BASE_URL ?>pages/projects.php"  class="nav-item <?= basename($_SERVER['PHP_SELF']) === 'projects.php' ? 'active' : '' ?>">
        <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
        Projects
      </a>
      <a href="<?= BASE_URL ?>pages/testimonials.php" class="nav-item <?= basename($_SERVER['PHP_SELF']) === 'testimonials.php' ? 'active' : '' ?>">
        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        Testimonials
      </a>
      <a href="<?= BASE_URL ?>pages/messages.php"  class="nav-item <?= basename($_SERVER['PHP_SELF']) === 'messages.php' ? 'active' : '' ?>">
        <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        Messages
        <?php
          try {
            $unread = getDB()->query("SELECT COUNT(*) FROM contact_messages WHERE status='unread'")->fetchColumn();
            if ($unread > 0) echo '<span class="badge">' . $unread . '</span>';
          } catch(Exception $e) {}
        ?>
      </a>

      <p class="nav-group-label" style="margin-top:1.5rem;">System</p>
      <a href="<?= PUBLIC_URL ?>" class="nav-item" target="_blank">
        <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        View Site
      </a>
      <a href="<?= BASE_URL ?>logout.php" class="nav-item nav-logout">
        <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Logout
      </a>
    </nav>

    <div class="sidebar-user">
      <div class="user-avatar"><?= strtoupper(substr($user['username'] ?? 'A', 0, 1)) ?></div>
      <div>
        <p class="user-name"><?= htmlspecialchars($user['username'] ?? '') ?></p>
        <p class="user-role"><?= htmlspecialchars($user['role'] ?? '') ?></p>
      </div>
    </div>
  </aside>

  <!-- Main area -->
  <main class="cms-main">
    <div class="cms-topbar">
      <button type="button" class="cms-hamburger" id="cmsHamburger"
              aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="cmsSidebarNav">
        <span></span><span></span><span></span>
      </button>
      <h1 class="page-title"><?= htmlspecialchars($pageTitle) ?></h1>
    </div>

    <?php
    $flash = getFlash();
    if ($flash): ?>
    <div class="flash flash-<?= htmlspecialchars($flash['type']) ?>">
      <?= htmlspecialchars($flash['msg']) ?>
    </div>
    <?php endif; ?>

    <div class="cms-content">
<?php
}

function cmsFoot(): void {
?>
    </div><!-- .cms-content -->
  </main>
</div><!-- .cms-shell -->

<script src="<?= BASE_URL ?>assets/js/cms.js"></script>
</body>
</html>
<?php
}
