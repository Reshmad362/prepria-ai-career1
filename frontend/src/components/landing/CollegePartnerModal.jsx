import React, { useState, useEffect, useRef } from 'react';
import { X, Building2, Send, CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

/* ─── tiny helpers ───────────────────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE  = /^[+]?[\d\s\-().]{7,20}$/;

/* ─── shared field-wrapper styles ───────────────────────────────────────── */
const S = {
  /* modal overlay */
  overlay: {
    position:       'fixed',
    inset:          0,
    zIndex:         60,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '12px',
    background:     'rgba(10,10,15,0.52)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    animation:      'prepria-modal-fade 0.2s ease',
  },

  /* modal card */
  card: {
    position:        'relative',
    width:           '100%',
    maxWidth:        '720px',
    maxHeight:       '92vh',
    borderRadius:    '24px',
    background:      '#FFFFFF',
    border:          '1px solid #E8E8EC',
    boxShadow:       '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
    display:         'flex',
    flexDirection:   'column',
    overflow:        'hidden',
    animation:       'prepria-modal-scale 0.22s ease',
  },

  /* header */
  header: {
    display:         'flex',
    alignItems:      'flex-start',
    justifyContent:  'space-between',
    padding:         '28px 32px 24px',
    borderBottom:    '1px solid #F0F0F4',
    flexShrink:      0,
  },

  /* scrollable body */
  body: {
    overflowY:  'auto',
    padding:    '28px 32px 8px',
    flex:       1,
  },

  /* footer (submit area) */
  footer: {
    padding:    '20px 32px 28px',
    flexShrink: 0,
  },

  /* section label */
  sectionLabel: {
    fontFamily:    '"Inter","Manrope",sans-serif',
    fontWeight:    700,
    fontSize:      '11px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color:         '#FF6B00',
    marginBottom:  '14px',
    display:       'block',
  },

  /* field label */
  fieldLabel: {
    fontFamily:    '"Inter","Manrope",sans-serif',
    fontWeight:    600,
    fontSize:      '13px',
    color:         '#2E2E3A',
    marginBottom:  '6px',
    display:       'block',
  },

  /* base input / select / textarea */
  input: (focused, hasError) => ({
    width:           '100%',
    height:          '50px',
    padding:         '0 16px',
    borderRadius:    '12px',
    background:      '#F8F9FB',
    border:          hasError  ? '1.5px solid #E53935'
                   : focused   ? '1.5px solid #FF6B00'
                   :             '1.5px solid #E2E5EA',
    boxShadow:       focused && !hasError
                       ? '0 0 0 3px rgba(255,107,0,0.10)'
                       : hasError
                         ? '0 0 0 3px rgba(229,57,53,0.09)'
                         : 'none',
    fontFamily:      '"Inter","Manrope",sans-serif',
    fontWeight:      500,
    fontSize:        '14px',
    color:           '#1A1A2E',
    outline:         'none',
    transition:      'border-color 0.16s ease, box-shadow 0.16s ease',
    boxSizing:       'border-box',
    display:         'block',
  }),

  /* textarea variant */
  textarea: (focused, hasError) => ({
    ...S.input(focused, hasError),
    height:     'auto',
    minHeight:  '108px',
    padding:    '14px 16px',
    resize:     'vertical',
  }),

  /* select variant — needs explicit appearance reset */
  select: (focused, hasError) => ({
    ...S.input(focused, hasError),
    appearance:    'auto',
    WebkitAppearance: 'auto',
    cursor:        'pointer',
  }),

  /* inline error */
  inlineError: {
    display:        'flex',
    alignItems:     'center',
    gap:            '5px',
    marginTop:      '5px',
    fontFamily:     '"Inter","Manrope",sans-serif',
    fontWeight:     500,
    fontSize:       '12px',
    color:          '#D32F2F',
    lineHeight:     1.4,
  },
};

/* ─── Reusable controlled field ─────────────────────────────────────────── */
function Field({ label, required, error, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={S.fieldLabel}>
        {label}
        {required && <span style={{ color: '#FF6B00', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
      {error && (
        <span style={S.inlineError}>
          <AlertCircle style={{ width: '12px', height: '12px', flexShrink: 0 }} />
          {error}
        </span>
      )}
    </div>
  );
}

/* ─── Stateful input wrapper ─────────────────────────────────────────────── */
function PInput({ type = 'text', name, value, onChange, placeholder, hasError, style: extraStyle }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...S.input(focused, hasError), ...extraStyle }}
    />
  );
}

function PSelect({ name, value, onChange, children, hasError }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={S.select(focused, hasError)}
    >
      {children}
    </select>
  );
}

