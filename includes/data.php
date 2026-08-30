<?php
require_once __DIR__ . '/db.php';

// ── Profile ──────────────────────────────────
function getProfile(): array {
    $db = getDB();
    $profile = $db->query("SELECT * FROM profile LIMIT 1")->fetch();
    if (!$profile) return [];

    $stmt = $db->prepare("SELECT * FROM social_links WHERE profile_id = ? ORDER BY sort_order");
    $stmt->execute([$profile['id']]);
    $profile['social_links'] = $stmt->fetchAll();

    return $profile;
}

// ── Skills ────────────────────────────────────
function getSkills(): array {
    return getDB()
        ->query("SELECT * FROM skills WHERE is_visible = 1 ORDER BY sort_order")
        ->fetchAll();
}

function getSkillsByCategory(): array {
    $skills = getSkills();
    $grouped = [];
    foreach ($skills as $skill) {
        $grouped[$skill['category']][] = $skill;
    }
    return $grouped;
}

// ── Work Experience ───────────────────────────
function getWorkExperience(): array {
    $db   = getDB();
    $jobs = $db->query("SELECT * FROM work_experience ORDER BY sort_order, started_at DESC")->fetchAll();

    foreach ($jobs as &$job) {
        $stmt = $db->prepare("SELECT bullet FROM work_highlights WHERE experience_id = ? ORDER BY sort_order");
        $stmt->execute([$job['id']]);
        $job['highlights'] = $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
    return $jobs;
}

// ── Education ─────────────────────────────────
function getEducation(): array {
    return getDB()
        ->query("SELECT * FROM education ORDER BY sort_order, started_at DESC")
        ->fetchAll();
}

// ── Projects ─────────────────────────────────
function getFeaturedProjects(): array {
    $db   = getDB();
    $rows = $db->query(
        "SELECT * FROM projects WHERE is_visible = 1 AND status = 'published'
         ORDER BY is_featured DESC, sort_order LIMIT 6"
    )->fetchAll();

    foreach ($rows as &$p) {
        $stmt = $db->prepare("SELECT tech_name, category FROM project_tech WHERE project_id = ?");
        $stmt->execute([$p['id']]);
        $p['tech'] = $stmt->fetchAll();

        $stmt = $db->prepare("SELECT tag FROM project_tags WHERE project_id = ?");
        $stmt->execute([$p['id']]);
        $p['tags'] = $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
    return $rows;
}

// ── Published project slugs (for sitemap.xml) ─
function getPublishedProjectSlugs(): array {
    return getDB()
        ->query("SELECT slug FROM projects WHERE is_visible = 1 AND status = 'published' ORDER BY sort_order")
        ->fetchAll(PDO::FETCH_COLUMN);
}

// ── Single Project by Slug ────────────────────
function getProjectBySlug(string $slug): array {
    $db   = getDB();
    $stmt = $db->prepare(
        "SELECT * FROM projects WHERE slug = ? AND is_visible = 1 AND status = 'published' LIMIT 1"
    );
    $stmt->execute([$slug]);
    $p = $stmt->fetch();
    if (!$p) return [];

    $t = $db->prepare("SELECT tech_name, category FROM project_tech WHERE project_id = ?");
    $t->execute([$p['id']]);
    $p['tech'] = $t->fetchAll();

    $tg = $db->prepare("SELECT tag FROM project_tags WHERE project_id = ?");
    $tg->execute([$p['id']]);
    $p['tags'] = $tg->fetchAll(PDO::FETCH_COLUMN);

    $im = $db->prepare("SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order");
    $im->execute([$p['id']]);
    $p['images'] = $im->fetchAll();

    return $p;
}

// ── Adjacent projects (prev / next) ──────────
function getAdjacentProjects(int $currentId): array {
    $db   = getDB();
    $all  = $db->query(
        "SELECT id, title, slug FROM projects
         WHERE is_visible = 1 AND status = 'published'
         ORDER BY sort_order, created_at DESC"
    )->fetchAll();

    $result = ['prev' => null, 'next' => null];
    foreach ($all as $i => $p) {
        if ((int)$p['id'] === $currentId) {
            $result['prev'] = $all[$i - 1] ?? null;
            $result['next'] = $all[$i + 1] ?? null;
            break;
        }
    }
    return $result;
}

// ── Testimonials ──────────────────────────────
function getTestimonials(): array {
    return getDB()
        ->query("SELECT * FROM testimonials WHERE is_visible = 1 ORDER BY sort_order")
        ->fetchAll();
}

// ── Contact: save message ─────────────────────
function saveContactMessage(string $name, string $email, string $subject, string $message, string $ip): bool {
    // Store raw validated input; the prepared statement handles SQL safety and
    // every read-side template already escapes with htmlspecialchars() on output.
    // Escaping here too would double-encode (e.g. an apostrophe would render as "&#039;").
    $stmt = getDB()->prepare(
        "INSERT INTO contact_messages (name, email, subject, message, ip_address) VALUES (?, ?, ?, ?, ?)"
    );
    return $stmt->execute([$name, $email, $subject, $message, $ip]);
}

// ── Contact: count messages from an IP in the current calendar month (anti-spam cap) ──
// Resets on the 1st of each month (e.g. July's count doesn't carry into August).
function countContactMessagesFromIp(string $ip): int {
    $stmt = getDB()->prepare(
        "SELECT COUNT(*) FROM contact_messages
         WHERE ip_address = ? AND YEAR(sent_at) = YEAR(NOW()) AND MONTH(sent_at) = MONTH(NOW())"
    );
    $stmt->execute([$ip]);
    return (int)$stmt->fetchColumn();
}