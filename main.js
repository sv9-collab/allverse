document.addEventListener('DOMContentLoaded', () => {
    // --- THREE.JS HYPERCORE ---
    let scene, camera, renderer, hypercore, particles;
    let mouseX = 0, mouseY = 0;

    function initHypercore() {
        const container = document.getElementById('canvas-container');
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Hypercore Orb
        const geometry = new THREE.IcosahedronGeometry(2, 2);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00f2ff,
            wireframe: true,
            transparent: true,
            opacity: 0.3,
            emissive: 0x00f2ff,
            emissiveIntensity: 0.5
        });
        hypercore = new THREE.Mesh(geometry, material);
        scene.add(hypercore);

        // Inner Core
        const innerGeom = new THREE.SphereGeometry(1.2, 32, 32);
        const innerMat = new THREE.MeshPhongMaterial({
            color: 0x7000ff,
            transparent: true,
            opacity: 0.6,
            emissive: 0x7000ff,
            emissiveIntensity: 1
        });
        const innerCore = new THREE.Mesh(innerGeom, innerMat);
        scene.add(innerCore);

        // Lighting
        const light = new THREE.PointLight(0x00f2ff, 2, 50);
        light.position.set(5, 5, 5);
        scene.add(light);
        scene.add(new THREE.AmbientLight(0x404040));

        // Particles
        const partGeom = new THREE.BufferGeometry();
        const partCount = 1500;
        const posArray = new Float32Array(partCount * 3);

        for (let i = 0; i < partCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 40;
        }

        partGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const partMat = new THREE.PointsMaterial({
            size: 0.02,
            color: 0x00f2ff,
            transparent: true,
            opacity: 0.8
        });

        particles = new THREE.Points(partGeom, partMat);
        scene.add(particles);

        camera.position.z = 8;

        // Mouse Parallax
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX - window.innerWidth / 2) / 100;
            mouseY = (e.clientY - window.innerHeight / 2) / 100;
        });

        function animate() {
            requestAnimationFrame(animate);

            hypercore.rotation.x += 0.005;
            hypercore.rotation.y += 0.005;

            innerCore.rotation.x -= 0.008;

            particles.rotation.y += 0.001;

            // Smoothly move camera based on mouse
            camera.position.x += (mouseX - camera.position.x) * 0.05;
            camera.position.y += (-mouseY - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        }

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        animate();
    }

    // Call Hypercore Init immediately for background
    initHypercore();

    // --- QUANTUM FLOW (SMALL CANVAS) ---
    function initQuantumFlow() {
        const canvas = document.getElementById('topology-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height;

        function resize() {
            width = canvas.width = canvas.parentElement.clientWidth;
            height = canvas.height = 120;
        }
        resize();
        window.addEventListener('resize', resize);

        const particles = [];
        for (let i = 0; i < 30; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                speed: Math.random() * 2 + 1,
                size: Math.random() * 2 + 1
            });
        }

        function draw() {
            ctx.fillStyle = 'rgba(13, 17, 23, 0.2)';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#00f2ff';
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                p.x += p.speed;
                if (p.x > width) p.x = 0;
            });
            requestAnimationFrame(draw);
        }
        draw();
    }
    initQuantumFlow();

    const mainContainer = document.getElementById('main-container');
    const authBtn = document.getElementById('auth-btn');
    const authOverlay = document.getElementById('login-overlay');

    if (authBtn) {
        authBtn.addEventListener('click', () => {
            const statusEl = document.getElementById('auth-status');
            statusEl.textContent = 'LINKING TO HYPERCORE...';

            // GSAP Sequence
            gsap.to(authBtn, { duration: 0.5, scale: 0.9, opacity: 0 });
            gsap.to('.scanner-ring', { duration: 1, scale: 2, opacity: 0, ease: 'power4.in' });

            setTimeout(() => {
                authOverlay.classList.add('hidden-auth');
                document.body.classList.add('visible');

                // Animate entry with GSAP
                gsap.from('.card', {
                    duration: 1,
                    y: 50,
                    opacity: 0,
                    stagger: 0.1,
                    ease: 'power3.out',
                    delay: 0.5
                });

                gsap.to(camera.position, {
                    z: 12,
                    duration: 2,
                    ease: 'power2.inOut'
                });
            }, 1000);
        });
    }

    // --- TELEMETRY ---
    async function updateStats() {
        try {
            const response = await fetch('/api/stats');
            const data = response.ok ? await response.json() : {
                cpu: (Math.random() * 25 + 20).toFixed(2),
                ram: (Math.random() * 10 + 60).toFixed(1)
            };

            const safeUpdate = (id, content, isHtml = false) => {
                const el = document.getElementById(id);
                if (el) isHtml ? el.innerHTML = content : el.textContent = content;
            };

            safeUpdate('cpu-percent', `${Math.round(data.cpu)}%`);
            gsap.to('#cpu-bar', { width: `${data.cpu}%`, duration: 1 });
            safeUpdate('cpu-value', `${data.cpu}<span class="stat-unit">GHz</span>`, true);

            safeUpdate('ram-percent', `${Math.round(data.ram)}%`);
            gsap.to('#ram-bar', { width: `${data.ram}%`, duration: 1 });
            safeUpdate('ram-value', `${data.ram}<span class="stat-unit">GB</span>`, true);

            // React Three.js to stats
            if (hypercore) {
                const targetScale = 1 + (data.cpu / 100);
                gsap.to(hypercore.scale, { x: targetScale, y: targetScale, z: targetScale, duration: 2 });
            }
        } catch (e) {
            console.error('Telemetry Error:', e);
        }
    }

    setInterval(updateStats, 2000);

    // Terminal
    const typingText = document.getElementById('typing-text');
    if (typingText) {
        const commands = [
            'orb hypercore --status',
            'netstat -v matrix',
            'quantum-link --establish',
            'sysctl -w god_mode=1',
            'tail -f /dev/universe',
            'uptime --eternity'
        ];

        let cmdIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentCmd = commands[cmdIndex];
            typingText.textContent = isDeleting
                ? currentCmd.substring(0, charIndex--)
                : currentCmd.substring(0, charIndex++);

            let speed = isDeleting ? 30 : 70;
            if (!isDeleting && charIndex > currentCmd.length) {
                speed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex < 0) {
                isDeleting = false;
                cmdIndex = (cmdIndex + 1) % commands.length;
                charIndex = 0;
                speed = 500;
            }
            setTimeout(type, speed);
        }
        type();
    }

    // Uptime
    let seconds = 285000;
    setInterval(() => {
        seconds++;
        const d = Math.floor(seconds / 86400);
        const h = Math.floor((seconds % 86400) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        const pad = n => n.toString().padStart(2, '0');
        const el = document.getElementById('uptime');
        if (el) el.textContent = `UPTIME: ${pad(d)}:${pad(h)}:${pad(m)}:${pad(s)}`;
    }, 1000);

    // Millisecond counter
    const msEl = document.getElementById('ms-counter');
    function updateMs() {
        if (msEl) msEl.textContent = '.' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        requestAnimationFrame(updateMs);
    }
    updateMs();
});
