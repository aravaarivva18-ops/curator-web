export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Метод не поддерживается.' });
  }

  try {
    const { name, phone, messenger, task, audit_data, website_hp } = req.body;

    // Honeypot validation
    if (website_hp) {
      return res.status(200).json({ status: 'success', message: 'Message sent (honeypot)' });
    }

    if (!name || !phone) {
      return res.status(400).json({ status: 'error', message: 'Имя и телефон обязательны.' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN || '8800019727:AAHYE83Y0zfJXY81q5gB_FRhSNO-5YVaUWc';
    const chatId = process.env.TELEGRAM_CHAT_ID || '685915071';

    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
      console.warn('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing from environment variables. Using hardcoded fallback.');
    }

    // Format message
    let message = `<b>SYSTEM: NEW LEAD (Vercel)</b>\n`;
    message += `----------------------------\n`;
    message += `<b>CLIENT:</b> ${name}\n`;
    message += `<b>PHONE:</b> ${phone}\n`;
    message += `<b>TG/VK:</b> ${messenger || 'Не указано'}\n`;
    message += `<b>SCOPE:</b> ${task || 'Не указано'}\n`;

    if (audit_data) {
      message += `----------------------------\n`;
      message += `<b>AUDIT RESULT:</b> ${audit_data}\n`;
    }

    message += `----------------------------\n`;
    message += `<i>${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })} (MSK)</i>`;

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${botToken || 'YOUR_BOT_TOKEN_HERE'}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId || 'YOUR_CHAT_ID_HERE',
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (response.ok) {
      return res.status(200).json({ status: 'success', message: 'Заявка успешно отправлена!' });
    } else {
      const errText = await response.text();
      console.error('Telegram API error:', errText);
      // Even if token is missing/invalid, return success to user for UX and log error internally
      return res.status(500).json({ status: 'error', message: 'Ошибка отправки в Telegram.' });
    }
  } catch (error) {
    console.error('API Handler Error:', error);
    return res.status(500).json({ status: 'error', message: 'Внутренняя ошибка сервера.' });
  }
}
