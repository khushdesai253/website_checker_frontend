import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import './index.css'

function AnimatedStars() {
  const ref = useRef()

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 15
    ref.current.rotation.y -= delta / 20
  })

  return (
    <group ref={ref}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </group>
  )
}

function Background3D() {
  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <AnimatedStars />
      </Canvas>
    </div>
  )
}

const CHECK_META = {
  home: {
    icon: '🏠',
    label: 'Home Page',
    description: 'Website has a home/main page'
  },
  termsAndConditions: {
    icon: '📋',
    label: 'Terms & Conditions',
    description: 'Terms & Conditions page found and not empty'
  },
  privacyPolicy: {
    icon: '🔒',
    label: 'Privacy Policy',
    description: 'Privacy Policy page found and not empty'
  },
  aboutUs: {
    icon: '🏢',
    label: 'About Us',
    description: 'About Us page found and accessible'
  },
  contactUs: {
    icon: '📞',
    label: 'Contact Us',
    description: 'Contact Us page found and accessible'
  }
}

// Sample Account Managers — update this list as needed
const ACCOUNT_MANAGERS = [
  { name: 'Dax Desai', email: 'dax@alendei.com' },
  { name: 'Khush Desai', email: 'khush@alendei.com' },
  { name: 'Sarthik Chotani', email: 'sarthik@alendei.com' },
  { name: 'Jignesh Viradiya', email: 'jignesh.viradiya@alendei.com' },
  { name: 'Anand Parashar', email: 'anand@alendei.com' },
  { name: 'Darshan Kumar Jain', email: 'darshan@alendei.com' },
  { name: 'Prinsal Parikh', email: 'prinsal@alendei.com' }

]

function getCheckStatus(key, data) {
  if (!data) return 'fail'
  if (!data.found) return 'fail'
  // For terms and privacy: must also not be blank
  if ((key === 'termsAndConditions' || key === 'privacyPolicy') && data.found && !data.notBlank) {
    return 'warning'
  }
  return 'pass'
}

function getStatusIcon(status) {
  if (status === 'pass') return '✓'
  if (status === 'warning') return '!'
  return '✗'
}

function getStatusText(key, data) {
  if (!data || !data.found) return 'Not found'
  if ((key === 'termsAndConditions' || key === 'privacyPolicy') && !data.notBlank) {
    return 'Found but appears empty'
  }
  return 'Found & accessible'
}

function getScore(checks) {
  if (!checks) return 0
  let total = 0
  let pass = 0
  for (const key of Object.keys(CHECK_META)) {
    total++
    const status = getCheckStatus(key, checks[key])
    if (status === 'pass') pass++
    else if (status === 'warning') pass += 0.5
  }
  return Math.round((pass / total) * 100)
}

