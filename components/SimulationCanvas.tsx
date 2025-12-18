import React, { useRef, useEffect, useState } from 'react';
import { LensType } from '../types';
import { CENTER_X, CENTER_Y, FOCAL_LENGTH } from '../constants';

interface SimulationCanvasProps {
  objectX: number; // The target X position
  lensType: LensType;
  isDarkMode: boolean;
  objectHeight: number;
  perfMode: boolean;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Ref to hold latest props without triggering re-renders of the effect
  const propsRef = useRef(props);
  propsRef.current = props;

  // Physics state used for interpolation
  const animState = useRef({ currentX: -150, currentH: 60 });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const drawArrowhead = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-6, -3);
    ctx.lineTo(-6, 3);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };

  const drawLens = (ctx: CanvasRenderingContext2D, lensType: LensType, isDarkMode: boolean, perfMode: boolean) => {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#3b82f6';
    ctx.fillStyle = isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)';
    
    if (!perfMode) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#3b82f640';
    }

    if (lensType === LensType.CONVEX) {
      // Standard Bi-Convex
      ctx.ellipse(CENTER_X, CENTER_Y, 12, 130, 0, 0, Math.PI * 2);
    } else {
      // Corrected Bi-Concave Lens Geometry
      const halfW = 12;
      const halfH = 130;
      const curveDepth = 8;
      
      const topY = CENTER_Y - halfH;
      const bottomY = CENTER_Y + halfH;
      const leftX = CENTER_X - halfW;
      const rightX = CENTER_X + halfW;
      const innerLeftX = CENTER_X - (halfW - curveDepth);
      const innerRightX = CENTER_X + (halfW - curveDepth);

      ctx.moveTo(leftX, topY);
      ctx.lineTo(rightX, topY);
      ctx.quadraticCurveTo(innerRightX, CENTER_Y, rightX, bottomY);
      ctx.lineTo(leftX, bottomY);
      ctx.quadraticCurveTo(innerLeftX, CENTER_Y, leftX, topY);
    }
    
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Optical Center Dot
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.fillStyle = isDarkMode ? '#cbd5e1' : '#475569';
    ctx.font = 'italic 12px Inter, sans-serif';
    ctx.fillText('O', CENTER_X + 5, CENTER_Y + 15);
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const { objectX, lensType, isDarkMode, objectHeight, perfMode } = propsRef.current;
    
    const currentColors = {
        grid: isDarkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(203, 213, 225, 0.3)',
        axis: isDarkMode ? '#475569' : '#94a3b8', 
        lens: '#3b82f6', 
        object: '#ef4444', 
        image: '#a855f7', 
        ray1: '#10b981', 
        ray2: '#f59e0b', 
        virtual: isDarkMode ? '#64748b' : '#94a3b8',
        text: isDarkMode ? '#cbd5e1' : '#475569'
    };

    const targetX = objectX;
    const diffX = targetX - animState.current.currentX;
    
    if (!perfMode && Math.abs(diffX) > 0.5) animState.current.currentX += diffX * 0.25;
    else animState.current.currentX = targetX;

    const targetH = objectHeight;
    const diffH = targetH - animState.current.currentH;
    if (!perfMode && Math.abs(diffH) > 0.5) animState.current.currentH += diffH * 0.25;
    else animState.current.currentH = targetH;

    const u = animState.current.currentX;
    const h = animState.current.currentH;
    const f = lensType === LensType.CONVEX ? FOCAL_LENGTH : -FOCAL_LENGTH;
    
    const v = (f * u) / (f + u);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const magnification = v / u;
    const imageY = -h * (v / u); 
    const isVirtual = (v < 0 && u < 0) || (v > 0 && u > 0);

    // --- DRAWING ---
    ctx.fillStyle = isDarkMode ? '#050505' : '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = currentColors.grid;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let i = 0; i < canvas.width; i+=40) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
    for (let i = 0; i < canvas.height; i+=40) { ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); }
    ctx.stroke();

    // Principal Axis
    ctx.beginPath();
    ctx.strokeStyle = currentColors.axis;
    ctx.lineWidth = 2;
    ctx.moveTo(0, CENTER_Y);
    ctx.lineTo(canvas.width, CENTER_Y);
    ctx.stroke();

    // Focal Points
    const points = [
      { x: CENTER_X - FOCAL_LENGTH, label: 'F1' },
      { x: CENTER_X - 2 * FOCAL_LENGTH, label: '2F1' },
      { x: CENTER_X + FOCAL_LENGTH, label: 'F2' },
      { x: CENTER_X + 2 * FOCAL_LENGTH, label: '2F2' }
    ];
    points.forEach(p => {
      ctx.fillStyle = currentColors.text;
      ctx.beginPath();
      ctx.arc(p.x, CENTER_Y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '600 10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, p.x, CENTER_Y + 15);
    });

    // Lens
    drawLens(ctx, lensType, isDarkMode, perfMode);

    const objTopY = CENTER_Y - h;
    const objAbsX = CENTER_X + u;

    // --- RAY 1 ---
    ctx.beginPath();
    ctx.strokeStyle = currentColors.ray1;
    ctx.lineWidth = 2;
    ctx.moveTo(objAbsX, objTopY);
    ctx.lineTo(CENTER_X, objTopY);
    
    const ray1Slope = lensType === LensType.CONVEX
        ? (CENTER_Y - objTopY) / FOCAL_LENGTH
        : (objTopY - CENTER_Y) / FOCAL_LENGTH;

    ctx.lineTo(canvas.width, objTopY + (canvas.width - CENTER_X) * ray1Slope);
    ctx.stroke();
    drawArrowhead(ctx, (objAbsX + CENTER_X)/2, objTopY, 0, currentColors.ray1);

    if (isVirtual || lensType === LensType.CONCAVE) {
        ctx.beginPath();
        ctx.strokeStyle = currentColors.virtual;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(CENTER_X, objTopY);
        ctx.lineTo(0, objTopY - CENTER_X * ray1Slope);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // --- RAY 2 (Central) ---
    const ray2Slope = (CENTER_Y - objTopY) / (CENTER_X - objAbsX); 
    
    ctx.beginPath();
    ctx.strokeStyle = currentColors.ray2;
    ctx.moveTo(objAbsX, objTopY);
    const yAtEnd = ray2Slope * (canvas.width - CENTER_X) + CENTER_Y;
    ctx.lineTo(canvas.width, yAtEnd);
    ctx.stroke();
    
    drawArrowhead(ctx, CENTER_X - 40, CENTER_Y + (-40) * ray2Slope, Math.atan(ray2Slope) + (ray2Slope > 0 ? Math.PI : 0), currentColors.ray2);

    if (isVirtual) {
        ctx.beginPath();
        ctx.strokeStyle = currentColors.virtual;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(CENTER_X, CENTER_Y);
        const yAtStart = ray2Slope * (0 - CENTER_X) + CENTER_Y;
        ctx.lineTo(0, yAtStart);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Object
    ctx.save();
    if (!perfMode) {
        ctx.shadowBlur = 12;
        ctx.shadowColor = currentColors.object + '80';
    }
    ctx.strokeStyle = currentColors.object;
    ctx.fillStyle = currentColors.object;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(objAbsX, CENTER_Y);
    ctx.lineTo(objAbsX, objTopY);
    ctx.stroke();
    drawArrowhead(ctx, objAbsX, objTopY, -Math.PI / 2, currentColors.object);
    ctx.restore();

    // Image
    if (Math.abs(v) < 4000 && Math.abs(imageY) < 4000) {
        const imgAbsX = CENTER_X + v;
        const imgTopY = CENTER_Y + imageY;
        
        ctx.save();
        if (!perfMode) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = currentColors.image + '80';
        }
        ctx.strokeStyle = currentColors.image;
        ctx.fillStyle = currentColors.image;
        ctx.lineWidth = 3;
        if (isVirtual) ctx.setLineDash([4, 4]);
        
        ctx.beginPath();
        ctx.moveTo(imgAbsX, CENTER_Y);
        ctx.lineTo(imgAbsX, imgTopY);
        ctx.stroke();
        
        const angle = imageY < 0 ? -Math.PI/2 : Math.PI/2;
        drawArrowhead(ctx, imgAbsX, imgTopY, angle, currentColors.image);
        ctx.restore();

        ctx.fillStyle = currentColors.image;
        ctx.font = 'bold 12px Sora, sans-serif';
        ctx.fillText("Image", imgAbsX, imgTopY + (imageY < 0 ? -15 : 25));
    }

    ctx.fillStyle = currentColors.object;
    ctx.font = 'bold 12px Sora, sans-serif';
    ctx.fillText("Object", objAbsX, objTopY - 15);

    requestRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(render);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        if (width > 0) {
             canvas.width = width * dpr;
             canvas.height = height * dpr;
             const ctx = canvas.getContext('2d');
             ctx?.scale(dpr, dpr);
        }
      }
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-[350px] md:h-[450px] rounded-3xl overflow-hidden shadow-inner bg-slate-50/50 dark:bg-slate-900/50 relative group touch-manipulation">
        <canvas ref={canvasRef} className="block w-full h-full touch-none" />
        
        <div className="absolute bottom-4 right-4 text-[10px] opacity-40 font-mono pointer-events-none select-none text-slate-500 dark:text-slate-400">
            {props.perfMode ? 'RAY_TRACER_V3 (LITE)' : 'RAY_TRACER_V3 (HQ)'}
        </div>

        {/* Fullscreen Button */}
        <button 
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 dark:hover:bg-black/40 text-slate-700 dark:text-slate-200"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.25 4A.75.75 0 014 3.25h4a.75.75 0 010 1.5H4.75v3.25a.75.75 0 01-1.5 0V4zM12 3.25a.75.75 0 01.75.75v3.25a.75.75 0 01-1.5 0V4h-3.25a.75.75 0 010-1.5h4zM16.75 16a.75.75 0 01-.75.75h-4a.75.75 0 010-1.5h3.25v-3.25a.75.75 0 011.5 0v4zM8 16.75a.75.75 0 01-.75-.75v-3.25a.75.75 0 011.5 0v3.25h3.25a.75.75 0 010 1.5h-4z" />
            </svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
               <path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 014.25 2h2.5A.75.75 0 017.5 2.75V4h2.75a.75.75 0 010 1.5H7.5v2.75a.75.75 0 01-1.5 0V5.5h-1.75a.75.75 0 00-.75.75v10c0 .414.336.75.75.75h10a.75.75 0 00.75-.75V12.5a.75.75 0 011.5 0v3.75A2.25 2.25 0 0114.25 18.5h-10A2.25 2.25 0 012 16.25v-12zM12.5 2.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V4.56l-3.22 3.22a.75.75 0 11-1.06-1.06l3.22-3.22h-2.69a.75.75 0 01-.75-.75z" clipRule="evenodd" />
             </svg>
          )}
        </button>
    </div>
  );
};

export default SimulationCanvas;