// Three.js сцена для 3D визуализации
class ThreeScene {
    constructor(canvas, type = 'canopy') {
        this.canvas = canvas;
        this.type = type;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.canopyGroup = null;
        this.fenceGroup = null;
        this.animationId = null;
        this.currentView = '3d';
    }

    init() {
        try {
            // Scene setup
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0xf5f7fa);
            this.scene.fog = new THREE.Fog(0xf5f7fa, 100, 1000);

            // Camera
            const width = this.canvas.clientWidth;
            const height = this.canvas.clientHeight;
            this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            this.camera.position.set(15, 10, 15);
            this.camera.lookAt(0, 0, 0);

            // Renderer
            this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
            this.renderer.setSize(width, height);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;

            // Lighting
            this.setupLighting();

            // Ground
            this.createGround();

            // Controls
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.autoRotate = false;
            this.controls.minDistance = 10;
            this.controls.maxDistance = 80;

            // Groups
            this.canopyGroup = new THREE.Group();
            this.fenceGroup = new THREE.Group();
            this.scene.add(this.canopyGroup);
            this.scene.add(this.fenceGroup);

            // Initial builds
            if (this.type === 'canopy') {
                this.updateCanopy(getCanopyState());
            } else {
                this.updateFence(getFenceState());
            }

            // Handle resize
            window.addEventListener('resize', () => this.onWindowResize());

        } catch (e) {
            console.error('WebGL Error:', e);
            document.getElementById('webgl-error')?.classList.remove('hidden');
        }
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(20, 30, 20);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        directionalLight.shadow.camera.far = 100;
        this.scene.add(directionalLight);

