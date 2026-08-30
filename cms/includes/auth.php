<?php
// ─────────────────────────────────────────────
//  CMS Auth Helper
// ─────────────────────────────────────────────
require_once __DIR__ . '/csrf.php';

if (session_status() === PHP_SESSION_NONE) {
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['SERVER_PORT'] ?? '') == 443);
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'domain'   => '',
        'secure'   => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function requireLogin(): void {
    if (empty($_SESSION['cms_user'])) {
        header('Location: ' . BASE_URL . 'login.php');
        exit;
    }
    if (($_SESSION['cms_user']['role'] ?? '') !== 'admin') {
        $_SESSION = [];
        session_destroy();
        header('Location: ' . BASE_URL . 'login.php');
        exit;
    }
}

function isLoggedIn(): bool {
    return !empty($_SESSION['cms_user']);
}

function currentUser(): array {
    return $_SESSION['cms_user'] ?? [];
}

function logout(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
    header('Location: ' . BASE_URL . 'login.php');
    exit;
}
