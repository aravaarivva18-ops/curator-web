<?php
// config.php
// SECURITY WARNING: This file contains sensitive credentials. 
// Do NOT commit this file to version control. Add it to .gitignore.

return [
    'telegram_bot_token' => getenv('TELEGRAM_BOT_TOKEN') ?: '8800019727:AAHYE83Y0zfJXY81q5gB_FRhSNO-5YVaUWc',
    'telegram_chat_id' => getenv('TELEGRAM_CHAT_ID') ?: '685915071',
    'allowed_origin' => 'https://curator.dev' // Replace with your production domain
];
