<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
requireLogin();

$db = getDB();

// ── Handle form submission ───────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $action = $_POST['_action'] ?? '';

    try {
        // Save profile
        if ($action === 'save_profile') {
            $fields = ['full_name','tagline','bio','location','email','phone','resume_url'];
            $data   = [];
            foreach ($fields as $f) $data[$f] = trim($_POST[$f] ?? '');

            if (!isSafeUrl($data['resume_url'])) {
                setFlash('error', 'Resume URL must start with http:// or https://.');
                header('Location: profile.php'); exit;
            }

            // Avatar upload
            if (!empty($_FILES['avatar']['name'])) {
                $url = uploadImage($_FILES['avatar'], 'avatar');
                if ($url) $data['avatar_url'] = $url;
                else { setFlash('error', 'Avatar upload failed. Use JPG/PNG/WebP under 5 MB.'); header('Location: profile.php'); exit; }
            }

            // Resume upload (takes precedence over the URL field below, if provided)
            if (!empty($_FILES['resume']['name'])) {
                $url = uploadDocument($_FILES['resume']);
                if ($url) $data['resume_url'] = $url;
                else { setFlash('error', 'Resume upload failed. Use a PDF under 5 MB.'); header('Location: profile.php'); exit; }
            }

            $exists = $db->query("SELECT id FROM profile LIMIT 1")->fetch();
            if ($exists) {
                $set = implode(', ', array_map(fn($k) => "$k = ?", array_keys($data)));
                $stmt = $db->prepare("UPDATE profile SET $set WHERE id = ?");
                $stmt->execute([...array_values($data), $exists['id']]);
            } else {
                $cols = implode(', ', array_keys($data));
                $phs  = implode(', ', array_fill(0, count($data), '?'));
                $db->prepare("INSERT INTO profile ($cols) VALUES ($phs)")->execute(array_values($data));
            }
            setFlash('success', 'Profile updated successfully.');
            header('Location: profile.php'); exit;
        }

        // Add social link
        if ($action === 'add_social') {
            $profileId = (int)($_POST['profile_id'] ?? 0);
            $platform  = trim($_POST['platform'] ?? '');
            $url       = trim($_POST['url'] ?? '');
            if (!isSafeUrl($url)) {
                setFlash('error', 'Social link URL must start with http:// or https://.');
                header('Location: profile.php'); exit;
            }
            if ($profileId && $platform && $url) {
                $db->prepare("INSERT INTO social_links (profile_id, platform, url) VALUES (?,?,?)")
                   ->execute([$profileId, $platform, $url]);
            }
            setFlash('success', 'Social link added.');
            header('Location: profile.php'); exit;
        }

        // Delete social link
        if ($action === 'delete_social') {
            $db->prepare("DELETE FROM social_links WHERE id = ?")->execute([(int)$_POST['link_id']]);
            setFlash('success', 'Social link removed.');
            header('Location: profile.php'); exit;
        }
    } catch (PDOException $e) {
        setFlash('error', 'Save failed — please check the form and try again.');
        header('Location: profile.php'); exit;
    }
}

$profile = $db->query("SELECT * FROM profile LIMIT 1")->fetch() ?: [];
$socials  = [];
if (!empty($profile['id'])) {
    $stmt = $db->prepare("SELECT * FROM social_links WHERE profile_id = ? ORDER BY sort_order");
    $stmt->execute([$profile['id']]);
    $socials = $stmt->fetchAll();
}

cmsHead('Profile');
?>

