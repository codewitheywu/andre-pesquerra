<?php
require_once __DIR__ . '/../includes/data.php';
require_once __DIR__ . '/../includes/url.php';

header('Content-Type: application/xml; charset=UTF-8');

$base = rtrim(siteBaseUrl() . urlPathFor(dirname(__DIR__)), '/');

$slugs = getPublishedProjectSlugs();

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc><?= htmlspecialchars($base . '/', ENT_QUOTES, 'UTF-8') ?></loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <?php foreach ($slugs as $slug): ?>
  <url>
    <loc><?= htmlspecialchars($base . '/pages/project.php?slug=' . urlencode($slug), ENT_QUOTES, 'UTF-8') ?></loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <?php endforeach; ?>
  <url>
    <loc><?= htmlspecialchars($base . '/privacy/', ENT_QUOTES, 'UTF-8') ?></loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc><?= htmlspecialchars($base . '/terms/', ENT_QUOTES, 'UTF-8') ?></loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
