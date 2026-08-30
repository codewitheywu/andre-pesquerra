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
                'name'       => trim($_POST['name']    ?? ''),
                'title'      => trim($_POST['title']   ?? ''),
                'company'    => trim($_POST['company'] ?? ''),
                'quote'      => trim($_POST['quote']   ?? ''),
                'rating'     => max(1, min(5, (int)($_POST['rating'] ?? 5))),
                'sort_order' => (int)($_POST['sort_order'] ?? 0),
                'is_visible' => isset($_POST['is_visible']) ? 1 : 0,
            ];
            if (!empty($_FILES['avatar']['name'])) {
                $url = uploadImage($_FILES['avatar'], 'testimonials');
                if ($url) $data['avatar_url'] = $url;
                else { setFlash('error', 'Avatar upload failed. Use JPG/PNG/WebP/GIF under 5 MB.'); header('Location: testimonials.php'); exit; }
            }
            if ($id) {
                $set = implode(',', array_map(fn($k) => "$k=?", array_keys($data)));
                $db->prepare("UPDATE testimonials SET $set WHERE id=?")->execute([...array_values($data), $id]);
                setFlash('success', 'Testimonial updated.');
            } else {
                $cols = implode(',', array_keys($data));
                $phs  = implode(',', array_fill(0, count($data), '?'));
                $db->prepare("INSERT INTO testimonials ($cols) VALUES ($phs)")->execute(array_values($data));
                setFlash('success', 'Testimonial added.');
            }
            header('Location: testimonials.php'); exit;
        }

        if ($action === 'delete') {
            $db->prepare("DELETE FROM testimonials WHERE id=?")->execute([(int)($_POST['id'] ?? 0)]);
            setFlash('success', 'Testimonial deleted.');
            header('Location: testimonials.php'); exit;
        }

        if ($action === 'toggle') {
            $db->prepare("UPDATE testimonials SET is_visible = NOT is_visible WHERE id=?")
               ->execute([(int)($_POST['id'] ?? 0)]);
            header('Location: testimonials.php'); exit;
        }
    } catch (PDOException $e) {
        setFlash('error', 'Save failed — please check the form and try again.');
        header('Location: testimonials.php'); exit;
    }
}

$testimonials = $db->query("SELECT * FROM testimonials ORDER BY sort_order, created_at DESC")->fetchAll();
$editing      = null;
if (isset($_GET['edit'])) {
    $s = $db->prepare("SELECT * FROM testimonials WHERE id=?");
    $s->execute([(int)$_GET['edit']]);
    $editing = $s->fetch();
}

cmsHead('Testimonials');
?>

