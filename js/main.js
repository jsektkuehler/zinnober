/* =============================================================================
   ZINNOBER PIZZA — Main JavaScript
   Modules: nav · hero slider · scroll reveal · faq · gallery lightbox · form
============================================================================= */

'use strict';


// ─────────────────────────────────────────────────────────────
// 1. Navigation – scroll effect + mobile toggle
// ─────────────────────────────────────────────────────────────
(function initNav() {
    const header   = document.getElementById('header');
    const toggle   = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (!header) return;

    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    toggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
    });

    navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            navLinks.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });

    document.addEventListener('click', e => {
        if (!header.contains(e.target)) {
            navLinks.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
})();


// ─────────────────────────────────────────────────────────────
// 2. Hero Slider – auto-advance, dots, prev/next, touch/swipe
// ─────────────────────────────────────────────────────────────
(function initHeroSlider() {
    const slides      = document.querySelectorAll('.hero-slide');
    const dotsWrap    = document.getElementById('sliderDots');
    const btnPrev     = document.getElementById('sliderPrev');
    const btnNext     = document.getElementById('sliderNext');
    if (!slides.length || !dotsWrap) return;

    const INTERVAL = 5800;
    let current    = 0;
    let timer      = null;
    let touchX     = 0;

    // Build dots
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className   = 'slider-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Bild ${i + 1}`);
        dot.setAttribute('role', 'tab');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
    });

    const getDots = () => dotsWrap.querySelectorAll('.slider-dot');

    function goTo(idx) {
        slides[current].classList.remove('active');
        getDots()[current].classList.remove('is-active');
        current = (idx + slides.length) % slides.length;
        slides[current].classList.add('active');
        getDots()[current].classList.add('is-active');
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startTimer() { clearInterval(timer); timer = setInterval(next, INTERVAL); }
    function stopTimer()  { clearInterval(timer); }

    if (btnNext) btnNext.addEventListener('click', () => { next(); startTimer(); });
    if (btnPrev) btnPrev.addEventListener('click', () => { prev(); startTimer(); });

    const hero = document.querySelector('.s-hero');
    if (hero) {
        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        hero.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
        hero.addEventListener('touchend', e => {
            const d = touchX - e.changedTouches[0].clientX;
            if (Math.abs(d) > 44) { d > 0 ? next() : prev(); startTimer(); }
        }, { passive: true });
        hero.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') { next(); startTimer(); }
            if (e.key === 'ArrowLeft')  { prev(); startTimer(); }
        });
    }

    startTimer();
})();


// ─────────────────────────────────────────────────────────────
// 2b. Pizza Menu Slider – paginated cards, click/swipe to page
// ─────────────────────────────────────────────────────────────
(function initMenuSlider() {
    const track    = document.getElementById('menuTrack');
    const pages    = track ? track.querySelectorAll('.menu-page') : [];
    const dotsWrap = document.getElementById('menuDots');
    const btnPrev  = document.getElementById('menuPrev');
    const btnNext  = document.getElementById('menuNext');
    if (!track || !pages.length || !dotsWrap) return;

    let current = 0;

    pages.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'menu-slider-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Pizzen ${i + 1}`);
        dot.setAttribute('role', 'tab');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
    });

    const getDots = () => dotsWrap.querySelectorAll('.menu-slider-dot');

    function syncHeight() {
        track.style.height = pages[current].offsetHeight + 'px';
    }

    function setActive(i) {
        current = i;
        getDots().forEach((d, idx) => d.classList.toggle('is-active', idx === i));
        syncHeight();
    }

    function goTo(idx) {
        const target = Math.max(0, Math.min(idx, pages.length - 1));
        setActive(target);
        track.scrollTo({ left: track.clientWidth * target, behavior: 'smooth' });
    }

    if (btnNext) btnNext.addEventListener('click', () => goTo(current + 1));
    if (btnPrev) btnPrev.addEventListener('click', () => goTo(current - 1));

    track.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
    });

    let scrollTimer;
    track.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            const idx = Math.round(track.scrollLeft / track.clientWidth);
            if (idx !== current) setActive(idx);
        }, 80);
    }, { passive: true });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(syncHeight, 120);
    });

    syncHeight();
})();


