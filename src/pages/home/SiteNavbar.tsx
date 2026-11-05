import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

export function SiteNavbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV_LINKS = [
    { label: 'Home', href: '#hero' },
    { label: 'Hospitals', href: '#hospitals' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
      style={{
        background: 'rgba(5,47,75,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
      aria-label="Site navigation"
    >
      {/* Brand */}
      <a href="#hero" className="flex items-center gap-3 no-underline shrink-0">
        {/* Logo mark */}
        <div className="relative w-20 h-20 shrink-0">
          <img src="/logo.png" alt="MediTrack logo" width="80" height="80" className="w-20 h-20 object-contain" />
        </div>
        <div>
          <div className="text-white font-bold text-lg leading-tight tracking-wide">MediTrack</div>
          <div className="text-xs leading-tight" style={{ color: '#19D5E5' }}>
            Emergency Resources | When It Matters
          </div>
        </div>
      </a>

      {/* Desktop nav links */}
      <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0 absolute left-1/2 -translate-x-1/2">
        {NAV_LINKS.map((link) => {
          const isActive = link.label === 'Home';
          return (
            <li key={link.label}>
              <a
                href={link.href}
                className="px-4 py-2 text-sm font-medium rounded-md no-underline flex flex-col items-center transition-colors"
                style={{ color: isActive ? '#19D5E5' : 'rgba(255,255,255,0.75)' }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.75)';
                }}
              >
                {link.label}
                {isActive && (
                  <span
                    className="mt-0.5 h-0.5 w-full rounded-full"
                    style={{ background: '#19D5E5' }}
                  />
                )}
              </a>
            </li>
          );
        })}
      </ul>

      {/* Staff Login CTA */}
      <button
        onClick={() => navigate('/dashboard')}
        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white border border-white/30 transition-all cursor-pointer shrink-0"
        style={{ background: 'transparent' }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
        aria-label="Hospital Staff Login"
      >
        <Users size={15} />
        Hospital Staff Login
      </button>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-white p-2 cursor-pointer"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        style={{ background: 'transparent', border: 'none' }}
      >
        <span className="flex flex-col gap-1.5">
          <span className="block w-5 h-0.5 bg-white" />
          <span className="block w-5 h-0.5 bg-white" />
          <span className="block w-5 h-0.5 bg-white" />
        </span>
      </button>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="absolute top-full left-0 right-0 md:hidden flex flex-col py-4 px-6 gap-2"
          style={{
            background: 'rgba(5,47,75,0.98)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-white/80 py-2 text-sm no-underline hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              navigate('/dashboard');
            }}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-white/30 text-white w-fit cursor-pointer"
            style={{ background: 'transparent' }}
          >
            <Users size={15} />
            Hospital Staff Login
          </button>
        </div>
      )}
    </nav>
  );
}
