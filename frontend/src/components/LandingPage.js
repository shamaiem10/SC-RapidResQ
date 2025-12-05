import React from "react";
import "./LandingPage.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const LandingPage = () => {
  return (
    <div className="lp-container">

      {/* NAVBAR */}
      <nav className="lp-navbar">
        <div className="lp-logo">
          <i className="bi-shield-check lp-logo-icon"></i>
          <span>RapidResQ</span>
        </div>

        <div className="lp-nav-right">
          <button className="lp-login">Login</button>
          <button className="lp-signup">Sign Up</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="lp-hero">
        <div className="lp-badge">
          <i className="bi-check-circle"></i> Trusted by thousands in emergencies
        </div>

        <h1 className="lp-title">
          Emergency Help at Your <br />
          <span className="lp-title-red">Fingertips</span>
        </h1>

        <p className="lp-subtitle">
          RapidResQ provides instant access to emergency services, first aid
          guides, <br />
          and community support when every second counts.
        </p>

        <div className="lp-hero-buttons">
          <button className="lp-btn-primary">Get Started Free →</button>
          <button className="lp-btn-secondary">View Demo</button>
        </div>
      </section>

      {/* STATS */}
      <div className="lp-stats">
        <div><span>24/7</span><br />Available</div>
        <div><span>100+</span><br />Emergency Guides</div>
        <div><span>50+</span><br />Cities Covered</div>
        <div><span>10K+</span><br />Lives Helped</div>
      </div>

      {/* FEATURES */}
      <section className="lp-features-section">
        <h2 className="lp-features-title">Everything You Need in an Emergency</h2>
        <p className="lp-features-sub">
          From instant emergency calls to AI-powered guidance, RapidResQ has you covered.
        </p>

        <div className="lp-features-grid">

          <div className="lp-feature-card">
            <i className="bi-speedometer2 lp-feature-icon"></i>
            <h3>Emergency Dashboard</h3>
            <p>Quick access to all emergency services</p>
          </div>

          <div className="lp-feature-card">
            <i className="bi-telephone-inbound lp-feature-icon"></i>
            <h3>Emergency Numbers</h3>
            <p>Instant dial for ambulance, police, fire</p>
          </div>

          <div className="lp-feature-card">
            <i className="bi-heart-pulse lp-feature-icon"></i>
            <h3>First Aid Library</h3>
            <p>Step-by-step medical guidance</p>
          </div>

          <div className="lp-feature-card">
            <i className="bi-people lp-feature-icon"></i>
            <h3>Community Help</h3>
            <p>Connect with local volunteers</p>
          </div>

          <div className="lp-feature-card">
            <i className="bi-geo-alt lp-feature-icon"></i>
            <h3>Safety Maps</h3>
            <p>Find safe routes and shelters</p>
          </div>

          <div className="lp-feature-card">
            <i className="bi-robot lp-feature-icon"></i>
            <h3>AI Assistant</h3>
            <p>Voice-activated emergency help</p>
          </div>

        </div>
      </section>

      {/* CTA SECTION */}
      <section className="lp-cta">
        <h2>Ready to Stay Prepared?</h2>
        <p>Join thousands who trust RapidResQ for emergency preparedness.</p>
        <button className="lp-cta-btn">Create Free Account →</button>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-logo">
          <i className="bi-shield-check lp-logo-icon"></i>
          RapidResQ
        </div>
        <p>© 2024 RapidResQ. Saving lives, one emergency at a time.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
