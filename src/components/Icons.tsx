import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 18): SVGProps<SVGSVGElement> => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
});

export const Arrow = ({ size = 17, ...p }: P) => (
  <svg {...base(size)} className="arr" {...p}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);
export const ArrowUpRight = ({ size = 17, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M7 17 17 7" /><path d="M8 7h9v9" /></svg>
);
export const Plus = ({ size = 16, ...p }: P) => (<svg {...base(size)} strokeWidth={2} {...p}><path d="M12 5v14M5 12h14" /></svg>);
export const Minus = ({ size = 16, ...p }: P) => (<svg {...base(size)} strokeWidth={2} {...p}><path d="M5 12h14" /></svg>);
export const Check = ({ size = 16, ...p }: P) => (<svg {...base(size)} strokeWidth={2.2} {...p}><path d="M20 6 9 17l-5-5" /></svg>);
export const Cross = ({ size = 16, ...p }: P) => (<svg {...base(size)} strokeWidth={2} {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>);
export const Info = ({ size = 18, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>);
export const Clock = ({ size = 17, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
export const Users = ({ size = 17, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7" /><path d="M18 14c2.2.6 3.5 2.8 3.5 6" /></svg>);
export const Plate = ({ size = 17, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /></svg>);
export const Moon = ({ size = 19, ...p }: P) => (<svg {...base(size)} className="moon" {...p}><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" /></svg>);
export const Sun = ({ size = 19, ...p }: P) => (
  <svg {...base(size)} className="sun" {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
export const Burger = ({ size = 22, ...p }: P) => (<svg {...base(size)} strokeWidth={1.6} {...p}><path d="M4 8h16M4 16h16" /></svg>);
export const Globe = ({ size = 16, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" /></svg>);
export const Chevron = ({ size = 14, ...p }: P) => (<svg {...base(size)} strokeWidth={2} {...p}><path d="m6 9 6 6 6-6" /></svg>);
export const Moon2 = Moon;
export const Bed = ({ size = 16, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3 18v-8M21 18v-5a3 3 0 0 0-3-3h-8v8" /><path d="M3 14h18" /><circle cx="6.5" cy="10.5" r="1.5" /></svg>);
export const Calendar = ({ size = 16, ...p }: P) => (<svg {...base(size)} {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>);
export const Pin = ({ size = 16, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>);
export const Mail = ({ size = 17, ...p }: P) => (<svg {...base(size)} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>);
export const Phone = ({ size = 17, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" /></svg>);
export const Printer = ({ size = 16, ...p }: P) => (<svg {...base(size)} {...p}><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M6 14h12v7H6z" /></svg>);
export const LinkIc = ({ size = 16, ...p }: P) => (<svg {...base(size)} {...p}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>);
export const Shield = ({ size = 22, ...p }: P) => (<svg {...base(size)} strokeWidth={1.4} {...p}><path d="M12 2 4 5.5v6c0 5 3.4 9 8 10.5 4.6-1.5 8-5.5 8-10.5v-6L12 2z" /><path d="m9 12 2 2 4-4" /></svg>);

export const WhatsApp = ({ size = 26, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
  </svg>
);
export const Telegram = ({ size = 24, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M21.9 4.6 18.8 19c-.2 1-.8 1.3-1.7.8l-4.6-3.4-2.2 2.1c-.2.2-.5.5-1 .5l.3-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2L6.9 13 2.3 11.6c-1-.3-1-1 .2-1.5L20.5 3.2c.8-.3 1.6.2 1.4 1.4z" />
  </svg>
);

/** Emblème : arc d'iwan — portail de médersa stylisé. */
export const Mark = ({ size = 30 }: { size?: number }) => (
  <svg className="brand__mark" width={size} height={size * 1.18} viewBox="0 0 34 40" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M17 2c6.6 0 11 4.9 11 11.5V38H6V13.5C6 6.9 10.4 2 17 2z" />
    <path d="M17 38V24c0-2.5 1.6-4 3.6-4S24 21.5 24 24v14" />
    <path d="M10 38V24c0-2.5 1.6-4 3.6-4" />
    <path d="M17 7.5l1.1 2.4 2.4-1-1 2.4 2.4 1.1-2.4 1.1 1 2.4-2.4-1L17 17.3l-1.1-2.4-2.4 1 1-2.4-2.4-1.1 2.4-1.1-1-2.4 2.4 1z" strokeWidth={1} />
  </svg>
);
