import React, { useRef, useState } from 'react';

/* ─────────────────────────────────────────────
   KEYFRAME STYLES – scoped to this component
───────────────────────────────────────────── */
const ORBIT_CSS = `
  /* Orbit ring rotation */
  @keyframes orbit-ring-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* Centre ECG node "breathing" glow */
  @keyframes ecg-breathe {
    0%, 100% { box-shadow: 0 0 18px 4px rgba(0,213,232,0.35), 0 0 40px 10px rgba(0,213,232,0.12); }
    50%       { box-shadow: 0 0 28px 8px rgba(0,213,232,0.55), 0 0 60px 20px rgba(0,213,232,0.20); }
  }

  /* Badge hover cyan glow */
  @keyframes badge-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0,213,232,0.4); }
    50%       { box-shadow: 0 0 0 5px rgba(0,213,232,0); }
  }

  .orbit-ring-spin {
    animation: orbit-ring-spin 30s linear infinite;
  }

  .orbit-ring-spin-slow {
    animation: orbit-ring-spin 48s linear infinite reverse;
  }

  .ecg-breathe {
    animation: ecg-breathe 3s ease-in-out infinite;
  }

  /* Pause the whole orbit group on hover of a badge */
  .orbit-track-group:has(.orbit-badge:hover) .orbit-ring-spin {
    animation-play-state: paused;
  }

  /* For browsers that do not support :has(), individual badge hover still provides visual feedback */
  .orbit-badge:hover {
    animation-play-state: paused;
  }

  /* Reduced-motion override */
  @media (prefers-reduced-motion: reduce) {
    .orbit-ring-spin,
    .orbit-ring-spin-slow,
    .ecg-breathe {
      animation: none !important;
    }
  }
`;

/* ─────────────────────────────────────────────
   BADGE DEFINITIONS – 7 medical resources
───────────────────────────────────────────── */
interface BadgeDef {
  label: string;
  icon: React.ReactNode;
  accentColor: string;
}

/* Thin SVG icons, all 18×18 viewBox */
function NavIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M9 2L14 16L9 13L4 16L9 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}
function IcuIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M6 6V4a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M9 9v3M7.5 10.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function VentIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M9 5.5v3.5l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.5 9h1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function OxygenIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M4 7c0-2.76 2.24-5 5-5s5 2.24 5 5v5H4V7Z" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M6.5 15.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M9 11v2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M7 8.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1.5 1.5"/>
    </svg>
  );
}
function EmergencyIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M9 2L2 15.5h14L9 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M9 7.5v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="9" cy="12.5" r="0.75" fill="currentColor"/>
    </svg>
  );
}
function LiveIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M2 10L5.5 6.5L8.5 9.5L13 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="14" cy="12" r="2.5" fill="currentColor" opacity="0.85"/>
      <path d="M11.5 12h0.5" stroke="#001525" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}
function AmbulanceIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" aria-hidden="true">
      <rect x="1.5" y="5.5" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M11.5 8.5h2.5L16 11v2.5h-4.5V8.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <circle cx="4.5" cy="14" r="1.3" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="13" cy="14" r="1.3" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4.5 8.5V10M3.75 9.25h1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

