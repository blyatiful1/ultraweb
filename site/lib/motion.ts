// SYSTEM.md §motion — the only file besides globals.css where raw motion numbers exist.
export const dur = { micro: 0.18, small: 0.3, section: 0.56 } as const;

export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.83, 0, 0.17, 1],
  in: [0.64, 0, 0.78, 0],
} as const;

export const reveal = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: dur.section, ease: ease.out },
} as const;
