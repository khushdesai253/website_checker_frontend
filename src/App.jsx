import { useState } from 'react'
import './index.css'

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

export default function App() {
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [legalName, setLegalName] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleCheck = async () => {
    if (!url.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const resp = await fetch('https://website-checker-backend-rv7b.onrender.com/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: url.trim(),
          email: email.trim(),
          displayName: displayName.trim(),
          legalName: legalName.trim()
        })
      })

      if (!resp.ok) {
        const err = await resp.json()
        throw new Error(err.error || 'Server error')
      }

      const data = await resp.json()
      setResult(data)
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        setError(err)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCheck()
  }

  const score = result?.checks ? getScore(result.checks) : 0
  const scoreInfo = ScoreLabel(score)
  const scoreClass = ScoreColor(score)

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo-icon">🔍</div>
        <div className="header-text">
          <h1>WebSite Checker</h1>
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
            <div className="error-banner" id="error-banner">
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
          </section>
        )}
      </main>

      <footer className="footer">
        Website Checker — Built with React &amp; Node.js
      </footer>
    </div>
  )
}
