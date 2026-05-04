document.addEventListener('DOMContentLoaded', () => {
    // Detect mobile/low-power devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobile = window.innerWidth <= 1024;
    
    // ==========================================
    // Preloader
    // ==========================================
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('fade-out');
                setTimeout(() => {
                    document.body.classList.remove('loading');
                    document.body.classList.add('loaded');
                    preloader.style.display = 'none';
                }, 1000);
            }, 1000);
        });
        
        // Fallback
        setTimeout(() => {
            if (document.body.classList.contains('loading')) {
                preloader.classList.add('fade-out');
                document.body.classList.remove('loading');
                document.body.classList.add('loaded');
                setTimeout(() => preloader.style.display = 'none', 1000);
            }
        }, 5000);
    }

    // ==========================================
    // Custom Cursor (Disabled on Touch)
    // ==========================================
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    if (cursor && cursorFollower && !isTouchDevice) {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });
        
        function animateCursor() {
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;
            
            cursorFollower.style.left = followerX + 'px';
            cursorFollower.style.top = followerY + 'px';
            
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
        
        const hoverElements = document.querySelectorAll('a, button, .clickable');
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
    } else {
        if (cursor) cursor.style.display = 'none';
        if (cursorFollower) cursorFollower.style.display = 'none';
        document.body.style.cursor = 'auto';
    }

    // ==========================================
    // Scrolling & Parallax
    // ==========================================
    class OptimizedScroll {
        constructor() {
            this.dom = {
                container: document.querySelector('[data-scroll-container]'),
                navbar: document.querySelector('.navbar'),
                parallaxElements: document.querySelectorAll('.parallax-element'),
                parallaxImages: document.querySelectorAll('.parallax-image img'),
                bgText: document.querySelector('.hero-bg-text')
            };
            
            this.state = {
                scrollY: window.scrollY,
                windowHeight: window.innerHeight,
                isMobile: window.innerWidth <= 1024
            };
            
            this.init();
        }

        init() {
            if (!this.state.isMobile) {
                // Smooth scroll logic for desktop
                this.ease = 0.08;
                this.current = window.scrollY;
                this.last = window.scrollY;
                
                this.setStyles();
                this.setHeight();
                this.run();
            }
            
            this.addEvents();
        }

        setStyles() {
            if (this.dom.container) {
                this.dom.container.style.position = 'fixed';
                this.dom.container.style.top = '0';
                this.dom.container.style.left = '0';
                this.dom.container.style.width = '100%';
                this.dom.container.style.overflow = 'hidden';
            }
        }

        setHeight() {
            if (this.dom.container) {
                document.body.style.height = `${this.dom.container.getBoundingClientRect().height}px`;
            }
        }

        addEvents() {
            window.addEventListener('scroll', () => {
                this.state.scrollY = window.scrollY;
                if (this.state.isMobile) {
                    this.updateOnScroll(this.state.scrollY);
                }
            }, { passive: true });

            window.addEventListener('resize', () => {
                this.state.windowHeight = window.innerHeight;
                this.state.isMobile = window.innerWidth <= 1024;
                if (!this.state.isMobile) this.setHeight();
            });

            window.addEventListener('load', () => {
                setTimeout(() => this.setHeight(), 1000);
            });
        }

        run() {
            if (this.state.isMobile) return;

            this.last += (this.state.scrollY - this.last) * this.ease;
            const rounded = Math.round(this.last * 100) / 100;

            if (this.dom.container) {
                this.dom.container.style.transform = `translate3d(0, -${rounded}px, 0)`;
            }

            this.updateOnScroll(rounded);
            requestAnimationFrame(() => this.run());
        }

        updateOnScroll(y) {
            // Update Navbar
            if (this.dom.navbar) {
                if (y > 50) {
                    this.dom.navbar.classList.add('scrolled');
                } else {
                    this.dom.navbar.classList.remove('scrolled');
                }
            }

            // Optimize: Only run parallax if elements are in viewport
            // (IntersectionObserver handles reveals, we handle parallax here)
            this.dom.parallaxElements.forEach(el => {
                const speed = parseFloat(el.getAttribute('data-speed')) || 0.1;
                el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
            });

            if (this.dom.bgText) {
                this.dom.bgText.style.transform = `translate(-50%, calc(-50% + ${y * 0.4}px))`;
            }

            this.dom.parallaxImages.forEach(img => {
                const container = img.parentElement;
                const rect = container.getBoundingClientRect();
                
                // Only animate if visible
                if (rect.top < this.state.windowHeight && rect.bottom > 0) {
                    const speed = 0.15;
                    const yPos = (rect.top) * speed;
                    img.style.transform = `translate3d(0, ${yPos}px, 0) scale(1.1)`;
                }
            });
        }
    }

    const scrollSystem = new OptimizedScroll();

    // ==========================================
    // Intersection Observer for Reveals & Lotties
    // ==========================================
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                
                // If it's a lottie player, play it
                const lottie = entry.target.querySelector('lottie-player');
                if (lottie) lottie.play();
                
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    document.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el));

    // Lottie optimization: Pause when not visible
    const lottieObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const lottie = entry.target;
            if (entry.isIntersecting) {
                lottie.play();
            } else {
                lottie.pause();
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('lottie-player').forEach(lottie => {
        lottieObserver.observe(lottie);
    });

    // ==========================================
    // Number Counter Animation
    // ==========================================
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endVal = parseInt(target.getAttribute('data-target'));
                const duration = 2000;
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
                counterObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.counter').forEach(c => counterObserver.observe(c));

    // ==========================================
    // Smooth Anchor Scrolling
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                const headerOffset = 80;
                const elementPosition = targetEl.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });

                // Mobile menu close
                const navLinks = document.querySelector('.nav-links');
                const icon = document.querySelector('.menu-toggle i');
                if (navLinks?.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    icon?.classList.replace('ri-close-line', 'ri-menu-4-line');
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
                if (navLinks.classList.contains('active')) {
                    icon.classList.replace('ri-menu-4-line', 'ri-close-line');
                } else {
                    icon.classList.replace('ri-close-line', 'ri-menu-4-line');
                }
            }
        });
    }
});
