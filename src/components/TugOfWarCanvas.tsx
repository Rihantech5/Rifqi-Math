import React, { useEffect, useRef } from 'react';
import { Team } from '../types/game';

interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

interface TugOfWarCanvasProps {
  currentDistance: number; // in meters, negative = Red pulling, positive = Blue pulling
  targetDistance: number; // e.g., 3.0 meters for victory
  pullingTeam: Team | null; // active team currently pulling
  pullIntensity: number; // 0 to 1
  shakeIntensity: number; // 0 to 1 for screen shake
  timeRemaining: number; // current seconds remaining (floating point or integer)
  totalTime: number; // max duration in seconds
  isRoundActive: boolean;
  gameStatus: 'ready' | 'playing' | 'round_end' | 'game_over';
  winner: Team | 'draw' | null;
}

export const TugOfWarCanvas: React.FC<TugOfWarCanvasProps> = ({
  currentDistance,
  targetDistance,
  pullingTeam,
  pullIntensity,
  shakeIntensity,
  timeRemaining,
  totalTime,
  isRoundActive,
  gameStatus,
  winner,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Animation state stored in refs to avoid React re-render overhead
  const animStateRef = useRef({
    currentOffsetPixels: 0,
    targetOffsetPixels: 0,
    shake: 0,
    particles: [] as DustParticle[],
    time: 0,
  });

  // Keep latest props in ref for animation frame
  const propsRef = useRef({
    currentDistance,
    targetDistance,
    pullingTeam,
    pullIntensity,
    shakeIntensity,
    timeRemaining,
    totalTime,
    isRoundActive,
    gameStatus,
    winner,
  });

  useEffect(() => {
    propsRef.current = {
      currentDistance,
      targetDistance,
      pullingTeam,
      pullIntensity,
      shakeIntensity,
      timeRemaining,
      totalTime,
      isRoundActive,
      gameStatus,
      winner,
    };
  }, [
    currentDistance,
    targetDistance,
    pullingTeam,
    pullIntensity,
    shakeIntensity,
    timeRemaining,
    totalTime,
    isRoundActive,
    gameStatus,
    winner,
  ]);

  // Trigger dust particles & shake when a pull occurs
  useEffect(() => {
    if (pullingTeam && pullIntensity > 0) {
      animStateRef.current.shake = Math.min(1.0, (animStateRef.current.shake || 0) + shakeIntensity);

      // Spawn dust particles near the pulling team's feet
      const pCount = 18;
      const isRed = pullingTeam === 'red';
      for (let i = 0; i < pCount; i++) {
        animStateRef.current.particles.push({
          x: isRed ? -160 + (Math.random() * 80 - 40) : 160 + (Math.random() * 80 - 40),
          y: 65 + Math.random() * 15,
          vx: (isRed ? -1 : 1) * (Math.random() * 2.5 + 1),
          vy: -(Math.random() * 2.2 + 0.8),
          size: Math.random() * 5 + 3,
          alpha: 0.85,
          color: isRed ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)',
        });
      }
    }
  }, [pullingTeam, pullIntensity, shakeIntensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;

    const render = () => {
      const {
        currentDistance,
        targetDistance,
        pullingTeam,
        pullIntensity,
        timeRemaining,
        totalTime,
        isRoundActive,
        gameStatus,
        winner,
      } = propsRef.current;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const container = containerRef.current;
      const dpr = window.devicePixelRatio || 1;
      const width = container ? container.clientWidth : 960;
      const height = 360;

      // Ensure canvas internal resolution matches display size * DPR
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      animStateRef.current.time += 0.04;
      const animTime = animStateRef.current.time;

      // Smooth pixel displacement: map distance to pixels
      // Max visual displacement is about 180px when distance == targetDistance
      const pixelsPerMeter = 180 / (targetDistance || 3.0);
      animStateRef.current.targetOffsetPixels = currentDistance * pixelsPerMeter;
      // Spring smoothing
      animStateRef.current.currentOffsetPixels +=
        (animStateRef.current.targetOffsetPixels - animStateRef.current.currentOffsetPixels) * 0.12;
      const offsetPx = animStateRef.current.currentOffsetPixels;

      // Handle screen shake decay
      if (animStateRef.current.shake > 0.01) {
        animStateRef.current.shake *= 0.88;
      } else {
        animStateRef.current.shake = 0;
      }
      const shakeAmt = animStateRef.current.shake * 12;
      const shakeX = (Math.random() - 0.5) * shakeAmt;
      const shakeY = (Math.random() - 0.5) * shakeAmt;

      // Clear full background
      ctx.clearRect(0, 0, width, height);

      // --- 1. ARENA BACKGROUND & GEOMETRIC COURT ---
      // Court base gradient
      const courtGrad = ctx.createLinearGradient(0, 0, 0, height);
      courtGrad.addColorStop(0, '#f8fafc');
      courtGrad.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = courtGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle geometric grid lines
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Outer court boundary border
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, width - 20, height - 20);

      // Center reference coordinates (middle of court)
      const cx = width / 2;
      const groundY = height * 0.68;

      // Apply screen shake to game elements
      ctx.save();
      ctx.translate(shakeX, shakeY);

      // --- 2. GROUND & METRIC LINES ---
      // Ground plane
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, height);
      groundGrad.addColorStop(0, '#e2e8f0');
      groundGrad.addColorStop(0.3, '#cbd5e1');
      groundGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY, width, height - groundY);

      // Ground surface line
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // Team Zones on the ground
      // Left Zone (Tim Merah)
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.fillRect(0, groundY, cx - 180, height - groundY);

      // Right Zone (Tim Biru)
      ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
      ctx.fillRect(cx + 180, groundY, width - (cx + 180), height - groundY);

      // Center Court Circle
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, groundY + 20, 48, 0, Math.PI * 2);
      ctx.stroke();

      // Meter markers on court surface: -3m, -2m, -1m, 0, +1m, +2m, +3m
      const maxMeters = Math.ceil(targetDistance || 3);
      for (let m = -maxMeters; m <= maxMeters; m++) {
        const mx = cx + m * pixelsPerMeter;
        if (mx < 25 || mx > width - 25) continue;

        const isCenter = m === 0;
        const isGoal = Math.abs(m) === targetDistance;

        ctx.beginPath();
        ctx.moveTo(mx, groundY - 6);
        ctx.lineTo(mx, groundY + (isCenter ? 32 : isGoal ? 26 : 14));
        ctx.strokeStyle = isCenter ? '#475569' : isGoal ? (m < 0 ? '#ef4444' : '#3b82f6') : '#94a3b8';
        ctx.lineWidth = isCenter || isGoal ? 3 : 1.5;
        ctx.stroke();

        // Meter labels
        ctx.font = isCenter || isGoal ? 'bold 11px sans-serif' : '10px sans-serif';
        ctx.fillStyle = isCenter ? '#1e293b' : isGoal ? (m < 0 ? '#dc2626' : '#2563eb') : '#64748b';
        ctx.textAlign = 'center';
        let label = `${Math.abs(m)}m`;
        if (isCenter) label = '0 (Tengah)';
        else if (isGoal) label = m < 0 ? '🏁 MENANG MERAH' : 'MENANG BIRU 🏁';
        ctx.fillText(label, mx, groundY + (isGoal ? 40 : 25));
      }

      // --- 3. DUST PARTICLES ---
      const particles = animStateRef.current.particles;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.025;
        p.size *= 0.97;

        if (p.alpha <= 0 || p.size <= 0.5) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = p.color.replace('0.4', p.alpha.toFixed(2));
        ctx.beginPath();
        ctx.arc(cx + p.x, groundY + p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // --- 4. CHARACTERS & TEAMS ---
      const ropeY = groundY - 45;

      // Draw Tim Merah (Left side, pulling left)
      // 3 characters at relative positions
      const redPositions = [-130, -195, -260];
      const redStrain = pullingTeam === 'red' ? 0.35 + pullIntensity * 0.15 : 0.18;
      const redBob = Math.sin(animTime * 4) * 2;

      redPositions.forEach((pos, idx) => {
        const charX = cx + pos + offsetPx * 0.75;
        const charY = groundY;
        const isPulling = pullingTeam === 'red';

        drawStylizedPuller(ctx, {
          x: charX,
          y: charY,
          color: '#ef4444',
          accentColor: '#991b1b',
          facing: 'left',
          leanAngle: isPulling ? -redStrain - idx * 0.03 : -0.12,
          bob: redBob,
          ropeY: ropeY,
          handX: charX + 18,
          number: idx + 1,
          isWinner: winner === 'red',
        });
      });

      // Draw Tim Biru (Right side, pulling right)
      // 3 characters at relative positions
      const bluePositions = [130, 195, 260];
      const blueStrain = pullingTeam === 'blue' ? 0.35 + pullIntensity * 0.15 : 0.18;
      const blueBob = Math.cos(animTime * 4) * 2;

      bluePositions.forEach((pos, idx) => {
        const charX = cx + pos + offsetPx * 0.75;
        const charY = groundY;
        const isPulling = pullingTeam === 'blue';

        drawStylizedPuller(ctx, {
          x: charX,
          y: charY,
          color: '#3b82f6',
          accentColor: '#1e40af',
          facing: 'right',
          leanAngle: isPulling ? blueStrain + idx * 0.03 : 0.12,
          bob: blueBob,
          ropeY: ropeY,
          handX: charX - 18,
          number: idx + 1,
          isWinner: winner === 'blue',
        });
      });

      // --- 5. TEXTURED TUG ROPE ---
      // Rope spans across the full play area through the characters' hands
      const ropeStartX = Math.max(30, cx - 340 + offsetPx * 0.75);
      const ropeEndX = Math.min(width - 30, cx + 340 + offsetPx * 0.75);
      const ropeCenterX = cx + offsetPx;

      // Rope sag: slightly sags when relaxed, straight when tensioned
      const isTensioned = pullingTeam !== null || Math.abs(offsetPx) > 5;
      const sagAmount = isTensioned ? Math.sin(animTime * 25) * 1.5 : 8 + Math.sin(animTime * 2) * 1.5;

      // Draw rope shadow on ground
      ctx.save();
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.25)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(ropeStartX, groundY + 12);
      ctx.quadraticCurveTo(ropeCenterX, groundY + 12 + sagAmount * 0.6, ropeEndX, groundY + 12);
      ctx.stroke();
      ctx.restore();

      // Main rope thick strand (braided texture effect)
      ctx.save();
      ctx.lineCap = 'round';

      // Base rope dark brown/tan
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(ropeStartX, ropeY);
      ctx.quadraticCurveTo(ropeCenterX, ropeY + sagAmount, ropeEndX, ropeY);
      ctx.stroke();

      // Inner lighter tan fibers
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(ropeStartX, ropeY);
      ctx.quadraticCurveTo(ropeCenterX, ropeY + sagAmount, ropeEndX, ropeY);
      ctx.stroke();

      // Highlight braid striping
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 8]);
      ctx.lineDashOffset = (offsetPx * 0.5) % 16;
      ctx.beginPath();
      ctx.moveTo(ropeStartX, ropeY);
      ctx.quadraticCurveTo(ropeCenterX, ropeY + sagAmount, ropeEndX, ropeY);
      ctx.stroke();
      ctx.restore();

      // Center Ribbon / Flag Marker (Merah Putih / Emas ribbon hanging from the rope center)
      const flagY = ropeY + sagAmount * 0.5;
      ctx.save();
      ctx.translate(ropeCenterX, flagY);

      // Flag fluttering wave
      const flutter = Math.sin(animTime * 6) * 5;

      // Center ring attachment
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Hanging Flag Ribbon (Merah - Putih)
      // Top half (Red)
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-10, 5);
      ctx.quadraticCurveTo(flutter, 20, -10 + flutter * 0.5, 30);
      ctx.lineTo(10 + flutter * 0.5, 30);
      ctx.quadraticCurveTo(10 + flutter, 20, 10, 5);
      ctx.closePath();
      ctx.fill();

      // Bottom half (White)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-10 + flutter * 0.5, 30);
      ctx.quadraticCurveTo(flutter * 0.8, 42, -6 + flutter * 0.5, 52);
      // Swallowtail flag notch
      ctx.lineTo(flutter * 0.5, 46);
      ctx.lineTo(6 + flutter * 0.5, 52);
      ctx.quadraticCurveTo(10 + flutter * 0.8, 42, 10 + flutter * 0.5, 30);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Center plumb-line shadow indicator straight down to ground
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, 52);
      ctx.lineTo(0, groundY - flagY);
      ctx.stroke();
      ctx.restore();

      ctx.restore(); // Restore from shake translation

      // --- 6. TOP TENSION & DISTANCE BAR ---
      // Tension HUD at top
      ctx.save();
      const meterWidth = Math.min(width - 60, 480);
      const meterX = (width - meterWidth) / 2;
      const meterY = 22;
      const meterHeight = 10;

      // Track background
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.roundRect(meterX, meterY, meterWidth, meterHeight, 5);
      ctx.fill();

      // Safe / target limits
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(meterX, meterY - 3, meterWidth, meterHeight + 6);

      // Meter fill from center
      const meterMid = meterX + meterWidth / 2;
      const displacementRatio = Math.max(-1, Math.min(1, currentDistance / (targetDistance || 3)));
      const fillLen = displacementRatio * (meterWidth / 2);

      if (fillLen < 0) {
        // Red leading
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(meterMid + fillLen, meterY, -fillLen, meterHeight, 4);
        ctx.fill();
      } else if (fillLen > 0) {
        // Blue leading
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.roundRect(meterMid, meterY, fillLen, meterHeight, 4);
        ctx.fill();
      }

      // Center divider notch
      ctx.fillStyle = '#475569';
      ctx.fillRect(meterMid - 1.5, meterY - 4, 3, meterHeight + 8);

      // Digital Distance readout
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      let distanceText = '0.0 m (Seimbang)';
      let textFill = '#475569';

      if (currentDistance < -0.05) {
        distanceText = `◀ Tim Merah: +${Math.abs(currentDistance).toFixed(1)} m`;
        textFill = '#dc2626';
      } else if (currentDistance > 0.05) {
        distanceText = `Tim Biru: +${currentDistance.toFixed(1)} m ▶`;
        textFill = '#2563eb';
      }
      ctx.fillStyle = textFill;
      ctx.fillText(distanceText, meterMid, meterY + 24);
      ctx.restore();

      // --- 7. CIRCULAR COUNTDOWN TIMER OVERLAY ---
      // "Implement a circular countdown timer overlay on the canvas that dynamically
      // changes color (green to red) as the remaining time for a question decreases,
      // giving students visual urgency."
      if (isRoundActive && totalTime > 0) {
        drawCircularCountdownTimer(ctx, {
          cx: width / 2,
          cy: 110, // Positioned gracefully above the court center
          radius: 36,
          timeRemaining: Math.max(0, timeRemaining),
          totalTime: totalTime,
          animTime: animTime,
        });
      }

      ctx.restore(); // Restore DPR scale
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs bg-white">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '360px', display: 'block' }}
      />
    </div>
  );
};

