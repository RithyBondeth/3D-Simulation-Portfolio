/** A drawn monogram keeps the mark crisp at favicon and display sizes. */
export default function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`bondeth-mark ${className}`}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <rect className="bondeth-mark-tile" width="64" height="64" rx="18" />
      <path
        className="bondeth-mark-letter"
        d="M19 16v32h14c7 0 12-3 12-8s-5-8-12-8H19m0 0h13c6 0 10-3 10-8s-4-8-10-8h-5"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle className="bondeth-mark-dot" cx="49" cy="50" r="3.5" />
    </svg>
  );
}
