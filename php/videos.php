<?php
/**
 * INFORMA-TECHNIQUE R — php/videos.php
 * ─────────────────────────────────────────────────────────
 * API REST pour la gestion des vidéos.
 * Utilisé par le panneau Admin (admin/index.html).
 *
 * Routes :
 *  GET    /php/videos.php           → Liste toutes les vidéos
 *  POST   /php/videos.php           → Ajouter une vidéo
 *  PUT    /php/videos.php?id=X      → Modifier une vidéo
 *  DELETE /php/videos.php?id=X      → Supprimer une vidéo
 *
 * Authentification :
 *  Toutes les requêtes d'écriture (POST/PUT/DELETE)
 *  doivent inclure l'en-tête : X-Admin-Token: votre-token-secret
 * ─────────────────────────────────────────────────────────
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');

// Répondre aux requêtes preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── CONFIGURATION ─────────────────────────────────────
define('ADMIN_TOKEN', 'informa2025secret'); // ← Changez ce token !
define('DATA_FILE',   __DIR__ . '/../data/videos.json');
define('JS_FILE',     __DIR__ . '/../js/videos.js');
// ──────────────────────────────────────────────────────

// ── FONCTIONS UTILITAIRES ──

/**
 * Lire le fichier JSON des vidéos
 */
function readVideos(): array {
    if (!file_exists(DATA_FILE)) return [];
    $content = file_get_contents(DATA_FILE);
    if (!$content) return [];
    return json_decode($content, true) ?? [];
}

/**
 * Écrire dans le fichier JSON des vidéos
 */
