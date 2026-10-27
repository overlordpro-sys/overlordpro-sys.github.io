const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------------------
   Header: background on scroll, mobile menu, active section link
   ------------------------------------------------------------------------ */
const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');

function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
}

updateHeader();
window.addEventListener('scroll', updateHeader, {passive: true});

function setMenu(open) {
    header.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.querySelector('iconify-icon').setAttribute('icon', open ? 'mdi:close' : 'mdi:menu');
}

navToggle.addEventListener('click', () => {
    setMenu(!header.classList.contains('is-open'));
});

header.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('is-open')) {
        setMenu(false);
        navToggle.focus();
    }
});

window.matchMedia('(min-width: 821px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
});

const sectionLinks = new Map();
header.querySelectorAll('.nav-links a[href^="#"]').forEach((link) => {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) sectionLinks.set(section, link);
});

if (sectionLinks.size) {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            sectionLinks.forEach((link) => link.removeAttribute('aria-current'));
            sectionLinks.get(entry.target).setAttribute('aria-current', 'true');
        });
    }, {rootMargin: '-45% 0px -50% 0px'});

    sectionLinks.forEach((_, section) => sectionObserver.observe(section));
}

/* ---------------------------------------------------------------------------
   Reveal on scroll
   ------------------------------------------------------------------------ */
const revealTargets = document.querySelectorAll('[data-reveal]');

if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
} else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, {rootMargin: '0px 0px -8% 0px'});

    revealTargets.forEach((el) => revealObserver.observe(el));
}

/* ---------------------------------------------------------------------------
   Lightbox
   ------------------------------------------------------------------------ */
const lightbox = document.querySelector('.lightbox');
const lightboxImg = lightbox?.querySelector('.lightbox-stage img');
const lightboxCaption = lightbox?.querySelector('.lightbox-caption');
const lightboxCount = lightbox?.querySelector('.lightbox-count');
const lightboxPrev = lightbox?.querySelector('.lightbox-nav.prev');
const lightboxNext = lightbox?.querySelector('.lightbox-nav.next');
let lightboxItems = [];
let lightboxIndex = 0;
let lightboxOnChange = null;

function showLightboxItem(index) {
    lightboxIndex = (index + lightboxItems.length) % lightboxItems.length;
    const img = lightboxItems[lightboxIndex];
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.alt;
    lightboxCount.textContent = `${lightboxIndex + 1} / ${lightboxItems.length}`;
    lightboxOnChange?.(lightboxIndex);
}

function openLightbox(items, index, onChange) {
    lightboxItems = items;
    lightboxOnChange = onChange;
    const multiple = items.length > 1;
    lightboxPrev.hidden = !multiple;
    lightboxNext.hidden = !multiple;
    showLightboxItem(index);
    lightbox.showModal();
}

if (lightbox) {
    lightboxPrev.addEventListener('click', () => showLightboxItem(lightboxIndex - 1));
    lightboxNext.addEventListener('click', () => showLightboxItem(lightboxIndex + 1));
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());

    // Clicking the dark area around the image closes it.
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox || event.target.classList.contains('lightbox-stage')) {
            lightbox.close();
        }
    });

    lightbox.addEventListener('keydown', (event) => {
        if (lightboxItems.length < 2) return;
        if (event.key === 'ArrowLeft') showLightboxItem(lightboxIndex - 1);
        if (event.key === 'ArrowRight') showLightboxItem(lightboxIndex + 1);
    });

    let touchStartX = null;
    lightbox.addEventListener('touchstart', (event) => {
        touchStartX = event.touches[0].clientX;
    }, {passive: true});
    lightbox.addEventListener('touchend', (event) => {
        if (touchStartX === null || lightboxItems.length < 2) return;
        const dx = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) showLightboxItem(lightboxIndex + (dx < 0 ? 1 : -1));
        touchStartX = null;
    });
}

/* ---------------------------------------------------------------------------
   Galleries
   ------------------------------------------------------------------------ */
function iconButton(className, icon, label) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('aria-label', label);
    button.innerHTML = `<iconify-icon icon="${icon}" aria-hidden="true"></iconify-icon>`;
    return button;
}

