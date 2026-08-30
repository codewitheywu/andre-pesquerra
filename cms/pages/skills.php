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
                'name'        => trim($_POST['name'] ?? ''),
                'category'    => trim($_POST['category'] ?? ''),
                'proficiency' => max(1, min(100, (int)($_POST['proficiency'] ?? 80))),
                'sort_order'  => (int)($_POST['sort_order'] ?? 0),
                'is_visible'  => isset($_POST['is_visible']) ? 1 : 0,
            ];
            if (!empty($_FILES['icon']['name'])) {
                $url = uploadImage($_FILES['icon'], 'skills');
                if ($url) $data['icon_url'] = $url;
                else { setFlash('error', 'Icon upload failed. Use JPG/PNG/WebP/GIF under 5 MB.'); header('Location: skills.php'); exit; }
            }
            if ($id) {
                $set  = implode(', ', array_map(fn($k) => "$k=?", array_keys($data)));
                $db->prepare("UPDATE skills SET $set WHERE id=?")->execute([...array_values($data), $id]);
                setFlash('success', 'Skill updated.');
            } else {
                $cols = implode(',', array_keys($data));
                $phs  = implode(',', array_fill(0, count($data), '?'));
                $db->prepare("INSERT INTO skills ($cols) VALUES ($phs)")->execute(array_values($data));
                setFlash('success', 'Skill added.');
            }
            header('Location: skills.php'); exit;
        }

        if ($action === 'delete') {
            $db->prepare("DELETE FROM skills WHERE id=?")->execute([(int)($_POST['id'] ?? 0)]);
            setFlash('success', 'Skill deleted.'); header('Location: skills.php'); exit;
        }

        if ($action === 'toggle') {
            $db->prepare("UPDATE skills SET is_visible = NOT is_visible WHERE id=?")->execute([(int)($_POST['id'] ?? 0)]);
            header('Location: skills.php'); exit;
        }
    } catch (PDOException $e) {
        setFlash('error', 'Save failed — please check the form and try again.');
        header('Location: skills.php'); exit;
    }
}

$skills  = $db->query("SELECT * FROM skills ORDER BY sort_order, name")->fetchAll();
$editing = null;
if (isset($_GET['edit'])) {
    $s = $db->prepare("SELECT * FROM skills WHERE id=?");
    $s->execute([(int)$_GET['edit']]);
    $editing = $s->fetch();
}

cmsHead('Skills');
?>

<div class="two-col-layout">
  <!-- Form -->
  <div class="card">
    <div class="card-head">
      <h2 class="card-title"><?= $editing ? 'Edit Skill' : 'Add Skill' ?></h2>
      <?php if ($editing): ?><a href="skills.php" class="btn-sm">+ New</a><?php endif; ?>
    </div>
    <form method="POST" enctype="multipart/form-data">
      <?= csrf_field() ?>
      <input type="hidden" name="_action" value="save">
      <?php if ($editing): ?><input type="hidden" name="id" value="<?= $editing['id'] ?>"><?php endif; ?>

      <div class="form-group">
        <label class="form-label" for="skill-name">Skill Name</label>
        <input class="form-input" id="skill-name" name="name" required value="<?= htmlspecialchars($editing['name'] ?? '', ENT_QUOTES) ?>">
      </div>
      <div class="form-group">
        <label class="form-label" for="skill-category">Category</label>
        <input class="form-input" id="skill-category" name="category" placeholder="Frontend / Backend / Tools"
               value="<?= htmlspecialchars($editing['category'] ?? '', ENT_QUOTES) ?>">
      </div>
      <div class="form-group">
        <label class="form-label" for="profRange">Proficiency (1–100)</label>
        <div style="display:flex;align-items:center;gap:1rem;">
          <input class="form-input" name="proficiency" type="range" min="1" max="100"
                 style="flex:1;padding:0;border:none;background:none;"
                 id="profRange" value="<?= $editing['proficiency'] ?? 80 ?>"
                 oninput="document.getElementById('profVal').textContent=this.value">
          <span id="profVal" style="color:var(--gold);min-width:2rem;"><?= (int)($editing['proficiency'] ?? 80) ?></span>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="skill-sort">Sort Order</label>
        <input class="form-input" id="skill-sort" name="sort_order" type="number" value="<?= $editing['sort_order'] ?? 0 ?>">
      </div>
      <div class="form-group">
        <label class="form-label" for="skill-icon">Icon Image (optional)</label>
        <input type="file" id="skill-icon" name="icon" accept="image/*" class="form-input" style="padding:0.4rem;">
        <?php if (!empty($editing['icon_url'])): ?>
        <img src="<?= htmlspecialchars($editing['icon_url']) ?>" style="height:32px;margin-top:0.5rem;"
             alt="<?= htmlspecialchars($editing['name'] ?? 'Skill', ENT_QUOTES, 'UTF-8') ?> icon">
        <?php endif; ?>
      </div>
      <div class="form-group">
        <label class="check-label">
          <input type="checkbox" name="is_visible" <?= ($editing['is_visible'] ?? 1) ? 'checked' : '' ?>>
          Visible on portfolio
        </label>
      </div>
      <button type="submit" class="btn-primary"><?= $editing ? 'Update Skill' : 'Add Skill' ?></button>
    </form>
  </div>

  <!-- List -->
  <div class="card">
    <div class="card-head"><h2 class="card-title">All Skills</h2></div>
    <?php if ($skills): ?>
    <div class="cms-table-wrap">
    <table class="cms-table">
      <thead><tr><th>Name</th><th>Category</th><th>Level</th><th>Vis</th><th></th></tr></thead>
      <tbody>
      <?php foreach ($skills as $sk): ?>
      <tr>
        <td><?= htmlspecialchars($sk['name']) ?></td>
        <td><?= htmlspecialchars($sk['category'] ?? '—') ?></td>
        <td>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <div style="flex:1;height:4px;background:var(--border);border-radius:2px;">
              <div style="width:<?= (int)$sk['proficiency'] ?>%;height:100%;background:var(--gold);border-radius:2px;"></div>
            </div>
            <span style="font-size:0.75rem;color:var(--gold)"><?= (int)$sk['proficiency'] ?></span>
          </div>
        </td>
        <td>
          <form method="POST" style="display:inline">
            <?= csrf_field() ?>
            <input type="hidden" name="_action" value="toggle">
            <input type="hidden" name="id" value="<?= $sk['id'] ?>">
            <button type="submit" class="toggle-btn <?= $sk['is_visible'] ? 'on' : 'off' ?>"
                    aria-pressed="<?= $sk['is_visible'] ? 'true' : 'false' ?>"
                    aria-label="<?= $sk['is_visible'] ? 'Visible — click to hide' : 'Hidden — click to show' ?>"
                    title="Toggle visibility"></button>
          </form>
        </td>
        <td class="row-actions">
          <a href="?edit=<?= $sk['id'] ?>" class="btn-sm">Edit</a>
          <form method="POST" style="display:inline">
            <?= csrf_field() ?>
            <input type="hidden" name="_action" value="delete">
            <input type="hidden" name="id" value="<?= $sk['id'] ?>">
            <button type="submit" class="btn-danger-sm" onclick="return confirm('Delete this skill?')">Del</button>
          </form>
        </td>
      </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
    </div>
    <?php else: ?><p class="empty-state">No skills added yet.</p><?php endif; ?>
  </div>
</div>

<?php cmsFoot(); ?>
