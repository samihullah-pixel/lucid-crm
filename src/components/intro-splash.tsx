"use client";

import { useEffect, useState } from "react";

const WORD = "Lucid";

export function IntroSplash() {
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("lucid-intro-seen")) return;
    sessionStorage.setItem("lucid-intro-seen", "1");
    setShow(true);

    const doneTimer = setTimeout(() => setDone(true), 2000);
    const removeTimer = setTimeout(() => setShow(false), 3500);
    return () => {
      clearTimeout(doneTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`intro-overlay${done ? " intro-done" : ""}`} aria-hidden="true">
      <div className="intro-word">
        {WORD.split("").map((ch, i) => (
          <span
            key={i}
            className="intro-letter"
            style={{ animationDelay: `${200 + i * 90}ms` }}
          >
            {ch}
          </span>
        ))}
        <span className="intro-star">*</span>
      </div>
      <div className="intro-line" />
      <div className="intro-tagline">Cleaning Services</div>
    </div>
  );
}
