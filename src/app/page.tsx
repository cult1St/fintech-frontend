"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);

  return (
    <div id="landing-page-active">
      <nav className="land-nav">
        <div className="land-logo">
          Pay<span>Vault</span>
        </div>
        <div className="land-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <div className="guest-menu-container">
            <button
              className="btn-nav"
              onClick={() => setIsGuestMenuOpen(!isGuestMenuOpen)}
            >
              Menu
            </button>
            {isGuestMenuOpen && (
              <div className="guest-menu-dropdown">
                <Link href="/login" className="guest-menu-item">
                  Sign in
                </Link>
                <Link href="/register" className="guest-menu-item">
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      <section className="land-hero">
        <div>
          <div className="hero-tag">
            <svg
              width={12}
              height={12}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 1L3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4z" />
            </svg>
            Trusted by 12,000+ Nigerians
          </div>
          <h1 className="hero-h1">
            The smarter
            <br />
            way to
            <br />
            <span>manage money</span>
          </h1>
          <p className="hero-sub">
            Fund your wallet, buy airtime &amp; data, pay electricity and TV bills —
            all from one secure platform built for Nigeria.
          </p>
          <div className="hero-btns">
            <button
              className="btn-hero-primary"
              onClick={() => router.push("/register")}
            >
              Create free account
            </button>
            <button
              className="btn-hero-outline"
              onClick={() => router.push("/login")}
            >
              Sign in
            </button>
          </div>
          <div className="hero-trust">
            <div className="hero-trust-icon">
              <svg
                width={14}
                height={14}
                fill="none"
                viewBox="0 0 24 24"
                stroke="#1D9E75"
                strokeWidth="2.5"
              >
                <rect x={3} y={11} width={18} height={11} rx={2} />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            256-bit SSL encrypted &nbsp;·&nbsp; CBN licensed partners &nbsp;·&nbsp;
            Zero hidden fees
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start"
              }}
            >
              <div>
                <div className="hero-card-label">PayVault Wallet</div>
                <div className="hero-card-balance">₦ 247,850.00</div>
                <div className="hero-card-meta">CHIDI OKAFOR · PV-7829045</div>
              </div>
              <div style={{ fontSize: 22, opacity: "0.5" }}>🔐</div>
            </div>
            <div className="hero-card-chips">
              <div className="hero-chip">📱 Airtime</div>
              <div className="hero-chip">📡 Data</div>
              <div className="hero-chip">⚡ Bills</div>
              <div className="hero-chip">💸 Fund</div>
            </div>
            <div className="hero-mini-txs">
              <div className="hero-tx">
                <span>Wallet Top-up</span>
                <span className="hero-tx-credit">+₦50,000</span>
              </div>
              <div className="hero-tx">
                <span>MTN Airtime</span>
                <span className="hero-tx-debit">-₦500</span>
              </div>
              <div className="hero-tx">
                <span>IKEDC Electricity</span>
                <span className="hero-tx-debit">-₦5,000</span>
              </div>
            </div>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: "1rem",
              marginTop: "1rem",
              display: "flex",
              gap: 12,
              alignItems: "center"
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                background: "rgba(29,158,117,0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0
              }}
            >
              ✓
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                Transaction successful
              </div>
              <div style={{ fontSize: 12, opacity: "0.6", marginTop: 2 }}>
                DStv Compact renewed · ₦9,000 · Just now
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="land-stats">
        <div className="land-stats-inner">
          <div className="stat-item">
            <div className="stat-num">12K+</div>
            <div className="stat-lbl">Active users</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">₦48M+</div>
            <div className="stat-lbl">Transactions processed</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">99.9%</div>
            <div className="stat-lbl">Uptime reliability</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">4.8★</div>
            <div className="stat-lbl">User satisfaction</div>
          </div>
        </div>
      </div>
      <section className="land-features" id="features">
        <div className="section-tag">Everything you need</div>
        <h2 className="section-h2">Built for everyday financial life</h2>
        <p className="section-sub">
          From quick airtime top-ups to electricity payments — PayVault handles it
          all in seconds.
        </p>
        <div className="features-grid">
          <div className="feat-card">
            <div className="feat-icon">💸</div>
            <div className="feat-title">Instant wallet funding</div>
            <div className="feat-desc">
              Fund your wallet via Paystack — accept cards, bank transfers, and USSD
              instantly.
            </div>
          </div>
          <div className="feat-card">
            <div className="feat-icon">📱</div>
            <div className="feat-title">Airtime &amp; data</div>
            <div className="feat-desc">
              Buy airtime and data bundles for MTN, Airtel, Glo, and 9mobile at the
              best rates.
            </div>
          </div>
          <div className="feat-card">
            <div className="feat-icon">⚡</div>
            <div className="feat-title">Electricity tokens</div>
            <div className="feat-desc">
              Pay prepaid and postpaid bills for IKEDC, EKEDC, AEDC, EEDC and more
              providers.
            </div>
          </div>
          <div className="feat-card">
            <div className="feat-icon">📺</div>
            <div className="feat-title">TV &amp; cable</div>
            <div className="feat-desc">
              Renew DStv, GOtv, and Startimes subscriptions in seconds without
              leaving the app.
            </div>
          </div>
          <div className="feat-card">
            <div className="feat-icon">📊</div>
            <div className="feat-title">Transaction history</div>
            <div className="feat-desc">
              Full searchable history with filters, status tracking, and detailed
              receipts for every payment.
            </div>
          </div>
          <div className="feat-card">
            <div className="feat-icon">🔒</div>
            <div className="feat-title">Bank-grade security</div>
            <div className="feat-desc">
              256-bit encryption, 2FA, transaction PIN, and real-time login alerts
              keep your wallet safe.
            </div>
          </div>
        </div>
      </section>
      <section className="land-how" id="how">
        <div className="section-tag">Simple process</div>
        <h2 className="section-h2">Get started in 4 steps</h2>
        <div className="steps-row">
          <div className="step">
            <div className="step-num">1</div>
            <div className="step-title">Create account</div>
            <div className="step-desc">
              Register with your email and phone number
            </div>
            <div className="step-line" />
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <div className="step-title">Verify identity</div>
            <div className="step-desc">OTP verification &amp; basic KYC checks</div>
            <div className="step-line" />
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <div className="step-title">Fund wallet</div>
            <div className="step-desc">Add money via card or bank transfer</div>
            <div className="step-line" />
          </div>
          <div className="step">
            <div className="step-num">4</div>
            <div className="step-title">Pay anything</div>
            <div className="step-desc">Airtime, data, bills &amp; more</div>
          </div>
        </div>
      </section>
      <section className="land-cta">
        <div className="cta-box">
          <h2 className="cta-h2">Ready to simplify your finances?</h2>
          <p className="cta-sub">
            Join thousands of Nigerians already using PayVault daily.
          </p>
          <button
            className="btn-cta"
            onClick={() => router.push("/register")}
          >
            Create free account — it's instant
          </button>
        </div>
      </section>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="land-footer">
          <div className="land-logo" style={{ fontSize: 16 }}>
            Pay<span>Vault</span>
          </div>
          <div className="footer-copy">
            © 2025 PayVault Technologies. All rights reserved.
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            Secured · Licensed · Trusted
          </div>
        </div>
      </div>
    </div>

  );
}