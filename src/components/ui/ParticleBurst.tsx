"use client";

import { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface ParticleBurstProps {
  active: boolean;
  x?: number;
  y?: number;
  color?: string;
  count?: number;
  onComplete?: () => void;
}

export default function ParticleBurst({
  active,
  x = 50,
  y = 50,
  color = "#facc15",
  count = 24,
  onComplete,
}: ParticleBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  const burst = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const cx = (x / 100) * canvas.offsetWidth;
    const cy = (y / 100) * canvas.offsetHeight;

    particlesRef.current = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3;
      const life = 30 + Math.random() * 30;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size: 1.5 + Math.random() * 2.5,
        color,
      };
    });

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      let alive = false;

      for (const p of particlesRef.current) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.vx *= 0.98;
        p.life--;

        const alpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      }

      frame++;
      if (alive && frame < 120) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animate();
  }, [x, y, color, count, onComplete]);

  useEffect(() => {
    if (active) burst();
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, burst]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="particle-burst-canvas"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
