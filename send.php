<?php
/**
 * CURATOR.DEV - Telegram Lead Forwarder
 * 
 * Этот скрипт безопасно отправляет данные из формы в ваш Telegram.
 * Поместите этот файл на ваш сервер вместе с index.html.
 */

// --- НАСТРОЙКИ ---
$config = require 'config.php';
$botToken = $config['telegram_bot_token'];
$chatId = $config['telegram_chat_id'];
// -----------------------------------------

// Устанавливаем заголовки для работы с JSON и CORS
header('Content-Type: application/json');

// --- ЗАЩИТА ---
$allowedDomain = $config['allowed_origin']; // Укажите ваш основной домен
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$originHost = parse_url($origin, PHP_URL_HOST);
if (!empty($origin) && ($originHost === $allowedDomain || $originHost === "www." . $allowedDomain)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // В локальной среде разработки разрешаем, но в продакшене будет строго
    $host = $_SERVER['HTTP_HOST'] ?? '';
    if (strpos($host, 'localhost') !== false || strpos($host, '127.0.0.1') !== false) {
        header('Access-Control-Allow-Origin: *');
    } else {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden: Invalid Origin']);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    session_start();
    
    // CSRF Validation
    if (empty($_POST['csrf_token']) || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden: Invalid CSRF Token']);
        exit;
    }
    // Простейший Honeypot (если поле заполнено — это бот)
    if (!empty($_POST['website_hp'])) {
        echo json_encode(['status' => 'success', 'message' => 'Message sent (honeypot)']);
        exit;
    }

    // Получаем данные из формы (POST)
    $name = strip_tags($_POST['name'] ?? 'Не указано');
    $phone = strip_tags($_POST['phone'] ?? 'Не указано');
    $messenger = strip_tags($_POST['messenger'] ?? 'Не указано');
    $task = strip_tags($_POST['task'] ?? 'Не указано');
    $auditData = strip_tags($_POST['audit_data'] ?? '');

    // Базовая валидация
    if ($name === 'Не указано' || $phone === 'Не указано') {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Name and Phone are required.']);
        exit;
    }

    // Формируем текст сообщения (HTML mode for premium look)
    $message = "<b>SYSTEM: NEW LEAD</b>\n";
    $message .= "----------------------------\n";
    $message .= "<b>CLIENT:</b> " . htmlspecialchars($name) . "\n";
    $message .= "<b>PHONE:</b> " . htmlspecialchars($phone) . "\n";
    $message .= "<b>TG/VK:</b> " . htmlspecialchars($messenger) . "\n";
    $message .= "<b>SCOPE:</b> " . htmlspecialchars($task) . "\n";
    
    if (!empty($auditData)) {
        $message .= "----------------------------\n";
        $message .= "<b>AUDIT RESULT:</b> " . htmlspecialchars($auditData) . "\n";
    }
    
    $message .= "----------------------------\n";
    $message .= "<i>" . date('d.m.Y | H:i') . "</i>";

    // Отправляем в Telegram через API
    $url = "https://api.telegram.org/bot{$botToken}/sendMessage";
    $data = [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_TIMEOUT, 3);
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($result && $httpCode === 200) {
        echo json_encode(['status' => 'success', 'message' => 'Заявка успешно отправлена!']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Ошибка при отправке в Telegram.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Метод не поддерживается.']);
}
?>