function ScoreColor(score) {
  if (score >= 80) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

function ScoreLabel(score) {
  if (score >= 80) return { text: `${score}%`, color: '#10b981' }
  if (score >= 50) return { text: `${score}%`, color: '#f59e0b' }
  return { text: `${score}%`, color: '#ef4444' }
}

function CheckCard({ name, data, checkKey }) {
  const meta = CHECK_META[checkKey]
  const status = getCheckStatus(checkKey, data)
  const statusText = getStatusText(checkKey, data)

  const iconBg = status === 'pass' ? 'green' : status === 'warning' ? 'orange' : 'red'

  return (
    <div className={`check-card ${status}`}>
      <div className="check-header">
        <div className={`check-icon-wrap ${iconBg}`}>
          {meta.icon}
        </div>
        <div className="check-info">
          <div className="check-name">{meta.label}</div>
          <div className={`check-status-text ${status}-text`}>{statusText}</div>
        </div>
        <div className={`check-status-icon ${status}`}>
          {getStatusIcon(status)}
        </div>
      </div>

      {data && data.found && data.url && (
        <>
          {(checkKey === 'termsAndConditions' || checkKey === 'privacyPolicy') && (
            <div className="not-blank-info">
              <span className={`not-blank-dot ${data.notBlank ? 'good' : 'bad'}`} />
              {data.notBlank ? 'Page has content' : 'Page appears to be blank or thin'}
            </div>
          )}
          <a
            className="check-link"
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            title={data.url}
          >
            🔗 {data.url}
          </a>
        </>
      )}

      {data && !data.found && data.error && (
        <div className="not-blank-info">
          <span className="not-blank-dot bad" />
          <span style={{ fontSize: '12px', color: '#64748b' }}>{data.error}</span>
        </div>
      )}
    </div>
  )
}

function VerificationCard({ label, icon, value, isMatch, statusText, subValue }) {
  return (
    <div className="v-card">
      <div className={`v-icon ${isMatch ? 'green' : 'red'}`} style={{ background: isMatch ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
        {icon}
      </div>
      <div className="v-info">
        <div className="v-label">{label}</div>
        <div className="v-value">
          {value || <span style={{ color: '#64748b', fontWeight: 400 }}>Not provided</span>}
        </div>
        {subValue && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{subValue}</div>}
      </div>
      <div className={`v-status ${isMatch ? 'match' : 'no-match'}`}>
        {isMatch ? 'Match' : 'No Match'}
      </div>
    </div>
  )
}

// ─── No Match Popup ──────────────────────────────────────────────────────────
function NoMatchPopup({ onClose }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="popup-icon">💡</div>
        <h3 className="popup-title">Minor Changes Needed</h3>
        <p className="popup-message">
          Koi bada issue nahi hai! Bas kuch chote changes karne ki zarurat hai.
          Report ko dhyan se review karein aur highlighted items ko fix kar dein.
        </p>
        <p className="popup-sub">
          These are small adjustments — nothing critical. Review the flagged items and make the necessary updates.
        </p>
        <button className="popup-close-btn" onClick={onClose}>
          Got it ✓
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [legalName, setLegalName] = useState('')
  const [phone, setPhone] = useState('')

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // No Match Popup
  const [showNoMatchPopup, setShowNoMatchPopup] = useState(false)

  // Send to AM
  const [showAMDropdown, setShowAMDropdown] = useState(false)
  const [selectedAM, setSelectedAM] = useState(null)
  const [sending, setSending] = useState(false)
  const [sendStatus, setSendStatus] = useState(null) // { type: 'success'|'error', message }

  const handleCheck = async () => {
    if (!url.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)
    setShowNoMatchPopup(false)
    setShowAMDropdown(false)
    setSelectedAM(null)
    setSendStatus(null)

    try {
      const resp = await fetch('https://website-checker-backend-rv7b.onrender.com/api/waba-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          email: email.trim(),
          displayName: displayName.trim(),
          legalName: legalName.trim(),
          phone: phone.trim()
        })
      })

      if (!resp.ok) {
        const err = await resp.json()
        if (err.validationErrors) {
          const fieldLabels = { url: 'URL', email: 'Email', displayName: 'Display Name', legalName: 'Legal Name', phone: 'Phone' }
          const messages = Object.entries(err.validationErrors)
            .map(([field, msg]) => `${fieldLabels[field] || field}: ${msg}`)
            .join('\n')
          throw new Error(messages)
        }
        throw new Error(err.error || 'Server error')
      }

      const data = await resp.json()
      setResult(data)
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        setError('Cannot connect to the checker server. Make sure the backend is running on port 5000.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // Check for "No Match" in verification results and show popup
  useEffect(() => {
    if (!result || !result.verification) return
    const v = result.verification
    const hasNoMatch =
      (v.domainEmail && !v.domainEmail.match) ||
      (v.displayName && !v.displayName.match) ||
      (v.legalName && !v.legalName.match)
    if (hasNoMatch) {
      setShowNoMatchPopup(true)
    }
  }, [result])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCheck()
  }

  const handleSendToAM = async () => {
    if (!selectedAM || !result) return
    setSending(true)
    setSendStatus(null)

    try {
      const score = result.checks ? getScore(result.checks) : 0
      const resp = await fetch('https://website-checker-backend-rv7b.onrender.com/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amEmail: selectedAM.email,
          amName: selectedAM.name,
          reportData: {
            url: result.url,
            isHttps: result.isHttps,
            copyrightName: result.copyrightName,
            score,
            checks: result.checks,
            verification: result.verification
          }
        })
      })

      const data = await resp.json()
      if (resp.ok) {
        setSendStatus({ type: 'success', message: `Report sent to ${selectedAM.name} (${selectedAM.email})` })
      } else {
        setSendStatus({ type: 'error', message: data.error || 'Failed to send report' })
      }
    } catch (err) {
      setSendStatus({ type: 'error', message: 'Failed to connect to server' })
    } finally {
      setSending(false)
    }
  }

  const score = result?.checks ? getScore(result.checks) : 0
  const scoreInfo = ScoreLabel(score)
  const scoreClass = ScoreColor(score)

  return (
    <>
      <Background3D />
      <div className="app glass-app">
        {/* No Match Popup */}
        {showNoMatchPopup && <NoMatchPopup onClose={() => setShowNoMatchPopup(false)} />}

        {/* Header */}
        <header className="header">
          <div className="logo-icon">🔍</div>
          <div className="header-text">
            <h1>Form Validation</h1>
            <p>Analyze any website for compliance & key pages</p>
          </div>
        </header>

        {/* Main */}
        <main className="main-content">
          {/* Hero */}
          <section className="hero">
            <div className="hero-badge">Deep Analysis & Verification</div>
            <h2 className="hero-title">
              Verify Website<br />
              <span className="gradient">Authenticity & Info</span>
            </h2>
            <p className="hero-subtitle">
              Enter the website details below to run deep verification checks.
            </p>
          </section>

          {/* Input */}
          <section className="input-section">
            <div className="input-grid">
              <div className="input-wrapper main-url">
                <span className="url-icon">🌐</span>
                <input
                  id="url-input"
                  className="url-input"
                  type="text"
                  placeholder="Target Website URL (e.g. example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <div className="input-wrapper">
                <span className="url-icon">📧</span>
                <input
                  className="url-input"
                  type="email"
                  placeholder="Domain Email (e.g. info@example.com)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="input-wrapper">
                <span className="url-icon">🏷️</span>
                <input
                  className="url-input"
                  type="text"
                  placeholder="Display Name (Search in Header/Footer)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="input-wrapper">
                <span className="url-icon">⚖️</span>
                <input
                  className="url-input"
                  type="text"
                  placeholder="Legal Name (Beside Copyright ©)"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="input-wrapper">
                <span className="url-icon">📱</span>
                <input
                  className="url-input"
                  type="tel"
                  placeholder="WhatsApp Phone Number (with Country Code e.g. +1234567890)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button
                id="check-btn"
                className="check-btn"
                onClick={handleCheck}
                disabled={loading || !url.trim()}
                style={{ padding: '16px 60px', borderRadius: '100px', margin: '0 auto' }}
              >
                {loading ? <><div className="btn-spinner" /> Analyzing…</> : <><span>⚡</span> Run Verification</>}
              </button>
            </div>

            {error && (
              <div className="error-banner" id="error-banner" style={{ whiteSpace: 'pre-wrap' }}>
                ⚠️ {error}
              </div>
            )}
          </section>

          {/* Loading */}
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner-large" />
              <div className="loading-text">Crawling & Verifying…</div>
              <div className="loading-sub">Checking domains, names, and page content</div>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <section className="results-section" id="results">
              {/* Summary Card */}
              <div className="summary-card">
                <div className="summary-header">
                  <div className="summary-url-info">
                    <h3>Analyzed URL</h3>
                    <div className="summary-url">{result.url}</div>
                  </div>
                  <div className={`https-badge ${result.isHttps ? 'secure' : 'insecure'}`}>
                    {result.isHttps ? '🔒 HTTPS Secure' : '⚠️ Not HTTPS'}
                  </div>
                </div>

                {/* Copyright */}
                <div className="copyright-info">
                  <span className="copyright-label">Detected © Owner:</span>
                  {result.copyrightName ? (
                    <span className="copyright-value">{result.copyrightName}</span>
                  ) : (
                    <span className="copyright-not-found">Not detected on this page</span>
                  )}
                </div>

                {/* Score */}
                {result.mainPageAccessible && (
                  <div className="score-section">
                    <div className="score-label">
                      <span>Page Compliance Score</span>
                      <span style={{ color: scoreInfo.color }}>{scoreInfo.text}</span>
                    </div>
                    <div className="score-bar">
                      <div
                        className={`score-fill ${scoreClass}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Verification Results */}
              {result.verification && (
                <>
                  <div className="section-title"><span>Verification Checks</span></div>
                  <div className="verification-grid">
                    <VerificationCard
                      label="Domain Email Match"
                      icon="📧"
                      value={email}
                      isMatch={result.verification.domainEmail.match}
                      subValue={result.verification.domainEmail.siteDomain ? `Site Domain: ${result.verification.domainEmail.siteDomain}` : null}
                    />
                    <VerificationCard
                      label="Display Name (Header/Footer)"
                      icon="🏷️"
                      value={displayName}
                      isMatch={result.verification.displayName.match}
                      subValue={result.verification.displayName.match ? "Found in site boundaries" : "Not found in header or footer"}
                    />
                    <VerificationCard
                      label="Legal Name (Copyright ©)"
                      icon="⚖️"
                      value={legalName}
                      isMatch={result.verification.legalName.match}
                      subValue={result.verification.legalName.match ? "Found beside © symbol" : "Not found near copyright notice"}
                    />
                    {phone && result.verification.whatsappActive && (
                      <VerificationCard
                        label="WhatsApp Action Link"
                        icon="💬"
                        value={phone}
                        isMatch={true}
                        subValue={<a href={result.verification.whatsappActive.link} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', pointerEvents: 'auto' }}>Open in WhatsApp Web (wa.me)</a>}
                      />
                    )}
                  </div>
                </>
              )}

              {/* Checks Grid */}
              <div className="section-title"><span>Standard Page Checks</span></div>
              {result.mainPageAccessible && result.checks && (
                <div className="checks-grid">
                  {Object.entries(CHECK_META).map(([key]) => (
                    <CheckCard
                      key={key}
                      checkKey={key}
                      data={result.checks[key]}
                    />
                  ))}
                </div>
              )}

              {/* ─── Send to Account Manager ─────────────────────────────── */}
              <div className="send-am-section">
                {!showAMDropdown ? (
                  <button
                    className="send-am-btn"
                    onClick={() => { setShowAMDropdown(true); setSendStatus(null); }}
                  >
                    📤 Send to Account Manager
                  </button>
                ) : (
                  <div className="am-dropdown-container">
                    <div className="am-dropdown-header">
                      <span>👤 Select Account Manager</span>
                      <button className="am-close-btn" onClick={() => { setShowAMDropdown(false); setSelectedAM(null); setSendStatus(null); }}>✕</button>
                    </div>

                    <div className="am-list">
                      {ACCOUNT_MANAGERS.map((am) => (
                        <div
                          key={am.email}
                          className={`am-option ${selectedAM?.email === am.email ? 'selected' : ''}`}
                          onClick={() => setSelectedAM(am)}
                        >
                          <div className="am-avatar">{am.name.charAt(0)}</div>
                          <div className="am-details">
                            <div className="am-name">{am.name}</div>
                            <div className="am-email">{am.email}</div>
                          </div>
                          {selectedAM?.email === am.email && <span className="am-check">✓</span>}
                        </div>
                      ))}
                    </div>

                    {selectedAM && (
                      <button
                        className="send-btn"
                        onClick={handleSendToAM}
                        disabled={sending}
                      >
                        {sending ? (
                          <><div className="btn-spinner" /> Sending…</>
                        ) : (
                          <>📧 Send Report to {selectedAM.name}</>
                        )}
                      </button>
                    )}

                    {sendStatus && (
                      <div className={`send-status ${sendStatus.type}`}>
                        {sendStatus.type === 'success' ? '✅' : '❌'} {sendStatus.message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
        </main>

        <footer className="footer">
          ©2026 Emmy Desai. All Rights Reserved.
        </footer>
      </div>
    </>
  )
}