document.querySelectorAll('[data-gallery]').forEach((gallery) => {
    const track = gallery.querySelector('.gallery-track');
    const slides = [...track.children];
    const images = slides.map((slide) => slide.querySelector('img')).filter(Boolean);
    const frame = document.createElement('div');
    frame.className = 'gallery-frame';
    track.replaceWith(frame);
    frame.append(track);

    const caption = document.createElement('div');
    caption.className = 'gallery-caption';
    caption.innerHTML = '<span class="gallery-caption-text"></span><span class="gallery-count"></span>';
    gallery.append(caption);
    const captionText = caption.querySelector('.gallery-caption-text');
    const count = caption.querySelector('.gallery-count');

    let current = 0;
    let prev;
    let next;
    let dots = [];

    function render(index) {
        current = index;
        const slide = slides[index];
        captionText.textContent = slide.dataset.caption || slide.querySelector('img')?.alt || '';
        count.textContent = `${index + 1} / ${slides.length}`;
        if (prev) {
            prev.disabled = index === 0;
            next.disabled = index === slides.length - 1;
            dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
        }
    }

    function goTo(index) {
        track.scrollTo({left: index * track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth'});
    }

    if (slides.length > 1) {
        prev = iconButton('gallery-btn prev', 'mdi:chevron-left', 'Previous image');
        next = iconButton('gallery-btn next', 'mdi:chevron-right', 'Next image');
        prev.addEventListener('click', () => goTo(current - 1));
        next.addEventListener('click', () => goTo(current + 1));

        const dotWrap = document.createElement('div');
        dotWrap.className = 'gallery-dots';
        dots = slides.map((_, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.setAttribute('aria-label', `Show image ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            dotWrap.append(dot);
            return dot;
        });

        frame.append(prev, next, dotWrap);

        let ticking = false;
        track.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const index = Math.round(track.scrollLeft / track.clientWidth);
                if (index !== current) render(Math.min(Math.max(index, 0), slides.length - 1));
                ticking = false;
            });
        }, {passive: true});

        track.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') goTo(current - 1);
            if (event.key === 'ArrowRight') goTo(current + 1);
        });

        // Keep the current slide aligned when the layout width changes.
        new ResizeObserver(() => {
            track.scrollTo({left: current * track.clientWidth, behavior: 'auto'});
        }).observe(track);
    } else {
        gallery.classList.add('is-single');
    }

    if (lightbox) {
        track.querySelectorAll('.gallery-open').forEach((button) => {
            const img = button.querySelector('img');
            button.setAttribute('aria-label', `Enlarge: ${img.alt}`);
            button.addEventListener('click', () => {
                openLightbox(images, images.indexOf(img), (i) => {
                    goTo(slides.indexOf(images[i].closest('.gallery-slide')));
                });
            });
        });
    }

    render(0);
});

/* ---------------------------------------------------------------------------
   Videos: only play while on screen
   ------------------------------------------------------------------------ */
const videos = document.querySelectorAll('video[data-autoplay]');

if (videos.length && !reduceMotion) {
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.play().catch(() => {});
            } else {
                entry.target.pause();
            }
        });
    }, {threshold: 0.35});

    videos.forEach((video) => videoObserver.observe(video));
}

/* ---------------------------------------------------------------------------
   Starfield
   ------------------------------------------------------------------------ */
const canvas = document.getElementById('starfield');

if (canvas) {
    const ctx = canvas.getContext('2d');
    const palette = ['255,255,255', '200,215,255', '170,200,255', '210,190,255', '160,230,255'];
    let stars = [];
    let width = 0;
    let height = 0;
    let frame = null;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const count = Math.min(260, Math.round((width * height) / 6500));
        stars = Array.from({length: count}, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() < 0.9 ? Math.random() * 0.9 + 0.3 : Math.random() * 1.2 + 1,
            color: palette[Math.floor(Math.random() * palette.length)],
            base: Math.random() * 0.5 + 0.25,
            speed: Math.random() * 0.0015 + 0.0005,
            phase: Math.random() * Math.PI * 2,
            drift: Math.random() * 0.03 + 0.005,
        }));
    }

    function draw(time = 0) {
        ctx.clearRect(0, 0, width, height);
        for (const star of stars) {
            const twinkle = reduceMotion ? 1 : 0.65 + 0.35 * Math.sin(time * star.speed + star.phase);
            if (!reduceMotion) {
                star.y -= star.drift;
                if (star.y < -2) star.y = height + 2;
            }
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${star.color},${star.base * twinkle})`;
            ctx.fill();
        }
        if (!reduceMotion) frame = requestAnimationFrame(draw);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Mobile browsers fire resize when the URL bar collapses; only
            // regenerate when the width actually changes.
            if (window.innerWidth === width && Math.abs(window.innerHeight - height) < 150) return;
            resize();
            if (reduceMotion) draw();
        }, 150);
    });

    document.addEventListener('visibilitychange', () => {
        if (reduceMotion) return;
        if (document.hidden) {
            cancelAnimationFrame(frame);
        } else {
            frame = requestAnimationFrame(draw);
        }
    });

    resize();
    draw();
}

/* ---------------------------------------------------------------------------
   Footer year
   ------------------------------------------------------------------------ */
document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
});
