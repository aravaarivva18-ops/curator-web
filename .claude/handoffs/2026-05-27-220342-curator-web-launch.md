# Handoff: curator-web.ru — Launch & Post-Launch Setup

## Session Metadata
- Created: 2026-05-27 22:03:42
- Project: /Users/rus/Desktop/Expert_Site_Backup
- Branch: main
- Session duration: ~3 часа

### Recent Commits (for context)
  - d0222dd fix: optimize CSS paddings and grid columns for mobile devices
  - fa88c50 chore: migrate domain to curator-web.ru
  - 316b6cb fix: change form submit endpoint to /api/send to avoid Vercel rewrite redirect body-loss issue
  - 1335afc fix: make Vercel body parser bulletproof to support standard urlencoded and json formats
  - 6fc43a3 feat: remove laggy and outdated custom cursor to improve UX and scroll performance

## Handoff Chain

- **Continues from**: None (fresh start)
- **Supersedes**: None

> Это первый хандоф для данного проекта.

## Current State Summary

Лендинг `curator-web.ru` задеплоен на Vercel. Домен привязан, мобильная верстка исправлена. Сайт доступен по `https://www.curator-web.ru`. Выполнен GEO-аудит — выявлены отсутствующие файлы (`robots.txt`, `llms.txt`, `sitemap.xml`). Почта домена не настроена. Яндекс.Метрика не установлена. Регистрация в поисковиках не произведена.

## Codebase Understanding

### Architecture Overview

Статический сайт (HTML + CSS + vanilla JS). Нет фреймворков. Форма отправки → Vercel Serverless Function (`/api/send`). Деплой через Vercel CLI (`vercel --prod`). Проект называется `curator-dev` внутри Vercel (имя `curator-web` было занято другим пользователем).

### Critical Files

| File | Purpose | Relevance |
|------|---------|-----------|
| `index.html` | Весь лендинг, одностраничник | Основной файл, все секции здесь |
| `styles.css` | Все стили | Мобильные медиа-запросы в конце |
| `vercel.json` | Конфиг деплоя + rewrites | Имя проекта `curator-dev` — не менять! |
| `api/send.js` | Serverless функция формы | Принимает POST, отправляет email |

### Key Patterns Discovered

- Логотип: `.logo svg` — max-width ограничен `150px` на мобильных
- Сетка авторитета: `.authority-grid` — на мобильных `grid-template-columns: 1fr`
- Тема: темная, glassmorphism, градиенты
- Форма: endpoint `POST /api/send`, body urlencoded или JSON

## Work Completed

### Tasks Finished

- [x] Ребрендинг `curator.dev` → `curator-web.ru` (мета-теги, канон, og-теги, title)
- [x] Исправлена мобильная верстка (горизонт. скролл `.authority-grid`, паддинги, логотип)
- [x] Деплой на Vercel, привязка домена `www.curator-web.ru`
- [x] Создан `tools/plugin_importer.py` в ReaperOS (импорт плагинов Anthropic)
- [x] GEO-аудит (ИИ-индексируемость): выявлены пробелы

### Files Modified

| File | Changes | Rationale |
|------|---------|-----------|
| `index.html` | Все `curator.dev` → `curator-web.ru`, мета-теги, OG | Ребрендинг |
| `styles.css` | Медиа-запросы: `.authority-grid`, паддинги, логотип | Мобильная адаптивность |
| `vercel.json` | `name: "curator-dev"` | Vercel занял имя curator-web |

### Decisions Made

| Decision | Options Considered | Rationale |
|----------|--------------------|-----------|
| Vercel project name = `curator-dev` | `curator-web` (занято), `curator-dev` | Единственный вариант с привязкой домена |
| Форма через `/api/send` | `/submit`, `/form` | Vercel rewrites конфликтовали с body при redirect |

## Pending Work

### Immediate Next Steps

1. **Настроить почту** `hello@curator-web.ru` — Яндекс 360 (бесплатно) → MX + SPF DNS-записи в REG.RU
2. **Создать `robots.txt`** с разрешением AI-ботов (GPTBot, Claude-Web) и указанием sitemap
3. **Создать `llms.txt`** и `sitemap.xml` → задеплоить → зарегистрировать в Яндекс.Вебмастер + Google Search Console
4. **Установить Яндекс.Метрику** — вставить счётчик перед `</head>` в `index.html`
5. **Юридическая приписка** под кнопкой формы (строки ~573-575 `index.html`)

### Blockers/Open Questions

- [ ] DNS `.ru` — обновление до 24ч, сайт мог ещё не открываться без VPN у всех провайдеров
- [ ] Vercel Protection — если требует пароль, отключить в Vercel Dashboard → Settings → Security

### Deferred Items

- Самозанятость (пользователь сам решит после запуска)
- Интеграция `plugin_importer.py` в ReaperOS CLI (отдельная задача)

## Context for Resuming Agent

### Important Context

1. **Vercel project name = `curator-dev`** — НЕ менять, иначе домен отвяжется
2. **Домен регистратор**: REG.RU — туда идти для DNS-записей (MX, SPF, TXT верификации)
3. **Пользователь не самозанятый** — не упоминать без запроса
4. **GEO-аудит выявил**: нет `robots.txt`, нет `llms.txt`, нет `sitemap.xml`, нет schema.org разметки
5. **Почта ещё не настроена** — ни один провайдер не выбран

### Assumptions Made

- Пользователь хочет минимальные расходы (выбор бесплатных инструментов)
- Яндекс.Метрика приоритетнее Google Analytics (РФ-аудитория)
- Почта через Яндекс 360 (бесплатный план, 1 пользователь)

### Potential Gotchas

- `vercel.json` → `name` менять НЕЛЬЗЯ (привяжется к другому проекту и домен слетит)
- При добавлении `robots.txt` / `llms.txt` — файлы должны быть в корне проекта (рядом с `index.html`)
- Яндекс.Вебмастер требует верификацию через meta-тег ИЛИ HTML-файл в корне
- Google Search Console — верификация через DNS TXT-запись проще всего

## Environment State

### Tools/Services Used

- Vercel CLI (`vercel --prod`) — деплой
- REG.RU — управление DNS доменом `curator-web.ru`
- Git (ветка `main`)

### Active Processes

- Нет (статический сайт, serverless)

### Environment Variables

- `EMAIL_*` — переменные для `api/send.js` заданы в Vercel Dashboard (Environment Variables)

## Related Resources

- [index.html](file:///Users/rus/Desktop/Expert_Site_Backup/index.html)
- [styles.css](file:///Users/rus/Desktop/Expert_Site_Backup/styles.css)
- [vercel.json](file:///Users/rus/Desktop/Expert_Site_Backup/vercel.json)
- Яндекс 360: https://360.yandex.ru
- Яндекс Вебмастер: https://webmaster.yandex.ru
- Google Search Console: https://search.google.com/search-console

---

**Security Reminder**: Before finalizing, run `validate_handoff.py` to check for accidental secret exposure.
