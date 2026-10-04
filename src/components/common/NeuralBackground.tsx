import React, { useEffect, useRef } from 'react';

interface NeuralBackgroundProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'high';
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  pulsePhase: number;
  pulseSpeed: number;
}

interface Pulse {
  fromIndex: number;
  toIndex: number;
  progress: number;
  speed: number;
}

export const NeuralBackground: React.FC<NeuralBackgroundProps> = ({ 
  className = '',
  intensity = 'medium' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 500;
    };

    window.addEventListener('resize', handleResize);

    const nodeCount = Math.floor((width * height) / (intensity === 'subtle' ? 14000 : 9000));
    const nodes: Node[] = [];

    for (let i = 0; i < Math.max(30, nodeCount); i++) {
      const radius = 2 + Math.random() * 2.5;
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius,
        baseRadius: radius,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03
      });
    }

    const pulses: Pulse[] = [];
    const maxConnectionDistance = 160;

    const spawnPulse = () => {
      if (nodes.length < 2) return;
      const fromIndex = Math.floor(Math.random() * nodes.length);
      const nearbyIndices: number[] = [];
      nodes.forEach((n, idx) => {
        if (idx === fromIndex) return;
        const dx = n.x - nodes[fromIndex].x;
        const dy = n.y - nodes[fromIndex].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxConnectionDistance) {
          nearbyIndices.push(idx);
        }
      });

      if (nearbyIndices.length > 0) {
        const toIndex = nearbyIndices[Math.floor(Math.random() * nearbyIndices.length)];
        pulses.push({
          fromIndex,
          toIndex,
          progress: 0,
          speed: 0.015 + Math.random() * 0.02
        });
      }
    };

    const pulseInterval = setInterval(spawnPulse, 300);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Update positions & pulse scale
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        node.pulsePhase += node.pulseSpeed;
        node.radius = node.baseRadius + Math.sin(node.pulsePhase) * 0.8;
      }

      // 2. Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectionDistance) {
            const alpha = (1 - dist / maxConnectionDistance) * 0.35;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // 3. Render moving signal pulses along lines
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.progress += p.speed;

        if (p.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }

        const fromNode = nodes[p.fromIndex];
        const toNode = nodes[p.toIndex];
        if (!fromNode || !toNode) {
          pulses.splice(i, 1);
          continue;
        }

        const px = fromNode.x + (toNode.x - fromNode.x) * p.progress;
        const py = fromNode.y + (toNode.y - fromNode.y) * p.progress;

        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(125, 211, 252, 0.95)';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 4. Draw nodes & glowing halos
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(pulseInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  const opacity = intensity === 'subtle' ? 'opacity-40' : 'opacity-70';

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${opacity} ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default NeuralBackground;
