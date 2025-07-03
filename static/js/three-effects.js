// Three.js 3D Effects and Particle System
class CyberEffects {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.init();
    }

    init() {
        this.setupThreeJS();
        this.createParticleSystem();
        this.createGeometry();
        this.setupEventListeners();
        this.animate();
    }

    setupThreeJS() {
        const canvas = document.getElementById('cyber-canvas');
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0a0a0f, 1, 1000);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 50;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    createParticleSystem() {
        // Floating particles
        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            // Positions
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

            // Colors (cyan theme)
            colors[i * 3] = 0;     // R
            colors[i * 3 + 1] = 1; // G
            colors[i * 3 + 2] = 1; // B

            // Sizes
            sizes[i] = Math.random() * 2 + 1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + sin(time + position.x * 0.01) * 0.3);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float distance = length(gl_PointCoord - vec2(0.5));
                    float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
    }

    createGeometry() {
        // Wireframe geometric shapes
        this.createWireframeShapes();
        this.createGridPlane();
        this.createLights();
    }

    createWireframeShapes() {
        // Rotating wireframe torus
        const torusGeometry = new THREE.TorusGeometry(15, 3, 8, 16);
        const torusMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        this.torus = new THREE.Mesh(torusGeometry, torusMaterial);
        this.torus.position.set(-30, 20, -20);
        this.scene.add(this.torus);

        // Floating wireframe cube
        const cubeGeometry = new THREE.BoxGeometry(8, 8, 8);
        const cubeMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0080,
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });
        this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        this.cube.position.set(30, -15, -15);
        this.scene.add(this.cube);

        // Wireframe sphere
        const sphereGeometry = new THREE.SphereGeometry(6, 16, 16);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            wireframe: true,
            transparent: true,
            opacity: 0.35
        });
        this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.sphere.position.set(0, 25, -25);
        this.scene.add(this.sphere);
    }

    createGridPlane() {
        // Cyberpunk grid plane
        const size = 100;
        const divisions = 20;
        const gridHelper = new THREE.GridHelper(size, divisions, 0x00ffff, 0x00ffff);
        gridHelper.position.y = -30;
        gridHelper.material.opacity = 0.2;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);
    }

    createLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Point lights with colors
        const pointLight1 = new THREE.PointLight(0x00ffff, 1, 100);
        pointLight1.position.set(25, 25, 25);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff0080, 0.8, 100);
        pointLight2.position.set(-25, -25, 25);
        this.scene.add(pointLight2);

        const pointLight3 = new THREE.PointLight(0xffff00, 0.6, 100);
        pointLight3.position.set(0, 0, 50);
        this.scene.add(pointLight3);
    }

    setupEventListeners() {
        // Mouse movement for camera interaction
        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = performance.now() * 0.001;

        // Update particle system
        if (this.particleSystem) {
            this.particleSystem.material.uniforms.time.value = time;
            this.particleSystem.rotation.y += 0.001;
        }

        // Rotate wireframe objects
        if (this.torus) {
            this.torus.rotation.x += 0.01;
            this.torus.rotation.y += 0.005;
        }

        if (this.cube) {
            this.cube.rotation.x += 0.008;
            this.cube.rotation.z += 0.012;
        }

        if (this.sphere) {
            this.sphere.rotation.y += 0.015;
            this.sphere.position.y = 25 + Math.sin(time) * 5;
        }

        // Camera mouse interaction
        this.camera.position.x += (this.mouseX * 10 - this.camera.position.x) * 0.05;
        this.camera.position.y += (-this.mouseY * 10 - this.camera.position.y) * 0.05;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }
}

// Floating particle DOM elements
class DOMParticles {
    constructor() {
        this.container = document.getElementById('particles-container');
        this.particles = [];
        this.init();
    }

    init() {
        this.createParticles();
        this.animate();
    }

    createParticles() {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (3 + Math.random() * 3) + 's';
            
            // Random colors
            const colors = ['#00ffff', '#ff0080', '#ffff00', '#ff4500'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.background = color;
            particle.style.boxShadow = `0 0 6px ${color}`;
            
            this.container.appendChild(particle);
            this.particles.push(particle);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Add random glitch effect to particles
        this.particles.forEach(particle => {
            if (Math.random() < 0.001) {
                particle.style.transform = `translateX(${Math.random() * 10 - 5}px)`;
                setTimeout(() => {
                    particle.style.transform = '';
                }, 100);
            }
        });
    }
}

// Initialize effects when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CyberEffects();
    new DOMParticles();
});

// Glitch effect for text elements
class GlitchEffect {
    static apply(element) {
        const originalText = element.textContent;
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        let iterations = 0;
        const maxIterations = 10;
        
        const glitchInterval = setInterval(() => {
            element.textContent = originalText
                .split('')
                .map((char, index) => {
                    if (index < iterations) {
                        return originalText[index];
                    }
                    return glitchChars[Math.floor(Math.random() * glitchChars.length)];
                })
                .join('');
            
            iterations += 1;
            
            if (iterations > maxIterations) {
                clearInterval(glitchInterval);
                element.textContent = originalText;
            }
        }, 50);
    }
}

// Export for use in other scripts
window.GlitchEffect = GlitchEffect;
