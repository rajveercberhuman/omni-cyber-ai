import React, { useEffect, useRef } from 'react';

interface CyberCoreVisualizerProps {
  state: 'idle' | 'listening' | 'scanning' | 'thinking' | 'speaking';
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const CyberCoreVisualizer: React.FC<CyberCoreVisualizerProps> = ({
  state,
  size = 140,
  className = '',
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;
    let pulse = 0;

    // Define 3D icosahedron vertices
    const phi = (1 + Math.sqrt(5)) / 2;
    const rawVertices = [
      [-1, phi, 0],
      [1, phi, 0],
      [-1, -phi, 0],
      [1, -phi, 0],
      [0, -1, phi],
      [0, 1, phi],
      [0, -1, -phi],
      [0, 1, -phi],
      [phi, 0, -1],
      [phi, 0, 1],
      [-phi, 0, -1],
      [-phi, 0, 1],
    ];

    // Normalize
    const vertices = rawVertices.map(([x, y, z]) => {
      const len = Math.sqrt(x * x + y * y + z * z);
      return [x / len, y / len, z / len];
    });

    // Edges connecting vertices with distance < 1.1
    const edges: [number, number][] = [];
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        const dx = vertices[i][0] - vertices[j][0];
        const dy = vertices[i][1] - vertices[j][1];
        const dz = vertices[i][2] - vertices[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 1.1) {
          edges.push([i, j]);
        }
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;

      // Speed and styling based on companion state
      let speed = 0.015;
      let primaryColor = '#06b6d4'; // Cyan
      let secondaryColor = '#3b82f6'; // Blue
      let glowColor = 'rgba(6, 182, 212, 0.5)';

      if (state === 'scanning') {
        speed = 0.04;
        primaryColor = '#10b981'; // Emerald
        secondaryColor = '#06b6d4';
        glowColor = 'rgba(16, 185, 129, 0.7)';
      } else if (state === 'thinking') {
        speed = 0.06;
        primaryColor = '#ec4899'; // Magenta
        secondaryColor = '#a855f7'; // Purple
        glowColor = 'rgba(236, 72, 153, 0.8)';
      } else if (state === 'speaking') {
        speed = 0.03;
        primaryColor = '#38bdf8'; // Sky
        secondaryColor = '#ec4899';
        glowColor = 'rgba(56, 189, 248, 0.8)';
      } else if (state === 'listening') {
        speed = 0.02;
        primaryColor = '#00f0ff';
        secondaryColor = '#00ff9d';
        glowColor = 'rgba(0, 240, 255, 0.7)';
      }

      rotation += speed;
      pulse += 0.04;

      const dynamicRadius = (size * 0.32) + Math.sin(pulse) * (state === 'speaking' ? 6 : 2);

      // 1. Draw outer geometric target rings
      ctx.save();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;

      // Outer dashed circle
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.44, 0, Math.PI * 2);
      ctx.stroke();

      // Outer rotating segmented brackets
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-rotation * 0.5);
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = primaryColor;

      for (let b = 0; b < 4; b++) {
        ctx.beginPath();
        const startA = (b * Math.PI) / 2 + 0.15;
        const endA = startA + Math.PI / 4;
        ctx.arc(0, 0, size * 0.44, startA, endA);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Draw core glow
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, dynamicRadius * 1.3);
      grad.addColorStop(0, primaryColor);
      grad.addColorStop(0.3, glowColor);
      grad.addColorStop(1, 'transparent');
      ctx.globalAlpha = state === 'thinking' ? 0.4 : 0.25;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, dynamicRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // 3. Project 3D vertices
      const cosY = Math.cos(rotation);
      const sinY = Math.sin(rotation);
      const cosX = Math.cos(rotation * 0.7);
      const sinX = Math.sin(rotation * 0.7);

      const projected: { x: number; y: number; z: number }[] = [];

      for (const [vx, vy, vz] of vertices) {
        // Rotate around Y
        const x1 = vx * cosY - vz * sinY;
        const z1 = vx * sinY + vz * cosY;

        // Rotate around X
        const y2 = vy * cosX - z1 * sinX;
        const z2 = vy * sinX + z1 * cosX;

        // Perspective projection
        const cameraDist = 2.8;
        const scale = cameraDist / (cameraDist + z2);
        projected.push({
          x: cx + x1 * dynamicRadius * scale,
          y: cy + y2 * dynamicRadius * scale,
          z: z2,
        });
      }

      // Draw wireframe edges
      ctx.lineWidth = 1.2;
      for (const [i, j] of edges) {
        const p1 = projected[i];
        const p2 = projected[j];
        const avgZ = (p1.z + p2.z) / 2;
        const alpha = Math.max(0.15, Math.min(0.9, (avgZ + 1) / 2));

        ctx.strokeStyle = avgZ > 0 ? primaryColor : secondaryColor;
        ctx.globalAlpha = alpha;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Draw glowing vertices
      for (const p of projected) {
        const alpha = Math.max(0.2, (p.z + 1) / 2);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = primaryColor;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = state === 'thinking' || state === 'speaking' ? 8 : 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.z > 0 ? 2.5 : 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 4. Central energy singularity
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5 + Math.sin(pulse * 2), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, size]);

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none group ${className}`}
      title={`AI Neural Core [State: ${state.toUpperCase()}]`}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
};