/**
 * Helper to draw the circular countdown urgency timer directly on Canvas
 */
function drawCircularCountdownTimer(
  ctx: CanvasRenderingContext2D,
  {
    cx,
    cy,
    radius,
    timeRemaining,
    totalTime,
    animTime,
  }: {
    cx: number;
    cy: number;
    radius: number;
    timeRemaining: number;
    totalTime: number;
    animTime: number;
  }
) {
  const fraction = Math.max(0, Math.min(1, timeRemaining / totalTime));
  const isUrgent = timeRemaining <= 5.0; // Under 5s is high urgency

  // Pulse effect when urgent (heartbeat scaling)
  const pulseScale = isUrgent ? 1.0 + Math.sin(animTime * 12) * 0.08 : 1.0;
  const currentRadius = radius * pulseScale;

  // Dynamic Color Transition (Green -> Amber/Yellow -> Red)
  // fraction 1.0 -> 0.6: Green
  // fraction 0.6 -> 0.3: Yellow/Amber
  // fraction 0.3 -> 0.0: Crimson Red
  let strokeColor = '#22c55e'; // Green
  let glowColor = 'rgba(34, 197, 94, 0.4)';

  if (fraction > 0.55) {
    // Green range
    strokeColor = '#16a34a';
    glowColor = 'rgba(22, 163, 74, 0.3)';
  } else if (fraction > 0.25) {
    // Amber/Yellow range
    strokeColor = '#f59e0b';
    glowColor = 'rgba(245, 158, 11, 0.35)';
  } else {
    // Urgent Red range
    strokeColor = '#ef4444';
    glowColor = 'rgba(239, 68, 68, 0.6)';
  }

  ctx.save();
  ctx.translate(cx, cy);

  // Background Glass Plate
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(0, 0, currentRadius + 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Outer Decorative Ring
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, currentRadius + 8, 0, Math.PI * 2);
  ctx.stroke();

  // Background Inactive Track
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Dynamic Progress Arc
  // Starts at top (-PI/2) and sweeps clockwise according to fraction
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + fraction * (Math.PI * 2);

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineWidth = 6.5;
  ctx.strokeStyle = strokeColor;

  if (isUrgent) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12 + Math.sin(animTime * 12) * 6;
  }

  ctx.beginPath();
  ctx.arc(0, 0, currentRadius, startAngle, endAngle, false);
  ctx.stroke();
  ctx.restore();

  // Seconds display inside circle
  const displaySec = Math.ceil(timeRemaining);
  ctx.fillStyle = isUrgent ? '#dc2626' : '#1e293b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = displaySec >= 100 ? 14 : isUrgent ? 20 : 18;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillText(`${displaySec}`, 0, -2);

  // Small "DETIK" sub-label
  ctx.font = 'bold 8px sans-serif';
  ctx.fillStyle = isUrgent ? '#ef4444' : '#64748b';
  ctx.fillText('DETIK', 0, 14);

  // Urgency tag badge underneath if remaining <= 5s
  if (isUrgent) {
    ctx.save();
    ctx.fillStyle = '#fee2e2';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-42, currentRadius + 14, 84, 18, 9);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#b91c1c';
    ctx.fillText('⚠️ WAKTU KRITIS', 0, currentRadius + 24);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Helper to draw a stylized athletic puller character on Canvas
 */
