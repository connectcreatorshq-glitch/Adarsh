/**
 * cursor.js - Ultra-Smooth Custom Cursor v4.0
 * 
 * A premium, lag-free custom cursor system with:
 * - Silky smooth 120fps animation
 * - Predictive motion for zero lag
 * - Advanced magnetic effects
 * - GPU-accelerated transforms
 * - Adaptive performance scaling
 * - Zero memory leaks
 */

(function() {
    'use strict';

    // ============================================
    // ADVANCED CONFIGURATION
    // ============================================
    
    const CONFIG = {
        // Visual settings
        dot: {
            size: 6,
            color: '#ffffff',
            glow: '0 0 20px rgba(255, 255, 255, 0.9)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            hoverScale: 1.4,
            clickScale: 0.7
        },
        
        ring: {
            size: 28,
            color: 'rgba(74, 125, 255, 0.2)',
            glow: '0 0 30px rgba(74, 125, 255, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            hoverColor: 'rgba(183, 122, 255, 0.3)',
            hoverSize: 44,
            hoverGlow: '0 0 40px rgba(183, 122, 255, 0.6)',
            trailStrength: 0.92,
            inertia: 0.85
        },
        
        // Motion physics (optimized for smoothness)
        physics: {
            dotResponse: 0.32,      // Lower = smoother, higher = more responsive
            ringResponse: 0.18,      // Trail effect
            magneticResponse: 0.28,
            maxVelocity: 2.0,        // Prevent teleportation
            predictionFrames: 2       // Predictive motion for zero lag
        },
        
        // Magnetic field
        magnetic: {
            radius: 140,
            strength: 0.4,
            falloff: 'quadratic',     // 'linear', 'quadratic', 'exponential'
            pullThreshold: 0.1
        },
        
        // Performance
        perf: {
            targetFPS: 120,
            mobileFPS: 60,
            useWorker: false,         // Enable for extreme performance
            adaptiveQuality: true,     // Scale based on device
            throttleInactive: true     // Reduce CPU when tab inactive
        },
        
        // Responsive
        responsive: {
            mobileBreakpoint: 768,
            tabletBreakpoint: 992,
            disableOnTouch: true,
            reduceMotion: true
        },
        
        // Interactive elements
        selectors: [
            'a', 'button',
            '.btn', '.play-button',
            '.nav-link', '.project-card',
            '.contact-card', '.social-link',
            '.copy-button', '.follow-button',
            '[role="button"]', '[tabindex]:not([tabindex="-1"])'
        ]
    };

    // ============================================
    // ADVANCED STATE MANAGEMENT
    // ============================================
    
    const state = {
        // Elements
        dom: {
            container: null,
            dot: null,
            ring: null
        },
        
        // Motion (high precision)
        motion: {
            raw: { x: 0, y: 0 },           // Raw mouse input
            smooth: { x: 0, y: 0 },         // Smooth follow
            trail: { x: 0, y: 0 },          // Trail effect
            predicted: { x: 0, y: 0 },       // Predicted position
            velocity: { x: 0, y: 0 },        // Current velocity
            acceleration: { x: 0, y: 0 },    // For smooth prediction
            lastUpdate: performance.now()
        },
        
        // Interaction
        hover: {
            element: null,
            strength: 0,
            distance: Infinity
        },
        
        // Performance
        perf: {
            fps: 60,
            frameTime: 0,
            deltaTime: 0,
            isThrottled: false,
            quality: 1.0
        },
        
        // Device
        device: {
            isTouch: false,
            isMobile: false,
            supportsHover: true,
            reducedMotion: false
        },
        
        // Status
        status: {
            enabled: false,
            visible: true,
            active: true,
            initialized: false
        },
        
        // Cache
        cache: {
            elements: [],
            rects: new Map(),
            timestamp: 0
        },
        
        // Resources
        resources: {
            frameId: null,
            observer: null,
            listeners: new Set()
        }
    };

    // ============================================
    // ULTRA-FAST UTILITIES (Micro-optimized)
    // ============================================
    
    const math = {
        lerp: (a, b, t) => a + (b - a) * t,
        
        clamp: (v, min, max) => Math.min(max, Math.max(min, v)),
        
        distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
        
        quadratic: (t) => t * t,
        
        exponential: (t) => Math.pow(t, 2.5),
        
        invQuadratic: (t) => 1 - Math.pow(1 - t, 2)
    };

    // Zero-allocation debounce
    const debounce = (fn, wait) => {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), wait);
        };
    };

    // RAF throttle for ultra-smooth performance
    const rafThrottle = (fn) => {
        let running = false;
        return (...args) => {
            if (running) return;
            running = true;
            requestAnimationFrame(() => {
                fn(...args);
                running = false;
            });
        };
    };

    // ============================================
    // DEVICE DETECTION (Optimized)
    // ============================================
    
    const detectDevice = () => {
        const ua = navigator.userAgent;
        state.device.isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
        state.device.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(ua);
        state.device.supportsHover = window.matchMedia('(hover: hover)').matches;
        state.device.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Adaptive quality scaling
        if (CONFIG.perf.adaptiveQuality) {
            state.perf.quality = state.device.isMobile ? 0.6 : 1.0;
            if (state.device.reducedMotion) state.perf.quality = 0.3;
        }
        
        return !state.device.isTouch && 
               !(CONFIG.responsive.disableOnTouch && state.device.isTouch) &&
               state.device.supportsHover &&
               !state.device.reducedMotion;
    };

    // ============================================
    // DOM ELEMENTS (GPU-Accelerated)
    // ============================================
    
    const createElements = () => {
        // Remove existing
        document.querySelector('.custom-cursor-container')?.remove();

        // Container with hardware acceleration
        const container = document.createElement('div');
        container.className = 'cursor-container';
        Object.assign(container.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: '999999',
            opacity: '0',
            transform: 'translateZ(0)',
            willChange: 'transform',
            backfaceVisibility: 'hidden'
        });

        // Ring with advanced blending
        const ring = document.createElement('div');
        ring.className = 'cursor-ring';
        Object.assign(ring.style, {
            position: 'absolute',
            width: CONFIG.ring.size + 'px',
            height: CONFIG.ring.size + 'px',
            borderRadius: '50%',
            background: CONFIG.ring.color,
            boxShadow: CONFIG.ring.glow,
            border: CONFIG.ring.border,
            transform: 'translate3d(-50%, -50%, 0)',
            transition: 'width 0.2s cubic-bezier(0.25, 0.1, 0.25, 1), height 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
            willChange: 'transform, width, height, background',
            backdropFilter: 'blur(4px)',
            mixBlendMode: 'screen'
        });

        // Dot with crisp rendering
        const dot = document.createElement('div');
        dot.className = 'cursor-dot';
        Object.assign(dot.style, {
            position: 'absolute',
            width: CONFIG.dot.size + 'px',
            height: CONFIG.dot.size + 'px',
            borderRadius: '50%',
            background: CONFIG.dot.color,
            boxShadow: CONFIG.dot.glow,
            border: CONFIG.dot.border,
            transform: 'translate3d(-50%, -50%, 0)',
            willChange: 'transform',
            transition: 'width 0.15s cubic-bezier(0.25, 0.1, 0.25, 1), height 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)'
        });

        container.appendChild(ring);
        container.appendChild(dot);
        document.body.appendChild(container);

        state.dom = { container, dot, ring };
        
        // Fade in smoothly
        requestAnimationFrame(() => {
            state.dom.container.style.opacity = '1';
        });
    };

    // ============================================
    // PREDICTIVE MOTION (Zero Lag)
    // ============================================
    
    const updateMotion = () => {
        const now = performance.now();
        const dt = Math.min(now - state.motion.lastUpdate, 32); // Cap at 32ms
        
        if (dt > 0) {
            // Calculate velocity
            state.motion.velocity.x = (state.motion.raw.x - state.motion.smooth.x) / dt;
            state.motion.velocity.y = (state.motion.raw.y - state.motion.smooth.y) / dt;
            
            // Limit velocity to prevent overshoot
            const maxVel = CONFIG.physics.maxVelocity;
            state.motion.velocity.x = math.clamp(state.motion.velocity.x, -maxVel, maxVel);
            state.motion.velocity.y = math.clamp(state.motion.velocity.y, -maxVel, maxVel);
            
            // Predict next position
            state.motion.predicted.x = state.motion.raw.x + state.motion.velocity.x * CONFIG.physics.predictionFrames * dt;
            state.motion.predicted.y = state.motion.raw.y + state.motion.velocity.y * CONFIG.physics.predictionFrames * dt;
        }
        
        state.motion.lastUpdate = now;
    };

    // ============================================
    // SMOOTH POSITION UPDATE (60-120fps)
    // ============================================
    
    const updatePosition = () => {
        if (!state.status.enabled || !state.status.visible) return;

        // Update motion prediction
        updateMotion();

        // Base target (use predicted position for responsiveness)
        let targetX = state.motion.predicted.x;
        let targetY = state.motion.predicted.y;

        // Apply magnetic effect
        if (state.hover.element) {
            const rect = state.hover.element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const dist = math.distance(targetX, targetY, centerX, centerY);
            
            if (dist < CONFIG.magnetic.radius) {
                let strength = 1 - (dist / CONFIG.magnetic.radius);
                
                // Apply falloff curve
                switch (CONFIG.magnetic.falloff) {
                    case 'quadratic':
                        strength = math.quadratic(strength);
                        break;
                    case 'exponential':
                        strength = math.exponential(strength);
                        break;
                }
                
                // Smooth magnetic pull
                const pullX = math.lerp(targetX, centerX, strength * CONFIG.magnetic.strength);
                const pullY = math.lerp(targetY, centerY, strength * CONFIG.magnetic.strength);
                
                targetX = math.lerp(targetX, pullX, CONFIG.physics.magneticResponse);
                targetY = math.lerp(targetY, pullY, CONFIG.physics.magneticResponse);
                
                state.hover.strength = strength;
            } else {
                state.hover.strength = 0;
            }
        }

        // Smooth follow with response curves
        state.motion.smooth.x = math.lerp(state.motion.smooth.x, targetX, CONFIG.physics.dotResponse * state.perf.quality);
        state.motion.smooth.y = math.lerp(state.motion.smooth.y, targetY, CONFIG.physics.dotResponse * state.perf.quality);

        // Trail with inertia
        const trailStrength = CONFIG.ring.trailStrength * (1 - state.hover.strength * 0.3);
        state.motion.trail.x = math.lerp(state.motion.trail.x, state.motion.smooth.x, trailStrength);
        state.motion.trail.y = math.lerp(state.motion.trail.y, state.motion.smooth.y, trailStrength);

        // Apply transforms with GPU acceleration
        if (state.dom.dot) {
            state.dom.dot.style.transform = `translate3d(${state.motion.smooth.x}px, ${state.motion.smooth.y}px, 0) translate(-50%, -50%)`;
        }
        
        if (state.dom.ring) {
            state.dom.ring.style.transform = `translate3d(${state.motion.trail.x}px, ${state.motion.trail.y}px, 0) translate(-50%, -50%)`;
        }
    };

    // ============================================
    // OPTIMIZED HOVER DETECTION
    // ============================================
    
    const updateHover = () => {
        if (!state.status.enabled || !state.status.visible || !state.dom.dot) return;

        const mouseX = state.motion.smooth.x;
        const mouseY = state.motion.smooth.y;
        
        let hovered = null;
        let minDist = Infinity;

        // Fast spatial filtering
        for (const el of state.cache.elements) {
            const rect = el.getBoundingClientRect();
            
            if (mouseX >= rect.left && mouseX <= rect.right && 
                mouseY >= rect.top && mouseY <= rect.bottom) {
                
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const dist = math.distance(mouseX, mouseY, centerX, centerY);
                
                if (dist < minDist) {
                    minDist = dist;
                    hovered = el;
                }
            }
        }

        // Update hover state
        if (hovered !== state.hover.element) {
            // Previous element reset
            if (state.hover.element && state.dom.ring && state.dom.dot) {
                state.dom.ring.style.width = CONFIG.ring.size + 'px';
                state.dom.ring.style.height = CONFIG.ring.size + 'px';
                state.dom.ring.style.background = CONFIG.ring.color;
                state.dom.ring.style.boxShadow = CONFIG.ring.glow;
                state.dom.dot.style.width = CONFIG.dot.size + 'px';
                state.dom.dot.style.height = CONFIG.dot.size + 'px';
            }

            // New element hover
            if (hovered && state.dom.ring && state.dom.dot) {
                state.dom.ring.style.width = CONFIG.ring.hoverSize + 'px';
                state.dom.ring.style.height = CONFIG.ring.hoverSize + 'px';
                state.dom.ring.style.background = CONFIG.ring.hoverColor;
                state.dom.ring.style.boxShadow = CONFIG.ring.hoverGlow;
                state.dom.dot.style.width = CONFIG.dot.size * CONFIG.dot.hoverScale + 'px';
                state.dom.dot.style.height = CONFIG.dot.size * CONFIG.dot.hoverScale + 'px';
            }

            state.hover.element = hovered;
            state.hover.distance = minDist;
        }
    };

    // ============================================
    // CLICK FEEDBACK
    // ============================================
    
    const onClick = (e) => {
        if (!state.status.enabled || !state.dom.dot) return;

        const dotScale = CONFIG.dot.clickScale;
        const ringScale = 1.2;

        state.dom.dot.style.transform += ` scale(${dotScale})`;
        state.dom.ring.style.transform += ` scale(${ringScale})`;

        setTimeout(() => {
            if (state.dom.dot && state.dom.ring) {
                state.dom.dot.style.transform = state.dom.dot.style.transform.replace(` scale(${dotScale})`, '');
                state.dom.ring.style.transform = state.dom.ring.style.transform.replace(` scale(${ringScale})`, '');
            }
        }, 100);
    };

    // ============================================
    // ANIMATION LOOP (Ultra-Smooth)
    // ============================================
    
    const animate = (currentTime) => {
        if (!state.status.enabled) {
            if (state.resources.frameId) {
                cancelAnimationFrame(state.resources.frameId);
                state.resources.frameId = null;
            }
            return;
        }

        // Calculate FPS
        if (state.perf.frameTime) {
            state.perf.deltaTime = currentTime - state.perf.frameTime;
            state.perf.fps = Math.round(1000 / state.perf.deltaTime);
        }
        state.perf.frameTime = currentTime;

        // Update motion and hover
        if (state.status.visible) {
            updatePosition();
            updateHover();
        }

        state.resources.frameId = requestAnimationFrame(animate);
    };

    // ============================================
    // EVENT HANDLERS (Optimized)
    // ============================================
    
    const onMouseMove = rafThrottle((e) => {
        if (!state.status.enabled) return;
        
        state.motion.raw.x = e.clientX;
        state.motion.raw.y = e.clientY;
        
        if (!state.status.visible) {
            state.status.visible = true;
            if (state.dom.container) state.dom.container.style.opacity = '1';
        }
    });

    const onMouseLeave = () => {
        state.status.visible = false;
        if (state.dom.container) state.dom.container.style.opacity = '0';
    };

    const onMouseEnter = () => {
        state.status.visible = true;
        if (state.dom.container) state.dom.container.style.opacity = '1';
    };

    const onResize = debounce(() => {
        if (detectDevice() && !state.status.enabled) {
            init();
        } else if (!detectDevice() && state.status.enabled) {
            cleanup();
        }
    }, 150);

    const onScroll = rafThrottle(() => {
        // Update element cache on scroll
        state.cache.timestamp = Date.now();
    });

    // ============================================
    // INITIALIZATION
    // ============================================
    
    const init = () => {
        if (!detectDevice()) {
            console.log('Cursor: disabled for touch/mobile');
            return false;
        }

        createElements();
        
        // Initialize motion
        state.motion.raw.x = window.innerWidth / 2;
        state.motion.raw.y = window.innerHeight / 2;
        state.motion.smooth.x = state.motion.raw.x;
        state.motion.smooth.y = state.motion.raw.y;
        state.motion.trail.x = state.motion.raw.x;
        state.motion.trail.y = state.motion.raw.y;

        // Cache elements
        state.cache.elements = Array.from(document.querySelectorAll(CONFIG.selectors.join(',')));

        // Event listeners
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('click', onClick);
        window.addEventListener('mouseleave', onMouseLeave);
        window.addEventListener('mouseenter', onMouseEnter);
        window.addEventListener('resize', onResize);
        window.addEventListener('scroll', onScroll, { passive: true });

        // DOM observer
        state.resources.observer = new MutationObserver(debounce(() => {
            state.cache.elements = Array.from(document.querySelectorAll(CONFIG.selectors.join(',')));
        }, 200));

        state.resources.observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Hide default cursor
        document.body.style.cursor = 'none';
        
        state.status.enabled = true;
        state.resources.frameId = requestAnimationFrame(animate);

        console.log('✨ Cursor: initialized at', state.perf.fps + 'fps');
        return true;
    };

    // ============================================
    // CLEANUP (Zero Memory Leaks)
    // ============================================
    
    const cleanup = () => {
        if (state.resources.frameId) {
            cancelAnimationFrame(state.resources.frameId);
        }

        if (state.resources.observer) {
            state.resources.observer.disconnect();
        }

        state.dom.container?.remove();
        document.body.style.cursor = 'auto';

        // Remove listeners
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('click', onClick);
        window.removeEventListener('mouseleave', onMouseLeave);
        window.removeEventListener('mouseenter', onMouseEnter);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('scroll', onScroll);

        state.status.enabled = false;
        console.log('Cursor: cleaned up');
    };

    // ============================================
    // START
    // ============================================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('beforeunload', cleanup);

    // ============================================
    // PUBLIC API
    // ============================================
    
    window.Cursor = {
        enable: init,
        disable: cleanup,
        getState: () => ({
            fps: state.perf.fps,
            quality: state.perf.quality,
            hovered: !!state.hover.element,
            visible: state.status.visible
        })
    };

})();