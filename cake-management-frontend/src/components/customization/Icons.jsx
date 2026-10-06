import { Cake } from "lucide-react";

/** SweetCakes logo mark: a tiered cake with candles. */
export function LogoMark({ size = 46 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <g stroke="#ff2d6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 5v3M16 8v3M32 8v3" />
        <path d="M16 13a1.4 1.4 0 0 1 0-2.6M24 10a1.4 1.4 0 0 1 0-2.6M32 13a1.4 1.4 0 0 1 0-2.6" />
        <path d="M12 20h24v6H12zM8 26h32v6H8zM6 32h36v9H6z" />
        <path d="M12 26c2 2 4 2 6 0s4-2 6 0 4 2 6 0 4-2 6 0" />
        <path d="M6 37c2 2 4 2 6 0s4-2 6 0 4 2 6 0 4-2 6 0 4 2 6 0" />
      </g>
    </svg>
  );
}

export { Cake };
