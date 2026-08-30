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
        if ($action === 'save_exp') {
            $id   = (int)($_POST['id'] ?? 0);
            $data = [
                'company'    => trim($_POST['company']  ?? ''),
                'role'       => trim($_POST['role']     ?? ''),
                'description'=> trim($_POST['description'] ?? ''),
                'location'   => trim($_POST['location'] ?? ''),
                'started_at' => !empty($_POST['started_at']) ? $_POST['started_at'] : null,
                'ended_at'   => !empty($_POST['ended_at'])   ? $_POST['ended_at']   : null,
                'is_current' => isset($_POST['is_current']) ? 1 : 0,
                'sort_order' => (int)($_POST['sort_order'] ?? 0),
            ];
            if (!empty($_FILES['logo']['name'])) {
                $url = uploadImage($_FILES['logo'], 'logos');
                if ($url) $data['logo_url'] = $url;
                else { setFlash('error', 'Logo upload failed. Use JPG/PNG/WebP/GIF under 5 MB.'); header('Location: experience.php'); exit; }
            }
            if ($id) {
                $set = implode(',', array_map(fn($k) => "$k=?", array_keys($data)));
                $db->prepare("UPDATE work_experience SET $set WHERE id=?")->execute([...array_values($data), $id]);
                setFlash('success', 'Experience updated.');
            } else {
                $cols = implode(',', array_keys($data));
                $phs  = implode(',', array_fill(0, count($data), '?'));
                $db->prepare("INSERT INTO work_experience ($cols) VALUES ($phs)")->execute(array_values($data));
                $id   = (int)$db->lastInsertId();
                setFlash('success', 'Experience added.');
            }
            // Save bullet highlights
            $db->prepare("DELETE FROM work_highlights WHERE experience_id=?")->execute([$id]);
            $bullets = array_filter(array_map('trim', explode("\n", $_POST['highlights'] ?? '')));
            foreach (array_values($bullets) as $i => $b) {
                $db->prepare("INSERT INTO work_highlights (experience_id, bullet, sort_order) VALUES (?,?,?)")
                   ->execute([$id, $b, $i]);
            }
            header('Location: experience.php'); exit;
        }

        if ($action === 'delete_exp') {
            $db->prepare("DELETE FROM work_experience WHERE id=?")->execute([(int)($_POST['id'] ?? 0)]);
            setFlash('success', 'Entry deleted.'); header('Location: experience.php'); exit;
        }
    } catch (PDOException $e) {
        setFlash('error', 'Save failed — please check the form and try again.');
        header('Location: experience.php'); exit;
    }
}

$jobs    = $db->query("SELECT * FROM work_experience ORDER BY sort_order, started_at DESC")->fetchAll();
$editing = null; $editHighlights = '';
if (isset($_GET['edit'])) {
    $s = $db->prepare("SELECT * FROM work_experience WHERE id=?");
    $s->execute([(int)$_GET['edit']]);
    $editing = $s->fetch();
    if ($editing) {
        $hs = $db->prepare("SELECT bullet FROM work_highlights WHERE experience_id=? ORDER BY sort_order");
        $hs->execute([$editing['id']]);
        $editHighlights = implode("\n", $hs->fetchAll(PDO::FETCH_COLUMN));
    }
}

cmsHead('Work Experience');
?>