function writeVideos(array $videos): bool {
    $dir = dirname(DATA_FILE);
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    return file_put_contents(
        DATA_FILE,
        json_encode(array_values($videos), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
    ) !== false;
}

/**
 * Régénérer js/videos.js à partir du JSON
 * (pour que le site frontend se mette à jour automatiquement)
 */
function regenerateJsFile(array $videos): bool {
    $json = json_encode(array_values($videos), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    $content = "/**\n";
    $content .= " * INFORMA-TECHNIQUE R — videos.js\n";
    $content .= " * Fichier généré automatiquement par l'admin. Ne pas éditer manuellement.\n";
    $content .= " * Dernière mise à jour : " . date('d/m/Y H:i:s') . "\n";
    $content .= " */\n\n";
    $content .= "const videosData = {$json};\n";
    return file_put_contents(JS_FILE, $content) !== false;
}

/**
 * Vérifier le token admin
 */
function checkAdminToken(): bool {
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN']
          ?? $_SERVER['HTTP_AUTHORIZATION']
          ?? ($_POST['admin_token'] ?? '');
    return $token === ADMIN_TOKEN;
}

/**
 * Envoyer une réponse JSON
 */
function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Valider les données d'une vidéo
 */
function validateVideo(array $data): array {
    $errors = [];
    $allowed_categories = ['securite', 'navigateur', 'crypto', 'demarches', 'astuces'];
    $allowed_platforms  = ['youtube', 'facebook', 'tiktok'];

    if (empty($data['title']))    $errors[] = 'Le titre est requis.';
    if (strlen($data['title'] ?? '') > 200) $errors[] = 'Titre trop long (max 200 caractères).';

    if (!in_array($data['category'] ?? '', $allowed_categories)) {
        $errors[] = 'Catégorie invalide. Valeurs acceptées : ' . implode(', ', $allowed_categories);
    }

    if (!in_array($data['platform'] ?? '', $allowed_platforms)) {
        $errors[] = 'Plateforme invalide. Valeurs acceptées : ' . implode(', ', $allowed_platforms);
    }

    return $errors;
}

// ── ROUTING ──

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($method) {

    // ── GET : lister toutes les vidéos ──
    case 'GET':
        $videos = readVideos();

        // Filtres optionnels
        if (!empty($_GET['category'])) {
            $videos = array_filter($videos, fn($v) => $v['category'] === $_GET['category']);
        }
        if (!empty($_GET['platform'])) {
            $videos = array_filter($videos, fn($v) => $v['platform'] === $_GET['platform']);
        }
        if (!empty($_GET['search'])) {
            $q = strtolower($_GET['search']);
            $videos = array_filter($videos, fn($v) =>
                str_contains(strtolower($v['title']), $q) ||
                str_contains(strtolower($v['desc'] ?? ''), $q)
            );
        }

        jsonResponse([
            'success' => true,
            'total'   => count($videos),
            'videos'  => array_values($videos),
        ]);
        break;

    // ── POST : ajouter une vidéo ──
    case 'POST':
        if (!checkAdminToken()) {
            jsonResponse(['success' => false, 'message' => 'Non autorisé.'], 401);
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? $_POST;

        $errors = validateVideo($body);
        if (!empty($errors)) {
            jsonResponse(['success' => false, 'message' => implode(' ', $errors)], 400);
        }

        $videos = readVideos();

        // Générer un nouvel ID
        $maxId = count($videos) > 0 ? max(array_column($videos, 'id')) : 0;

        $newVideo = [
            'id'        => $maxId + 1,
            'title'     => htmlspecialchars(trim($body['title']),     ENT_QUOTES, 'UTF-8'),
            'category'  => $body['category'],
            'platform'  => $body['platform'],
            'thumbnail' => htmlspecialchars($body['thumbnail'] ?? '', ENT_QUOTES, 'UTF-8'),
            'emoji'     => $body['emoji'] ?? '🎯',
            'views'     => htmlspecialchars($body['views'] ?? '0',    ENT_QUOTES, 'UTF-8'),
            'date'      => htmlspecialchars($body['date'] ?? date('d/m/Y'), ENT_QUOTES, 'UTF-8'),
            'desc'      => htmlspecialchars(trim($body['desc'] ?? ''), ENT_QUOTES, 'UTF-8'),
            'tags'      => is_array($body['tags'] ?? null)
                            ? array_map('trim', $body['tags'])
                            : (isset($body['tags']) ? array_map('trim', explode(',', $body['tags'])) : []),
            'links'     => [
                'youtube'  => filter_var($body['links']['youtube']  ?? $body['youtube']  ?? '', FILTER_SANITIZE_URL),
                'facebook' => filter_var($body['links']['facebook'] ?? $body['facebook'] ?? '', FILTER_SANITIZE_URL),
                'tiktok'   => filter_var($body['links']['tiktok']   ?? $body['tiktok']   ?? '', FILTER_SANITIZE_URL),
            ],
            'created_at' => date('Y-m-d H:i:s'),
        ];

        $videos[] = $newVideo;

        if (writeVideos($videos) && regenerateJsFile($videos)) {
            jsonResponse(['success' => true, 'message' => 'Vidéo ajoutée avec succès.', 'video' => $newVideo], 201);
        } else {
            jsonResponse(['success' => false, 'message' => 'Erreur lors de l\'écriture du fichier.'], 500);
        }
        break;

    // ── PUT : modifier une vidéo ──
    case 'PUT':
        if (!checkAdminToken()) {
            jsonResponse(['success' => false, 'message' => 'Non autorisé.'], 401);
        }

        if (!$id) {
            jsonResponse(['success' => false, 'message' => 'ID manquant.'], 400);
        }

        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $videos = readVideos();

        $index = -1;
        foreach ($videos as $i => $v) {
            if ((int)$v['id'] === $id) { $index = $i; break; }
        }

        if ($index === -1) {
            jsonResponse(['success' => false, 'message' => 'Vidéo introuvable.'], 404);
        }

        $errors = validateVideo($body);
        if (!empty($errors)) {
            jsonResponse(['success' => false, 'message' => implode(' ', $errors)], 400);
        }

        // Mettre à jour les champs
        $videos[$index] = array_merge($videos[$index], [
            'title'     => htmlspecialchars(trim($body['title']),     ENT_QUOTES, 'UTF-8'),
            'category'  => $body['category'],
            'platform'  => $body['platform'],
            'thumbnail' => htmlspecialchars($body['thumbnail'] ?? '', ENT_QUOTES, 'UTF-8'),
            'emoji'     => $body['emoji'] ?? $videos[$index]['emoji'],
            'views'     => htmlspecialchars($body['views'] ?? $videos[$index]['views'], ENT_QUOTES, 'UTF-8'),
            'date'      => htmlspecialchars($body['date'] ?? $videos[$index]['date'],   ENT_QUOTES, 'UTF-8'),
            'desc'      => htmlspecialchars(trim($body['desc'] ?? ''), ENT_QUOTES, 'UTF-8'),
            'tags'      => is_array($body['tags'] ?? null)
                            ? array_map('trim', $body['tags'])
                            : (isset($body['tags']) ? array_map('trim', explode(',', $body['tags'])) : $videos[$index]['tags']),
            'links'     => [
                'youtube'  => filter_var($body['links']['youtube']  ?? $body['youtube']  ?? $videos[$index]['links']['youtube']  ?? '', FILTER_SANITIZE_URL),
                'facebook' => filter_var($body['links']['facebook'] ?? $body['facebook'] ?? $videos[$index]['links']['facebook'] ?? '', FILTER_SANITIZE_URL),
                'tiktok'   => filter_var($body['links']['tiktok']   ?? $body['tiktok']   ?? $videos[$index]['links']['tiktok']   ?? '', FILTER_SANITIZE_URL),
            ],
            'updated_at' => date('Y-m-d H:i:s'),
        ]);

        if (writeVideos($videos) && regenerateJsFile($videos)) {
            jsonResponse(['success' => true, 'message' => 'Vidéo mise à jour avec succès.', 'video' => $videos[$index]]);
        } else {
            jsonResponse(['success' => false, 'message' => 'Erreur lors de l\'écriture.'], 500);
        }
        break;

    // ── DELETE : supprimer une vidéo ──
    case 'DELETE':
        if (!checkAdminToken()) {
            jsonResponse(['success' => false, 'message' => 'Non autorisé.'], 401);
        }

        if (!$id) {
            jsonResponse(['success' => false, 'message' => 'ID manquant.'], 400);
        }

        $videos = readVideos();
        $filtered = array_filter($videos, fn($v) => (int)$v['id'] !== $id);

        if (count($filtered) === count($videos)) {
            jsonResponse(['success' => false, 'message' => 'Vidéo introuvable.'], 404);
        }

        if (writeVideos(array_values($filtered)) && regenerateJsFile(array_values($filtered))) {
            jsonResponse(['success' => true, 'message' => 'Vidéo supprimée avec succès.']);
        } else {
            jsonResponse(['success' => false, 'message' => 'Erreur lors de la suppression.'], 500);
        }
        break;

    default:
        jsonResponse(['success' => false, 'message' => 'Méthode non supportée.'], 405);
}