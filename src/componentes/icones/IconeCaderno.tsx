/** Caderno com espiral. */
export function IconeCaderno() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <rect x="5" y="3" width="15" height="18" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <line x1="9" y1="8" x2="17" y2="8" stroke="currentColor" strokeWidth="1.4" />
      <line x1="9" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1.4" />
      <line x1="9" y1="16" x2="14" y2="16" stroke="currentColor" strokeWidth="1.4" />
      {[6, 10, 14, 18].map((y) => (
        <circle key={y} cx="5" cy={y} r="1.2" fill="currentColor" />
      ))}
    </svg>
  );
}
