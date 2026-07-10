/**
 * ═══════════════════════════════════════════════════════════
 *  Particles — Lightweight canvas particle system
 *  Creates a constellation-style particle effect for hero
 *  sections and page backgrounds.
 * ═══════════════════════════════════════════════════════════
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
}

interface ParticleConfig {
  count?: number;
  colors?: string[];
  maxSpeed?: number;
  minSpeed?: number;
  minRadius?: number;
  maxRadius?: number;
  connectDistance?: number;
  connectOpacity?: number;
  mouseInteraction?: boolean;
  mouseRadius?: number;
}

const DEFAULT_CONFIG: Required<ParticleConfig> = {
  count: 60,
  colors: ['rgba(224, 32, 64, 0.6)', 'rgba(0, 144, 208, 0.5)', 'rgba(0, 232, 120, 0.4)', 'rgba(255, 255, 255, 0.3)'],
  maxSpeed: 0.4,
  minSpeed: 0.1,
  minRadius: 1,
  maxRadius: 3,
  connectDistance: 150,
  connectOpacity: 0.12,
  mouseInteraction: true,
  mouseRadius: 200,
};

class ParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private config: Required<ParticleConfig>;
  private animationId: number | null = null;
  private mouseX = -1000;
  private mouseY = -1000;
  private width = 0;
  private height = 0;
  private resizeObserver: ResizeObserver | null = null;
  private destroyed = false;

  constructor(container: HTMLElement, config: ParticleConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;';
    container.style.position = container.style.position || 'relative';
    container.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D not supported');
    this.ctx = ctx;

    this.resize();
    this.initParticles();
    this.bindEvents();
    this.animate();
  }

  private resize() {
    const rect = this.canvas.parentElement!.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  private initParticles() {
    this.particles = [];
    // Scale particle count based on area
    const area = this.width * this.height;
    const scaledCount = Math.min(this.config.count, Math.max(20, Math.floor(area / 15000)));

    for (let i = 0; i < scaledCount; i++) {
      this.particles.push(this.createParticle());
    }
  }

  private createParticle(): Particle {
    const { colors, maxSpeed, minSpeed, minRadius, maxRadius } = this.config;
    const angle = Math.random() * Math.PI * 2;
    const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: minRadius + Math.random() * (maxRadius - minRadius),
      opacity: 0.3 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.02,
    };
  }

  private bindEvents() {
    const parent = this.canvas.parentElement!;
    const onMouseMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      this.mouseX = -1000;
      this.mouseY = -1000;
    };

    parent.addEventListener('mousemove', onMouseMove, { passive: true });
    parent.addEventListener('mouseleave', onMouseLeave, { passive: true });

    this.resizeObserver = new ResizeObserver(() => {
      if (!this.destroyed) {
        this.resize();
        // Re-position particles that went out of bounds
        for (const p of this.particles) {
          if (p.x > this.width) p.x = this.width;
          if (p.y > this.height) p.y = this.height;
        }
      }
    });
    this.resizeObserver.observe(parent);

    // Store cleanup references
    (this as any)._cleanup = () => {
      parent.removeEventListener('mousemove', onMouseMove);
      parent.removeEventListener('mouseleave', onMouseLeave);
    };
  }

  private animate() {
    if (this.destroyed) return;
    this.animationId = requestAnimationFrame(() => this.animate());

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update & draw particles
    for (const p of this.particles) {
      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;
      if (p.y < -10) p.y = this.height + 10;
      if (p.y > this.height + 10) p.y = -10;

      // Mouse interaction — gentle repulsion
      if (this.config.mouseInteraction) {
        const dx = p.x - this.mouseX;
        const dy = p.y - this.mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.config.mouseRadius && dist > 0) {
          const force = (1 - dist / this.config.mouseRadius) * 0.02;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
        // Dampen velocity
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > this.config.maxSpeed * 1.5) {
          p.vx *= 0.98;
          p.vy *= 0.98;
        }
      }

      // Pulse opacity
      p.pulse += p.pulseSpeed;
      const pulseFactor = 0.7 + 0.3 * Math.sin(p.pulse);

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity * pulseFactor;
      this.ctx.fill();
    }

    // Draw connections
    this.ctx.globalAlpha = 1;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.config.connectDistance) {
          const opacity = (1 - dist / this.config.connectDistance) * this.config.connectOpacity;
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.strokeStyle = `rgba(224, 32, 64, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
  }

  destroy() {
    this.destroyed = true;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if ((this as any)._cleanup) (this as any)._cleanup();
    this.canvas.remove();
  }
}

// ─── Public API ──────────────────────────────────────

const activeSystems = new Map<HTMLElement, ParticleSystem>();

/**
 * Initialize particle effect on a container element.
 * Returns a cleanup function.
 */
export function initParticles(container: HTMLElement, config?: ParticleConfig): () => void {
  // Don't double-init
  if (activeSystems.has(container)) return () => {};

  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  const system = new ParticleSystem(container, config);
  activeSystems.set(container, system);

  return () => {
    system.destroy();
    activeSystems.delete(container);
  };
}

/**
 * Initialize particles on hero sections automatically.
 * Looks for `.hero`, `.c2-hero`, `.edu-hero`, `.counseling-hero`, `.career-hero`.
 */
export function initHeroParticles(): () => void {
  const heroSelectors = ['.hero', '.c2-hero', '.edu-hero', '.counseling-hero', '.career-hero'];
  const cleanups: (() => void)[] = [];

  for (const sel of heroSelectors) {
    const el = document.querySelector(sel) as HTMLElement | null;
    if (el && !activeSystems.has(el)) {
      cleanups.push(initParticles(el, {
        count: sel === '.hero' ? 80 : 50,
        connectDistance: sel === '.hero' ? 160 : 120,
      }));
    }
  }

  return () => cleanups.forEach(fn => fn());
}

/**
 * Destroy all active particle systems.
 */
export function destroyAllParticles(): void {
  for (const [, system] of activeSystems) {
    system.destroy();
  }
  activeSystems.clear();
}
