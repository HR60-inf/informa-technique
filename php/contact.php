<?php
/**
 * INFORMA-TECHNIQUE R — php/contact.php
 * ─────────────────────────────────────────────────────────
 * Traitement du formulaire de contact.
 * Reçoit une requête POST via AJAX (fetch API) et :
 *  1. Valide les champs
 *  2. Envoie un email (si mail() est configuré sur votre hébergeur)
 *  3. Sauvegarde le message dans data/messages.json
 *  4. Retourne une réponse JSON
 *
 * CONFIGURATION :
 *  → Modifiez $destinataire avec votre email
 *  → Sur certains hébergeurs, il faut configurer le SMTP
 * ─────────────────────────────────────────────────────────
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

// ── CONFIGURATION ──────────────────────────────────────
$destinataire   = 'rahalismael37@gmail.com'; // ← Votre email
$nom_site       = 'Informa-Technique R';
$data_file      = __DIR__ . '/../data/messages.json';
// ───────────────────────────────────────────────────────

// Accepter seulement les POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

// ── RÉCUPÉRATION ET VALIDATION ──
$fname   = trim($_POST['fname']   ?? '');
$lname   = trim($_POST['lname']   ?? '');
$email   = trim($_POST['email']   ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');

$errors = [];

if (empty($fname))   $errors[] = 'Le prénom est requis.';
if (empty($email))   $errors[] = 'L\'email est requis.';
if (empty($message)) $errors[] = 'Le message est requis.';

if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Adresse email invalide.';
}

// Protection anti-spam basique
if (strlen($message) > 5000) {
    $errors[] = 'Message trop long (max 5000 caractères).';
}

// Vérifier qu'il n'y a pas d'injection dans les en-têtes
$check_fields = [$fname, $lname, $email, $subject];
foreach ($check_fields as $field) {
    if (preg_match('/[\r\n]/', $field)) {
        $errors[] = 'Caractères invalides détectés.';
        break;
    }
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// ── NETTOYER LES DONNÉES ──
$fname   = htmlspecialchars($fname,   ENT_QUOTES, 'UTF-8');
$lname   = htmlspecialchars($lname,   ENT_QUOTES, 'UTF-8');
$email   = htmlspecialchars($email,   ENT_QUOTES, 'UTF-8');
$subject = htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

$nom_complet = trim($fname . ' ' . $lname);

// ── MAPPAGE SUJET ──
$subjects_map = [
    'suggestion' => '💡 Suggestion de tutoriel',
    'question'   => '❓ Question technique',
    'collab'     => '🤝 Collaboration / Partenariat',
    'autre'      => '✉️ Autre',
    ''           => 'Contact général',
];
$sujet_label = $subjects_map[$subject] ?? $subject;

// ── ENVOI EMAIL ──
$email_subject = "[{$nom_site}] Nouveau message : {$sujet_label}";

$email_body = "Vous avez reçu un nouveau message via le site {$nom_site}.\n\n";
$email_body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
$email_body .= "Nom    : {$nom_complet}\n";
$email_body .= "Email  : {$email}\n";
$email_body .= "Sujet  : {$sujet_label}\n";
$email_body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$email_body .= "Message :\n{$message}\n\n";
$email_body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
$email_body .= "Envoyé le : " . date('d/m/Y à H:i') . "\n";
$email_body .= "Site      : " . ($_SERVER['HTTP_HOST'] ?? 'informa-technique.fr') . "\n";

$headers  = "From: noreply@informa-technique.fr\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$email_sent = @mail($destinataire, $email_subject, $email_body, $headers);

// ── SAUVEGARDE DU MESSAGE ──
$message_data = [
    'id'         => uniqid('msg_', true),
    'fname'      => $fname,
    'lname'      => $lname,
    'nom_complet'=> $nom_complet,
    'email'      => $email,
    'subject'    => $subject,
    'sujet_label'=> $sujet_label,
    'message'    => $message,
    'date'       => date('Y-m-d H:i:s'),
    'ip'         => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    'email_sent' => $email_sent,
    'lu'         => false,
];

$saved = false;
if (file_exists(dirname($data_file)) || mkdir(dirname($data_file), 0755, true)) {
    $messages = [];
    if (file_exists($data_file)) {
        $content = file_get_contents($data_file);
        if ($content) $messages = json_decode($content, true) ?? [];
    }
    $messages[] = $message_data;
    $saved = file_put_contents($data_file, json_encode($messages, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) !== false;
}

// ── RÉPONSE ──
if ($email_sent || $saved) {
    echo json_encode([
        'success' => true,
        'message' => 'Votre message a bien été envoyé ! Je vous répondrai dès que possible.',
        'email_sent' => $email_sent,
        'saved'      => $saved,
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Une erreur s\'est produite. Contactez-moi directement sur les réseaux sociaux.',
    ]);
}