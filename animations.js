/**
 * animations.js - Cinematic Portfolio Animations v2.0
 * 
 * A professional animation system for portfolio websites featuring:
 * - GPU-accelerated animations with GSAP and ScrollTrigger
 * - Cinematic scroll reveals with parallax effects
 * - Particle systems for enhanced visual depth
 * - Mobile-optimized performance with feature detection
 * - Accessibility-first approach with reduced motion support
 * 
 * Dependencies: GSAP (3.12+) with ScrollTrigger
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION & DEFAULTS
    // ============================================
    
    const CONFIG = {
        // Animation durations (in seconds)
        durations: {
            fade: 0.8,
            slide: 1.0,
            scale: 0.6,
            rotate: 1.2,
            particleFloat: 3.0,
            parallax: 1.5
        },
        
        // Easing functions
        easing: {
            standard: 'power2.out',
            smooth: 'power3.out',
            bounce: 'back.out(1.2)',
            elastic: 'elastic.out(1, 0.5)',
            slowMo: 'sine.inOut'
        },
        
        // Scroll thresholds
        thresholds: {
            early: 'top 85%',
            standard: 'top 80%',
            late: 'top 75%',
            exit: 'bottom 20%'
        },
        
        // Responsive breakpoints
        breakpoints: {
            mobile: 768,
            tablet: 992,
            desktop: 1200
        },
        
        // Particle effects
        particles: {
            count: {
                desktop: 50,
                tablet: 30,
                mobile: 15
            },
            colors: ['rgba(74, 125, 255, 0.3)', 'rgba(183, 122, 255, 0.3)', 'rgba(255, 255, 255, 0.2)'],
            sizes: { min: 2, max: 6 }
        },
        
        // Parallax intensity
        parallax: {
            subtle: 0.3,
            medium: 0.5,
            strong: 0.8
        }
    };

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    
    const state = {
        isMobile: window.innerWidth <= CONFIG.breakpoints.mobile,
        isTablet: window.innerWidth <= CONFIG.breakpoints.tablet,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        scrollDirection: 'down',
        lastScrollY: 0,
        particles: [],
        particleInterval: null,
        gsapContexts: new Set()
    };

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    /**
     * Debounce function for performance optimization
     */
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    /**
     * Throttle function for scroll events
     */
    const throttle = (func, limit) => {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    /**
     * Check if element is in viewport
     */
    const isInViewport = (element, offset = 0) => {
        const rect = element.getBoundingClientRect();
        return rect.top <= window.innerHeight - offset && rect.bottom >= offset;
    };

    /**
     * Create GSAP context for easy cleanup
     */
    const createGSAPContext = (func) => {
        const ctx = gsap.context(func);
        state.gsapContexts.add(ctx);
        return ctx;
    };

    /**
     * Safe element query with error handling
     */
    const queryElements = (selector, parent = document) => {
        try {
            const elements = parent.querySelectorAll(selector);
            return elements.length ? elements : [];
        } catch (error) {
            console.warn(`Error querying elements for selector: ${selector}`, error);
            return [];
        }
    };

    // ============================================
    // PERFORMANCE OPTIMIZATIONS
    // ============================================
    
    const initPerformanceOptimizations = () => {
        // Check for reduced motion preference
        if (state.prefersReducedMotion) {
            // Kill all animations
            gsap.globalTimeline.clear();
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            
            // Reset all animated elements
            document.querySelectorAll('[data-animate]').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            
            console.log('Reduced motion enabled - animations disabled');
            return false;
        }

        // GPU acceleration hints
        gsap.config({
            autoSleep: 60,
            force3D: true,
            nullTargetWarn: false
        });

        // Optimize ScrollTrigger
        ScrollTrigger.config({
            limitCallbacks: true,
            ignoreMobileResize: true
        });

        return true;
    };

    // ============================================
    // HERO ANIMATIONS - CINEMATIC ENTRANCE
    // ============================================
    
    const initHeroAnimations = () => {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroCTA = document.querySelector('.hero-cta');
        const heroHighlights = document.querySelector('.hero-highlights');
        const heroParticles = document.querySelector('.hero-particles');

        if (!heroTitle) return;

        createGSAPContext(() => {
            // Master timeline for coordinated entrance
            const masterTL = gsap.timeline({
                defaults: { ease: CONFIG.easing.smooth }
            });

            // Title animation with split text effect
            if (heroTitle) {
                const titleSpans = heroTitle.querySelectorAll('.hero-title-accent, .hero-title-gradient');
                
                if (titleSpans.length) {
                    gsap.set(titleSpans, { 
                        opacity: 0, 
                        y: 50,
                        scale: 0.95,
                        filter: 'blur(10px)'
                    });
                    
                    masterTL.to(titleSpans, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: 'blur(0px)',
                        duration: CONFIG.durations.slide * 1.2,
                        stagger: 0.2,
                        ease: 'power4.out'
                    }, 0.2);
                } else {
                    gsap.set(heroTitle, { opacity: 0, y: 50, scale: 0.95 });
                    masterTL.to(heroTitle, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: CONFIG.durations.slide * 1.2,
                        ease: 'power4.out'
                    }, 0.2);
                }
            }

            // Subtitle fade with slight delay
            if (heroSubtitle) {
                gsap.set(heroSubtitle, { opacity: 0, y: 30 });
                masterTL.to(heroSubtitle, {
                    opacity: 1,
                    y: 0,
                    duration: CONFIG.durations.fade,
                    ease: CONFIG.easing.standard
                }, 0.6);
            }

            // CTA buttons with bounce effect
            if (heroCTA) {
                gsap.set(heroCTA, { opacity: 0, scale: 0.9 });
                masterTL.to(heroCTA, {
                    opacity: 1,
                    scale: 1,
                    duration: CONFIG.durations.fade,
                    ease: CONFIG.easing.bounce
                }, 1.0);
            }

            // Highlights with staggered entrance
            if (heroHighlights) {
                const highlights = heroHighlights.children;
                gsap.set(highlights, { opacity: 0, y: 20 });
                masterTL.to(highlights, {
                    opacity: 1,
                    y: 0,
                    duration: CONFIG.durations.fade,
                    stagger: 0.1,
                    ease: CONFIG.easing.standard
                }, 1.3);
            }
        });
    };

    // ============================================
    // SCROLL REVEAL SYSTEM - ADVANCED
    // ============================================
    
    const initScrollReveal = () => {
        const sections = document.querySelectorAll('section[id]');
        
        sections.forEach(section => {
            const title = section.querySelector('.section-title');
            const subtitle = section.querySelector('.section-subtitle');
            const cards = section.querySelectorAll('.project-card, .service-card, .review-card, .contact-card');
            
            createGSAPContext(() => {
                // Section title animation
                if (title) {
                    ScrollTrigger.create({
                        trigger: section,
                        start: CONFIG.thresholds.early,
                        onEnter: () => {
                            gsap.fromTo(title,
                                { opacity: 0, y: 40, filter: 'blur(5px)' },
                                { 
                                    opacity: 1, 
                                    y: 0, 
                                    filter: 'blur(0px)',
                                    duration: CONFIG.durations.slide,
                                    ease: CONFIG.easing.smooth,
                                    overwrite: true
                                }
                            );
                        },
                        once: true
                    });
                }

                // Subtitle animation with delay
                if (subtitle) {
                    ScrollTrigger.create({
                        trigger: section,
                        start: CONFIG.thresholds.early,
                        onEnter: () => {
                            gsap.fromTo(subtitle,
                                { opacity: 0, y: 30 },
                                { 
                                    opacity: 1, 
                                    y: 0, 
                                    duration: CONFIG.durations.fade,
                                    delay: 0.2,
                                    ease: CONFIG.easing.standard,
                                    overwrite: true
                                }
                            );
                        },
                        once: true
                    });
                }

                // Cards with parallax and stagger
                if (cards.length) {
                    // Set initial states
                    gsap.set(cards, { 
                        opacity: 0, 
                        y: 60,
                        scale: state.isMobile ? 1 : 0.95,
                        filter: 'blur(5px)'
                    });

                    ScrollTrigger.create({
                        trigger: section,
                        start: CONFIG.thresholds.standard,
                        onEnter: () => {
                            gsap.to(cards, {
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                filter: 'blur(0px)',
                                duration: CONFIG.durations.fade * 1.2,
                                stagger: state.isMobile ? 0.1 : 0.15,
                                ease: CONFIG.easing.smooth,
                                overwrite: true
                            });
                        },
                        once: true
                    });
                }
            });
        });
    };

    // ============================================
    // CARD HOVER EFFECTS - CINEMATIC
    // ============================================
    
    const initCardHoverEffects = () => {
        const cards = queryElements('.project-card, .service-card, .contact-card');
        
        cards.forEach(card => {
            // Skip on mobile for performance
            if (state.isMobile) return;

            // Store original values for cleanup
            const originalTransform = card.style.transform;
            const originalBoxShadow = card.style.boxShadow;

            // Mouse move parallax effect for cards
            const handleMouseMove = (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                // Update CSS custom properties for child elements
                card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
                card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);

                gsap.to(card, {
                    rotateX: rotateX,
                    rotateY: rotateY,
                    scale: 1.02,
                    boxShadow: '0 30px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(74, 125, 255, 0.3)',
                    duration: 0.3,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
            };

            const handleMouseLeave = () => {
                gsap.to(card, {
                    rotateX: 0,
                    rotateY: 0,
                    scale: 1,
                    boxShadow: 'none',
                    duration: 0.4,
                    ease: 'elastic.out(1, 0.3)',
                    overwrite: 'auto',
                    onComplete: () => {
                        card.style.removeProperty('--mouse-x');
                        card.style.removeProperty('--mouse-y');
                    }
                });
            };

            card.addEventListener('mousemove', handleMouseMove);
            card.addEventListener('mouseleave', handleMouseLeave);

            // Store event listeners for cleanup
            card._hoverListeners = { mousemove: handleMouseMove, mouseleave: handleMouseLeave };
        });
    };

    // ============================================
    // THUMBNAIL OVERLAY ANIMATIONS
    // ============================================
    
    const initThumbnailAnimations = () => {
        const thumbnails = queryElements('.card-thumbnail');
        
        thumbnails.forEach(thumbnail => {
            const overlay = thumbnail.querySelector('.thumbnail-overlay');
            const playButton = thumbnail.querySelector('.play-button');
            
            if (!overlay || !playButton) return;

            // Skip on mobile
            if (state.isMobile) {
                overlay.style.opacity = '1';
                playButton.style.opacity = '1';
                return;
            }

            // Set initial states
            gsap.set(overlay, { opacity: 0 });
            gsap.set(playButton, { scale: 0.8, opacity: 0 });

            thumbnail.addEventListener('mouseenter', () => {
                gsap.to(overlay, { 
                    opacity: 1, 
                    duration: 0.3,
                    ease: CONFIG.easing.standard
                });
                
                gsap.to(playButton, { 
                    scale: 1.1, 
                    opacity: 1, 
                    duration: 0.4,
                    ease: CONFIG.easing.bounce
                });
            });

            thumbnail.addEventListener('mouseleave', () => {
                gsap.to(overlay, { 
                    opacity: 0, 
                    duration: 0.2 
                });
                
                gsap.to(playButton, { 
                    scale: 0.8, 
                    opacity: 0, 
                    duration: 0.2 
                });
            });
        });
    };

    // ============================================
    // FLOATING PARTICLES SYSTEM
    // ============================================
    
    const initParticleSystem = () => {
        // Disable on mobile or reduced motion
        if (state.isMobile || state.prefersReducedMotion) return;

        const container = document.querySelector('.hero-particles') || document.createElement('div');
        
        if (!container.classList.contains('hero-particles')) {
            container.className = 'hero-particles';
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                heroSection.style.position = 'relative';
                heroSection.appendChild(container);
            }
        }

        // Clear existing particles
        container.innerHTML = '';
        state.particles = [];

        // Determine particle count based on device
        const particleCount = state.isMobile ? CONFIG.particles.count.mobile :
                            state.isTablet ? CONFIG.particles.count.tablet :
                            CONFIG.particles.count.desktop;

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'hero-particle';
            
            const size = CONFIG.particles.sizes.min + 
                        Math.random() * (CONFIG.particles.sizes.max - CONFIG.particles.sizes.min);
            
            const color = CONFIG.particles.colors[
                Math.floor(Math.random() * CONFIG.particles.colors.length)
            ];

            // Random starting position
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;

            particle.style.cssText = `
                position: absolute;
                left: ${startX}%;
                top: ${startY}%;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                box-shadow: 0 0 ${size * 2}px ${color};
                pointer-events: none;
                will-change: transform;
                transform: translateZ(0);
            `;

            container.appendChild(particle);

            // Store particle data for animation
            state.particles.push({
                element: particle,
                x: startX,
                y: startY,
                speedX: (Math.random() - 0.5) * 0.05,
                speedY: (Math.random() - 0.5) * 0.05,
                scale: 0.5 + Math.random() * 0.5,
                opacity: 0.3 + Math.random() * 0.5
            });
        }

        // Animate particles with requestAnimationFrame
        const animateParticles = () => {
            if (!state.particles.length) return;

            state.particles.forEach(p => {
                // Update position
                p.x += p.speedX;
                p.y += p.speedY;

                // Wrap around screen
                if (p.x > 100) p.x = 0;
                if (p.x < 0) p.x = 100;
                if (p.y > 100) p.y = 0;
                if (p.y < 0) p.y = 100;

                // Apply transform with GPU acceleration
                p.element.style.transform = `translate(${p.x - parseFloat(p.element.style.left)}%, ${p.y - parseFloat(p.element.style.top)}%) scale(${p.scale})`;
            });

            state.particleInterval = requestAnimationFrame(animateParticles);
        };

        animateParticles();
    };

    // ============================================
    // PARALLAX SCROLL EFFECTS
    // ============================================
    
    const initParallaxEffects = () => {
        // Skip on mobile
        if (state.isMobile) return;

        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallax) || CONFIG.parallax.subtle;
            
            ScrollTrigger.create({
                trigger: element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                onUpdate: (self) => {
                    const y = self.progress * 100 * speed;
                    gsap.set(element, {
                        y: y,
                        force3D: true
                    });
                }
            });
        });

        // Background parallax for hero
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            ScrollTrigger.create({
                trigger: heroSection,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
                onUpdate: (self) => {
                    const scale = 1 + self.progress * 0.1;
                    const y = self.progress * 20;
                    
                    gsap.set(heroSection.querySelector('.hero-content'), {
                        scale: scale,
                        y: -y,
                        force3D: true
                    });
                }
            });
        }
    };

    // ============================================
    // TEXT SPLIT ANIMATIONS
    // ============================================
    
    const initTextSplitAnimations = () => {
        const splitElements = queryElements('[data-split]');
        
        splitElements.forEach(element => {
            const text = element.textContent;
            const words = text.split(' ');
            
            element.innerHTML = words.map(word => 
                `<span class="split-word" style="display: inline-block; opacity: 0; transform: translateY(20px);">${word}</span>`
            ).join(' ');
            
            ScrollTrigger.create({
                trigger: element,
                start: CONFIG.thresholds.standard,
                onEnter: () => {
                    gsap.to(element.querySelectorAll('.split-word'), {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        stagger: 0.1,
                        ease: CONFIG.easing.smooth
                    });
                },
                once: true
            });
        });
    };

    // ============================================
    // ACCESSIBILITY FOCUS ANIMATIONS
    // ============================================
    
    const initFocusAnimations = () => {
        const interactiveElements = queryElements('a, button, .project-card, .service-card, .contact-card, .faq-question');
        
        interactiveElements.forEach(el => {
            el.addEventListener('focus', () => {
                if (!state.prefersReducedMotion) {
                    gsap.to(el, {
                        boxShadow: '0 0 0 3px rgba(74, 125, 255, 0.5)',
                        scale: 1.02,
                        duration: 0.2,
                        ease: CONFIG.easing.standard
                    });
                } else {
                    el.style.outline = '3px solid rgba(74, 125, 255, 0.5)';
                }
            });

            el.addEventListener('blur', () => {
                if (!state.prefersReducedMotion) {
                    gsap.to(el, {
                        boxShadow: 'none',
                        scale: 1,
                        duration: 0.2,
                        ease: CONFIG.easing.standard
                    });
                } else {
                    el.style.outline = '';
                }
            });
        });
    };

    // ============================================
    // SCROLL DIRECTION DETECTION
    // ============================================
    
    const initScrollDirection = () => {
        window.addEventListener('scroll', throttle(() => {
            const currentScrollY = window.scrollY;
            state.scrollDirection = currentScrollY > state.lastScrollY ? 'down' : 'up';
            state.lastScrollY = currentScrollY;
            
            // Dispatch custom event for other scripts
            window.dispatchEvent(new CustomEvent('scrolldirection', { 
                detail: { direction: state.scrollDirection }
            }));
        }, 100));
    };

    // ============================================
    // RESPONSIVE HANDLING
    // ============================================
    
    const initResponsiveHandling = () => {
        const handleResize = debounce(() => {
            // Update state
            state.isMobile = window.innerWidth <= CONFIG.breakpoints.mobile;
            state.isTablet = window.innerWidth <= CONFIG.breakpoints.tablet;

            // Refresh ScrollTrigger
            ScrollTrigger.refresh();

            // Reinitialize particle system if needed
            if (state.particleInterval) {
                cancelAnimationFrame(state.particleInterval);
                state.particles = [];
                initParticleSystem();
            }
        }, 250);

        window.addEventListener('resize', handleResize);
    };

    // ============================================
    // CLEANUP SYSTEM
    // ============================================
    
    const cleanup = () => {
        console.log('Cleaning up animations...');

        // Kill all GSAP contexts
        state.gsapContexts.forEach(ctx => ctx.revert());
        state.gsapContexts.clear();

        // Kill ScrollTriggers
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());

        // Clear GSAP timeline
        gsap.globalTimeline.clear();

        // Cancel particle animation
        if (state.particleInterval) {
            cancelAnimationFrame(state.particleInterval);
            state.particleInterval = null;
        }

        // Remove particle container
        const particleContainer = document.querySelector('.hero-particles');
        if (particleContainer) {
            particleContainer.remove();
        }

        // Remove hover listeners
        document.querySelectorAll('[data-hover-listeners]').forEach(el => {
            if (el._hoverListeners) {
                el.removeEventListener('mousemove', el._hoverListeners.mousemove);
                el.removeEventListener('mouseleave', el._hoverListeners.mouseleave);
            }
        });

        state.particles = [];
    };

    // ============================================
    // INITIALIZATION
    // ============================================
    
    const init = () => {
        console.log('🎬 Initializing cinematic portfolio animations v2.0...');

        // Check dependencies
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.error('GSAP or ScrollTrigger not loaded. Please include required libraries.');
            return;
        }

        // Performance first
        if (!initPerformanceOptimizations()) return;

        // Initialize all animation modules
        initHeroAnimations();
        initScrollReveal();
        initCardHoverEffects();
        initThumbnailAnimations();
        initParticleSystem();
        initParallaxEffects();
        initTextSplitAnimations();
        initFocusAnimations();
        initScrollDirection();
        initResponsiveHandling();

        // Initial ScrollTrigger refresh
        ScrollTrigger.refresh();

        console.log('✨ All animations initialized successfully');
    };

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);

    // ============================================
    // PUBLIC API
    // ============================================
    
    window.PortfolioAnimations = {
        refresh: () => {
            ScrollTrigger.refresh();
            console.log('Animations refreshed');
        },
        
        kill: cleanup,
        
        restart: () => {
            cleanup();
            init();
        },
        
        toggleParticles: (enable) => {
            if (enable) {
                initParticleSystem();
            } else if (state.particleInterval) {
                cancelAnimationFrame(state.particleInterval);
                state.particleInterval = null;
                document.querySelector('.hero-particles')?.remove();
            }
        },
        
        getState: () => ({ ...state })
    };

})();