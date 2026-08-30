<?php
// ─────────────────────────────────────────────
//  Host-agnostic URL helpers
//  Never hardcode a domain or subfolder — derive everything
//  from the current request, so the app works unchanged whether
//  it's served from a subfolder (e.g. /portfolio/) or a domain root.
// ─────────────────────────────────────────────

function siteBaseUrl(): string {
    $https  = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['SERVER_PORT'] ?? '') == 443);
    $scheme = $https ? 'https' : 'http';
    $host   = $_SERVER['HTTP_HOST'] ?? 'localhost';
    return $scheme . '://' . $host;
}

// Converts an absolute filesystem path into its web-root-relative URL path,
// by diffing it against the server's DOCUMENT_ROOT. Works at any subfolder
// depth (including the domain root) with no hardcoded prefix.
function urlPathFor(string $absoluteFsPath): string {
    $docRoot = str_replace('\\', '/', rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/\\'));
    $resolved = realpath($absoluteFsPath);
    $path    = str_replace('\\', '/', rtrim($resolved !== false ? $resolved : $absoluteFsPath, '/\\'));

    if ($docRoot !== '' && str_starts_with($path, $docRoot)) {
        $rel = substr($path, strlen($docRoot));
    } else {
        // Fallback (DOCUMENT_ROOT unavailable, e.g. some CLI/proxy setups): assume
        // this file's own location is a known point relative to the web root.
        $rel = '';
    }

    return ($rel === '' || $rel === '/') ? '/' : $rel . '/';
}
