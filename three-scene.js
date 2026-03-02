/**
 * three-scene.js
 * Premium Cinematic Spiral Galaxy Background with Three.js
 * 
 * Features:
 * - Dense spiral galaxy with 4 arms
 * - 8000 glowing stars with twinkling and color variation
 * - Soft nebula clouds with depth layering
 * - Mouse parallax interaction
 * - Performance optimized
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    
    const CONFIG = {
        // Galaxy structure
        arms: 4,
        radius: 30,
        coreRadius: 8,
        spinFactor: 1.2,
        randomness: 0.45,
        flattenFactor: 0.25, // Vertical flattening
        
        // Star counts
        desktopCount: 8000,
        mobileCount: 2500,
        
        // Star sizes
        minSize: 0.4,
        maxSize: 1.8,
        coreGlowMultiplier: 1.5,
        
        // Star colors (expanded palette)
        colors: {
            white: new THREE.Color(0xffffff),
            warmWhite: new THREE.Color(0xfff5e6),
            coolWhite: new THREE.Color(0xe6f0ff),
            softBlue: new THREE.Color(0xaaccff),
            lightPurple: new THREE.Color(0xd9b0ff),
            softPink: new THREE.Color(0xffb0d0),
            paleBlue: new THREE.Color(0x99ccff),
            palePurple: new THREE.Color(0xc0a0e0)
        },
        
        // Nebula settings
        nebula: {
            enabled: true,
            particleCount: 50,
            opacity: 0.2,
            colors: [0x4a2a5a, 0x2a3a6a, 0x3a1a4a, 0x1a3a5a],
            size: 4.0
        },
        
        // Animation speeds
        rotationSpeed: 0.00008,
        nebulaRotationSpeed: -0.00003,
        twinkleSpeed: 2.0,
        colorShiftSpeed: 0.15,
        
        // Mouse parallax
        mouseIntensity: 0.0008,
        mouseSmoothing: 0.08,
        
        // Performance
        maxPixelRatio: 2,
        backgroundColor: 0x0a0710
    };

    // ============================================
    // GLOBAL VARIABLES
    // ============================================
    
    let scene, camera, renderer;
    let galaxy, nebulaLayer1, nebulaLayer2;
    let clock = new THREE.Clock();
    
    // Mouse state
    let mouse = {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0
    };
    
    // Performance detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const pixelRatio = Math.min(window.devicePixelRatio, CONFIG.maxPixelRatio);
    const starCount = isMobile ? CONFIG.mobileCount : CONFIG.desktopCount;
    
    // Canvas element
    const canvas = document.getElementById('galaxy-bg');
    
    if (!canvas) {
        console.warn('Canvas element #galaxy-bg not found');
        return;
    }

    // ============================================
    // CREATE STAR TEXTURE (SOFT GLOW)
    // ============================================
    
    function createStarTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Create soft radial gradient for stars
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.6)');
        gradient.addColorStop(0.7, 'rgba(180, 160, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.clearRect(0, 0, 64, 64);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        
        // Add slight glow extension
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 20;

        return new THREE.CanvasTexture(canvas);
    }

    // ============================================
    // CREATE SPIRAL GALAXY
    // ============================================
    
    function createSpiralGalaxy() {
        const geometry = new THREE.BufferGeometry();
        const starTexture = createStarTexture();
        
        // Arrays for attributes
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        const twinkleOffsets = new Float32Array(starCount);
        const coreGlow = new Float32Array(starCount);

        // Color palette
        const colorPalette = [
            CONFIG.colors.warmWhite,
            CONFIG.colors.coolWhite,
            CONFIG.colors.softBlue,
            CONFIG.colors.lightPurple,
            CONFIG.colors.softPink,
            CONFIG.colors.paleBlue,
            CONFIG.colors.palePurple,
            CONFIG.colors.white
        ];

        for (let i = 0; i < starCount; i++) {
            // Spiral arm distribution
            const armIndex = i % CONFIG.arms;
            const armAngleOffset = (armIndex / CONFIG.arms) * Math.PI * 2;
            
            // Distance from center (exponential distribution for more stars near center)
            const distanceFactor = Math.pow(Math.random(), 1.2);
            const distance = CONFIG.coreRadius + distanceFactor * (CONFIG.radius - CONFIG.coreRadius);
            
            // Spiral twist (increases with distance)
            const twistAngle = distance * CONFIG.spinFactor * 0.15;
            const randomOffset = (Math.random() - 0.5) * CONFIG.randomness * (distance * 0.3);
            
            // Calculate angle with randomness for natural look
            const angle = armAngleOffset + twistAngle + randomOffset;
            
            // Add extra randomness for spiral thickness
            const spread = 0.2 * distance * (Math.random() - 0.5);
            
            // Position with vertical flattening
            const x = Math.cos(angle) * distance + Math.sin(angle) * spread;
            const y = Math.sin(angle) * distance * CONFIG.flattenFactor + Math.cos(angle) * spread * 0.5;
            const z = (Math.random() - 0.5) * distance * 0.3; // Depth variation
            
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Color selection with bias toward blue/purple in outer arms, white near center
            const isCore = distance < CONFIG.coreRadius * 1.5;
            let color;
            
            if (isCore && Math.random() > 0.3) {
                color = colorPalette[0].clone(); // Warm white for core
            } else {
                // More colorful in outer arms
                color = colorPalette[Math.floor(Math.random() * colorPalette.length)].clone();
                
                // Add slight hue variation
                if (Math.random() > 0.7) {
                    color.lerp(CONFIG.colors.lightPurple, Math.random() * 0.5);
                }
            }

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            // Size based on distance (larger near center)
            const coreFactor = 1 - distance / CONFIG.radius;
            const sizeVariation = CONFIG.minSize + Math.random() * (CONFIG.maxSize - CONFIG.minSize);
            sizes[i] = sizeVariation * (0.8 + coreFactor * 0.5);
            
            // Core glow boost
            coreGlow[i] = isCore ? 1.2 + Math.random() * 0.5 : 0.8 + Math.random() * 0.4;
            
            // Random twinkle offset (0 to 2PI)
            twinkleOffsets[i] = Math.random() * Math.PI * 2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('twinkleOffset', new THREE.BufferAttribute(twinkleOffsets, 1));
        geometry.setAttribute('coreGlow', new THREE.BufferAttribute(coreGlow, 1));

        // Custom shader material for premium star effects
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pointTexture: { value: starTexture },
                colorShift: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                attribute float twinkleOffset;
                attribute float coreGlow;
                varying vec3 vColor;
                varying float vTwinkleOffset;
                varying float vCoreGlow;
                
                void main() {
                    vColor = color;
                    vTwinkleOffset = twinkleOffset;
                    vCoreGlow = coreGlow;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    vec4 projected = projectionMatrix * mvPosition;
                    gl_Position = projected;
                    
                    // Size attenuation with distance
                    float dist = length(mvPosition.xyz);
                    gl_PointSize = size * coreGlow * (300.0 / dist);
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                uniform float time;
                uniform float colorShift;
                varying vec3 vColor;
                varying float vTwinkleOffset;
                varying float vCoreGlow;
                
                void main() {
                    vec4 texColor = texture2D(pointTexture, gl_PointCoord);
                    
                    // Complex twinkling effect (multiple frequencies)
                    float twinkle1 = sin(time * 3.0 + vTwinkleOffset * 5.0) * 0.3;
                    float twinkle2 = cos(time * 2.0 + vTwinkleOffset * 3.0) * 0.2;
                    float twinkle = 0.7 + twinkle1 + twinkle2;
                    
                    // Color shift over time (subtle)
                    float shift = colorShift * 0.3;
                    vec3 shiftedColor = mix(vColor, vec3(0.9, 0.8, 1.0), shift * 0.5);
                    
                    // Core glow boost
                    float brightness = twinkle * (0.8 + vCoreGlow * 0.4);
                    
                    vec4 finalColor = vec4(shiftedColor * brightness, texColor.a * (0.7 + vCoreGlow * 0.3));
                    gl_FragColor = finalColor;
                    
                    if (gl_FragColor.a < 0.05) discard;
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        return new THREE.Points(geometry, material);
    }

    // ============================================
    // CREATE NEBULA CLOUDS
    // ============================================
    
    function createNebulaLayer(color, size, opacity, spread) {
        if (!CONFIG.nebula.enabled || isMobile) return null;

        const geometry = new THREE.BufferGeometry();
        const particleCount = CONFIG.nebula.particleCount;
        
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            // Distribute in flattened sphere
            const radius = CONFIG.radius * (0.8 + Math.random() * 1.2);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta) * 0.3;
            const z = radius * Math.cos(phi) * 0.6;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Color with variation
            const baseColor = new THREE.Color(color);
            const r = baseColor.r * (0.7 + Math.random() * 0.3);
            const g = baseColor.g * (0.7 + Math.random() * 0.3);
            const b = baseColor.b * (0.7 + Math.random() * 0.3);

            colors[i * 3] = r;
            colors[i * 3 + 1] = g;
            colors[i * 3 + 2] = b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: size,
            vertexColors: true,
            transparent: true,
            opacity: opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        return new THREE.Points(geometry, material);
    }

    // ============================================
    // INITIALIZE SCENE
    // ============================================
    
    function init() {
        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(CONFIG.backgroundColor);

        // Camera
        const aspect = window.innerWidth / window.innerHeight;
        camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 1000);
        camera.position.set(0, 5, 35);
        camera.lookAt(0, 0, 0);

        // Renderer
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(pixelRatio);
        renderer.setClearColor(CONFIG.backgroundColor, 1);

        // Create galaxy
        galaxy = createSpiralGalaxy();
        scene.add(galaxy);

        // Create nebula layers
        if (CONFIG.nebula.enabled && !isMobile) {
            nebulaLayer1 = createNebulaLayer(0x4a2a6a, 4.5, 0.18, 1.5);
            nebulaLayer2 = createNebulaLayer(0x2a3a7a, 5.0, 0.15, 1.8);
            
            if (nebulaLayer1) scene.add(nebulaLayer1);
            if (nebulaLayer2) scene.add(nebulaLayer2);
        }

        // Start animation
        animate();

        // Setup event listeners
        setupEventListeners();

        console.log(`✨ Spiral galaxy initialized with ${starCount} stars`);
    }

    // ============================================
    // ANIMATION LOOP
    // ============================================
    
    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const elapsedTime = performance.now() / 1000;

        // Smooth mouse follow
        mouse.targetX += (mouse.x - mouse.targetX) * CONFIG.mouseSmoothing;
        mouse.targetY += (mouse.y - mouse.targetY) * CONFIG.mouseSmoothing;

        // Rotate galaxy
        if (galaxy) {
            galaxy.rotation.y += CONFIG.rotationSpeed;
            galaxy.rotation.x += CONFIG.rotationSpeed * 0.05;

            // Apply mouse parallax
            galaxy.rotation.y += mouse.targetX * CONFIG.mouseIntensity;
            galaxy.rotation.x += mouse.targetY * CONFIG.mouseIntensity * 0.3;

            // Update shader uniforms
            if (galaxy.material.uniforms) {
                galaxy.material.uniforms.time.value = elapsedTime;
                galaxy.material.uniforms.colorShift.value = Math.sin(elapsedTime * CONFIG.colorShiftSpeed) * 0.5 + 0.5;
            }
        }

        // Rotate nebula layers in opposite direction for depth
        if (nebulaLayer1) {
            nebulaLayer1.rotation.y += CONFIG.nebulaRotationSpeed;
            nebulaLayer1.rotation.x += CONFIG.nebulaRotationSpeed * 0.1;
        }
        
        if (nebulaLayer2) {
            nebulaLayer2.rotation.y += CONFIG.nebulaRotationSpeed * 0.7;
            nebulaLayer2.rotation.x += CONFIG.nebulaRotationSpeed * 0.05;
        }

        // Render
        renderer.render(scene, camera);
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================
    
    function setupEventListeners() {
        // Mouse for parallax
        window.addEventListener('mousemove', (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Touch support
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length) {
                mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        }, { passive: true });

        // Resize
        window.addEventListener('resize', onResize);
    }

    function onResize() {
        if (!camera || !renderer) return;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // ============================================
    // CLEANUP
    // ============================================
    
    function cleanup() {
        if (renderer) renderer.dispose();
        
        if (scene) {
            scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }

        window.removeEventListener('resize', onResize);
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

})();