// ─────────────────────────────────────────────────────────────
// 3. Scroll Reveal – IntersectionObserver
// ─────────────────────────────────────────────────────────────
(function initReveal() {
    if (!('IntersectionObserver' in window)) {
        // Fallback: show everything immediately
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
        return;
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();


// ─────────────────────────────────────────────────────────────
// 4. FAQ Accordion
// ─────────────────────────────────────────────────────────────
(function initFaq() {
    const questions = document.querySelectorAll('.faq-q');

    questions.forEach(btn => {
        btn.addEventListener('click', () => {
            const isOpen = btn.getAttribute('aria-expanded') === 'true';
            const answer = btn.nextElementSibling;

            // Close all
            questions.forEach(b => {
                b.setAttribute('aria-expanded', 'false');
                b.nextElementSibling.style.maxHeight = null;
            });

            // Open clicked if it was closed
            if (!isOpen) {
                btn.setAttribute('aria-expanded', 'true');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
})();


// ─────────────────────────────────────────────────────────────
// 5. Gallery Lightbox
// ─────────────────────────────────────────────────────────────
(function initLightbox() {
    const lightbox    = document.getElementById('lightbox');
    const lbImg       = document.getElementById('lightboxImg');
    const lbClose     = document.getElementById('lightboxClose');
    const lbPrev      = document.getElementById('lightboxPrev');
    const lbNext      = document.getElementById('lightboxNext');
    const cells       = [...document.querySelectorAll('.gallery-cell[data-src]')];
    if (!lightbox || !cells.length) return;

    let currentIdx = 0;

    function open(idx) {
        currentIdx = idx;
        const src = cells[idx].dataset.src;
        lbImg.src = src;
        lbImg.alt = cells[idx].getAttribute('aria-label') || '';
        lightbox.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
        lbClose.focus();
    }

    function close() {
        lightbox.setAttribute('hidden', '');
        document.body.style.overflow = '';
        lbImg.src = '';
    }

    function showPrev() { open((currentIdx - 1 + cells.length) % cells.length); }
    function showNext() { open((currentIdx + 1) % cells.length); }

    cells.forEach((cell, i) => {
        cell.addEventListener('click', () => open(i));
        cell.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
    });

    lbClose.addEventListener('click', close);
    lbPrev.addEventListener('click', showPrev);
    lbNext.addEventListener('click', showNext);

    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

    document.addEventListener('keydown', e => {
        if (lightbox.hasAttribute('hidden')) return;
        if (e.key === 'Escape')     close();
        if (e.key === 'ArrowLeft')  showPrev();
        if (e.key === 'ArrowRight') showNext();
    });
})();


// ─────────────────────────────────────────────────────────────
// 5b. Pizza Preview Modal – click a menu card for a larger view
// ─────────────────────────────────────────────────────────────
(function initPizzaModal() {
    const modal     = document.getElementById('pizzaModal');
    const modalImg  = document.getElementById('pizzaModalImg');
    const modalName = document.getElementById('pizzaModalName');
    const modalIng  = document.getElementById('pizzaModalIngredients');
    const modalBadge = document.getElementById('pizzaModalBadge');
    const modalClose = document.getElementById('pizzaModalClose');
    const cards     = [...document.querySelectorAll('.menu-card')];
    if (!modal || !cards.length) return;

    function open(card) {
        const img    = card.querySelector('.menu-card-img img');
        const badge  = card.querySelector('.menu-badge');
        const name   = card.querySelector('h3');
        const ing    = card.querySelector('p');

        modalImg.src = img.src;
        modalImg.alt = img.alt;
        modalName.textContent = name ? name.textContent : '';
        modalIng.textContent  = ing ? ing.textContent : '';
        modalBadge.className  = badge ? badge.className : 'menu-badge';
        modalBadge.innerHTML  = badge ? badge.innerHTML : '';

        modal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
        modalClose.focus();
    }

    function close() {
        modal.setAttribute('hidden', '');
        document.body.style.overflow = '';
        modalImg.src = '';
    }

    cards.forEach(card => {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.addEventListener('click', () => open(card));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); }
        });
    });

    modalClose.addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', e => {
        if (modal.hasAttribute('hidden')) return;
        if (e.key === 'Escape') close();
    });
})();


// ─────────────────────────────────────────────────────────────
// 6. Contact Form – mailto fallback (replace with Formspree
//    or a backend handler for production)
// ─────────────────────────────────────────────────────────────
(function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const ENDPOINT = 'https://formspree.io/f/mdaqwwlj';

    form.addEventListener('submit', e => {
        e.preventDefault();

        // Validate required fields
        const required = form.querySelectorAll('[required]');
        let valid = true;
        required.forEach(field => {
            field.classList.remove('is-error');
            if (!field.value.trim()) { field.classList.add('is-error'); valid = false; }
        });
        if (!valid) {
            form.querySelector('.is-error').focus();
            return;
        }

        const btn = form.querySelector('[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Wird gesendet…';

        fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: new FormData(form),
        })
        .then(r => r.json().then(data => ({ ok: r.ok, data })))
        .then(({ ok, data }) => {
            if (ok) {
                form.innerHTML = '<p class="form-success">Danke! Wir melden uns so schnell wie möglich bei dir.</p>';
            } else {
                btn.disabled = false;
                btn.textContent = 'Anfrage senden';
                alert(data?.errors?.map(e => e.message).join(', ') || 'Etwas ist schiefgelaufen. Bitte versuche es erneut.');
            }
        })
        .catch(() => {
            btn.disabled = false;
            btn.textContent = 'Anfrage senden';
            alert('Keine Verbindung. Bitte versuche es erneut.');
        });
    });

    // Clear error state on input
    form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('input', () => field.classList.remove('is-error'));
    });
})();


// ─────────────────────────────────────────────────────────────
// 7. Hero word rotator
// ─────────────────────────────────────────────────────────────
(function initWordRotator() {
    const el = document.getElementById('heroWord');
    if (!el) return;
    const words = ['live', 'frisch', 'heiß', 'lecker', 'fluffig'];
    let idx = 0;

    setInterval(() => {
        el.classList.add('is-fading');
        setTimeout(() => {
            idx = (idx + 1) % words.length;
            el.textContent = words[idx];
            el.classList.remove('is-fading');
        }, 350);
    }, 2500);
})();


// ─────────────────────────────────────────────────────────────
// 8. Smooth background image loading for gallery cells
//    (replaces placeholder once real image is available)
// ─────────────────────────────────────────────────────────────
(function loadGalleryImages() {
    document.querySelectorAll('.gallery-cell[data-src]').forEach(cell => {
        const src = cell.dataset.src;
        const img = new Image();
        img.onload = () => {
            cell.style.backgroundImage = `url('${src}')`;
            cell.querySelector('.img-ph')?.remove();
        };
        img.src = src;
    });
})();
