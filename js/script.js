document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // Preloader
    // ==========================================
    setTimeout(() => {
        document.querySelector('.preloader').classList.add('fade-out');
        setTimeout(() => {
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
            document.querySelector('.preloader').style.display = 'none';
        }, 1000);
    }, 2000);

    // ==========================================
    // Custom Cursor
    // ==========================================
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });
    
    // Smooth follower loop
    function animateCursor() {
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;
        
        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    
    // Hover states for cursor
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

    // ==========================================
    // Momentum Scrolling (Vanilla JS)
    // ==========================================
    class SmoothScroll {
        constructor() {
            this.bindMethods();
            this.data = {
                ease: 0.08,
                current: window.scrollY,
                last: window.scrollY,
                rounded: window.scrollY
            };
            this.dom = {
                el: document.querySelector('[data-scroll-container]'),
                content: document.querySelector('[data-scroll-container]')
            };
            this.init();
        }

        bindMethods() {
            ['scroll', 'run', 'resize'].forEach(fn => this[fn] = this[fn].bind(this));
        }

        setStyles() {
            this.dom.el.style.position = 'fixed';
            this.dom.el.style.top = 0;
            this.dom.el.style.left = 0;
            this.dom.el.style.width = '100%';
            this.dom.el.style.overflow = 'hidden';
        }

        setHeight() {
            document.body.style.height = `${this.dom.content.getBoundingClientRect().height}px`;
        }

        resize() {
            this.setHeight();
            this.scroll();
        }

        scroll() {
            this.data.current = window.scrollY;
        }

        run() {
            this.data.last += (this.data.current - this.data.last) * this.data.ease;
            this.data.rounded = Math.round(this.data.last * 100) / 100;

            const diff = this.data.current - this.data.rounded;
            const acc = diff / window.innerWidth;
            const velo = +acc;

            this.dom.content.style.transform = `translate3d(0, -${this.data.rounded}px, 0)`;

            // Update Navbar
            this.updateNavbar(this.data.rounded);
            
            // Update Parallax
            this.updateParallax(this.data.rounded);

            requestAnimationFrame(this.run);
        }

        updateNavbar(scrollY) {
            const navbar = document.querySelector('.navbar');
            if (scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        updateParallax(scrollY) {
            // General Parallax Elements
            const parallaxElements = document.querySelectorAll('.parallax-element');
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.getAttribute('data-speed')) || 0.1;
                const yPos = scrollY * speed;
                el.style.transform = `translate3d(0, ${yPos}px, 0)`;
            });

            // Specific Background Text Parallax
            const bgText = document.querySelector('.hero-bg-text');
            if(bgText) {
                const yPos = scrollY * 0.4;
                bgText.style.transform = `translate(-50%, calc(-50% + ${yPos}px))`;
            }

            // Image Parallax
            const parallaxImages = document.querySelectorAll('.parallax-image img');
            parallaxImages.forEach(img => {
                const speed = 0.15;
                const container = img.parentElement;
                const containerTop = container.offsetTop;
                const containerHeight = container.offsetHeight;
                const windowHeight = window.innerHeight;
                
                if (scrollY + windowHeight > containerTop && scrollY < containerTop + containerHeight) {
                    const yPos = (scrollY - containerTop) * speed;
                    img.style.transform = `translate3d(0, ${yPos}px, 0) scale(1.1)`;
                }
            });
        }

        init() {
            this.setStyles();
            this.setHeight();
            this.addEvents();
            requestAnimationFrame(this.run);
        }

        addEvents() {
            window.addEventListener('scroll', this.scroll);
            window.addEventListener('resize', this.resize);
            
            // Re-calculate height after all images loaded
            window.addEventListener('load', () => {
                setTimeout(() => this.setHeight(), 500);
            });

            // Re-calculate after preloader
            setTimeout(() => this.setHeight(), 3000);
        }
    }

    // Initialize Smooth Scroll
    const smScroll = new SmoothScroll();

    // ==========================================
    // Scroll Reveal Animations
    // ==========================================
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    };
    
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
    
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // ==========================================
    // Number Counter Animation
    // ==========================================
    const counters = document.querySelectorAll('.counter');
    
    const counterCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endVal = parseInt(target.getAttribute('data-target'));
                const duration = 2000; // ms
                let startTimestamp = null;
                
                const step = (timestamp) => {
                    if (!startTimestamp) startTimestamp = timestamp;
                    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                    const easeProgress = 1 - Math.pow(1 - progress, 4);
                    
                    target.innerText = Math.floor(easeProgress * endVal);
                    
                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    } else {
                        target.innerText = endVal;
                    }
                };
                
                window.requestAnimationFrame(step);
                observer.unobserve(target);
            }
        });
    };
    
    const counterObserver = new IntersectionObserver(counterCallback, { threshold: 0.5 });
    counters.forEach(counter => counterObserver.observe(counter));

    // ==========================================
    // Smooth Anchor Scrolling
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetEl = document.querySelector(targetId);
            if(targetEl) {
                const headerOffset = 80;
                const elementPosition = targetEl.getBoundingClientRect().top;
                
                // For momentum scroll, we need to consider the current transform
                const currentScroll = window.scrollY;
                const offsetPosition = elementPosition + currentScroll - headerOffset;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
});
