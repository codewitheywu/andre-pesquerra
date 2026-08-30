<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/layout.php';
requireLogin();

$db = getDB();
$stats = [
    'projects'     => $db->query("SELECT COUNT(*) FROM projects")->fetchColumn(),
    'skills'       => $db->query("SELECT COUNT(*) FROM skills")->fetchColumn(),
    'experience'   => $db->query("SELECT COUNT(*) FROM work_experience")->fetchColumn(),
    'testimonials' => $db->query("SELECT COUNT(*) FROM testimonials")->fetchColumn(),
    'messages'     => $db->query("SELECT COUNT(*) FROM contact_messages WHERE status='unread'")->fetchColumn(),
    'education'    => $db->query("SELECT COUNT(*) FROM education")->fetchColumn(),
];
$recentMessages = $db->query(
    "SELECT * FROM contact_messages ORDER BY sent_at DESC LIMIT 5"
)->fetchAll();

cmsHead('Dashboard');
?>

<div class="stat-grid">
  <a href="pages/projects.php" class="stat-card">
    <div class="stat-icon">
      <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
    </div>
    <div class="stat-val"><?= $stats['projects'] ?></div>
    <div class="stat-lbl">Projects</div>
  </a>
  <a href="pages/skills.php" class="stat-card">
    <div class="stat-icon">
      <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    </div>
    <div class="stat-val"><?= $stats['skills'] ?></div>
    <div class="stat-lbl">Skills</div>
  </a>
  <a href="pages/experience.php" class="stat-card">
    <div class="stat-icon">
      <svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
    </div>
    <div class="stat-val"><?= $stats['experience'] ?></div>
    <div class="stat-lbl">Work Entries</div>
  </a>
  <a href="pages/testimonials.php" class="stat-card">
    <div class="stat-icon">
      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
    </div>
    <div class="stat-val"><?= $stats['testimonials'] ?></div>
    <div class="stat-lbl">Testimonials</div>
  </a>
  <a href="pages/messages.php" class="stat-card <?= $stats['messages'] > 0 ? 'stat-card--alert' : '' ?>">
    <div class="stat-icon">
      <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
    </div>
    <div class="stat-val"><?= $stats['messages'] ?></div>
    <div class="stat-lbl">Unread Messages</div>
  </a>
  <a href="pages/education.php" class="stat-card">
    <div class="stat-icon">
      <svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
    </div>
    <div class="stat-val"><?= $stats['education'] ?></div>
    <div class="stat-lbl">Education</div>
  </a>
</div>

<div class="card" style="margin-top:2rem;">
  <div class="card-head">
    <h2 class="card-title">Recent Messages</h2>
    <a href="pages/messages.php" class="btn-sm">View All</a>
  </div>
  <?php if ($recentMessages): ?>
  <div class="cms-table-wrap">
  <table class="cms-table">
    <thead><tr><th>Name</th><th>Subject</th><th>Date</th><th>Status</th></tr></thead>
    <tbody>
    <?php foreach ($recentMessages as $m): ?>
    <tr>
      <td><?= htmlspecialchars($m['name'], ENT_QUOTES, 'UTF-8') ?></td>
      <td><?= htmlspecialchars($m['subject'] ?? '—', ENT_QUOTES, 'UTF-8') ?></td>
      <td><?= date('M j, Y', strtotime($m['sent_at'])) ?></td>
      <td><span class="status-pill status-<?= htmlspecialchars($m['status'], ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars($m['status'], ENT_QUOTES, 'UTF-8') ?></span></td>
    </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  </div>
  <?php else: ?>
  <p class="empty-state">No messages yet.</p>
  <?php endif; ?>
</div>

<?php cmsFoot(); ?>
