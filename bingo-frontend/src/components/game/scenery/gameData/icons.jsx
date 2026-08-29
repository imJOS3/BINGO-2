const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

export function UsersIcon({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} className={className} {...base}>
      <path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
      <circle cx="9" cy="7" r="3.2" />
      <path d="M17 11.2A3.2 3.2 0 0 0 17 4.8" />
      <path d="M22 20v-1.2a3.6 3.6 0 0 0-2.8-3.5" />
    </svg>
  );
}

export function ChartIcon({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} className={className} {...base}>
      <path d="M4 20h16" />
      <path d="M7 20v-6" />
      <path d="M12 20V6" />
      <path d="M17 20v-9" />
    </svg>
  );
}

export function MenuIcon({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} className={className} {...base}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function BoardIcon({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} className={className} {...base}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M3.5 9h17" />
      <path d="M9 9v11.5" />
      <path d="M15 9v11.5" />
    </svg>
  );
}

export function TargetIcon({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} className={className} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChatIcon({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} className={className} {...base}>
      <path d="M8 18.5 4.8 21V18.5H7.2A7.2 7.2 0 1 1 16.8 8.4 7.2 7.2 0 0 1 8 18.5Z" />
      <path d="M8.2 9.6h7.2M8.2 13h4.8" />
    </svg>
  );
}