function PTextarea({ name, value, onChange, placeholder, hasError }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={S.textarea(focused, hasError)}
    />
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN MODAL COMPONENT
════════════════════════════════════════════════════════════════════════════ */
export default function CollegePartnerModal({ isOpen, onClose }) {
  /* ── Form state (preserving all original field names) ── */
  const INITIAL = {
    collegeName:   '',
    contactPerson: '',
    email:         '',
    phone:         '',
    designation:   'TPO / Head of Placements',
    batchSize:     '500-1000',
    message:       '',
  };

  const [formData,  setFormData]  = useState(INITIAL);
  const [errors,    setErrors]    = useState({});
  const [touched,   setTouched]   = useState({});
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  /* Reset when modal opens */
  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL);
      setErrors({});
      setTouched({});
      setLoading(false);
      setSubmitted(false);
      setSubmitError('');
    }
  }, [isOpen]);

  /* Escape key — preserved from original */
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [isOpen, onClose]);

  /* ── Validation ── */
  const validate = (data) => {
    const e = {};
    if (!data.collegeName.trim())   e.collegeName   = 'Please enter the college or institution name.';
    if (!data.contactPerson.trim()) e.contactPerson = "Please enter the contact person's name.";
    if (!data.email.trim())         e.email         = 'Please enter an official email address.';
    else if (!EMAIL_RE.test(data.email.trim())) e.email = 'Please enter a valid email address.';
    if (!data.phone.trim())         e.phone         = 'Please enter a phone number.';
    else if (!PHONE_RE.test(data.phone.trim())) e.phone = 'Please enter a valid phone number.';
    return e;
  };

  /* ── Handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    if (touched[name]) {
      const newErr = validate(next);
      setErrors(prev => ({ ...prev, [name]: newErr[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const newErr = validate(formData);
    setErrors(prev => ({ ...prev, [name]: newErr[name] }));
  };

  /* Original submission logic preserved exactly */
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError('');

    /* Mark everything as touched */
    const allTouched = Object.keys(INITIAL).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched(allTouched);

    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 3000);
    }, 800);
  };

  if (!isOpen) return null;

  /* ── Inject keyframe CSS once ── */
  if (typeof document !== 'undefined' && !document.getElementById('prepria-modal-kf')) {
    const style = document.createElement('style');
    style.id = 'prepria-modal-kf';
    style.textContent = `
      @keyframes prepria-modal-fade  { from { opacity:0; } to { opacity:1; } }
      @keyframes prepria-modal-scale { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
    `;
    document.head.appendChild(style);
  }

  /* ════════════════════════════════════════════════════════════════════ */
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.card} onClick={e => e.stopPropagation()}>

        {/* ── HEADER ────────────────────────────────────────────────── */}
        <div style={S.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Orange icon mark */}
            <div style={{
              width:          '50px',
              height:         '50px',
              borderRadius:   '14px',
              background:     '#FF6B00',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              flexShrink:     0,
              boxShadow:      '0 4px 14px rgba(255,107,0,0.34)',
            }}>
              <Building2 style={{ width: '22px', height: '22px', color: '#FFFFFF' }} strokeWidth={2} />
            </div>

            {/* Title block */}
            <div>
              <h2 style={{
                fontFamily:    '"Inter","Manrope",sans-serif',
                fontWeight:    800,
                fontSize:      '22px',
                letterSpacing: '-0.02em',
                color:         '#111118',
                lineHeight:    1.15,
                margin:        0,
              }}>
                Partner with PREPRIA
              </h2>
              <p style={{
                fontFamily: '"Inter","Manrope",sans-serif',
                fontWeight: 500,
                fontSize:   '13.5px',
                color:      '#868699',
                marginTop:  '4px',
                lineHeight: 1.4,
              }}>
                Institutional &amp; Campus Placement Programs
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width:          '36px',
              height:         '36px',
              borderRadius:   '10px',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              border:         '1.5px solid #EAEAEF',
              background:     'transparent',
              cursor:         'pointer',
              color:          '#888899',
              flexShrink:     0,
              transition:     'background 0.14s ease, color 0.14s ease',
              marginTop:      '2px',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F4F4F8'; e.currentTarget.style.color = '#333344'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888899'; }}
          >
            <X style={{ width: '16px', height: '16px' }} strokeWidth={2.2} />
          </button>
        </div>

        {/* ── SUCCESS STATE ─────────────────────────────────────────── */}
        {submitted ? (
          <div style={{
            padding:    '56px 32px',
            textAlign:  'center',
            display:    'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap:        '16px',
            animation:  'prepria-modal-fade 0.3s ease',
          }}>
            {/* Success icon */}
            <div style={{
              width:          '72px',
              height:         '72px',
              borderRadius:   '50%',
              background:     'linear-gradient(135deg,#E8F8F2,#C8F0E2)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              boxShadow:      '0 4px 20px rgba(46,204,113,0.2)',
            }}>
              <CheckCircle2 style={{ width: '32px', height: '32px', color: '#1DB974' }} />
            </div>

            <div>
              <h3 style={{
                fontFamily:    '"Inter","Manrope",sans-serif',
                fontWeight:    800,
                fontSize:      '22px',
                color:         '#111118',
                margin:        '0 0 10px',
                letterSpacing: '-0.015em',
              }}>
                Partnership Inquiry Sent
              </h3>
              <p style={{
                fontFamily:  '"Inter","Manrope",sans-serif',
                fontWeight:  400,
                fontSize:    '14.5px',
                color:       '#666677',
                lineHeight:  1.6,
                maxWidth:    '420px',
                margin:      '0 auto',
              }}>
                Thank you for reaching out to PREPRIA. Our Institutional Partnerships team will review your requirements and get in touch with you within 24 hours.
              </p>
            </div>

            <button
              onClick={onClose}
              style={{
                marginTop:      '8px',
                padding:        '11px 28px',
                borderRadius:   '12px',
                background:     '#F4F4F8',
                border:         '1.5px solid #E2E2EA',
                fontFamily:     '"Inter","Manrope",sans-serif',
                fontWeight:     600,
                fontSize:       '14px',
                color:          '#333344',
                cursor:         'pointer',
                transition:     'background 0.14s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#EAEAEF'}
              onMouseLeave={e => e.currentTarget.style.background = '#F4F4F8'}
            >
              Close
            </button>
          </div>

        ) : (
          <>
            {/* ── FORM BODY ─────────────────────────────────────────── */}
            <div style={S.body}>

              {/* Intro */}
              <p style={{
                fontFamily:   '"Inter","Manrope",sans-serif',
                fontWeight:   400,
                fontSize:     '14px',
                color:        '#555566',
                lineHeight:   1.6,
                marginBottom: '28px',
                paddingBottom:'22px',
                borderBottom: '1px solid #F0F0F5',
              }}>
                Tell us about your institution and placement requirements. Our team will get in touch to explore how PREPRIA can accelerate career readiness for your students.
              </p>

              {/* ── SECTION 1: INSTITUTION ── */}
              <span style={S.sectionLabel}>Institution Details</span>

              <Field label="College / Institution Name" required error={errors.collegeName}>
                <PInput
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleChange}
                  placeholder="e.g. AMC Engineering College"
                  hasError={!!errors.collegeName}
                  onBlur={handleBlur}
                />
              </Field>

              {/* ── SECTION 2: PRIMARY CONTACT ── */}
              <span style={S.sectionLabel}>Primary Contact</span>

              {/* Row 1: Contact Person + Designation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}
                   className="grid-cols-partner">
                <Field label="Contact Person" required error={errors.contactPerson}>
                  <PInput
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="Prof. Name / TPO Name"
                    hasError={!!errors.contactPerson}
                    onBlur={handleBlur}
                  />
                </Field>

                <Field label="Designation">
                  <PSelect
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                  >
                    <option value="TPO / Head of Placements">TPO / Head of Placements</option>
                    <option value="Dean / Principal">Dean / Principal</option>
                    <option value="Department HOD">Department HOD</option>
                    <option value="Faculty Coordinator">Faculty Coordinator</option>
                    <option value="Other">Other</option>
                  </PSelect>
                </Field>
              </div>

              {/* Row 2: Email + Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}
                   className="grid-cols-partner">
                <Field label="Official Email" required error={errors.email}>
                  <PInput
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="placements@college.edu"
                    hasError={!!errors.email}
                    onBlur={handleBlur}
                  />
                </Field>

                <Field label="Phone Number" required error={errors.phone}>
                  <PInput
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    hasError={!!errors.phone}
                    onBlur={handleBlur}
                  />
                </Field>
              </div>

              {/* ── Batch Size ── */}
              <span style={S.sectionLabel}>Expected Student Batch Size</span>

              <Field label="Number of Students">
                <PSelect
                  name="batchSize"
                  value={formData.batchSize}
                  onChange={handleChange}
                >
                  <option value="100-500">100 – 500 Students</option>
                  <option value="500-1000">500 – 1,000 Students</option>
                  <option value="1000-3000">1,000 – 3,000 Students</option>
                  <option value="3000+">3,000+ Students</option>
                </PSelect>
              </Field>

              {/* ── Message ── */}
              <span style={S.sectionLabel}>Specific Requirements / Message</span>

              <Field label="Tell us more">
                <PTextarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about upcoming placement drives, departments, student requirements, or any specific assessment needs..."
                />
              </Field>

              {/* Bottom padding */}
              <div style={{ height: '4px' }} />
            </div>

            {/* ── FOOTER: SUBMIT ─────────────────────────────────────── */}
            <div style={S.footer}>
              {/* Global submit error */}
              {submitError && (
                <div style={{
                  display:       'flex',
                  alignItems:    'center',
                  gap:           '8px',
                  padding:       '12px 16px',
                  borderRadius:  '10px',
                  background:    '#FFF2F2',
                  border:        '1px solid #FFCCCC',
                  marginBottom:  '14px',
                  fontFamily:    '"Inter","Manrope",sans-serif',
                  fontWeight:    500,
                  fontSize:      '13px',
                  color:         '#D32F2F',
                }}>
                  <AlertCircle style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                  {submitError}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width:          '100%',
                  height:         '54px',
                  borderRadius:   '14px',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            '9px',
                  fontFamily:     '"Inter","Manrope",sans-serif',
                  fontWeight:     700,
                  fontSize:       '15px',
                  color:          '#FFFFFF',
                  background:     loading ? '#E07A2A' : '#FF6B00',
                  border:         'none',
                  cursor:         loading ? 'not-allowed' : 'pointer',
                  boxShadow:      '0 3px 14px rgba(255,107,0,0.36)',
                  transition:     'background 0.16s ease, box-shadow 0.16s ease, transform 0.14s ease',
                  opacity:        loading ? 0.88 : 1,
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.background  = '#E85F00';
                    e.currentTarget.style.boxShadow   = '0 5px 20px rgba(255,107,0,0.48)';
                    e.currentTarget.style.transform   = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background  = loading ? '#E07A2A' : '#FF6B00';
                  e.currentTarget.style.boxShadow   = '0 3px 14px rgba(255,107,0,0.36)';
                  e.currentTarget.style.transform   = 'translateY(0)';
                }}
                onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0) scale(0.99)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-1px) scale(1)'; }}
              >
                {loading ? (
                  <>
                    <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send style={{ width: '16px', height: '16px' }} />
                    Submit Partnership Inquiry
                    <ArrowRight style={{ width: '15px', height: '15px', marginLeft: '2px' }} strokeWidth={2.5} />
                  </>
                )}
              </button>

              {/* Privacy note */}
              <p style={{
                fontFamily:  '"Inter","Manrope",sans-serif',
                fontWeight:  400,
                fontSize:    '12px',
                color:       '#AAAABC',
                textAlign:   'center',
                marginTop:   '12px',
                lineHeight:  1.5,
              }}>
                Your information is used only to respond to your partnership inquiry.
              </p>
            </div>
          </>
        )}

      </div>{/* /card */}

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        @media(max-width:560px){ .grid-cols-partner{ grid-template-columns:1fr !important; } }`}
      </style>
    </div>
  );
}
