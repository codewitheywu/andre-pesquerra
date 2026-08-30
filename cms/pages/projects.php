<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
requireLogin();

$db = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $action = $_POST['_action'] ?? '';

    try {
        if ($action === 'save') {
            $id   = (int)($_POST['id'] ?? 0);
            $slug = trim($_POST['slug'] ?? preg_replace('/[^a-z0-9]+/', '-', strtolower(trim($_POST['title'] ?? ''))));
            $data = [
                'title'         => trim($_POST['title']      ?? ''),
                'slug'          => $slug,
                'summary'       => trim($_POST['summary']    ?? ''),
                'case_study'    => trim($_POST['case_study'] ?? ''),
                'challenges'    => trim($_POST['challenges'] ?? ''),
                'outcomes'      => trim($_POST['outcomes']   ?? ''),
                'live_url'      => trim($_POST['live_url']   ?? ''),
                'repo_url'      => trim($_POST['repo_url']   ?? ''),
                'status'        => ($_POST['status'] ?? '') === 'published' ? 'published' : 'draft',
                'is_featured'   => isset($_POST['is_featured']) ? 1 : 0,
                'is_visible'    => isset($_POST['is_visible'])  ? 1 : 0,
                'show_case_study_link' => isset($_POST['show_case_study_link']) ? 1 : 0,
                'sort_order'    => (int)($_POST['sort_order'] ?? 0),
            ];

            if (!isSafeUrl($data['live_url']) || !isSafeUrl($data['repo_url'])) {
                setFlash('error', 'Live URL and Repo URL must start with http:// or https://.');
                header('Location: projects.php'); exit;
            }

            if (!empty($_FILES['thumbnail']['name'])) {
                $url = uploadImage($_FILES['thumbnail'], 'projects');
                if ($url) $data['thumbnail_url'] = $url;
                else { setFlash('error', 'Thumbnail upload failed. Use JPG/PNG/WebP/GIF under 5 MB.'); header('Location: projects.php'); exit; }
            }
            if ($id) {
                $set = implode(',', array_map(fn($k) => "$k=?", array_keys($data)));
                $db->prepare("UPDATE projects SET $set WHERE id=?")->execute([...array_values($data), $id]);
                setFlash('success', 'Project updated.');
            } else {
                $cols = implode(',', array_keys($data));
                $phs  = implode(',', array_fill(0, count($data), '?'));
                $db->prepare("INSERT INTO projects ($cols) VALUES ($phs)")->execute(array_values($data));
                $id = (int)$db->lastInsertId();
                setFlash('success', 'Project created.');
            }
            // Tags
            $db->prepare("DELETE FROM project_tags WHERE project_id=?")->execute([$id]);
            foreach (array_filter(array_map('trim', explode(',', $_POST['tags'] ?? ''))) as $tag) {
                $db->prepare("INSERT INTO project_tags (project_id, tag) VALUES (?,?)")->execute([$id, $tag]);
            }
            // Tech
            $db->prepare("DELETE FROM project_tech WHERE project_id=?")->execute([$id]);
            foreach (array_filter(array_map('trim', explode(',', $_POST['tech'] ?? ''))) as $t) {
                $db->prepare("INSERT INTO project_tech (project_id, tech_name) VALUES (?,?)")->execute([$id, $t]);
            }
            header('Location: projects.php'); exit;
        }

        if ($action === 'delete') {
            $db->prepare("DELETE FROM projects WHERE id=?")->execute([(int)($_POST['id'] ?? 0)]);
            setFlash('success', 'Project deleted.'); header('Location: projects.php'); exit;
        }
    } catch (PDOException $e) {
        setFlash('error', 'Save failed — please check the form and try again.');
        header('Location: projects.php'); exit;
    }
}

$projects = $db->query("SELECT * FROM projects ORDER BY sort_order, created_at DESC")->fetchAll();
$editing  = null; $editTags = ''; $editTech = '';
if (isset($_GET['edit'])) {
    $s = $db->prepare("SELECT * FROM projects WHERE id=?");
    $s->execute([(int)$_GET['edit']]);
    $editing = $s->fetch();
    if ($editing) {
        $t = $db->prepare("SELECT tag FROM project_tags WHERE project_id=?");
        $t->execute([$editing['id']]);
        $editTags = implode(', ', $t->fetchAll(PDO::FETCH_COLUMN));
        $tc = $db->prepare("SELECT tech_name FROM project_tech WHERE project_id=?");
        $tc->execute([$editing['id']]);
        $editTech = implode(', ', $tc->fetchAll(PDO::FETCH_COLUMN));
    }
}

