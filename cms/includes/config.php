<?php
// ─────────────────────────────────────────────
//  CMS Config
//  BASE_URL / PUBLIC_URL / UPLOAD_URL are auto-detected from the
//  current request (see includes/url.php) — no manual editing
//  needed, whether this runs from a subfolder or a domain root.
// ─────────────────────────────────────────────

require_once __DIR__ . '/../../includes/url.php';

define('BASE_URL',    urlPathFor(__DIR__ . '/..'));               // e.g. /portfolio/cms/
define('PUBLIC_URL',  urlPathFor(dirname(__DIR__, 2)));           // e.g. /portfolio/
define('UPLOAD_DIR',  dirname(__DIR__, 2) . '/assets/img/');
define('UPLOAD_URL',  urlPathFor(dirname(__DIR__, 2) . '/assets/img')); // e.g. /portfolio/assets/img/
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5 MB

$allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/security.php';
sendSecurityHeaders();

// ── File Upload Helper ────────────────────────
function uploadImage(array $file, string $subfolder = 'uploads'): string|false {
    global $allowedImageTypes;

    if ($file['error'] !== UPLOAD_ERR_OK) return false;
    if ($file['size']  > MAX_FILE_SIZE)   return false;

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime  = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mime, $allowedImageTypes, true)) return false;

    // Reject files that pass MIME sniffing but don't actually decode as an image
    // (defense against polyglot files).
    if (@getimagesize($file['tmp_name']) === false) return false;

    $ext      = match($mime) {
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif',
        default      => 'jpg',
    };
    $filename = uniqid('img_', true) . '.' . $ext;
    $dir      = UPLOAD_DIR . $subfolder . '/';

    if (!is_dir($dir)) mkdir($dir, 0755, true);

    if (!move_uploaded_file($file['tmp_name'], $dir . $filename)) return false;

    return UPLOAD_URL . $subfolder . '/' . $filename;
}

// ── Document Upload Helper (resume PDF) ────────
function uploadDocument(array $file, string $subfolder = 'files'): string|false {
    if ($file['error'] !== UPLOAD_ERR_OK) return false;
    if ($file['size']  > MAX_FILE_SIZE)   return false;

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime  = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if ($mime !== 'application/pdf') return false;

    $filename = uniqid('resume_', true) . '.pdf';
    $dir      = dirname(UPLOAD_DIR) . '/' . $subfolder . '/'; // sibling of assets/img/

    if (!is_dir($dir)) mkdir($dir, 0755, true);

    if (!move_uploaded_file($file['tmp_name'], $dir . $filename)) return false;

    return urlPathFor(dirname(UPLOAD_DIR) . '/' . $subfolder) . $filename;
}

// ── URL Scheme Validation ──────────────────────
// Blocks storing a "javascript:" (or similar) URI in any field that later gets
// rendered as a clickable link — htmlspecialchars() alone doesn't stop that.
function isSafeUrl(?string $url): bool {
    if ($url === null || $url === '') return true; // empty is fine, just don't store garbage
    $scheme = parse_url($url, PHP_URL_SCHEME);
    return in_array(strtolower((string)$scheme), ['http', 'https'], true);
}

// ── Flash Messages ────────────────────────────
function setFlash(string $type, string $msg): void {
    $_SESSION['flash'] = ['type' => $type, 'msg' => $msg];
}
function getFlash(): array {
    $f = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);
    return $f;
}
