document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // Preloader
    // ==========================================
    setTimeout(() => {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                document.body.classList.remove('loading');
                document.body.classList.add('loaded');
                preloader.style.display = 'none';
            }, 800);
        } else {
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
        }
    }, 2000);

    // ==========================================
    // Custom Cursor — hanya desktop
    // ==========================================
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    if (!isTouchDevice) {
        const cursor = document.querySelector('.cursor');
        const cursorFollower = document.querySelector('.cursor-follower');

        if (cursor && cursorFollower) {
            let mouseX = 0, mouseY = 0;
            let followerX = 0, followerY = 0;
            let rafId = null;

            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

                if (!rafId) {
                    rafId = requestAnimationFrame(animateCursor);
                }
            });

            function animateCursor() {
                followerX += (mouseX - followerX) * 0.12;
                followerY += (mouseY - followerY) * 0.12;

                cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;

                const dx = mouseX - followerX;
                const dy = mouseY - followerY;
                if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
                    rafId = requestAnimationFrame(animateCursor);
                } else {
                    rafId = null;
                }
            }

            const hoverElements = document.querySelectorAll('a, button');
            hoverElements.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    cursor.classList.add('hover');
                    cursorFollower.classList.add('hover');
                });
                el.addEventListener('mouseleave', () => {
                    cursor.classList.remove('hover');
                    cursorFollower.classList.remove('hover');
                });
            });
        }
    } else {
        // Sembunyikan cursor element di touch device
        const cursor = document.querySelector('.cursor');
        const cursorFollower = document.querySelector('.cursor-follower');
        if (cursor) cursor.style.display = 'none';
        if (cursorFollower) cursorFollower.style.display = 'none';
        document.body.style.cursor = 'auto';
        document.querySelectorAll('a, button').forEach(el => el.style.cursor = 'pointer');
    }

    // ==========================================
    // Navbar Scroll + Scroll Progress Bar
    // ==========================================
    const navbar = document.querySelector('.navbar');
    const scrollProgress = document.querySelector('.scroll-progress');

    const onScroll = () => {
        const scrollY = window.scrollY;

        // Navbar
        if (navbar) {
            navbar.classList.toggle('scrolled', scrollY > 50);
        }

        // Scroll progress bar
        if (scrollProgress) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
            scrollProgress.style.width = pct + '%';
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // ==========================================
    // Scroll Reveal Animations (IntersectionObserver)
    // ==========================================
    const revealElements = document.querySelectorAll('.scroll-reveal');

    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // ==========================================
    // Number Counter Animation
    // ==========================================
    const counters = document.querySelectorAll('.counter');

    if (counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const endVal = parseInt(target.getAttribute('data-target'));
                    const duration = 1800;
                    let startTimestamp = null;

                    const step = (timestamp) => {
                        if (!startTimestamp) startTimestamp = timestamp;
                        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                        const easeProgress = 1 - Math.pow(1 - progress, 4);
                        target.innerText = Math.floor(easeProgress * endVal);
                        if (progress < 1) {
                            requestAnimationFrame(step);
                        } else {
                            target.innerText = endVal;
                        }
                    };

                    requestAnimationFrame(step);
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    // ==========================================
    // Smooth Anchor Scrolling
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const headerOffset = 80;
                const offsetPosition = targetEl.getBoundingClientRect().top + window.scrollY - headerOffset;

                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

                // Tutup mobile menu jika terbuka
                const navLinks = document.querySelector('.nav-links');
                const menuToggleIcon = document.querySelector('.menu-toggle i');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    if (menuToggleIcon) {
                        menuToggleIcon.classList.remove('ri-close-line');
                        menuToggleIcon.classList.add('ri-menu-4-line');
                    }
                }
            }
        });
    });

    // ==========================================
    // Mobile Menu Toggle
    // ==========================================
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                const isActive = navLinks.classList.contains('active');
                icon.classList.toggle('ri-menu-4-line', !isActive);
                icon.classList.toggle('ri-close-line', isActive);
            }
        });
    }

    // ==========================================
    // Marquee: pause on hover (sudah di CSS, ini fallback)
    // ==========================================
    // Handled via CSS animation-play-state

});