cmsHead('Projects');
?>

<!-- Form -->
<div class="card">
  <div class="card-head">
    <h2 class="card-title"><?= $editing ? 'Edit Project' : 'Add Project' ?></h2>
    <?php if ($editing): ?><a href="projects.php" class="btn-sm">+ New</a><?php endif; ?>
  </div>
  <form method="POST" enctype="multipart/form-data">
    <?= csrf_field() ?>
    <input type="hidden" name="_action" value="save">
    <?php if ($editing): ?><input type="hidden" name="id" value="<?= $editing['id'] ?>"><?php endif; ?>

    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label" for="proj-title">Title</label>
        <input class="form-input" id="proj-title" name="title" required value="<?= htmlspecialchars($editing['title'] ?? '') ?>">
      </div>
      <div class="form-group">
        <label class="form-label" for="proj-slug">Slug <span class="hint">(auto-generated if blank)</span></label>
        <input class="form-input" id="proj-slug" name="slug" value="<?= htmlspecialchars($editing['slug'] ?? '') ?>">
      </div>
    </div>

    <div class="form-group">
      <label class="form-label" for="proj-summary">Summary <span class="hint">(shown on card)</span></label>
      <textarea class="form-input" id="proj-summary" name="summary" rows="3"><?= htmlspecialchars($editing['summary'] ?? '') ?></textarea>
    </div>

    <div class="form-tabs" id="projectTabs">
      <div class="tab-bar" role="tablist">
        <button type="button" class="tab-btn active" role="tab" id="tabbtn-case"
                aria-controls="tab-case" aria-selected="true" data-tab="case">Case Study</button>
        <button type="button" class="tab-btn" role="tab" id="tabbtn-challenges"
                aria-controls="tab-challenges" aria-selected="false" data-tab="challenges">Challenges</button>
        <button type="button" class="tab-btn" role="tab" id="tabbtn-outcomes"
                aria-controls="tab-outcomes" aria-selected="false" data-tab="outcomes">Outcomes</button>
      </div>
      <div class="tab-panel active" id="tab-case" role="tabpanel" aria-labelledby="tabbtn-case">
        <label class="form-label" for="proj-case_study" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);">Case Study</label>
        <textarea class="form-input" id="proj-case_study" name="case_study" rows="8" placeholder="Tell the full story of this project..."><?= htmlspecialchars($editing['case_study'] ?? '') ?></textarea>
      </div>
      <div class="tab-panel" id="tab-challenges" role="tabpanel" aria-labelledby="tabbtn-challenges">
        <label class="form-label" for="proj-challenges" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);">Challenges</label>
        <textarea class="form-input" id="proj-challenges" name="challenges" rows="8" placeholder="What were the hard parts?"><?= htmlspecialchars($editing['challenges'] ?? '') ?></textarea>
      </div>
      <div class="tab-panel" id="tab-outcomes" role="tabpanel" aria-labelledby="tabbtn-outcomes">
        <label class="form-label" for="proj-outcomes" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);">Outcomes</label>
        <textarea class="form-input" id="proj-outcomes" name="outcomes" rows="8" placeholder="What was the result or impact?"><?= htmlspecialchars($editing['outcomes'] ?? '') ?></textarea>
      </div>
    </div>

    <div class="form-grid-2" style="margin-top:1.5rem;">
      <div class="form-group">
        <label class="form-label" for="proj-tags">Tags <span class="hint">(comma-separated)</span></label>
        <input class="form-input" id="proj-tags" name="tags" placeholder="PHP, SaaS, Open Source" value="<?= htmlspecialchars($editTags) ?>">
      </div>
      <div class="form-group">
        <label class="form-label" for="proj-tech">Tech Stack <span class="hint">(comma-separated)</span></label>
        <input class="form-input" id="proj-tech" name="tech" placeholder="PHP, MySQL, React" value="<?= htmlspecialchars($editTech) ?>">
      </div>
      <div class="form-group">
        <label class="form-label" for="proj-live_url">Live URL</label>
        <input class="form-input" id="proj-live_url" name="live_url" type="url" value="<?= htmlspecialchars($editing['live_url'] ?? '') ?>">
      </div>
      <div class="form-group">
        <label class="form-label" for="proj-repo_url">Repo URL</label>
        <input class="form-input" id="proj-repo_url" name="repo_url" type="url" value="<?= htmlspecialchars($editing['repo_url'] ?? '') ?>">
      </div>
      <div class="form-group">
        <label class="form-label" for="proj-status">Status</label>
        <select class="form-input" id="proj-status" name="status">
          <option value="draft"     <?= ($editing['status'] ?? '') === 'draft'     ? 'selected' : '' ?>>Draft</option>
          <option value="published" <?= ($editing['status'] ?? '') === 'published' ? 'selected' : '' ?>>Published</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="proj-sort">Sort Order</label>
        <input class="form-input" id="proj-sort" name="sort_order" type="number" value="<?= $editing['sort_order'] ?? 0 ?>">
      </div>
    </div>

    <div class="form-group">
      <label class="form-label" for="proj-thumbnail">Thumbnail Image</label>
      <input type="file" id="proj-thumbnail" name="thumbnail" accept="image/*" class="form-input" style="padding:0.4rem;">
      <?php if (!empty($editing['thumbnail_url'])): ?>
      <img src="<?= htmlspecialchars($editing['thumbnail_url']) ?>" style="height:60px;margin-top:0.5rem;border-radius:4px;"
           alt="<?= htmlspecialchars($editing['title'] ?? 'Project', ENT_QUOTES, 'UTF-8') ?> thumbnail">
      <?php endif; ?>
    </div>

    <div style="display:flex;gap:1.5rem;flex-wrap:wrap;">
      <label class="check-label"><input type="checkbox" name="is_featured" <?= ($editing['is_featured'] ?? 0) ? 'checked' : '' ?>> Featured project</label>
      <label class="check-label"><input type="checkbox" name="is_visible"  <?= ($editing['is_visible']  ?? 1) ? 'checked' : '' ?>> Visible on portfolio</label>
      <label class="check-label">
        <input type="checkbox" name="show_case_study_link" <?= ($editing['show_case_study_link'] ?? 1) ? 'checked' : '' ?>>
        Show "View Case Study" link <span class="hint">(uncheck for client work you'd rather not link publicly)</span>
      </label>
    </div>

    <div class="form-actions" style="margin-top:1.5rem;">
      <button type="submit" class="btn-primary"><?= $editing ? 'Update Project' : 'Create Project' ?></button>
    </div>
  </form>
</div>

<!-- List -->
<div class="card" style="margin-top:1.5rem;">
  <div class="card-head"><h2 class="card-title">All Projects</h2></div>
  <?php if ($projects): ?>
  <div class="cms-table-wrap">
  <table class="cms-table">
    <thead><tr><th>Title</th><th>Status</th><th>Featured</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($projects as $p): ?>
    <tr>
      <td>
        <p style="font-size:0.88rem;color:var(--text-1)"><?= htmlspecialchars($p['title']) ?></p>
        <p style="font-size:0.72rem;color:var(--text-muted)">/<?= htmlspecialchars($p['slug']) ?></p>
      </td>
      <td><span class="status-pill status-<?= htmlspecialchars($p['status'], ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars($p['status'], ENT_QUOTES, 'UTF-8') ?></span></td>
      <td><?= $p['is_featured'] ? '<span style="color:var(--gold)">★</span>' : '—' ?></td>
      <td class="row-actions">
        <a href="?edit=<?= $p['id'] ?>" class="btn-sm">Edit</a>
        <form method="POST" style="display:inline">
          <?= csrf_field() ?>
          <input type="hidden" name="_action" value="delete">
          <input type="hidden" name="id" value="<?= $p['id'] ?>">
          <button type="submit" class="btn-danger-sm" onclick="return confirm('Delete this project?')">Del</button>
        </form>
      </td>
    </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  </div>
  <?php else: ?><p class="empty-state">No projects yet.</p><?php endif; ?>
</div>

<?php cmsFoot(); ?>
