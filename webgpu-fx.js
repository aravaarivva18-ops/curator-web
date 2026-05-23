/**
 * Dynamic Canvas Fluid Gradient Mesh (Vision 2026)
 * High-performance, GPU-accelerated interactive backdrop
 */
class WebGPUVisuals {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isMobile = window.matchMedia("(max-width: 768px)").matches;
        
        this.visual = document.querySelector('.hero-visual');
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.targetMouseX = this.mouseX;
        this.targetMouseY = this.mouseY;

        this.initCanvas();
        this.initBlobs();
        this.bindEvents();
        this.animate();
    }

    initCanvas() {
        this.canvas.className = 'fluid-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: -1;
            pointer-events: none;
            background: #FAFAFA;
        `;
        document.body.appendChild(this.canvas);
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initBlobs() {
        // Create 3 large soft color blobs with different offsets and sizes
        this.blobs = [
            {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.min(this.canvas.width, this.canvas.height) * 0.5,
                baseRadius: Math.min(this.canvas.width, this.canvas.height) * 0.5,
                color: 'rgba(12, 70, 214, 0.06)', // accent cobalt
                speedX: 0.002,
                speedY: 0.0015,
                phaseX: Math.random() * 100,
                phaseY: Math.random() * 100
            },
            {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.min(this.canvas.width, this.canvas.height) * 0.6,
                baseRadius: Math.min(this.canvas.width, this.canvas.height) * 0.6,
                color: 'rgba(142, 68, 173, 0.04)', // soft lavender
                speedX: 0.001,
                speedY: 0.0025,
                phaseX: Math.random() * 100,
                phaseY: Math.random() * 100
            },
            {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.min(this.canvas.width, this.canvas.height) * 0.45,
                baseRadius: Math.min(this.canvas.width, this.canvas.height) * 0.45,
                color: 'rgba(44, 62, 80, 0.05)', // slate grey
                speedX: 0.0015,
                speedY: 0.001,
                phaseX: Math.random() * 100,
                phaseY: Math.random() * 100
            }
        ];
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        if (!this.isMobile) {
            // Track mouse on desktop
            window.addEventListener('mousemove', (e) => {
                this.targetMouseX = e.clientX;
                this.targetMouseY = e.clientY;

                // Hero visual parallax rotation
                if (this.visual) {
                    const rotX = (window.innerWidth / 2 - e.clientX) / 45;
                    const rotY = (window.innerHeight / 2 - e.clientY) / 45;
                    this.visual.style.transform = `perspective(1000px) rotateY(${rotX}deg) rotateX(${-rotY}deg)`;
                }
            });
        }
    }

    animate(time) {
        requestAnimationFrame((t) => this.animate(t));
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#FAFAFA';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Smooth mouse position tracking
        if (!this.isMobile) {
            this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
            this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;
        }

        const now = time || 0;

        this.blobs.forEach((blob, idx) => {
            // Self-floating movement using sin/cos
            blob.phaseX += blob.speedX;
            blob.phaseY += blob.speedY;

            let driftX = Math.sin(blob.phaseX) * (this.canvas.width * 0.12);
            let driftY = Math.cos(blob.phaseY) * (this.canvas.height * 0.12);

            let centerX = (this.canvas.width / 2) + driftX;
            let centerY = (this.canvas.height / 2) + driftY;

            // Mouse interaction on desktop
            if (!this.isMobile) {
                // Blob follows mouse with custom offsets based on index
                const influence = 0.15 - (idx * 0.04);
                centerX += (this.mouseX - this.canvas.width / 2) * influence;
                centerY += (this.mouseY - this.canvas.height / 2) * influence;
            }

            // Draw radial gradient blob
            const grad = this.ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, blob.radius
            );
            grad.addColorStop(0, blob.color);
            grad.addColorStop(1, 'rgba(250, 250, 250, 0)');

            this.ctx.beginPath();
            this.ctx.fillStyle = grad;
            this.ctx.arc(centerX, centerY, blob.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WebGPUVisuals();
});