<!-- ── Profile Form ──────────────────────────── -->
<div class="card">
  <div class="card-head"><h2 class="card-title">Personal Information</h2></div>

  <form method="POST" enctype="multipart/form-data">
    <?= csrf_field() ?>
    <input type="hidden" name="_action" value="save_profile">

    <!-- Photo Upload -->
    <div class="avatar-upload-row">
      <div class="avatar-preview" id="avatarPreview">
        <?php if (!empty($profile['avatar_url'])): ?>
          <img src="<?= htmlspecialchars($profile['avatar_url'], ENT_QUOTES, 'UTF-8') ?>" alt="Current avatar" id="avatarImg">
        <?php else: ?>
          <span id="avatarInitial"><?= htmlspecialchars(strtoupper(substr($profile['full_name'] ?? 'Y', 0, 1)), ENT_QUOTES, 'UTF-8') ?></span>
          <img id="avatarImg" style="display:none;" alt="Avatar preview">
        <?php endif; ?>
      </div>
      <div class="avatar-upload-info">
        <label class="btn-sm" for="avatarInput" style="cursor:pointer;">
          Upload Photo
        </label>
        <input type="file" name="avatar" id="avatarInput" accept="image/*" style="display:none;">
        <p class="hint">JPG, PNG or WebP · Max 5 MB · Recommended 400×400 px</p>
        <?php if (!empty($profile['avatar_url'])): ?>
        <p class="hint" style="color:var(--gold);">Current photo is set ✓</p>
        <?php endif; ?>
      </div>
    </div>

    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label" for="pf-full_name">Full Name</label>
        <input class="form-input" id="pf-full_name" name="full_name" type="text" required
               value="<?= htmlspecialchars($profile['full_name'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
      </div>
      <div class="form-group">
        <label class="form-label" for="pf-tagline">Tagline</label>
        <input class="form-input" id="pf-tagline" name="tagline" type="text" placeholder="e.g. Full-Stack Developer"
               value="<?= htmlspecialchars($profile['tagline'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
      </div>
      <div class="form-group">
        <label class="form-label" for="pf-email">Email</label>
        <input class="form-input" id="pf-email" name="email" type="email"
               value="<?= htmlspecialchars($profile['email'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
      </div>
      <div class="form-group">
        <label class="form-label" for="pf-phone">Phone</label>
        <input class="form-input" id="pf-phone" name="phone" type="text"
               value="<?= htmlspecialchars($profile['phone'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
      </div>
      <div class="form-group">
        <label class="form-label" for="pf-location">Location</label>
        <input class="form-input" id="pf-location" name="location" type="text" placeholder="e.g. Angeles City, PH"
               value="<?= htmlspecialchars($profile['location'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
      </div>
      <div class="form-group">
        <label class="form-label" for="pf-resume_url">Resume URL <span class="hint">(if hosted elsewhere)</span></label>
        <input class="form-input" id="pf-resume_url" name="resume_url" type="url" placeholder="https://..."
               value="<?= htmlspecialchars($profile['resume_url'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
      </div>
    </div>

    <div class="form-group">
      <label class="form-label" for="pf-resume">Upload Resume <span class="hint">(PDF, replaces the URL above)</span></label>
      <input type="file" id="pf-resume" name="resume" accept="application/pdf" class="form-input" style="padding:0.4rem;">
      <?php if (!empty($profile['resume_url'])): ?>
      <p class="hint" style="color:var(--gold);">
        Current resume: <a href="<?= htmlspecialchars($profile['resume_url'], ENT_QUOTES, 'UTF-8') ?>" target="_blank" style="color:inherit;">view ✓</a>
      </p>
      <?php endif; ?>
    </div>

    <div class="form-group">
      <label class="form-label" for="pf-bio">Bio</label>
      <textarea class="form-input" id="pf-bio" name="bio" rows="5"
        placeholder="Tell visitors who you are..."><?= htmlspecialchars($profile['bio'] ?? '', ENT_QUOTES, 'UTF-8') ?></textarea>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn-primary">Save Profile</button>
    </div>
  </form>
</div>

<!-- ── Social Links ──────────────────────────── -->
<div class="card" style="margin-top:1.5rem;">
  <div class="card-head"><h2 class="card-title">Social Links</h2></div>

  <?php if ($socials): ?>
  <div class="cms-table-wrap">
  <table class="cms-table">
    <thead><tr><th>Platform</th><th>URL</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($socials as $s): ?>
    <tr>
      <td><?= htmlspecialchars($s['platform'], ENT_QUOTES, 'UTF-8') ?></td>
      <td><a href="<?= htmlspecialchars($s['url'], ENT_QUOTES, 'UTF-8') ?>" target="_blank" style="color:var(--gold)"><?= htmlspecialchars($s['url'], ENT_QUOTES, 'UTF-8') ?></a></td>
      <td>
        <form method="POST" style="display:inline;">
          <?= csrf_field() ?>
          <input type="hidden" name="_action" value="delete_social">
          <input type="hidden" name="link_id" value="<?= $s['id'] ?>">
          <button type="submit" class="btn-danger-sm" onclick="return confirm('Remove this link?')">Remove</button>
        </form>
      </td>
    </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  </div>
  <?php elseif (!empty($profile['id'])): ?>
  <p class="empty-state">No social links yet.</p>
  <?php else: ?>
  <p class="empty-state">Save your profile above first, then add social links here.</p>
  <?php endif; ?>

  <?php if (!empty($profile['id'])): ?>
  <form method="POST" style="margin-top:1.5rem; display:flex; gap:0.75rem; flex-wrap:wrap; align-items:flex-end;">
    <?= csrf_field() ?>
    <input type="hidden" name="_action" value="add_social">
    <input type="hidden" name="profile_id" value="<?= $profile['id'] ?>">
    <div class="form-group" style="margin:0;flex:1;min-width:120px;">
      <label class="form-label" for="soc-platform">Platform</label>
      <input class="form-input" id="soc-platform" name="platform" placeholder="GitHub" required>
    </div>
    <div class="form-group" style="margin:0;flex:3;min-width:200px;">
      <label class="form-label" for="soc-url">URL</label>
      <input class="form-input" id="soc-url" name="url" type="url" placeholder="https://github.com/you" required>
    </div>
    <button type="submit" class="btn-primary" style="margin-bottom:0;">Add Link</button>
  </form>
  <?php endif; ?>
</div>

<script>
// Live avatar preview
document.getElementById('avatarInput')?.addEventListener('change', function() {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById('avatarImg');
    const init = document.getElementById('avatarInitial');
    img.src = e.target.result;
    img.style.display = 'block';
    if (init) init.style.display = 'none';
  };
  reader.readAsDataURL(file);
});
</script>

<?php cmsFoot(); ?>
