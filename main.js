/**
 * main.js
 * Adarsh – Cinematic Portfolio Website
 * Orchestrates site-wide animations, scroll triggers, video playback, and interactions
 * 
 * Dependencies: GSAP, ScrollTrigger, Lenis (optional), Three.js
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    
    const CONFIG = {
        // Animation durations
        heroFadeDuration: 1.2,
        cardStaggerDelay: 0.15,
        sectionRevealDuration: 1.0,
        
        // Breakpoints
        mobileBreakpoint: 768,
        tabletBreakpoint: 992,
        
        // Performance
        enableParallax: true,
        enableParticles: true,
        
        // Video
        videoAutoplay: true,
        videoLoop: true
    };

    // ============================================
    // STATE
    // ============================================
    
    let isMobile = window.innerWidth <= CONFIG.mobileBreakpoint;
    let isTablet = window.innerWidth <= CONFIG.tabletBreakpoint;
    let currentVideoPlayer = null;
    let particleInterval = null;

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    /**
     * Debounce function for performance optimization
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Check if element is in viewport
     */
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }

    // ============================================
    // LENIS SMOOTH SCROLL (OPTIONAL)
    // ============================================
    
    function initSmoothScroll() {
        if (typeof Lenis !== 'undefined' && !isMobile) {
            const lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical',
                gestureDirection: 'vertical',
                smooth: true,
                smoothTouch: false,
                touchMultiplier: 2,
            });

            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }

            requestAnimationFrame(raf);

            // Integrate with GSAP ScrollTrigger
            lenis.on('scroll', ScrollTrigger.update);

            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });

            window.lenis = lenis;
            console.log('✨ Lenis smooth scroll initialized');
        }
    }

    // ============================================
    // HERO SECTION ANIMATIONS
    // ============================================
    
    function initHeroAnimations() {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroCTA = document.querySelector('.hero-cta');
        const heroHighlights = document.querySelector('.hero-highlights');
        const heroParticles = document.querySelector('.hero-particles');

        if (!heroTitle) return;

        // Create timeline for hero entrance
        const tl = gsap.timeline({
            defaults: {
                ease: 'power3.out'
            }
        });

        // Set initial states
        gsap.set([heroTitle, heroSubtitle, heroCTA, heroHighlights], {
            opacity: 0,
            y: 30
        });

        // Animate in sequence
        tl.to(heroTitle, {
            opacity: 1,
            y: 0,
            duration: CONFIG.heroFadeDuration
        })
        .to(heroSubtitle, {
            opacity: 1,
            y: 0,
            duration: CONFIG.heroFadeDuration * 0.8
        }, '-=0.6')
        .to(heroCTA, {
            opacity: 1,
            y: 0,
            duration: CONFIG.heroFadeDuration * 0.6
        }, '-=0.4')
        .to(heroHighlights, {
            opacity: 1,
            y: 0,
            duration: CONFIG.heroFadeDuration * 0.6
        }, '-=0.2');

        // Add floating animation to hero particles if they exist
        if (heroParticles && !isMobile) {
            gsap.to(heroParticles, {
                y: -20,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        }

        // Add floating animation to hero title accent
        const titleAccent = document.querySelector('.hero-title-accent');
        if (titleAccent) {
            gsap.to(titleAccent, {
                scale: 1.1,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        }
    }

    // ============================================
    // SECTION REVEAL ANIMATIONS
    // ============================================
    
    function initSectionReveals() {
        // Sections to animate
        const sections = [
            {
                selector: '.projects-section',
                elements: ['.section-title', '.section-subtitle', '.project-card']
            },
            {
                selector: '.contact-section',
                elements: ['.section-title', '.section-subtitle', '.contact-card']
            },
            {
                selector: '.services-section',
                elements: ['.section-title', '.section-subtitle', '.service-card']
            },
            {
                selector: '.reviews-section',
                elements: ['.section-title', '.section-subtitle', '.review-card']
            }
        ];

        sections.forEach(section => {
            const sectionEl = document.querySelector(section.selector);
            if (!sectionEl) return;

            // Create ScrollTrigger for section
            ScrollTrigger.create({
                trigger: sectionEl,
                start: 'top 80%',
                onEnter: () => {
                    // Animate section title and subtitle
                    const title = sectionEl.querySelector('.section-title');
                    const subtitle = sectionEl.querySelector('.section-subtitle');

                    if (title) {
                        gsap.fromTo(title, 
                            { opacity: 0, y: 30 },
                            { opacity: 1, y: 0, duration: CONFIG.sectionRevealDuration, ease: 'power3.out' }
                        );
                    }

                    if (subtitle) {
                        gsap.fromTo(subtitle,
                            { opacity: 0, y: 20 },
                            { 
                                opacity: 1, y: 0, 
                                duration: CONFIG.sectionRevealDuration * 0.8, 
                                delay: 0.2,
                                ease: 'power3.out' 
                            }
                        );
                    }

                    // Animate cards with stagger
                    const cards = sectionEl.querySelectorAll(section.elements[2]);
                    if (cards.length) {
                        gsap.fromTo(cards,
                            { opacity: 0, y: 40 },
                            { 
                                opacity: 1, y: 0, 
                                duration: 0.8, 
                                stagger: CONFIG.cardStaggerDelay,
                                ease: 'back.out(1.2)'
                            }
                        );
                    }
                },
                once: true
            });
        });
    }

    // ============================================
    // PORTFOLIO CARD ANIMATIONS
    // ============================================
    
    function initPortfolioCards() {
        const cards = document.querySelectorAll('.project-card');
        
        cards.forEach((card, index) => {
            // Add hover animation
            card.addEventListener('mouseenter', () => {
                if (isMobile) return;
                
                gsap.to(card, {
                    scale: 1.03,
                    y: -10,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(74, 125, 255, 0.3)',
                    duration: 0.3,
                    ease: 'power2.out'
                });

                // Animate thumbnail overlay
                const overlay = card.querySelector('.thumbnail-overlay');
                if (overlay) {
                    gsap.to(overlay, { opacity: 1, duration: 0.2 });
                }

                // Animate play button
                const playBtn = card.querySelector('.play-button');
                if (playBtn) {
                    gsap.to(playBtn, {
                        scale: 1.1,
                        boxShadow: '0 0 40px rgba(74, 125, 255, 0.8)',
                        duration: 0.3,
                        ease: 'back.out(1.7)'
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                if (isMobile) return;
                
                gsap.to(card, {
                    scale: 1,
                    y: 0,
                    boxShadow: 'none',
                    duration: 0.3,
                    ease: 'power2.out'
                });

                const overlay = card.querySelector('.thumbnail-overlay');
                if (overlay) {
                    gsap.to(overlay, { opacity: 0, duration: 0.2 });
                }

                const playBtn = card.querySelector('.play-button');
                if (playBtn) {
                    gsap.to(playBtn, {
                        scale: 1,
                        boxShadow: '0 0 30px rgba(183, 122, 255, 0.5)',
                        duration: 0.3
                    });
                }
            });

            // Add floating animation with staggered delay
            if (!isMobile) {
                gsap.to(card, {
                    y: -5,
                    duration: 2 + (index * 0.2),
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                    delay: index * 0.2
                });
            }
        });
    }

    // ============================================
    // VIDEO PLAYER FUNCTIONALITY
    // ============================================
    
    function initVideoPlayers() {
        const playButtons = document.querySelectorAll('.play-button');
        
        playButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const card = button.closest('.project-card');
                if (!card) return;
                
                const videoSrc = card.dataset.video;
                if (!videoSrc) {
                    console.warn('No video source specified for this card');
                    return;
                }

                playVideo(videoSrc, card);
            });

            // Add ARIA label if not present
            if (!button.hasAttribute('aria-label')) {
                const cardTitle = button.closest('.project-card')?.querySelector('.card-title')?.textContent;
                button.setAttribute('aria-label', `Play video: ${cardTitle || 'portfolio item'}`);
            }
        });
    }

    /**
     * Play video in overlay
     */
    function playVideo(src, triggerElement) {
        // Close existing player if any
        if (currentVideoPlayer) {
            closeVideoPlayer();
        }

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'video-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Video player');
        
        // Create video container
        const container = document.createElement('div');
        container.className = 'video-container';
        
        // Create video element
        const video = document.createElement('video');
        video.className = 'video-player';
        video.src = src;
        video.controls = true;
        video.autoplay = CONFIG.videoAutoplay;
        video.loop = CONFIG.videoLoop;
        video.setAttribute('playsinline', '');
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'video-close';
        closeBtn.innerHTML = '✕';
        closeBtn.setAttribute('aria-label', 'Close video');
        
        // Add loading indicator
        const loader = document.createElement('div');
        loader.className = 'video-loader';
        loader.innerHTML = '<div class="spinner"></div>';
        
        // Assemble
        container.appendChild(video);
        container.appendChild(closeBtn);
        container.appendChild(loader);
        overlay.appendChild(container);
        document.body.appendChild(overlay);

        // Animate in
        gsap.fromTo(overlay,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: 'power2.out' }
        );

        gsap.fromTo(container,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, delay: 0.1, ease: 'back.out(1.7)' }
        );

        // Handle video events
        video.addEventListener('loadeddata', () => {
            loader.style.display = 'none';
        });

        video.addEventListener('error', () => {
            loader.innerHTML = '<p class="error">Failed to load video</p>';
            setTimeout(() => closeVideoPlayer(), 2000);
        });

        // Close functionality
        closeBtn.addEventListener('click', closeVideoPlayer);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeVideoPlayer();
            }
        });

        // Store reference
        currentVideoPlayer = {
            overlay,
            video,
            close: closeVideoPlayer
        };

        // Pause body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close video player
     */
    function closeVideoPlayer() {
        if (!currentVideoPlayer) return;

        const { overlay, video } = currentVideoPlayer;

        // Animate out
        gsap.to(overlay, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                // Stop video
                if (video) {
                    video.pause();
                    video.src = '';
                    video.load();
                }

                // Remove overlay
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }

                // Restore body scroll
                document.body.style.overflow = '';

                currentVideoPlayer = null;
            }
        });
    }

    // ============================================
    // FLOATING PARTICLES
    // ============================================
    
    function initFloatingParticles() {
        if (isMobile || !CONFIG.enableParticles) return;

        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        // Create particle container if not exists
        let particleContainer = document.querySelector('.floating-particles');
        if (!particleContainer) {
            particleContainer = document.createElement('div');
            particleContainer.className = 'floating-particles';
            particleContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            `;
            heroSection.style.position = 'relative';
            heroSection.appendChild(particleContainer);
        }

        // Create particles
        const particleCount = 30;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            
            const size = Math.random() * 4 + 1;
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;
            
            particle.style.cssText = `
                position: absolute;
                left: ${startX}%;
                top: ${startY}%;
                width: ${size}px;
                height: ${size}px;
                background: rgba(74, 125, 255, ${Math.random() * 0.3});
                border-radius: 50%;
                box-shadow: 0 0 ${size * 2}px rgba(74, 125, 255, 0.3);
                pointer-events: none;
            `;

            particleContainer.appendChild(particle);
            particles.push({
                element: particle,
                x: startX,
                y: startY,
                speedX: (Math.random() - 0.5) * 0.1,
                speedY: (Math.random() - 0.5) * 0.1
            });
        }

        // Animate particles
        function animateParticles() {
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;

                // Wrap around
                if (p.x > 100) p.x = 0;
                if (p.x < 0) p.x = 100;
                if (p.y > 100) p.y = 0;
                if (p.y < 0) p.y = 100;

                p.element.style.left = `${p.x}%`;
                p.element.style.top = `${p.y}%`;
            });

            particleInterval = requestAnimationFrame(animateParticles);
        }

        animateParticles();
    }

    // ============================================
    // ACCESSIBILITY ENHANCEMENTS
    // ============================================
    
    function initAccessibility() {
        // Add proper ARIA roles to sections
        const sections = document.querySelectorAll('section');
        sections.forEach((section, index) => {
            if (!section.hasAttribute('aria-label') && section.id) {
                section.setAttribute('aria-label', `${section.id.replace('-', ' ')} section`);
            }
        });

        // Add focus states to interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .project-card, .contact-card');
        interactiveElements.forEach(el => {
            if (!el.hasAttribute('tabindex') && !el.tagName.match(/^(A|BUTTON)$/)) {
                el.setAttribute('tabindex', '0');
                el.setAttribute('role', 'button');
            }
        });

        // Handle keyboard navigation for cards
        const cards = document.querySelectorAll('.project-card');
        cards.forEach(card => {
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const playBtn = card.querySelector('.play-button');
                    if (playBtn) playBtn.click();
                }
            });
        });
    }

    // ============================================
    // RESPONSIVE HANDLING
    // ============================================
    
    function initResponsiveHandling() {
        const handleResize = debounce(() => {
            isMobile = window.innerWidth <= CONFIG.mobileBreakpoint;
            isTablet = window.innerWidth <= CONFIG.tabletBreakpoint;

            // Kill particle animation on mobile
            if (isMobile && particleInterval) {
                cancelAnimationFrame(particleInterval);
                particleInterval = null;
                
                const particleContainer = document.querySelector('.floating-particles');
                if (particleContainer) {
                    particleContainer.remove();
                }
            }

            // Refresh ScrollTrigger
            ScrollTrigger.refresh();
        }, 250);

        window.addEventListener('resize', handleResize);
    }

    // ============================================
    // INITIALIZE EVERYTHING
    // ============================================
    
    function init() {
        console.log('🚀 Initializing Adarsh portfolio...');

        // Check dependencies
        if (typeof gsap === 'undefined') {
            console.error('GSAP is required for animations');
            return;
        }

        // Register ScrollTrigger
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        } else {
            console.warn('ScrollTrigger not loaded - scroll animations disabled');
        }

        // Initialize all modules
        initSmoothScroll();
        initHeroAnimations();
        initSectionReveals();
        initPortfolioCards();
        initVideoPlayers();
        initFloatingParticles();
        initAccessibility();
        initResponsiveHandling();

        // Log completion
        console.log('✨ Adarsh portfolio initialized successfully');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ============================================
    // PUBLIC API
    // ============================================
    
    window.AdarshPortfolio = {
        closeVideo: closeVideoPlayer,
        refresh: () => {
            ScrollTrigger.refresh();
        },
        destroy: () => {
            if (particleInterval) {
                cancelAnimationFrame(particleInterval);
            }
            closeVideoPlayer();
        }
    };

})();

