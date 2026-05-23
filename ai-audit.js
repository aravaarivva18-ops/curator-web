/**
 * Conversion Audit Bot logic
 * Interactive lead magnet for experts
 */
document.addEventListener('DOMContentLoaded', () => {
    const auditInput = document.getElementById('auditInput');
    const runAuditBtn = document.getElementById('runAudit');
    const terminal = document.getElementById('auditTerminal');
    
    if (!runAuditBtn || !auditInput || !terminal) return;

    const steps = [
        { text: "Инициализация глубокого аудита воронки...", delay: 800 },
        { text: "Анализ скорости загрузки: мобильная версия — 4.2с (-24% конверсии)...", delay: 1200 },
        { text: "Разбор первого экрана: ценностное предложение размыто...", delay: 1000 },
        { text: "Проверка разметки: обнаружено отсутствие SEO-схемы...", delay: 900 },
        { text: "Анализ смысловых блоков: отзывы не содержат твердых цифр...", delay: 1300 },
        { text: "Оценка ИИ-видимости (AEO): структура не адаптирована под LLM...", delay: 1100 },
        { text: "Расчет потенциальной окупаемости (ROI) и точек роста...", delay: 1200 }
    ];

    async function startAudit() {
        const val = auditInput.value.trim();
        if (!val) {
            auditInput.classList.add('error-shake');
            setTimeout(() => auditInput.classList.remove('error-shake'), 500);
            return;
        }

        auditInput.disabled = true;
        runAuditBtn.disabled = true;
        terminal.innerHTML = '';
        
        addLog(`>> Проект: ${val}`, 'input');
        await new Promise(r => setTimeout(r, 600));

        for (const step of steps) {
            addLog(step.text, 'system');
            await new Promise(r => setTimeout(r, step.delay));
        }

        const roi = Math.floor(Math.random() * (320 - 180 + 1)) + 180;
        const result = document.createElement('div');
        result.className = 'terminal-result reveal-final';
        result.innerHTML = `
            <div class="result-header">АУДИТ ЗАВЕРШЕН</div>
            <div class="result-score">Прогноз ROI: +${roi}%</div>
            <p>Выявлено 3 критических разрыва в смыслах, снижающих конверсию в 1.8 раза.</p>
            <button class="btn btn-primary btn-submit mini btn-get-report" style="margin-top: 1rem; width: auto; padding: 0.5rem 1.25rem; font-size: 0.85rem;">Получить расшифровку</button>
        `;
        
        const getReportBtn = result.querySelector('.btn-get-report');
        if (getReportBtn) {
            getReportBtn.addEventListener('click', () => {
                const formSection = document.querySelector('#contact');
                const formTitle = formSection?.querySelector('h2');
                if (formTitle) formTitle.textContent = 'Ваша расшифровка готова';
                formSection?.scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        terminal.appendChild(result);
        terminal.scrollTop = terminal.scrollHeight;
        
        // Передача данных в форму
        const auditDataInput = document.getElementById('audit_data');
        if (auditDataInput) {
            auditDataInput.value = `ROI: +${roi}%, Gaps: 3, Project: ${val}`;
        }
        
        auditInput.disabled = false;
        runAuditBtn.disabled = false;
        auditInput.value = '';
        auditInput.placeholder = 'Введите другой проект...';
    }

    runAuditBtn.addEventListener('click', startAudit);
    auditInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startAudit();
    });

    function addLog(text, type) {
        const line = document.createElement('div');
        line.className = `terminal-line terminal-${type}`;
        
        const promptSpan = document.createElement('span');
        promptSpan.className = 'prompt';
        promptSpan.textContent = '>';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'text';
        textSpan.textContent = ` ${text}`;
        
        line.appendChild(promptSpan);
        line.appendChild(textSpan);
        
        // Remove cursor if exists
        const cursor = terminal.querySelector('.terminal-cursor');
        if (cursor) cursor.remove();
        
        terminal.appendChild(line);
        
        // Add cursor back
        const newCursor = document.createElement('div');
        newCursor.className = 'terminal-cursor';
        terminal.appendChild(newCursor);
        
        terminal.scrollTop = terminal.scrollHeight;
    }
});
