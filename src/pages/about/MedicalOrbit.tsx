import React from 'react';

/* ─────────────────────────────────────────────────────────────
   ORBIT ANIMATION CSS
   Strictly ONE animation:
   All seven badges continuously revolve clockwise around
   the stationary central ECG circle (30s linear infinite).
   The inner badge content counter-rotates at the exact same
   rate (-360deg) so all text and icons remain perfectly upright.
   No other animations (no pulsing, breathing, scaling, etc.)
───────────────────────────────────────────────────────────── */
const ORBIT_KEYFRAMES = `
  @keyframes orbit-revolve-clockwise {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes orbit-counter-rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(-360deg);
    }
  }

  .orbit-track-revolve {
    animation: orbit-revolve-clockwise 30s linear infinite;
  }

  .orbit-badge-upright {
    animation: orbit-counter-rotate 30s linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .orbit-track-revolve,
    .orbit-badge-upright {
      animation: none !important;
    }
  }
`;

/* ─────────────────────────────────────────────────────────────
   7 MEDICAL RESOURCE BADGES
───────────────────────────────────────────────────────────── */
interface BadgeDef {
  label: string;
  icon: React.ReactNode;
}

function NavigationIcon() {
  return (
    <svg viewBox="0 0 18 18" width="15" height="15" fill="none" aria-hidden="true">
      <path d="M9 2L14 16L9 13L4 16L9 2Z" stroke="#00D5E8" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function IcuBedsIcon() {
  return (
    <svg viewBox="0 0 18 18" width="15" height="15" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="14" height="9" rx="2" stroke="#00D5E8" strokeWidth="1.5" />
      <path d="M6 6V4a3 3 0 0 1 6 0v2" stroke="#00D5E8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 9v3M7.5 10.5h3" stroke="#00D5E8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function VentilatorsIcon() {
  return (
    <svg viewBox="0 0 18 18" width="15" height="15" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" stroke="#00D5E8" strokeWidth="1.5" />
      <path d="M9 5.5v3.5l2.5 2.5" stroke="#00D5E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9h1.5" stroke="#00D5E8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function OxygenIcon() {
  return (
    <svg viewBox="0 0 18 18" width="15" height="15" fill="none" aria-hidden="true">
      <path d="M4 7c0-2.76 2.24-5 5-5s5 2.24 5 5v5H4V7Z" stroke="#00D5E8" strokeWidth="1.5" />
      <path d="M6.5 15.5h5" stroke="#00D5E8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 11v2.5" stroke="#00D5E8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 8.5h4" stroke="#00D5E8" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1.5 1.5" />
    </svg>
  );
}

function EmergencyIcon() {
  return (
    <svg viewBox="0 0 18 18" width="15" height="15" fill="none" aria-hidden="true">
      <path d="M9 2L2 15.5h14L9 2Z" stroke="#00D5E8" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 7.5v3.5" stroke="#00D5E8" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="9" cy="12.5" r="0.75" fill="#00D5E8" />
    </svg>
  );
}

function LiveStatusIcon() {
  return (
    <svg viewBox="0 0 18 18" width="15" height="15" fill="none" aria-hidden="true">
      <path d="M2 10L5.5 6.5L8.5 9.5L13 4.5" stroke="#00D5E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="12" r="2.5" fill="#00D5E8" opacity="0.85" />
      <path d="M12.5 12h1" stroke="#001525" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function AmbulanceIcon() {
  return (
    <svg viewBox="0 0 18 18" width="15" height="15" fill="none" aria-hidden="true">
      <rect x="1.5" y="5.5" width="10" height="8" rx="1.5" stroke="#00D5E8" strokeWidth="1.5" />
      <path d="M11.5 8.5h2.5L16 11v2.5h-4.5V8.5Z" stroke="#00D5E8" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="4.5" cy="14" r="1.3" stroke="#00D5E8" strokeWidth="1.2" />
      <circle cx="13" cy="14" r="1.3" stroke="#00D5E8" strokeWidth="1.2" />
      <path d="M4.5 8.5V10M3.75 9.25h1.5" stroke="#00D5E8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

const BADGES: BadgeDef[] = [
  { label: 'Navigation', icon: <NavigationIcon /> },
  { label: 'ICU Beds', icon: <IcuBedsIcon /> },
  { label: 'Ventilators', icon: <VentilatorsIcon /> },
  { label: 'Oxygen', icon: <OxygenIcon /> },
  { label: 'Emergency', icon: <EmergencyIcon /> },
  { label: 'Live Status', icon: <LiveStatusIcon /> },
  { label: 'Ambulance', icon: <AmbulanceIcon /> },
];

/* ─────────────────────────────────────────────────────────────
   COMPONENT: MedicalOrbit
───────────────────────────────────────────────────────────── */
export function MedicalOrbit() {
  const CANVAS = 480;
  const CX = CANVAS / 2; // 240
  const CY = CANVAS / 2; // 240
  const ORBIT_R = 175;   // Radius for 7 badges
  const RING_R = 175;    // Orbit track radius
  const RING_INNER = 135;// Subtle inner track

  return (
    <div className="medical-orbit-container w-full flex justify-center items-center select-none">
      <style>{ORBIT_KEYFRAMES}</style>

      {/* Scalable frame: 480px on desktop, cleanly scaled down on tablet/mobile */}
      <div
        className="medical-orbit-scaler"
        style={{
          width: CANVAS,
          height: CANVAS,
          position: 'relative',
        }}
      >
        {/* 1. Dark navy circular backdrop with radial gradient */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 50%, #052F4B 0%, #001C30 55%, #001525 100%)',
            boxShadow: 'inset 0 0 50px 15px rgba(0,21,37,0.85), 0 10px 40px rgba(0,0,0,0.3)',
            border: '1px solid rgba(0, 213, 232, 0.12)',
          }}
        />

        {/* 2. Stationary subtle blue grid lines inside the backdrop */}
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${CANVAS} ${CANVAS}`}
          width={CANVAS}
          height={CANVAS}
          style={{ position: 'absolute', inset: 0, opacity: 0.12, pointerEvents: 'none' }}
        >
          {Array.from({ length: 13 }).map((_, i) => {
            const pos = (i * CANVAS) / 12;
            return (
              <g key={i}>
                <line x1={pos} y1="0" x2={pos} y2={CANVAS} stroke="#00D5E8" strokeWidth="0.6" />
                <line x1="0" y1={pos} x2={CANVAS} y2={pos} stroke="#00D5E8" strokeWidth="0.6" />
              </g>
            );
          })}
        </svg>

        {/* 3. Stationary subtle circular cyan orbit tracks behind badges */}
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${CANVAS} ${CANVAS}`}
          width={CANVAS}
          height={CANVAS}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          {/* Outer glow ring */}
          <circle
            cx={CX}
            cy={CY}
            r={RING_R + 14}
            stroke="rgba(0, 213, 232, 0.04)"
            strokeWidth="20"
            fill="none"
          />
          {/* Inner decorative circle */}
          <circle
            cx={CX}
            cy={CY}
            r={RING_INNER}
            stroke="rgba(0, 213, 232, 0.12)"
            strokeWidth="1"
            strokeDasharray="4 8"
            fill="none"
          />
          {/* Main orbit track */}
          <circle
            cx={CX}
            cy={CY}
            r={RING_R}
            stroke="rgba(0, 213, 232, 0.22)"
            strokeWidth="1.2"
            strokeDasharray="5 7"
            fill="none"
          />
          {/* Radial tick marks at equal 360/7 degree intervals */}
          {BADGES.map((_, i) => {
            const angle = (i * 360) / BADGES.length;
            const rad = (angle * Math.PI) / 180;
            const x1 = CX + (RING_R - 6) * Math.cos(rad);
            const y1 = CY + (RING_R - 6) * Math.sin(rad);
            const x2 = CX + (RING_R + 6) * Math.cos(rad);
            const y2 = CY + (RING_R + 6) * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(0, 213, 232, 0.35)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* 4. REVOLVING ORBIT CONTAINER: 
               Rotates continuously clockwise 360deg over 30s.
               Contains all 7 badges evenly positioned around the circle. */}
        <div
          className="orbit-track-revolve"
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: `${CX}px ${CY}px`,
          }}
        >
          {BADGES.map((badge, i) => {
            // Equal angular spacing: 360 / 7 degrees
            const angleDeg = (i * 360) / BADGES.length;
            const angleRad = (angleDeg * Math.PI) / 180;
            const bx = CX + ORBIT_R * Math.cos(angleRad);
            const by = CY + ORBIT_R * Math.sin(angleRad);

            return (
              <div
                key={badge.label}
                style={{
                  position: 'absolute',
                  left: `${bx}px`,
                  top: `${by}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                }}
              >
                {/* Counter-rotating element: rotates -360deg over 30s so text and icons stay upright */}
                <div
                  className="orbit-badge-upright"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                    padding: '6px 13px 6px 9px',
                    borderRadius: 999,
                    background: 'rgba(240, 250, 255, 0.94)',
                    border: '1.5px solid rgba(0, 213, 232, 0.4)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.16)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}>
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

        {/* 5. Central stationary glowing cyan ECG node
               Stationary: does NOT revolve, NO breathing animation */}
        <div
          aria-label="Central ECG Heartbeat"
          style={{
            position: 'absolute',
            left: `${CX}px`,
            top: `${CY}px`,
            transform: 'translate(-50%, -50%)',
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 50%, #052F4B 50%, #031E32 100%)',
            border: '2.5px solid rgba(0, 213, 232, 0.85)',
            boxShadow: '0 0 24px 4px rgba(0, 213, 232, 0.4), inset 0 0 16px rgba(0, 213, 232, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          {/* ECG waveform SVG icon */}
          <svg
            viewBox="0 0 80 36"
            width="60"
            height="26"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M0,18 L14,18 L18,8 L22,28 L28,4 L33,32 L38,16 L42,18 L80,18"
              stroke="#00D5E8"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Center label below node */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `${CX}px`,
            top: `${CY + 58}px`,
            transform: 'translateX(-50%)',
            textAlign: 'center',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'rgba(0, 213, 232, 0.75)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            MediTrack
          </span>
        </div>
      </div>

      {/* Responsive scaling styles */}
      <style>{`
        .medical-orbit-scaler {
          transform-origin: center center;
        }
        @media (max-width: 540px) {
          .medical-orbit-container {
            overflow: hidden;
          }
          .medical-orbit-scaler {
            transform: scale(0.64);
            margin: -80px auto;
          }
        }
        @media (min-width: 541px) and (max-width: 767px) {
          .medical-orbit-scaler {
            transform: scale(0.78);
            margin: -50px auto;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .medical-orbit-scaler {
            transform: scale(0.88);
            margin: -25px auto;
          }
        }
      `}</style>
    </div>
  );
}
