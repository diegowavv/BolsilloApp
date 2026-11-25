export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="18" fill="#6c5ce7" />
      <path d="M18 24c0-3.3 2.7-6 6-6h16c3.3 0 6 2.7 6 6v18c0 3.3-2.7 6-6 6H24c-3.3 0-6-2.7-6-6V24Z" fill="#fff" opacity=".95" />
      <path d="M18 27h28" stroke="#6c5ce7" strokeWidth="3" />
      <circle cx="39" cy="38" r="3.5" fill="#eda100" />
      <circle cx="29" cy="38" r="3.5" fill="#1baf7a" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="text-lg font-bold tracking-tight">Bolsillo</span>
    </span>
  );
}
