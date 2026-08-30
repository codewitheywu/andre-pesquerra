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
            $data = [
                'institution' => trim($_POST['institution'] ?? ''),
                'degree'      => trim($_POST['degree']      ?? ''),
                'field'       => trim($_POST['field']       ?? ''),
                'started_at'  => !empty($_POST['started_at']) ? $_POST['started_at'] : null,
                'ended_at'    => !empty($_POST['ended_at'])   ? $_POST['ended_at']   : null,
                'description' => trim($_POST['description'] ?? ''),
                'sort_order'  => (int)($_POST['sort_order'] ?? 0),
            ];
            if (!empty($_FILES['logo']['name'])) {
                $url = uploadImage($_FILES['logo'], 'logos');
                if ($url) $data['logo_url'] = $url;
                else { setFlash('error', 'Logo upload failed. Use JPG/PNG/WebP/GIF under 5 MB.'); header('Location: education.php'); exit; }
            }
            if ($id) {
                $set = implode(',', array_map(fn($k) => "$k=?", array_keys($data)));
                $db->prepare("UPDATE education SET $set WHERE id=?")->execute([...array_values($data), $id]);
                setFlash('success', 'Education entry updated.');
            } else {
                $cols = implode(',', array_keys($data));
                $phs  = implode(',', array_fill(0, count($data), '?'));
                $db->prepare("INSERT INTO education ($cols) VALUES ($phs)")->execute(array_values($data));
                setFlash('success', 'Education entry added.');
            }
            header('Location: education.php'); exit;
        }

        if ($action === 'delete') {
            $db->prepare("DELETE FROM education WHERE id=?")->execute([(int)($_POST['id'] ?? 0)]);
            setFlash('success', 'Entry deleted.');
            header('Location: education.php'); exit;
        }
    } catch (PDOException $e) {
        setFlash('error', 'Save failed — please check the form and try again.');
        header('Location: education.php'); exit;
    }
}

$entries = $db->query("SELECT * FROM education ORDER BY sort_order, started_at DESC")->fetchAll();
$editing = null;
if (isset($_GET['edit'])) {
    $s = $db->prepare("SELECT * FROM education WHERE id=?");
    $s->execute([(int)$_GET['edit']]);
    $editing = $s->fetch();
}

cmsHead('Education');
?>

<div class="two-col-layout">

  <!-- Form -->
  <div class="card">
    <div class="card-head">
      <h2 class="card-title"><?= $editing ? 'Edit Entry' : 'Add Education' ?></h2>
      <?php if ($editing): ?><a href="education.php" class="btn-sm">+ New</a><?php endif; ?>
    </div>
    <form method="POST" enctype="multipart/form-data">
      <?= csrf_field() ?>
      <input type="hidden" name="_action" value="save">
      <?php if ($editing): ?><input type="hidden" name="id" value="<?= $editing['id'] ?>"><?php endif; ?>

      <div class="form-group">
        <label class="form-label" for="edu-institution">Institution</label>
        <input class="form-input" id="edu-institution" name="institution" required
               value="<?= htmlspecialchars($editing['institution'] ?? '', ENT_QUOTES) ?>">
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="edu-degree">Degree</label>
          <input class="form-input" id="edu-degree" name="degree" placeholder="e.g. Bachelor of Science"
                 value="<?= htmlspecialchars($editing['degree'] ?? '', ENT_QUOTES) ?>">
        </div>
        <div class="form-group">
          <label class="form-label" for="edu-field">Field of Study</label>
          <input class="form-input" id="edu-field" name="field" placeholder="e.g. Information Technology"
                 value="<?= htmlspecialchars($editing['field'] ?? '', ENT_QUOTES) ?>">
        </div>
        <div class="form-group">
          <label class="form-label" for="edu-started">Start Date</label>
          <input class="form-input" id="edu-started" name="started_at" type="date" required
                 value="<?= $editing['started_at'] ?? '' ?>">
        </div>
        <div class="form-group">
          <label class="form-label" for="edu-ended">End Date <span class="hint">(blank if ongoing)</span></label>
          <input class="form-input" id="edu-ended" name="ended_at" type="date"
                 value="<?= $editing['ended_at'] ?? '' ?>">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="edu-description">Description <span class="hint">(optional)</span></label>
        <textarea class="form-input" id="edu-description" name="description" rows="4"
                  placeholder="Honors, activities, relevant coursework..."><?= htmlspecialchars($editing['description'] ?? '', ENT_QUOTES) ?></textarea>
      </div>

      <div class="form-group">
        <label class="form-label" for="edu-logo">Institution Logo <span class="hint">(optional)</span></label>
        <input type="file" id="edu-logo" name="logo" accept="image/*" class="form-input" style="padding:0.4rem;">
        <?php if (!empty($editing['logo_url'])): ?>
        <img src="<?= htmlspecialchars($editing['logo_url']) ?>"
             alt="<?= htmlspecialchars($editing['institution'] ?? 'Institution', ENT_QUOTES, 'UTF-8') ?> logo"
             style="height:36px;margin-top:0.5rem;border-radius:4px;">
        <?php endif; ?>
      </div>

      <div class="form-group">
        <label class="form-label" for="edu-sort">Sort Order</label>
        <input class="form-input" id="edu-sort" name="sort_order" type="number"
               value="<?= $editing['sort_order'] ?? 0 ?>">
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary">
          <?= $editing ? 'Update Entry' : 'Add Entry' ?>
        </button>
      </div>
    </form>
  </div>

  <!-- List -->
  <div class="card">
    <div class="card-head"><h2 class="card-title">All Entries</h2></div>
    <?php if ($entries): ?>
    <div style="display:flex;flex-direction:column;gap:0;">
      <?php foreach ($entries as $e): ?>
      <div style="padding:1rem 0;border-bottom:1px solid var(--border);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;">
          <div>
            <p style="font-size:0.88rem;font-weight:500;color:var(--text-1)">
              <?= htmlspecialchars($e['institution']) ?>
            </p>
            <?php if ($e['degree'] || $e['field']): ?>
            <p style="font-size:0.78rem;color:var(--gold);margin-top:0.15rem;">
              <?= htmlspecialchars(implode(' — ', array_filter([$e['degree'], $e['field']]))) ?>
            </p>
            <?php endif; ?>
            <p style="font-size:0.72rem;color:var(--text-muted);margin-top:0.15rem;">
              <?= $e['started_at'] ? date('Y', strtotime($e['started_at'])) : '?' ?>
              &ndash;
              <?= $e['ended_at'] ? date('Y', strtotime($e['ended_at'])) : 'Present' ?>
            </p>
          </div>
          <div class="row-actions" style="flex-shrink:0;">
            <a href="?edit=<?= $e['id'] ?>" class="btn-sm">Edit</a>
            <form method="POST" style="display:inline;">
              <?= csrf_field() ?>
              <input type="hidden" name="_action" value="delete">
              <input type="hidden" name="id" value="<?= $e['id'] ?>">
              <button type="submit" class="btn-danger-sm"
                      onclick="return confirm('Delete this entry?')">Del</button>
            </form>
          </div>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
    <?php else: ?>
    <p class="empty-state">No education entries yet.</p>
    <?php endif; ?>
  </div>

</div>

<?php cmsFoot(); ?>