function drawStylizedPuller(
  ctx: CanvasRenderingContext2D,
  {
    x,
    y,
    color,
    accentColor,
    facing,
    leanAngle,
    bob,
    ropeY,
    handX,
    number,
    isWinner,
  }: {
    x: number;
    y: number;
    color: string;
    accentColor: string;
    facing: 'left' | 'right';
    leanAngle: number;
    bob: number;
    ropeY: number;
    handX: number;
    number: number;
    isWinner: boolean;
  }
) {
  ctx.save();
  ctx.translate(x, y);

  // Ground contact shadow
  ctx.fillStyle = 'rgba(71, 85, 105, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lean transform for straining body
  ctx.rotate(leanAngle);

  // Legs in athletic braced stance
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Back leg (braced deep into ground)
  ctx.beginPath();
  ctx.moveTo(0, -32 + bob);
  ctx.lineTo(facing === 'left' ? 14 : -14, -14);
  ctx.lineTo(facing === 'left' ? 22 : -22, 0);
  ctx.stroke();

  // Front leg (bent knee for power)
  ctx.beginPath();
  ctx.moveTo(0, -32 + bob);
  ctx.lineTo(facing === 'left' ? -8 : 8, -16);
  ctx.lineTo(facing === 'left' ? -12 : 12, 0);
  ctx.stroke();

  // Athletic Shoes
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(facing === 'left' ? 18 : -26, -4, 10, 4);
  ctx.fillRect(facing === 'left' ? -16 : 8, -4, 10, 4);

  // Torso / Jersey
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(-10, -62 + bob, 20, 32, 6);
  ctx.fill();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Jersey Number
  ctx.font = 'bold 10px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(`${number}`, 0, -42 + bob);

  // Arms gripping rope
  ctx.strokeStyle = '#f87171'; // Skin tone or jersey arm
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -52 + bob);
  // Reaching to handX
  ctx.lineTo(facing === 'left' ? -18 : 18, -44 + bob);
  ctx.stroke();

  // Hands (gloves)
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(facing === 'left' ? -18 : 18, -44 + bob, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#fed7aa'; // Warm skin tone
  ctx.beginPath();
  ctx.arc(0, -74 + bob, 10, 0, Math.PI * 2);
  ctx.fill();

  // Team Headband
  ctx.fillStyle = color;
  ctx.fillRect(-10, -78 + bob, 20, 5);

  // Eyeballs / Expression: Straining or Smiling
  ctx.fillStyle = '#1e293b';
  if (isWinner) {
    // Joyful arc eyes (^_^)
    ctx.beginPath();
    ctx.arc(facing === 'left' ? -4 : 4, -73 + bob, 2.5, 0, Math.PI);
    ctx.stroke();
  } else {
    // Concentrated / Straining slanted eye
    ctx.beginPath();
    ctx.arc(facing === 'left' ? -4 : 4, -73 + bob, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
