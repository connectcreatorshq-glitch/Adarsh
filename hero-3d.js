/**
 * cursor.js
 * Professional Cinematic Portfolio Website
 * Custom cursor with magnetic effects and smooth trailing
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    
    const CONFIG = {
        // Inner dot settings
        dotSize: 8,
        dotColor: '#ffffff',
        dotGlow: '0 0 15px rgba(255, 255, 255, 0.8)',
        
        // Outer circle settings
        circleSize: 32,
        circleColor: 'rgba(74, 125, 255, 0.3)',
        circleGlow: '0 0 20px rgba(74, 125, 255, 0.5)',
        circleBorder: '1px solid rgba(255, 255, 255, 0.2)',
        
        // Animation speeds (0-1, lower = smoother/slower)
        dotSpeed: 0.25,
        circleSpeed: 0.15,
        trailIntensity: 0.15, // Added trail intensity
        
        // Magnetic effect
        magneticRadius: 120,
        magneticStrength: 0.3,
        magneticSmoothing: 0.1, // Added smoothing
        hoverScale: 1.3,
        
        // Responsive
        mobileBreakpoint: 768,
        
        // Interactive elements
        interactiveSelectors: [
            'a',
            'button',
            '.btn',
            '.play-button',
            '.nav-link',
            '.project-card',
            '.contact-card',
            '.social-link',
            '.copy-button',
            '.follow-button',
            '.faq-question'
        ],
        
        debug: false // Debug mode
    };

    // ============================================
    // STATE
    // ============================================
    
    let cursor = {
        dot: null,
        circle: null,
        container: null,
        initialized: false
    };

    let mouse = {
        x: 0,
        y: 0,
        lastX: 0,
        lastY: 0,
        targetX: 0,
        targetY: 0
    };

    let hoveredElement = null;
    let animationFrame = null;
    let isMouseInside = true;
    let clickTimeout = null;

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    function getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    function isTouchCapable() {
        return ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) || 
               (navigator.msMaxTouchPoints > 0);
    }

    function shouldEnableCursor() {
        return !isTouchCapable() && window.innerWidth > CONFIG.mobileBreakpoint;
    }

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

    // ============================================
    // CREATE CURSOR ELEMENTS
    // ============================================
    
    function createCursorElements() {
        const existingCursor = document.querySelector('.custom-cursor-container');
        if (existingCursor) {
            existingCursor.remove();
        }

        const container = document.createElement('div');
        container.className = 'custom-cursor-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const circle = document.createElement('div');
        circle.className = 'cursor-circle';
        circle.style.cssText = `
            position: absolute;
            width: ${CONFIG.circleSize}px;
            height: ${CONFIG.circleSize}px;
            border-radius: 50%;
            background: ${CONFIG.circleColor};
            box-shadow: ${CONFIG.circleGlow};
            border: ${CONFIG.circleBorder};
            transform: translate(-50%, -50%);
            transition: width 0.3s ease, height 0.3s ease, background 0.3s ease;
            will-change: transform;
            backdrop-filter: blur(2px);
        `;

        const dot = document.createElement('div');
        dot.className = 'cursor-dot';
        dot.style.cssText = `
            position: absolute;
            width: ${CONFIG.dotSize}px;
            height: ${CONFIG.dotSize}px;
            border-radius: 50%;
            background: ${CONFIG.dotColor};
            box-shadow: ${CONFIG.dotGlow};
            transform: translate(-50%, -50%);
            transition: width 0.2s ease, height 0.2s ease;
            will-change: transform;
            border: 2px solid rgba(255, 255, 255, 0.3);
        `;

        container.appendChild(circle);
        container.appendChild(dot);
        document.body.appendChild(container);

        cursor = {
            dot: dot,
            circle: circle,
            container: container,
            initialized: true
        };

        document.body.style.cursor = 'none';
    }

    function removeCursorElements() {
        const container = document.querySelector('.custom-cursor-container');
        if (container) {
            container.remove();
        }
        document.body.style.cursor = 'auto';
        cursor.initialized = false;
    }

    // ============================================
    // INTERACTIVE ELEMENTS
    // ============================================
    
    let interactiveElements = [];
    
    function refreshInteractiveElements() {
        const selector = CONFIG.interactiveSelectors.join(',');
        interactiveElements = Array.from(document.querySelectorAll(selector));
    }

    // ============================================
    // CHECK HOVER STATE
    // ============================================
    
    function checkHoverElements() {
        if (!cursor.initialized || !isMouseInside) return;

        const mouseX = mouse.targetX;
        const mouseY = mouse.targetY;
        
        // Quick optimization: filter nearby elements
        const nearbyElements = interactiveElements.filter(el => {
            const rect = el.getBoundingClientRect();
            const buffer = 100;
            return mouseX >= rect.left - buffer && 
                   mouseX <= rect.right + buffer && 
                   mouseY >= rect.top - buffer && 
                   mouseY <= rect.bottom + buffer;
        });

        let hovered = null;
        let minDistance = Infinity;

        for (let i = 0; i < nearbyElements.length; i++) {
            const element = nearbyElements[i];
            const rect = element.getBoundingClientRect();
            
            if (mouseX >= rect.left && mouseX <= rect.right && 
                mouseY >= rect.top && mouseY <= rect.bottom) {
                
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const distance = getDistance(mouseX, mouseY, centerX, centerY);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    hovered = element;
                }
            }
        }

        if (hovered !== hoveredElement) {
            if (hoveredElement) {
                cursor.circle.style.width = `${CONFIG.circleSize}px`;
                cursor.circle.style.height = `${CONFIG.circleSize}px`;
                cursor.circle.style.background = CONFIG.circleColor;
                cursor.dot.style.width = `${CONFIG.dotSize}px`;
                cursor.dot.style.height = `${CONFIG.dotSize}px`;
            }

            if (hovered) {
                cursor.circle.style.width = `${CONFIG.circleSize * CONFIG.hoverScale}px`;
                cursor.circle.style.height = `${CONFIG.circleSize * CONFIG.hoverScale}px`;
                cursor.circle.style.background = 'rgba(74, 125, 255, 0.5)';
                cursor.dot.style.width = `${CONFIG.dotSize * 1.2}px`;
                cursor.dot.style.height = `${CONFIG.dotSize * 1.2}px`;
            }

            hoveredElement = hovered;
        }
    }

    // ============================================
    // UPDATE CURSOR POSITION
    // ============================================
    
    function updateCursorPosition() {
        if (!cursor.initialized || !isMouseInside) return;

        mouse.targetX = lerp(mouse.targetX, mouse.x, CONFIG.dotSpeed);
        mouse.targetY = lerp(mouse.targetY, mouse.y, CONFIG.dotSpeed);

        if (hoveredElement) {
            const rect = hoveredElement.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const distToCenter = getDistance(mouse.targetX, mouse.targetY, centerX, centerY);
            
            if (distToCenter < CONFIG.magneticRadius) {
                const strength = 1 - (distToCenter / CONFIG.magneticRadius);
                const targetX = lerp(mouse.targetX, centerX, strength * CONFIG.magneticStrength);
                const targetY = lerp(mouse.targetY, centerY, strength * CONFIG.magneticStrength);
                
                mouse.targetX = lerp(mouse.targetX, targetX, CONFIG.magneticSmoothing);
                mouse.targetY = lerp(mouse.targetY, targetY, CONFIG.magneticSmoothing);
            }
        }

        const circleSpeed = CONFIG.circleSpeed * (1 - CONFIG.trailIntensity);
        const circleX = lerp(mouse.lastX, mouse.targetX, circleSpeed);
        const circleY = lerp(mouse.lastY, mouse.targetY, circleSpeed);

        cursor.dot.style.transform = `translate(${mouse.targetX}px, ${mouse.targetY}px) translate(-50%, -50%)`;
        cursor.circle.style.transform = `translate(${circleX}px, ${circleY}px) translate(-50%, -50%)`;

        mouse.lastX = circleX;
        mouse.lastY = circleY;
    }

    // ============================================
    // ANIMATION LOOP
    // ============================================
    
    function animate() {
        if (!cursor.initialized || !shouldEnableCursor()) {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
            return;
        }

        if (isMouseInside) {
            checkHoverElements();
            updateCursorPosition();
        }

        animationFrame = requestAnimationFrame(animate);
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================
    
    function onMouseMove(e) {
        if (!cursor.initialized) return;
        
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        
        if (!isMouseInside) {
            isMouseInside = true;
            cursor.container.style.opacity = '1';
        }
    }

    function onMouseDown() {
        if (!cursor.initialized) return;
        
        const currentDotTransform = cursor.dot.style.transform;
        const currentCircleTransform = cursor.circle.style.transform;
        
        cursor.dot.style.transform += ' scale(0.8)';
        cursor.circle.style.transform += ' scale(1.1)';
        
        if (clickTimeout) clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
            if (cursor.initialized) {
                cursor.dot.style.transform = currentDotTransform;
                cursor.circle.style.transform = currentCircleTransform;
            }
        }, 150);
    }

    function onMouseLeave() {
        isMouseInside = false;
        if (cursor.container) {
            cursor.container.style.opacity = '0';
        }
    }

    function onMouseEnter() {
        isMouseInside = true;
        if (cursor.container) {
            cursor.container.style.opacity = '1';
        }
    }

    function onResize() {
        if (shouldEnableCursor()) {
            if (!cursor.initialized) {
                createCursorElements();
                refreshInteractiveElements();
                
                // Ensure visible on resize
                if (cursor.container) {
                    cursor.container.style.opacity = '1';
                }
            }
        } else {
            if (cursor.initialized) {
                removeCursorElements();
            }
        }
    }

    function onVisibilityChange() {
        if (document.hidden && animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        } else if (!document.hidden && !animationFrame && cursor.initialized) {
            animationFrame = requestAnimationFrame(animate);
        }
    }

    // ============================================
    // INITIALIZE
    // ============================================
    
    function init() {
        if (!shouldEnableCursor()) {
            console.log('Custom cursor disabled on touch device or mobile');
            return;
        }

        createCursorElements();
        refreshInteractiveElements();

        mouse.x = window.innerWidth / 2;
        mouse.y = window.innerHeight / 2;
        mouse.targetX = mouse.x;
        mouse.targetY = mouse.y;
        mouse.lastX = mouse.x;
        mouse.lastY = mouse.y;

        if (cursor.container) {
            cursor.container.style.opacity = '1';
        }

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseleave', onMouseLeave);
        window.addEventListener('mouseenter', onMouseEnter);
        window.addEventListener('resize', onResize);
        document.addEventListener('visibilitychange', onVisibilityChange);

        const observer = new MutationObserver(debounce(refreshInteractiveElements, 200));
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        animationFrame = requestAnimationFrame(animate);

        console.log('✨ Custom cursor initialized');
    }

    // ============================================
    // CLEANUP
    // ============================================
    
    function cleanup() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }

        if (clickTimeout) {
            clearTimeout(clickTimeout);
        }

        removeCursorElements();

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mouseleave', onMouseLeave);
        window.removeEventListener('mouseenter', onMouseEnter);
        window.removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onVisibilityChange);

        console.log('Custom cursor cleaned up');
    }

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
    
    window.CustomCursor = {
        enable: init,
        disable: cleanup,
        refresh: refreshInteractiveElements
    };

})();