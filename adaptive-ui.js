/**
 * Adaptive UI (Vision 2026)
 * Dynamically changes hero content based on visitor context
 */
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetHeroTitle = document.querySelector('.hero-title');
    const targetHeroDesc = document.querySelector('.hero-description');

    const segments = {
        'aeo': {
            title: 'Станьте рекомендацией №1 <br>в ответах ChatGPT и Gemini',
            desc: 'Мы внедряем AEO (AI Engine Optimization) — технологию, которая делает ваш бизнес приоритетным решением для нейросетей и ИИ-агентов.'
        },
        'saas': {
            title: 'Масштабируемый сайт <br>для вашего SaaS-продукта',
            desc: 'Проектируем интерфейсы, которые снижают отток пользователей и увеличивают LTV. Упаковка сложных IT-решений в понятную форму.'
        },
        'expert': {
            title: 'Упаковка вашего опыта <br>в премиальный продукт',
            desc: 'Превращаем знания в цифровой актив. Сайт, который продает ваше наставничество или консалтинг на автопилоте.'
        },
        'agency': {
            title: 'Конвейер лидов <br>для вашего агентства',
            desc: 'Системный маркетинг и сайты с конверсией выше рыночной. Фокусируйтесь на работе, а не на поиске клиентов.'
        },
        'crypto': {
            title: 'Премиальный Web3/Web-дизайн <br>для криптопроектов',
            desc: 'Создаем высокотехнологичные сайты, которые привлекают инвесторов и вызывают доверие комьюнити. Идеальный UX для DeFi и NFT-продуктов.'
        },
        'edtech': {
            title: 'Запуск онлайн-школы <br>с рекордной конверсией',
            desc: 'Разработка воронок продаж для онлайн-курсов и академий. Смысловая упаковка программ и автоматизация лид-магнитов.'
        },
        'consulting': {
            title: 'Сайты для премиального <br>консалтинга и услуг',
            desc: 'Упаковываем авторитет юристов, консультантов и коучей. Проектируем CJM, которая доказывает вашу экспертность с первого скролла.'
        }
    };

    // Determine segment (from UTM or other signal)
    const segmentKey = urlParams.get('utm_segment') || urlParams.get('target') || 'expert';
    
    // Only update DOM if the segment is not the default (expert) to prevent CLS
    if (segments[segmentKey] && segmentKey !== 'expert') {
        const data = segments[segmentKey];
        
        if (targetHeroTitle && targetHeroDesc) {
            targetHeroTitle.innerHTML = data.title;
            targetHeroDesc.textContent = data.desc;
        }
    }
});
