import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Menu, X, ArrowRight, Building2, Play } from 'lucide-react';

/* ─── Navigation link definitions ──────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Features',     href: '#features'     },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Modules',      href: '#modules'      },
  { label: 'For Colleges', href: '#for-colleges', badge: 'B2B' },
  { label: 'Why PREPRIA',  href: '#why-us'       },
];

export default function Navbar({ onOpenPartnerModal }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [scrolled,   setScrolled]     = useState(false);

  /* Deepen border-shadow once user scrolls past 8px */
  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  /* Lock body scroll while mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleDemo = () => {
    setMobileOpen(false);
    localStorage.setItem('isDemo', 'true');
    navigate('/dashboard');
  };

  const close = () => setMobileOpen(false);

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ================================================================
          HEADER SHELL
      ================================================================ */}
      <header
        style={{
          position:         'sticky',
          top:              0,
          zIndex:           50,
          width:            '100%',
          backgroundColor:  theme === 'dark' ? '#0B0B0D' : '#FFFFFF',
          borderBottom:     theme === 'dark'
            ? '1px solid rgba(255,255,255,0.07)'
            : '1px solid #EBEBEB',
          boxShadow: scrolled
            ? (theme === 'dark'
                ? '0 2px 24px rgba(0,0,0,0.45)'
                : '0 2px 20px rgba(0,0,0,0.06)')
            : 'none',
          transition: 'box-shadow 0.25s ease, background-color 0.2s ease',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}
      >
        {/* Max-width centred inner row */}
        <div
          style={{
            maxWidth:       '1400px',
            margin:         '0 auto',
            padding:        '0 36px',
            height:         '74px',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            gap:            '24px',
          }}
          className="px-4 sm:px-8 lg:px-9"
        >

          {/* ── BRAND ──────────────────────────────────────────────────── */}
          <Link
            to="/"
            aria-label="Go to PREPRIA homepage"
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '13px',
              flexShrink: 0,
              textDecoration: 'none',
            }}
            className="group"
          >
            {/* P icon mark */}
            <div
              style={{
                width:           '46px',
                height:          '46px',
                borderRadius:    '13px',
                background:      '#FF6B00',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                color:           '#FFFFFF',
                fontFamily:      '"Manrope", "Inter", sans-serif',
                fontWeight:      800,
                fontSize:        '22px',
                letterSpacing:   '-0.02em',
                boxShadow:       '0 3px 12px rgba(255, 107, 0, 0.38)',
                transition:      'transform 0.18s ease, box-shadow 0.18s ease',
                flexShrink:      0,
              }}
              className="group-hover:[transform:translateY(-1px)] group-hover:[box-shadow:0_5px_18px_rgba(255,107,0,0.46)]"
            >
              P
            </div>

            {/* Wordmark stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span
                style={{
                  fontFamily:    '"Manrope", "Inter", sans-serif',
                  fontWeight:    800,
                  fontSize:      '21px',
                  letterSpacing: '-0.025em',
                  lineHeight:    1,
                  color:         theme === 'dark' ? '#FFFFFF' : '#111111',
                }}
              >
                PREPRIA
              </span>
              <span
                style={{
                  fontFamily:    '"Inter", "Manrope", sans-serif',
                  fontWeight:    600,
                  fontSize:      '10px',
                  letterSpacing: '0.17em',
                  textTransform: 'uppercase',
                  lineHeight:    1,
                  color:         theme === 'dark' ? '#5A5A6E' : '#9A9A9A',
                }}
              >
                Career Intelligence
              </span>
            </div>
          </Link>

          {/* ── CENTRE NAV (desktop) ────────────────────────────────────── */}
          <nav
            aria-label="Primary"
            style={{
              display:        'flex',
              alignItems:     'center',
              gap:            '2px',
              flex:           1,
              justifyContent: 'center',
            }}
            className="hidden lg:flex"
          >
            {NAV_LINKS.map(({ label, href, badge }) => (
              <a
                key={label}
                href={href}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  gap:            '5px',
                  padding:        '6px 13px',
                  borderRadius:   '8px',
                  fontFamily:     '"Inter", "Manrope", sans-serif',
                  fontWeight:     500,
                  fontSize:       '14.5px',
                  letterSpacing:  '-0.005em',
                  whiteSpace:     'nowrap',
                  color:          theme === 'dark' ? '#BBBBCC' : '#3D3D4D',
                  textDecoration: 'none',
                  transition:     'color 0.15s ease, background-color 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#FF6B00';
                  e.currentTarget.style.backgroundColor =
                    theme === 'dark' ? 'rgba(255,107,0,0.08)' : '#FFF5EF';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color =
                    theme === 'dark' ? '#BBBBCC' : '#3D3D4D';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {label}
                {badge && (
                  <span
                    style={{
                      fontSize:        '9px',
                      fontWeight:      700,
                      letterSpacing:   '0.08em',
                      textTransform:   'uppercase',
                      padding:         '2px 5px',
                      borderRadius:    '4px',
                      background:      theme === 'dark'
                        ? 'rgba(255,107,0,0.18)'
                        : '#FFF0E6',
                      color:           '#FF6B00',
                      lineHeight:      1.4,
                    }}
                  >
                    {badge}
                  </span>
                )}
              </a>
            ))}

            {/* Partner with Us — separated slightly */}
            {onOpenPartnerModal && (
              <>
                {/* Thin separator */}
                <span
                  style={{
                    display:         'inline-block',
                    width:           '1px',
                    height:          '16px',
                    background:      theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E4E4E4',
                    margin:          '0 6px',
                    flexShrink:      0,
                  }}
                />
                <button
                  onClick={onOpenPartnerModal}
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    gap:            '5px',
                    padding:        '6px 13px',
                    borderRadius:   '8px',
                    fontFamily:     '"Inter", "Manrope", sans-serif',
                    fontWeight:     600,
                    fontSize:       '14px',
                    whiteSpace:     'nowrap',
                    color:          theme === 'dark' ? '#BBBBCC' : '#3D3D4D',
                    background:     'transparent',
                    border:         'none',
                    cursor:         'pointer',
                    transition:     'color 0.15s ease, background-color 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#FF6B00';
                    e.currentTarget.style.backgroundColor =
                      theme === 'dark' ? 'rgba(255,107,0,0.08)' : '#FFF5EF';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color =
                      theme === 'dark' ? '#BBBBCC' : '#3D3D4D';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Building2
                    style={{ width: '13px', height: '13px', color: '#FF6B00', flexShrink: 0 }}
                    strokeWidth={2.3}
                  />
                  Partner with Us
                </button>
              </>
            )}
          </nav>

          {/* ── RIGHT ACTIONS (desktop) ─────────────────────────────────── */}
          <div
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '4px',
              flexShrink: 0,
            }}
            className="hidden lg:flex"
          >
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                width:           '34px',
                height:          '34px',
                borderRadius:    '9px',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                border:          theme === 'dark'
                  ? '1px solid rgba(255,255,255,0.1)'
                  : '1px solid #E4E4E4',
                background:      'transparent',
                cursor:          'pointer',
                color:           theme === 'dark' ? '#888' : '#666',
                transition:      'background-color 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor =
                  theme === 'dark' ? 'rgba(255,255,255,0.07)' : '#F4F4F4';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {theme === 'dark'
                ? <Sun  style={{ width: '15px', height: '15px', color: '#F5A623' }} />
                : <Moon style={{ width: '15px', height: '15px' }} />
              }
            </button>

            {/* Live Demo */}
            <button
              onClick={handleDemo}
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            '5px',
                padding:        '0 13px',
                height:         '34px',
                borderRadius:   '9px',
                fontFamily:     '"Inter", "Manrope", sans-serif',
                fontWeight:     600,
                fontSize:       '13.5px',
                whiteSpace:     'nowrap',
                color:          theme === 'dark' ? '#AAAABC' : '#555566',
                background:     'transparent',
                border:         'none',
                cursor:         'pointer',
                transition:     'color 0.15s ease, background-color 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#FF6B00';
                e.currentTarget.style.backgroundColor =
                  theme === 'dark' ? 'rgba(255,107,0,0.08)' : '#FFF5EF';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color =
                  theme === 'dark' ? '#AAAABC' : '#555566';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Play
                style={{ width: '12px', height: '12px', color: '#FF6B00', fill: '#FF6B00', flexShrink: 0 }}
              />
              Live Demo
            </button>

            {/* Thin separator */}
            <span
              style={{
                display:    'inline-block',
                width:      '1px',
                height:     '18px',
                background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E4E4E4',
                margin:     '0 4px',
              }}
            />

            {/* Sign In */}
            <Link
              to="/login"
              style={{
                display:        'flex',
                alignItems:     'center',
                padding:        '0 13px',
                height:         '34px',
                borderRadius:   '9px',
                fontFamily:     '"Inter", "Manrope", sans-serif',
                fontWeight:     600,
                fontSize:       '13.5px',
                whiteSpace:     'nowrap',
                color:          theme === 'dark' ? '#CCCCDD' : '#333344',
                textDecoration: 'none',
                transition:     'color 0.15s ease, background-color 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#FF6B00';
                e.currentTarget.style.backgroundColor =
                  theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#F7F7F7';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color =
                  theme === 'dark' ? '#CCCCDD' : '#333344';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Sign In
            </Link>

            {/* Get Started — primary CTA */}
            <Link
              to="/signup"
              style={{
                display:        'inline-flex',
                alignItems:     'center',
                gap:            '7px',
                padding:        '0 18px',
                height:         '40px',
                borderRadius:   '12px',
                fontFamily:     '"Inter", "Manrope", sans-serif',
                fontWeight:     700,
                fontSize:       '14px',
                whiteSpace:     'nowrap',
                color:          '#FFFFFF',
                background:     '#FF6B00',
                textDecoration: 'none',
                boxShadow:      '0 2px 12px rgba(255, 107, 0, 0.34)',
                transition:     'background-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease',
                marginLeft:     '2px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#E85F00';
                e.currentTarget.style.boxShadow       = '0 4px 18px rgba(255, 107, 0, 0.46)';
                e.currentTarget.style.transform       = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#FF6B00';
                e.currentTarget.style.boxShadow       = '0 2px 12px rgba(255, 107, 0, 0.34)';
                e.currentTarget.style.transform       = 'translateY(0)';
              }}
            >
              Get Started
              <ArrowRight style={{ width: '14px', height: '14px' }} strokeWidth={2.5} />
            </Link>
          </div>

          {/* ── MOBILE CONTROLS ─────────────────────────────────────────── */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            className="flex lg:hidden"
          >
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                width:          '36px',
                height:         '36px',
                borderRadius:   '9px',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                border:         theme === 'dark'
                  ? '1px solid rgba(255,255,255,0.1)'
                  : '1px solid #E4E4E4',
                background:     'transparent',
                cursor:         'pointer',
                color:          theme === 'dark' ? '#888' : '#555',
              }}
            >
              {theme === 'dark'
                ? <Sun  style={{ width: '16px', height: '16px', color: '#F5A623' }} />
                : <Moon style={{ width: '16px', height: '16px' }} />
              }
            </button>

            <button
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              style={{
                width:          '36px',
                height:         '36px',
                borderRadius:   '9px',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                border:         theme === 'dark'
                  ? '1px solid rgba(255,255,255,0.1)'
                  : '1px solid #E4E4E4',
                background:     'transparent',
                cursor:         'pointer',
                color:          theme === 'dark' ? '#CCC' : '#333',
              }}
            >
              {mobileOpen
                ? <X    style={{ width: '18px', height: '18px' }} />
                : <Menu style={{ width: '18px', height: '18px' }} />
              }
            </button>
          </div>

        </div>{/* /inner row */}
      </header>

      {/* ==================================================================
          MOBILE BACKDROP
      ================================================================== */}
      {mobileOpen && (
        <div
          onClick={close}
          style={{
            position:   'fixed',
            inset:      0,
            zIndex:     39,
            background: 'rgba(0,0,0,0.28)',
            backdropFilter: 'blur(2px)',
          }}
          aria-hidden="true"
        />
      )}

      {/* ==================================================================
          MOBILE MENU DRAWER
      ================================================================== */}
      <div
        style={{
          position:        'fixed',
          top:             '74px',
          left:            0,
          right:           0,
          zIndex:          40,
          background:      theme === 'dark' ? '#0B0B0D' : '#FFFFFF',
          borderBottom:    theme === 'dark'
            ? '1px solid rgba(255,255,255,0.07)'
            : '1px solid #EBEBEB',
          boxShadow:       '0 10px 40px rgba(0,0,0,0.12)',
          overflow:        'hidden',
          maxHeight:       mobileOpen ? '640px' : '0px',
          opacity:         mobileOpen ? 1 : 0,
          pointerEvents:   mobileOpen ? 'auto' : 'none',
          transition:      'max-height 0.3s ease, opacity 0.25s ease',
        }}
        className="lg:hidden"
      >
        <div style={{ padding: '16px 20px 24px' }}>

          {/* Nav links */}
          {NAV_LINKS.map(({ label, href, badge }) => (
            <a
              key={label}
              href={href}
              onClick={close}
              style={{
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'space-between',
                padding:         '11px 12px',
                borderRadius:    '10px',
                fontFamily:      '"Inter", "Manrope", sans-serif',
                fontWeight:      500,
                fontSize:        '15px',
                color:           theme === 'dark' ? '#CCCCDD' : '#2E2E3A',
                textDecoration:  'none',
                marginBottom:    '2px',
                transition:      'background-color 0.14s ease, color 0.14s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor =
                  theme === 'dark' ? 'rgba(255,107,0,0.09)' : '#FFF5EF';
                e.currentTarget.style.color = '#FF6B00';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color =
                  theme === 'dark' ? '#CCCCDD' : '#2E2E3A';
              }}
            >
              {label}
              {badge && (
                <span
                  style={{
                    fontSize:      '9px',
                    fontWeight:    700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding:       '2px 6px',
                    borderRadius:  '4px',
                    background:    theme === 'dark'
                      ? 'rgba(255,107,0,0.18)'
                      : '#FFF0E6',
                    color:         '#FF6B00',
                  }}
                >
                  {badge}
                </span>
              )}
            </a>
          ))}

          {/* Partner with Us */}
          {onOpenPartnerModal && (
            <button
              onClick={() => { close(); onOpenPartnerModal(); }}
              style={{
                width:          '100%',
                display:        'flex',
                alignItems:     'center',
                gap:            '7px',
                padding:        '11px 12px',
                borderRadius:   '10px',
                fontFamily:     '"Inter", "Manrope", sans-serif',
                fontWeight:     600,
                fontSize:       '15px',
                color:          '#FF6B00',
                background:     'transparent',
                border:         'none',
                cursor:         'pointer',
                marginBottom:   '2px',
                textAlign:      'left',
                transition:     'background-color 0.14s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor =
                  theme === 'dark' ? 'rgba(255,107,0,0.09)' : '#FFF5EF';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Building2 style={{ width: '14px', height: '14px', flexShrink: 0 }} />
              Partner with Us
            </button>
          )}

          {/* Divider */}
          <div
            style={{
              height:     '1px',
              background: theme === 'dark' ? 'rgba(255,255,255,0.07)' : '#F0F0F0',
              margin:     '12px 0',
            }}
          />

          {/* Live Demo */}
          <button
            onClick={handleDemo}
            style={{
              width:          '100%',
              padding:        '11px',
              borderRadius:   '10px',
              fontFamily:     '"Inter", "Manrope", sans-serif',
              fontWeight:     600,
              fontSize:       '14px',
              color:          theme === 'dark' ? '#BBBBCC' : '#444455',
              background:     'transparent',
              border:         theme === 'dark'
                ? '1px solid rgba(255,255,255,0.1)'
                : '1px solid #E4E4E4',
              cursor:         'pointer',
              marginBottom:   '8px',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '6px',
              transition:     'border-color 0.14s ease, color 0.14s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#FF6B00';
              e.currentTarget.style.color       = '#FF6B00';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor =
                theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E4E4E4';
              e.currentTarget.style.color =
                theme === 'dark' ? '#BBBBCC' : '#444455';
            }}
          >
            <Play style={{ width: '12px', height: '12px', color: '#FF6B00', fill: '#FF6B00' }} />
            Live Demo
          </button>

          {/* Sign In */}
          <Link
            to="/login"
            onClick={close}
            style={{
              display:        'block',
              textAlign:      'center',
              padding:        '11px',
              borderRadius:   '10px',
              fontFamily:     '"Inter", "Manrope", sans-serif',
              fontWeight:     600,
              fontSize:       '14px',
              color:          theme === 'dark' ? '#CCCCDD' : '#333344',
              textDecoration: 'none',
              border:         theme === 'dark'
                ? '1px solid rgba(255,255,255,0.1)'
                : '1px solid #E4E4E4',
              marginBottom:   '8px',
              transition:     'color 0.14s ease, border-color 0.14s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#FF6B00';
              e.currentTarget.style.color       = '#FF6B00';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor =
                theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E4E4E4';
              e.currentTarget.style.color =
                theme === 'dark' ? '#CCCCDD' : '#333344';
            }}
          >
            Sign In
          </Link>

          {/* Get Started */}
          <Link
            to="/signup"
            onClick={close}
            style={{
              display:        'block',
              textAlign:      'center',
              padding:        '12px',
              borderRadius:   '12px',
              fontFamily:     '"Inter", "Manrope", sans-serif',
              fontWeight:     700,
              fontSize:       '14.5px',
              color:          '#FFFFFF',
              textDecoration: 'none',
              background:     '#FF6B00',
              boxShadow:      '0 2px 12px rgba(255, 107, 0, 0.32)',
            }}
          >
            Get Started Free →
          </Link>

        </div>
      </div>
    </>
  );
}