        // Point light for accent
        const pointLight = new THREE.PointLight(0xffffff, 0.3);
        pointLight.position.set(-20, 20, -20);
        this.scene.add(pointLight);
    }

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xd4d4d4 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.position.y = -2;
        this.scene.add(ground);
    }

    updateCanopy(state) {
        // Clear existing
        while (this.canopyGroup.children.length > 0) {
            const child = this.canopyGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            this.canopyGroup.remove(child);
        }

        const { length, width, height, type, config, color } = state;

        // Metals color
        const metalColor = new THREE.Color(color);
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: metalColor,
            metalness: 0.8,
            roughness: 0.2
        });

        // Posts
        const postStep = 2.5;
        const postsPerSide = Math.ceil(length / postStep) + 1;

        for (let i = 0; i < postsPerSide; i++) {
            const x = -width / 2;
            const z = -length / 2 + (i * postStep);

            // Left post
            const post1 = this.createPost(0.08, 0.08, height, metalMaterial);
            post1.position.set(x, height / 2, z);
            post1.castShadow = true;
            this.canopyGroup.add(post1);

            // Right post
            const post2 = this.createPost(0.08, 0.08, height, metalMaterial);
            post2.position.set(-x, height / 2, z);
            post2.castShadow = true;
            this.canopyGroup.add(post2);
        }

        // Roof (simplified)
        const roofMaterial = new THREE.MeshStandardMaterial({
            color: 0xc0c0c0,
            metalness: 0.7,
            roughness: 0.3
        });

        if (type === 'arch') {
            this.createArchivedRoof(length, width, height, roofMaterial);
        } else if (type === 'gable') {
            this.createGableRoof(length, width, height, roofMaterial);
        } else if (type === 'single') {
            this.createSingleRoof(length, width, height, roofMaterial);
        } else if (type === 'semi') {
            this.createSemiRoof(length, width, height, roofMaterial);
        }

        // Trusses
        const trussStep = { standard: 1.5, reinforced: 1.25, max: 1.0 }[config] || 1.5;
        const trusses = Math.ceil(length / trussStep) + 1;

        const trussMaterial = new THREE.MeshStandardMaterial({
            color: 0x404040,
            metalness: 0.6,
            roughness: 0.4
        });

        for (let i = 0; i < trusses; i++) {
            const z = -length / 2 + (i * trussStep);

            // Truss beams (horizontal)
            const beam1 = this.createBox(width * 0.9, 0.08, 0.04, trussMaterial);
            beam1.position.set(0, height - 0.3, z);
            beam1.castShadow = true;
            this.canopyGroup.add(beam1);

            const beam2 = this.createBox(width * 0.9, 0.04, 0.08, trussMaterial);
            beam2.position.set(0, height - 0.5, z);
            beam2.castShadow = true;
            this.canopyGroup.add(beam2);
        }
    }

    createArchivedRoof(length, width, height, material) {
        const segments = 40;
        const radius = width / 2;
        const curve = [];

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI;
            const x = Math.sin(angle) * radius;
            const y = Math.cos(angle) * radius * 0.6;
            curve.push(new THREE.Vector3(x, y, 0));
        }

        // Create roof panels
        const panelCount = Math.ceil(length / 1.5);
        for (let i = 0; i < panelCount; i++) {
            const z1 = -length / 2 + (i * 1.5);
            const z2 = z1 + 1.5;

            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            const indices = [];

            for (let j = 0; j < curve.length; j++) {
                const p1 = curve[j];
                vertices.push(p1.x, p1.y, z1);
            }

            for (let j = 0; j < curve.length; j++) {
                const p2 = curve[j];
                vertices.push(p2.x, p2.y, z2);
            }

            for (let j = 0; j < curve.length - 1; j++) {
                indices.push(j, j + 1, j + curve.length);
                indices.push(j + 1, j + curve.length + 1, j + curve.length);
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
            geometry.computeVertexNormals();

            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.canopyGroup.add(mesh);
        }
    }

    createGableRoof(length, width, height, material) {
        const panelCount = Math.ceil(length / 1.5);
        for (let i = 0; i < panelCount; i++) {
            const z1 = -length / 2 + (i * 1.5);
            const z2 = z1 + 1.5;

            // Left slope
            const geom1 = new THREE.BufferGeometry();
            const verts1 = [
                -width / 2, height - 0.3, z1,
                0, height + 0.3, z1,
                -width / 2, height - 0.3, z2,
                0, height + 0.3, z2
            ];
            geom1.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts1), 3));
            geom1.setIndex([0, 1, 2, 1, 3, 2]);
            geom1.computeVertexNormals();

            const mesh1 = new THREE.Mesh(geom1, material);
            mesh1.castShadow = true;
            mesh1.receiveShadow = true;
            this.canopyGroup.add(mesh1);

            // Right slope
            const geom2 = new THREE.BufferGeometry();
            const verts2 = [
                0, height + 0.3, z1,
                width / 2, height - 0.3, z1,
                0, height + 0.3, z2,
                width / 2, height - 0.3, z2
            ];
            geom2.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts2), 3));
            geom2.setIndex([0, 1, 2, 1, 3, 2]);
            geom2.computeVertexNormals();

            const mesh2 = new THREE.Mesh(geom2, material);
            mesh2.castShadow = true;
            mesh2.receiveShadow = true;
            this.canopyGroup.add(mesh2);
        }
    }

    createSingleRoof(length, width, height, material) {
        const panelCount = Math.ceil(length / 1.5);
        for (let i = 0; i < panelCount; i++) {
            const z1 = -length / 2 + (i * 1.5);
            const z2 = z1 + 1.5;

            const geom = new THREE.BufferGeometry();
            const verts = [
                -width / 2, height - 0.3, z1,
                width / 2, height - 0.2, z1,
                -width / 2, height - 0.3, z2,
                width / 2, height - 0.2, z2
            ];
            geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
            geom.setIndex([0, 1, 2, 1, 3, 2]);
            geom.computeVertexNormals();

            const mesh = new THREE.Mesh(geom, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.canopyGroup.add(mesh);
        }
    }

    createSemiRoof(length, width, height, material) {
        const segments = 20;
        const radius = width / 4;
        const panelCount = Math.ceil(length / 1.5);

        for (let i = 0; i < panelCount; i++) {
            const z1 = -length / 2 + (i * 1.5);
            const z2 = z1 + 1.5;

            const curve = [];
            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * Math.PI;
                const x = Math.sin(angle) * radius - width / 4;
                const y = Math.cos(angle) * radius * 0.5 + height - 0.1;
                curve.push(new THREE.Vector3(x, y, 0));
            }

            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            const indices = [];

            for (let j = 0; j < curve.length; j++) {
                const p = curve[j];
                vertices.push(p.x, p.y, z1);
            }

            for (let j = 0; j < curve.length; j++) {
                const p = curve[j];
                vertices.push(p.x, p.y, z2);
            }

            for (let j = 0; j < curve.length - 1; j++) {
                indices.push(j, j + 1, j + curve.length);
                indices.push(j + 1, j + curve.length + 1, j + curve.length);
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
            geometry.computeVertexNormals();

            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.canopyGroup.add(mesh);
        }
    }

    updateFence(state) {
        // Clear existing
        while (this.fenceGroup.children.length > 0) {
            const child = this.fenceGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            this.fenceGroup.remove(child);
        }

        const { length, height, color } = state;

        const metalColor = new THREE.Color(color);
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: metalColor,
            metalness: 0.8,
            roughness: 0.2
        });

        // Posts
        const postStep = 2.5;
        const postsCount = Math.ceil(length / postStep) + 1;

        for (let i = 0; i < postsCount; i++) {
            const x = -length / 2 + (i * postStep);
            const post = this.createPost(0.08, 0.08, height, metalMaterial);
            post.position.set(x, height / 2, 0);
            post.castShadow = true;
            this.fenceGroup.add(post);
        }

        // Horizontal rails
        const railMaterial = new THREE.MeshStandardMaterial({
            color: 0x404040,
            metalness: 0.6,
            roughness: 0.4
        });

        // Top rail
        const topRail = this.createBox(length * 0.95, 0.04, 0.08, railMaterial);
        topRail.position.set(0, height - 0.15, 0);
        topRail.castShadow = true;
        this.fenceGroup.add(topRail);

        // Middle rail
        const middleRail = this.createBox(length * 0.95, 0.04, 0.08, railMaterial);
        middleRail.position.set(0, height / 2, 0);
        middleRail.castShadow = true;
        this.fenceGroup.add(middleRail);

        // Filling (corrugated sheets)
        const fillingMaterial = new THREE.MeshStandardMaterial({
            color: metalColor,
            metalness: 0.7,
            roughness: 0.3
        });

        const fillCount = Math.ceil(length / 2.5);
        for (let i = 0; i < fillCount; i++) {
            const x = -length / 2 + (i * 2.5);
            const filling = this.createBox(2.4, height - 0.3, 0.02, fillingMaterial);
            filling.position.set(x, height / 2, 0.05);
            filling.castShadow = true;
            filling.receiveShadow = true;
            this.fenceGroup.add(filling);
        }
    }

    createPost(width, depth, height, material) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        return mesh;
    }

    createBox(width, height, depth, material) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        return mesh;
    }

    resetView(viewType) {
        this.currentView = viewType;
        const duration = 800;
        const startPos = this.camera.position.clone();
        const startTime = Date.now();

        let targetPos;
        switch (viewType) {
            case 'top':
                targetPos = new THREE.Vector3(0, 25, 0.1);
                break;
            case 'front':
                targetPos = new THREE.Vector3(0, 5, 20);
                break;
            case 'side':
                targetPos = new THREE.Vector3(20, 5, 0);
                break;
            case 'iso':
                targetPos = new THREE.Vector3(15, 12, 15);
                break;
            default:
                targetPos = new THREE.Vector3(15, 10, 15);
        }

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            this.camera.position.lerpVectors(startPos, targetPos, progress);
            this.camera.lookAt(0, 3, 0);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        if (this.controls) {
            this.controls.update();
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
