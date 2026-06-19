const WORD = "Lucid";

// Server-rendered so it covers the first paint (no content flash).
// The whole animation, including the fade-out, runs purely in CSS.
export function IntroSplash() {
  return (
    <div className="intro-overlay" aria-hidden="true">
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
