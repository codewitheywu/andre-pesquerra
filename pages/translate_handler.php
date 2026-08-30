<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/security.php';
sendSecurityHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$text = trim($_POST['text'] ?? '');

if ($text === '' || mb_strlen($text) > 1000) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Invalid text.']);
    exit;
}

// Proxied server-side (rather than called from the browser) so the CSP's
// connect-src can stay locked to 'self' — the client never talks to a
// third-party domain directly.
$url = 'https://api.mymemory.translated.net/get?' . http_build_query([
    'q'        => $text,
    'langpair' => 'autodetect|en',
]);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 8,
    CURLOPT_USERAGENT      => 'PortfolioSite/1.0',
]);
$response = curl_exec($ch);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['success' => false, 'message' => 'Translation service unavailable.']);
    exit;
}

$data = json_decode($response, true);

if ((int)($data['responseStatus'] ?? 0) === 200 && !empty($data['responseData']['translatedText'])) {
    $translated = $data['responseData']['translatedText'];

    // Tagalog's third-person pronoun ("siya"/"niya") carries no gender at all, so
    // the translator has to guess "he" or "she" from nothing. Every testimonial on
    // this site is about the same person (male) — fix the unmistakable subject-
    // pronoun case. "her" is left alone: it's both the possessive ("his") and
    // object ("him") form in English, so a blind swap could trade one wrong word
    // for another instead of fixing it.
    if (($data['responseData']['detectedLanguage'] ?? null) === 'tl') {
        $translated = preg_replace(['/\bshe\b/', '/\bShe\b/'], ['he', 'He'], $translated);
    }

    echo json_encode(['success' => true, 'translated' => $translated]);
    exit;
}

// The API rejects same-language pairs (e.g. an English quote auto-detected
// as English) with this specific message — treat that as "nothing to do"
// rather than a failure.
if (stripos($data['responseDetails'] ?? '', 'distinct languages') !== false) {
    echo json_encode(['success' => true, 'alreadyEnglish' => true]);
    exit;
}

http_response_code(502);
echo json_encode(['success' => false, 'message' => 'Translation failed.']);
