export interface DownloadCtaModel {
  kind: 'download' | 'fallback';
  label: string;
  href: string;
}

interface DownloadCTAProps {
  cta: DownloadCtaModel;
  size?: 'sm' | 'lg';
}

export function DownloadCTA({ cta, size = 'lg' }: DownloadCTAProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-serif font-semibold tracking-[0.18em] uppercase transition-colors duration-200 border';

  const sizes =
    size === 'lg'
      ? 'min-h-11 px-6 py-3 text-[0.68rem] sm:px-8'
      : 'min-h-10 px-4 py-2 text-[0.64rem]';

  const style =
    'border-[var(--color-accent)] bg-[var(--color-accent)] text-[#fffaf0] hover:bg-[var(--color-accent-strong)] hover:border-[var(--color-accent-strong)]';

  return (
    <a
      href={cta.href}
      className={`${base} ${sizes} ${style}`}
      aria-label={cta.label}
    >
      {cta.label}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </a>
  );
}
