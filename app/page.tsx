"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EngagementFramePlayer from "../components/EngagementFramePlayer";

export default function Home() {
  const [verified, setVerified] = useState(false);
  const [paid, setPaid] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  const [showBrandText, setShowBrandText] = useState(false);
  const [pauseAnimation, setPauseAnimation] = useState(false);
  const [hidingText, setHidingText] = useState(false);

  useEffect(() => {
    try {
      setVerified(window.localStorage.getItem("vardhman_mobile_verified") === "true");
      setPaid(window.localStorage.getItem("vardhman_paid") === "true");
    } catch {
      setVerified(false);
      setPaid(false);
    }
  }, []);

  useEffect(() => {
    const checkScreenWidth = () => {
      const width = window.innerWidth;
      setShowAnimation(width < 480 || width >= 980);
    };

    checkScreenWidth();
    window.addEventListener("resize", checkScreenWidth);
    return () => window.removeEventListener("resize", checkScreenWidth);
  }, []);

  useEffect(() => {
    if (showBrandText) {
      // Text appears from 1s to 2.2s (1.2s duration)
      // Text stays visible for same duration (1.2s) until 3.4s
      // Blur out starts at 3.4s and lasts 3s until 6.4s
      const hideTimer = setTimeout(() => {
        setHidingText(true);
      }, 3400);

      const resumeTimer = setTimeout(() => {
        setShowBrandText(false);
        setPauseAnimation(false);
        setHidingText(false);
      }, 6400);

      return () => {
        clearTimeout(hideTimer);
        clearTimeout(resumeTimer);
      };
    }
  }, [showBrandText]);

  const registerHref = paid ? "/dashboard" : "/register";
  const registerLabel = paid ? "Go to Dashboard" : verified ? "Continue filling the form" : "Register Now";

  return (
    <main className="siteShell">
      <section className="hero" aria-label="Vardhman Matrimonials landing page">
        <div className="motif motifOne" aria-hidden="true" />
        <div className="motif motifTwo" aria-hidden="true" />
        <div className="particle particleOne" aria-hidden="true" />
        <div className="particle particleTwo" aria-hidden="true" />
        <div className="particle particleThree" aria-hidden="true" />

        <header className="navbar">
          <Link className="brand" href="/" aria-label="Vardhman Matrimonials home">
            <span className="brandMark">VM</span>
            <span>Vardhman Matrimonials</span>
          </Link>

          <nav className="navLinks" aria-label="Primary navigation">
            <a href="mailto:hello@vardhmanmatrimonials.com?subject=About%20Vardhman%20Matrimonials">About</a>
            <a href="mailto:hello@vardhmanmatrimonials.com?subject=Process%20Inquiry">Process</a>
            <a href="mailto:hello@vardhmanmatrimonials.com?subject=Contact%20Vardhman%20Matrimonials">Contact</a>
          </nav>
        </header>

        <div className="heroGrid">
          <div className="heroCopy">
            <p className="brandKicker">VARDHMAN MATRIMONIALS</p>
            <span className="goldDivider" aria-hidden="true" />
            <h1>
              Find a Trusted
              <span>Life Partner</span>
            </h1>
            <p className="subheading">
              Verified profiles.
              <br />
              Personal matchmaking assistance.
              <br />
              One-time registration {"\u20B9"}250.
            </p>

            <div className="heroActions" aria-label="Registration actions">
              <Link className="buttonPrimary" href={registerHref}>
                {registerLabel}
              </Link>
              <Link className="buttonSecondary" href="/profiles">
                Browse Profiles
              </Link>
            </div>
          </div>

          {showAnimation && (
            <div className="illustrationPanel" aria-label="Animated matrimonial illustration">
              <div className="heartIcon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path d="M12 20.4s-7.1-4.3-9.4-8.5C.8 8.7 2.5 5 6.2 5c2 0 3.3 1.1 3.9 2.1C10.7 6.1 12 5 14 5c3.7 0 5.4 3.7 3.6 6.9C19.1 16.1 12 20.4 12 20.4Z" />
                </svg>
              </div>
              <EngagementFramePlayer
                className="animationFramePlayer"
                basePath="/ezgif-2a8ae843605b09e2-jpg"
                frameCount={36}
                durationSeconds={2.5}
                framePrefix="ezgif-frame-"
                frameNumberPadding={3}
                fit="cover"
                alt="Vardhman Matrimonials animated wedding illustration"
                onLoopComplete={() => {
                  setShowBrandText(true);
                  setPauseAnimation(true);
                }}
                paused={pauseAnimation}
              />
              {showBrandText && (
                <div className={`brandTextContainer ${hidingText ? 'hiding' : ''}`}>
                  <span className="brandWord vardhman">Vardhman</span>
                  <span className="brandWord matrimonials">Matrimonials</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
