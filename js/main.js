/* =============================================================================
   ZINNOBER PIZZA — Main JavaScript
============================================================================= */

'use strict';

// ─────────────────────────────────────────────
// 1. Navigation: scroll effect + mobile toggle
// ─────────────────────────────────────────────
(function initNav() {
    const header    = document.getElementById('header');
    const toggle    = document.getElementById('navToggle');
    const navLinks  = document.getElementById('navLinks');

    // Scroll → darken header
    const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load

    // Mobile hamburger toggle
    toggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close nav when any link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
        if (!header.contains(e.target)) {
            navLinks.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
})();


// ─────────────────────────────────────────────
// 2. Hero Slider
// ─────────────────────────────────────────────
(function initSlider() {
    const slides        = document.querySelectorAll('.slide');
    const dotsContainer = document.getElementById('sliderDots');
    const btnPrev       = document.getElementById('sliderPrev');
    const btnNext       = document.getElementById('sliderNext');

    if (!slides.length) return;

    const INTERVAL = 5500; // ms between auto-advances
    let current    = 0;
    let timer      = null;
    let touchStartX = 0;

    // Build dots
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Bild ${i + 1}`);
        dot.setAttribute('role', 'tab');
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
    });

    const getDots = () => dotsContainer.querySelectorAll('.dot');

    function goTo(index) {
        slides[current].classList.remove('active');
        getDots()[current].classList.remove('active');
        current = (index + slides.length) % slides.length;
        slides[current].classList.add('active');
        getDots()[current].classList.add('active');
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startTimer() {
        clearInterval(timer);
        timer = setInterval(next, INTERVAL);
    }
    function stopTimer()  { clearInterval(timer); }

    btnNext.addEventListener('click', () => { next(); startTimer(); });
    btnPrev.addEventListener('click', () => { prev(); startTimer(); });

    // Pause on hover
    const hero = document.querySelector('.hero');
    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);

    // Touch / swipe support
    hero.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    hero.addEventListener('touchend', (e) => {
        const delta = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 48) {
            delta > 0 ? next() : prev();
            startTimer();
        }
    }, { passive: true });

    // Keyboard navigation when hero is focused
    hero.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { next(); startTimer(); }
        if (e.key === 'ArrowLeft')  { prev(); startTimer(); }
    });

    // Start
    startTimer();
})();


// ─────────────────────────────────────────────
// 3. FAQ Accordion
// ─────────────────────────────────────────────
(function initFaq() {
    const questions = document.querySelectorAll('.faq-question');

    questions.forEach(btn => {
        btn.addEventListener('click', () => {
            const isOpen   = btn.getAttribute('aria-expanded') === 'true';
            const answer   = btn.nextElementSibling;

            // Close all
            questions.forEach(b => {
                b.setAttribute('aria-expanded', 'false');
                const a = b.nextElementSibling;
                a.style.maxHeight = null;
            });

            // Open this one if it was closed
            if (!isOpen) {
                btn.setAttribute('aria-expanded', 'true');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
})();


// ─────────────────────────────────────────────
// 4. Contact Form → mailto fallback
//    Replace this with Formspree, Netlify Forms,
//    or another backend for production.
// ─────────────────────────────────────────────
(function initForm() {
    const form = document.getElementById('anfrageForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic client-side validation
        const required = form.querySelectorAll('[required]');
        let valid = true;
        required.forEach(field => {
            field.classList.remove('field-error');
            if (!field.value.trim()) {
                field.classList.add('field-error');
                valid = false;
            }
        });
        if (!valid) return;

        const name      = form.name.value.trim();
        const email     = form.email.value.trim();
        const eventType = form.eventType.value;
        const date      = form.date.value;
        const guests    = form.guests.value;
        const location  = form.location.value.trim();
        const message   = form.message.value.trim();

        // ── Replace the email address below with your actual contact address ──
        const TO      = 'anfrage@zinnoberpizza.com';
        const subject = encodeURIComponent(`Catering-Anfrage – ${eventType} – ${name}`);
        const body    = encodeURIComponent(
            `Name: ${name}\n` +
            `E-Mail: ${email}\n` +
            `Event: ${eventType}\n` +
            (date     ? `Datum: ${date}\n`              : '') +
            (guests   ? `Personen: ${guests}\n`          : '') +
            (location ? `Ort: ${location}\n`             : '') +
            (message  ? `\nNachricht:\n${message}`        : '')
        );

        window.location.href = `mailto:${TO}?subject=${subject}&body=${body}`;
    });
})();


// ─────────────────────────────────────────────
// 5. Smooth reveal on scroll (Intersection Observer)
// ─────────────────────────────────────────────
(function initReveal() {
    if (!('IntersectionObserver' in window)) return;

    const targets = document.querySelectorAll(
        '.catering-card, .menu-item, .faq-item, .gallery-item, .konzept-content, .konzept-image'
    );

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach((el, i) => {
        el.style.setProperty('--reveal-delay', `${(i % 4) * 80}ms`);
        el.classList.add('reveal');
        io.observe(el);
    });
})();
