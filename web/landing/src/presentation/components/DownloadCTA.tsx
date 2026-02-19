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
    'inline-flex items-center gap-2 font-serif font-bold tracking-wide uppercase transition-all duration-300 border';

  const sizes =
    size === 'lg'
      ? 'px-8 py-4 text-sm'
      : 'px-5 py-2.5 text-xs';

  const style =
    'border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-bg)]';

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