<div class="two-col-layout">

  <!-- Form -->
  <div class="card">
    <div class="card-head">
      <h2 class="card-title"><?= $editing ? 'Edit Testimonial' : 'Add Testimonial' ?></h2>
      <?php if ($editing): ?><a href="testimonials.php" class="btn-sm">+ New</a><?php endif; ?>
    </div>
    <form method="POST" enctype="multipart/form-data">
      <?= csrf_field() ?>
      <input type="hidden" name="_action" value="save">
      <?php if ($editing): ?><input type="hidden" name="id" value="<?= $editing['id'] ?>"><?php endif; ?>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="testi-name">Name</label>
          <input class="form-input" id="testi-name" name="name" required
                 value="<?= htmlspecialchars($editing['name'] ?? '', ENT_QUOTES) ?>">
        </div>
        <div class="form-group">
          <label class="form-label" for="testi-title">Job Title</label>
          <input class="form-input" id="testi-title" name="title" placeholder="e.g. Project Manager"
                 value="<?= htmlspecialchars($editing['title'] ?? '', ENT_QUOTES) ?>">
        </div>
        <div class="form-group">
          <label class="form-label" for="testi-company">Company</label>
          <input class="form-input" id="testi-company" name="company"
                 value="<?= htmlspecialchars($editing['company'] ?? '', ENT_QUOTES) ?>">
        </div>
        <div class="form-group">
          <label class="form-label" for="ratingRange">Rating (1–5)</label>
          <div style="display:flex;align-items:center;gap:1rem;">
            <input class="form-input" name="rating" type="range" min="1" max="5"
                   style="flex:1;padding:0;border:none;background:none;"
                   id="ratingRange" value="<?= $editing['rating'] ?? 5 ?>"
                   oninput="document.getElementById('ratingVal').textContent='★'.repeat(+this.value)">
            <span id="ratingVal" style="color:var(--gold);letter-spacing:2px;">
              <?= str_repeat('★', (int)($editing['rating'] ?? 5)) ?>
            </span>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="testi-quote">Quote</label>
        <textarea class="form-input" id="testi-quote" name="quote" rows="5" required
                  placeholder="What did they say about your work?"><?= htmlspecialchars($editing['quote'] ?? '', ENT_QUOTES) ?></textarea>
      </div>

      <div class="form-group">
        <label class="form-label" for="testi-avatar">Avatar Photo <span class="hint">(optional)</span></label>
        <input type="file" id="testi-avatar" name="avatar" accept="image/*" class="form-input" style="padding:0.4rem;">
        <?php if (!empty($editing['avatar_url'])): ?>
        <img src="<?= htmlspecialchars($editing['avatar_url']) ?>"
             alt="<?= htmlspecialchars($editing['name'] ?? 'Reviewer', ENT_QUOTES, 'UTF-8') ?> avatar"
             style="height:40px;width:40px;border-radius:50%;margin-top:0.5rem;object-fit:cover;">
        <?php endif; ?>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="testi-sort">Sort Order</label>
          <input class="form-input" id="testi-sort" name="sort_order" type="number"
                 value="<?= $editing['sort_order'] ?? 0 ?>">
        </div>
        <div class="form-group" style="display:flex;align-items:flex-end;padding-bottom:0.15rem;">
          <label class="check-label">
            <input type="checkbox" name="is_visible"
                   <?= ($editing['is_visible'] ?? 1) ? 'checked' : '' ?>>
            Visible on portfolio
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary">
          <?= $editing ? 'Update' : 'Add Testimonial' ?>
        </button>
      </div>
    </form>
  </div>

  <!-- List -->
  <div class="card">
    <div class="card-head"><h2 class="card-title">All Testimonials</h2></div>
    <?php if ($testimonials): ?>
    <div style="display:flex;flex-direction:column;gap:0;">
      <?php foreach ($testimonials as $t): ?>
      <div style="padding:1rem 0;border-bottom:1px solid var(--border);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;">
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.3rem;">
              <?php if (!empty($t['avatar_url'])): ?>
              <img src="<?= htmlspecialchars($t['avatar_url']) ?>" alt=""
                   style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0;">
              <?php endif; ?>
              <p style="font-size:0.88rem;font-weight:500;color:var(--text-1)">
                <?= htmlspecialchars($t['name']) ?>
              </p>
              <span style="color:var(--gold);font-size:0.7rem;letter-spacing:1px;">
                <?= str_repeat('★', (int)$t['rating']) ?>
              </span>
            </div>
            <p style="font-size:0.75rem;color:var(--gold);">
              <?= htmlspecialchars(implode(' · ', array_filter([$t['title'], $t['company']]))) ?>
            </p>
            <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.3rem;
                      overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:240px;">
              "<?= htmlspecialchars($t['quote']) ?>"
            </p>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.4rem;flex-shrink:0;">
            <div class="row-actions">
              <a href="?edit=<?= $t['id'] ?>" class="btn-sm">Edit</a>
              <form method="POST" style="display:inline;">
                <?= csrf_field() ?>
                <input type="hidden" name="_action" value="delete">
                <input type="hidden" name="id" value="<?= $t['id'] ?>">
                <button type="submit" class="btn-danger-sm"
                        onclick="return confirm('Delete this testimonial?')">Del</button>
              </form>
            </div>
            <form method="POST">
              <?= csrf_field() ?>
              <input type="hidden" name="_action" value="toggle">
              <input type="hidden" name="id" value="<?= $t['id'] ?>">
              <button type="submit" class="toggle-btn <?= $t['is_visible'] ? 'on' : 'off' ?>"
                      aria-pressed="<?= $t['is_visible'] ? 'true' : 'false' ?>"
                      aria-label="<?= $t['is_visible'] ? 'Visible — click to hide' : 'Hidden — click to show' ?>"
                      title="Toggle visibility"></button>
            </form>
          </div>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
    <?php else: ?>
    <p class="empty-state">No testimonials yet.</p>
    <?php endif; ?>
  </div>

</div>

<?php cmsFoot(); ?>
