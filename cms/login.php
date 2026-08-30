<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/auth.php';

if (isLoggedIn()) {
    header('Location: ' . BASE_URL . 'index.php');
    exit;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MINUTES = 15;

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $db = getDB();

    $attemptStmt = $db->prepare(
        "SELECT COUNT(*) FROM cms_login_attempts
         WHERE ip_address = ? AND attempted_at >= (NOW() - INTERVAL " . LOGIN_LOCKOUT_MINUTES . " MINUTE)"
    );
    $attemptStmt->execute([$ip]);
    $recentAttempts = (int)$attemptStmt->fetchColumn();

    if ($recentAttempts >= MAX_LOGIN_ATTEMPTS) {
        http_response_code(429);
        $error = 'Too many failed attempts. Please try again in a few minutes.';
    } else {
        $username = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';
        $user     = null;

        if ($username && $password) {
            $stmt = $db->prepare("SELECT * FROM cms_users WHERE username = ? OR email = ? LIMIT 1");
            $stmt->execute([$username, $username]);
            $user = $stmt->fetch();
        }

        if ($user && password_verify($password, $user['password_hash'])) {
            session_regenerate_id(true);
            $_SESSION['cms_user'] = [
                'id'       => $user['id'],
                'username' => $user['username'],
                'email'    => $user['email'],
                'role'     => $user['role'],
            ];
            header('Location: ' . BASE_URL . 'index.php');
            exit;
        }

        $db->prepare("INSERT INTO cms_login_attempts (ip_address) VALUES (?)")->execute([$ip]);
        $error = 'Invalid username or password.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login — Portfolio CMS</title>
  <link rel="stylesheet" href="<?= BASE_URL ?>assets/css/cms.css">
</head>
<body class="login-page">
<div class="login-wrap">
  <div class="login-card">
    <div class="login-brand">
      <span class="brand-dot"></span>
      Portfolio<em>CMS</em>
    </div>
    <p class="login-sub">Sign in to manage your portfolio</p>

    <?php if ($error): ?>
    <div class="flash flash-error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <form method="POST" novalidate>
      <?= csrf_field() ?>
      <div class="form-group">
        <label class="form-label" for="username">Username or Email</label>
        <input class="form-input" id="username" name="username" type="text"
               autocomplete="username" required autofocus
               value="<?= htmlspecialchars($_POST['username'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
      </div>
      <div class="form-group">
        <label class="form-label" for="password">Password</label>
        <input class="form-input" id="password" name="password" type="password"
               autocomplete="current-password" required>
      </div>
      <button type="submit" class="btn-primary" style="width:100%;margin-top:0.5rem;">
        Sign In
      </button>
    </form>
  </div>
</div>
</body>
</html>