const BADGES: BadgeDef[] = [
  { label: 'Navigation',   icon: <NavIcon />,       accentColor: '#00D5E8' },
  { label: 'ICU Beds',     icon: <IcuIcon />,       accentColor: '#00D5E8' },
  { label: 'Ventilators',  icon: <VentIcon />,      accentColor: '#00D5E8' },
  { label: 'Oxygen',       icon: <OxygenIcon />,    accentColor: '#00D5E8' },
  { label: 'Emergency',    icon: <EmergencyIcon />, accentColor: '#00D5E8' },
  { label: 'Live Status',  icon: <LiveIcon />,      accentColor: '#00D5E8' },
  { label: 'Ambulance',    icon: <AmbulanceIcon />, accentColor: '#00D5E8' },
];

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export function MedicalOrbit() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  /* Responsive sizing driven purely by CSS custom-property cascade */
  /* We pick concrete px values and use a wrapper scale transform for responsiveness */

  /* Layout constants (design-time, desktop) */
  const ORBIT_R  = 190;   // badge centre orbit radius
  const RING_R   = 190;   // main ring drawn at same radius
  const RING2_R  = 155;   // inner decorative ring
  const CANVAS   = 490;   // total square canvas
  const CX       = CANVAS / 2; // 245
  const CY       = CANVAS / 2; // 245
  const DURATION = 30;    // seconds for one full revolution

  return (
    <div className="medical-orbit-root w-full flex justify-center items-center select-none py-2">
      {/* Inject scoped keyframes once */}
      <style>{ORBIT_CSS}</style>

      {/*
        Wrapper that scales the fixed 490px canvas to fit the container.
        On mobile the outer div shrinks and CSS scale does the rest.
      */}
      <div
        className="medical-orbit-scaler"
        style={{
          width: CANVAS,
          height: CANVAS,
          position: 'relative',
        }}
      >
        {/* ── Dark navy radial background ── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 50%, #052F4B 0%, #001C30 55%, #001525 100%)',
            boxShadow: 'inset 0 0 60px 20px rgba(0,21,37,0.8)',
          }}
        />

        {/* ── Subtle blue grid lines ── */}
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${CANVAS} ${CANVAS}`}
          width={CANVAS}
          height={CANVAS}
          style={{ position: 'absolute', inset: 0, opacity: 0.1 }}
        >
          {Array.from({ length: 11 }).map((_, i) => {
            const x = (i * CANVAS) / 10;
            const y = (i * CANVAS) / 10;
            return (
              <g key={i}>
                <line x1={x} y1="0" x2={x} y2={CANVAS} stroke="#00D5E8" strokeWidth="0.5" />
                <line x1="0" y1={y} x2={CANVAS} y2={y} stroke="#00D5E8" strokeWidth="0.5" />
              </g>
            );
          })}
          {/* clip grid to circle */}
          <circle cx={CX} cy={CY} r={CANVAS / 2} fill="none" />
        </svg>

        {/* ── SVG: orbital tracks (behind badges) ── */}
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${CANVAS} ${CANVAS}`}
          width={CANVAS}
          height={CANVAS}
          style={{ position: 'absolute', inset: 0 }}
        >
          {/* Outer ambient glow ring */}
          <circle
            cx={CX} cy={CY} r={RING_R + 18}
            stroke="rgba(0,213,232,0.06)"
            strokeWidth="28"
            fill="none"
          />
          {/* Inner decorative ring (slow reverse) */}
          <circle
            cx={CX} cy={CY} r={RING2_R}
            stroke="rgba(0,213,232,0.12)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="6 10"
          />
          {/* Main orbit track */}
          <circle
            cx={CX} cy={CY} r={RING_R}
            stroke="rgba(0,213,232,0.25)"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="4 8"
          />
          {/* Tick marks at every badge position */}
          {BADGES.map((_, i) => {
            const angle = (i * 360) / BADGES.length;
            const rad   = (angle * Math.PI) / 180;
            const x1    = CX + (RING_R - 8) * Math.cos(rad);
            const y1    = CY + (RING_R - 8) * Math.sin(rad);
            const x2    = CX + (RING_R + 8) * Math.cos(rad);
            const y2    = CY + (RING_R + 8) * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(0,213,232,0.4)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* ── Orbit group: spins the entire ring so all badges travel ── */}
        <div
          ref={orbitRef}
          className={`orbit-ring-spin orbit-track-group`}
          style={{
            position: 'absolute',
            inset: 0,
            /* animation-play-state toggled individually per badge */
            animationPlayState: hoveredIndex !== null ? 'paused' : 'running',
            transformOrigin: `${CX}px ${CY}px`,
          }}
        >
          {BADGES.map((badge, i) => {
            const angleDeg = (i * 360) / BADGES.length;
            const angleRad = (angleDeg * Math.PI) / 180;
            /* Position on the orbit ring */
            const bx = CX + ORBIT_R * Math.cos(angleRad);
            const by = CY + ORBIT_R * Math.sin(angleRad);

            const isHovered = hoveredIndex === i;

            return (
              <div
                key={badge.label}
                className="orbit-badge"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  position: 'absolute',
                  left: bx,
                  top: by,
                  transform: `translate(-50%, -50%) rotate(${-angleDeg}deg)`,
                  /* counter-rotate by exactly the negative of the badge's current angular placement */
                  /* Because the whole group rotates +N°, each badge gets -N° to stay upright.      */
                  /* We embed the initial angle as CSS custom property so the counter-rotation       */
                  /* cancels perfectly at all times via animation-driven accumulated angle.          */
                  /* The key insight: the group animates from 0→360°.  Each badge starts at angle   */
                  /* i*(360/7)°.  We counter-rotate by that fixed initial angle. The GROUP rotation  */
                  /* accumulates evenly so the counter-rotate must track it.  We achieve this using  */
                  /* a separate counter-spin animation on each badge.                                */
                  animationPlayState: hoveredIndex !== null ? 'paused' : 'running',
                  zIndex: 10,
                  cursor: 'default',
                  pointerEvents: 'all',
                }}
              >
                {/*
                  Counter-rotation wrapper: spins at the same rate as the parent group
                  but in the opposite direction, keeping text upright.
                */}
                <div
                  className="orbit-ring-spin"
                  style={{
                    animationDirection: 'reverse',
                    animationPlayState: hoveredIndex !== null ? 'paused' : 'running',
                    /* Offset phase so counter matches parent perfectly */
                    animationDelay: '0s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                    padding: '7px 14px 7px 10px',
                    borderRadius: 999,
                    background: isHovered
                      ? 'rgba(255,255,255,0.97)'
                      : 'rgba(240,250,255,0.92)',
                    border: isHovered
                      ? '1.5px solid rgba(0,213,232,0.9)'
                      : '1.5px solid rgba(0,213,232,0.35)',
                    boxShadow: isHovered
                      ? '0 0 14px 4px rgba(0,213,232,0.35), 0 2px 8px rgba(0,0,0,0.15)'
                      : '0 2px 8px rgba(0,0,0,0.12)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ color: badge.accentColor, display: 'flex', alignItems: 'center' }}>
                    {badge.icon}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.01em',
                      color: '#0A2A3F',
                      lineHeight: 1,
                    }}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Central ECG node (stationary, NOT inside the spinning group) ── */}
        <div
          aria-label="ECG Heartbeat"
          className="ecg-breathe"
          style={{
            position: 'absolute',
            left: CX,
            top: CY,
            transform: 'translate(-50%, -50%)',
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 50%, #052F4B 60%, #031E32 100%)',
            border: '2.5px solid rgba(0,213,232,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
          }}
        >
          {/* ECG / heartbeat SVG waveform */}
          <svg
            viewBox="0 0 80 36"
            width="62"
            height="28"
            fill="none"
            aria-hidden="true"
          >
            <path
              d={`
                M0,18
                L14,18
                L18,8
                L22,28
                L28,4
                L33,32
                L38,16
                L42,18
                L80,18
              `}
              stroke="#00D5E8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        {/* ── Centre label below node ── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: CX,
            top: CY + 60,
            transform: 'translateX(-50%)',
            textAlign: 'center',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,213,232,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            MediTrack
          </span>
        </div>
      </div>

      {/*
        Responsive scaling: the 490px canvas shrinks via CSS transform scale
        without reflowing the page.  We inject a tiny <style> for the breakpoints.
      */}
      <style>{`
        .medical-orbit-scaler {
          transform-origin: center center;
        }
        @media (max-width: 540px) {
          .medical-orbit-root {
            overflow: hidden;
          }
          .medical-orbit-scaler {
            transform: scale(0.62);
            margin: -90px auto;
          }
        }
        @media (min-width: 541px) and (max-width: 767px) {
          .medical-orbit-scaler {
            transform: scale(0.78);
            margin: -55px auto;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .medical-orbit-scaler {
            transform: scale(0.88);
            margin: -28px auto;
          }
        }
      `}</style>
    </div>
  );
}
