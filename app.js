document.addEventListener('DOMContentLoaded', () => {
    // ── 0. PWA Service Worker Registration ──
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    let csrfToken = '';
    let csrfFetched = false;

    const fetchCsrfToken = () => {
        if (csrfFetched) return;
        csrfFetched = true;
        fetch('csrf.php')
            .then(res => res.json())
            .then(data => {
                if (data && data.csrf_token) {
                    csrfToken = data.csrf_token;
                }
            })
            .catch(console.error);
    };

    // Trigger CSRF fetch on early interaction to avoid blocking critical render paths
    const inputs = document.querySelectorAll('#leadForm input, #leadForm textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', fetchCsrfToken, { once: true });
        input.addEventListener('pointerdown', fetchCsrfToken, { once: true });
    });

    // ── 1. Scroll Progress Indicator ──
    const progressBar = document.querySelector('.scroll-progress');

    // ── 2. Scroll Reveal (IntersectionObserver — not scroll event) ──
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Staggered reveal within each viewport frame
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, index * 100);
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ── 3. Smooth Scroll for Navigation ──
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ── 4. Scroll Progress — requestAnimationFrame (no jank) ──
    let ticking = false;

    function updateScrollProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        if (progressBar) {
            progressBar.style.width = scrollPercent + '%';
        }
        ticking = false;
    }

    const mobileCTA = document.querySelector('.mobile-cta');

    function updateMobileCTA() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (mobileCTA) {
            if (scrollTop > 500) {
                mobileCTA.classList.add('active');
            } else {
                mobileCTA.classList.remove('active');
            }
        }
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateScrollProgress();
                updateMobileCTA();
            });
            ticking = true;
        }
    }, { passive: true });

    // ── 8. Form Handling (Telegram via PHP) ──
    const leadForm = document.getElementById('leadForm');

    if (leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = leadForm.querySelector('.btn-submit');
            const originalHTML = btn.innerHTML;

            // Блокируем кнопку
            btn.disabled = true;
            btn.innerHTML = 'Отправляем...';

            const formData = new FormData(leadForm);
            if (csrfToken) {
                formData.append('csrf_token', csrfToken);
            }
            const payload = new URLSearchParams(formData);

            try {
                // Отправляем данные на наш серверный скрипт
                const response = await fetch('/api/send', {
                    method: 'POST',
                    body: payload
                });

                if (response.ok) {
                    btn.innerHTML = 'Заявка отправлена';
                    btn.style.background = 'var(--success)';
                    leadForm.reset();
                    
                    // Возвращаем кнопку в исходное состояние через 5 секунд
                    setTimeout(() => {
                        btn.disabled = false;
                        btn.innerHTML = originalHTML;
                        btn.style.background = '';
                    }, 5000);
                } else {
                    throw new Error('Ошибка сервера');
                }
            } catch (error) {
                console.error('Submission error:', error);
                btn.innerHTML = 'Ошибка отправки';
                btn.style.background = 'var(--error)';
                btn.style.opacity = '1';

                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                }, 3000);
            }
        });
    }


    // ── 7. Phone Mask (Dynamic Lazy Load) ──
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        const initLazyMask = () => {
            if (typeof IMask !== 'undefined') return;
            
            const script = document.createElement('script');
            script.src = 'imask.js';
            script.async = true;
            script.onload = () => {
                if (typeof IMask !== 'undefined') {
                    IMask(phoneInput, {
                        mask: '+{7} (000) 000-00-00'
                    });
                    // Instantly trigger focus to keep smooth user keyboard transition
                    phoneInput.focus();
                }
            };
            document.head.appendChild(script);
        };
        
        phoneInput.addEventListener('focus', initLazyMask, { once: true });
        phoneInput.addEventListener('pointerdown', initLazyMask, { once: true });
    }

    // ── 8. Form Validation & Effects ──
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        if (trigger) {
            trigger.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other items
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
                });

                if (!isActive) {
                    item.classList.add('active');
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });
        }
    });

    // ── 10. Magnetic Buttons ──
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    const isMobileWindow = window.matchMedia("(max-width: 768px)").matches;
    
    if (!isMobileWindow) {
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                btn.style.transform = `translate3d(${x * 0.3}px, ${y * 0.3}px, 0)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = `translate3d(0, 0, 0)`;
            });
        });
    }

    // ── 11. Geo-Status Live Time & Location ──
    const geoTime = document.getElementById('geoTime');
    
    function detectLocation() {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (tz.includes('Moscow') || tz.includes('Volgograd') || tz.includes('Kirov') || tz.includes('Saratov')) return 'Москва / СПб';
            if (tz.includes('Samara') || tz.includes('Astrakhan') || tz.includes('Ulyanovsk')) return 'Самара';
            if (tz.includes('Yekaterinburg')) return 'Екатеринбург';
            if (tz.includes('Omsk')) return 'Омск';
            if (tz.includes('Novosibirsk') || tz.includes('Barnaul') || tz.includes('Tomsk') || tz.includes('Krasnoyarsk')) return 'Новосибирск';
            if (tz.includes('Irkutsk')) return 'Иркутск';
            if (tz.includes('Yakutsk')) return 'Якутск';
            if (tz.includes('Vladivostok') || tz.includes('Khabarovsk')) return 'Владивосток';
            if (tz.includes('Kaliningrad')) return 'Калининград';
            return 'РФ';
        } catch (e) {
            return 'РФ';
        }
    }

    const detectedCity = detectLocation();

    function updateGeoTime() {
        if (!geoTime) return;
        
        // Get user local time
        const localTimeStr = new Intl.DateTimeFormat('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(new Date());
        
        geoTime.textContent = `${localTimeStr} (${detectedCity})`;

        // Dynamically update the hero image badge if it exists
        const badgeText = document.querySelector('.expert-badge .badge-text');
        if (badgeText && !badgeText.textContent.includes('—')) {
            badgeText.textContent = `ROI-Driven — ${detectedCity}`;
        }
    }

    setInterval(updateGeoTime, 1000);
    updateGeoTime();

    // ── 12. Mobile Menu Toggle ──
    const menuToggle = document.querySelector('.menu-toggle');
    const navIsland = document.querySelector('.nav-island');

    if (menuToggle && navIsland) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navIsland.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close menu on click outside
        document.addEventListener('click', (e) => {
            if (navIsland.classList.contains('is-open') && !navIsland.contains(e.target)) {
                navIsland.classList.remove('is-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close menu on nav-link clicks
        navIsland.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navIsland.classList.remove('is-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

});