<div class="two-col-layout">
  <div class="card">
    <div class="card-head">
      <h2 class="card-title"><?= $editing ? 'Edit Entry' : 'Add Experience' ?></h2>
      <?php if ($editing): ?><a href="experience.php" class="btn-sm">+ New</a><?php endif; ?>
    </div>
    <form method="POST" enctype="multipart/form-data">
      <?= csrf_field() ?>
      <input type="hidden" name="_action" value="save_exp">
      <?php if ($editing): ?><input type="hidden" name="id" value="<?= $editing['id'] ?>"><?php endif; ?>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="exp-company">Company</label>
          <input class="form-input" id="exp-company" name="company" required value="<?= htmlspecialchars($editing['company'] ?? '') ?>">
        </div>
        <div class="form-group">
          <label class="form-label" for="exp-role">Role / Title</label>
          <input class="form-input" id="exp-role" name="role" required value="<?= htmlspecialchars($editing['role'] ?? '') ?>">
        </div>
        <div class="form-group">
          <label class="form-label" for="exp-started">Start Date</label>
          <input class="form-input" id="exp-started" name="started_at" type="date" required value="<?= $editing['started_at'] ?? '' ?>">
        </div>
        <div class="form-group">
          <label class="form-label" for="exp-ended">End Date</label>
          <input class="form-input" id="exp-ended" name="ended_at" type="date" value="<?= $editing['ended_at'] ?? '' ?>">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="exp-location">Location</label>
        <input class="form-input" id="exp-location" name="location" value="<?= htmlspecialchars($editing['location'] ?? '') ?>">
      </div>
      <div class="form-group">
        <label class="form-label" for="exp-description">Description</label>
        <textarea class="form-input" id="exp-description" name="description" rows="3"><?= htmlspecialchars($editing['description'] ?? '') ?></textarea>
      </div>
      <div class="form-group">
        <label class="form-label" for="exp-highlights">Bullet Highlights <span class="hint">(one per line)</span></label>
        <textarea class="form-input" id="exp-highlights" name="highlights" rows="5" placeholder="Built X that achieved Y&#10;Led team of Z..."><?= htmlspecialchars($editHighlights) ?></textarea>
      </div>
      <div class="form-group">
        <label class="form-label" for="exp-logo">Company Logo (optional)</label>
        <input type="file" id="exp-logo" name="logo" accept="image/*" class="form-input" style="padding:0.4rem;">
      </div>
      <div class="form-group">
        <label class="check-label">
          <input type="checkbox" name="is_current" <?= ($editing['is_current'] ?? 0) ? 'checked' : '' ?>>
          Currently working here
        </label>
      </div>
      <div class="form-group">
        <label class="form-label" for="exp-sort">Sort Order</label>
        <input class="form-input" id="exp-sort" name="sort_order" type="number" value="<?= $editing['sort_order'] ?? 0 ?>">
      </div>
      <button type="submit" class="btn-primary"><?= $editing ? 'Update' : 'Add Entry' ?></button>
    </form>
  </div>

  <div class="card">
    <div class="card-head"><h2 class="card-title">All Entries</h2></div>
    <?php if ($jobs): ?>
    <div style="display:flex;flex-direction:column;gap:0;">
      <?php foreach ($jobs as $j): ?>
      <div style="padding:1rem 0;border-bottom:1px solid var(--border);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;">
          <div>
            <p style="font-size:0.9rem;font-weight:500;color:var(--text-1)"><?= htmlspecialchars($j['company']) ?></p>
            <p style="font-size:0.78rem;color:var(--gold);margin-top:0.15rem"><?= htmlspecialchars($j['role']) ?></p>
            <p style="font-size:0.72rem;color:var(--text-muted);margin-top:0.15rem">
              <?= $j['started_at'] ? date('M Y', strtotime($j['started_at'])) : '—' ?> — <?= $j['is_current'] ? 'Present' : ($j['ended_at'] ? date('M Y', strtotime($j['ended_at'])) : '—') ?>
            </p>
          </div>
          <div class="row-actions" style="flex-shrink:0;">
            <a href="?edit=<?= $j['id'] ?>" class="btn-sm">Edit</a>
            <form method="POST" style="display:inline">
              <?= csrf_field() ?>
              <input type="hidden" name="_action" value="delete_exp">
              <input type="hidden" name="id" value="<?= $j['id'] ?>">
              <button type="submit" class="btn-danger-sm" onclick="return confirm('Delete?')">Del</button>
            </form>
          </div>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
    <?php else: ?><p class="empty-state">No experience entries yet.</p><?php endif; ?>
  </div>
</div>

<?php cmsFoot(); ?>
