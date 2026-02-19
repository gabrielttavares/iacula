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
    'inline-flex items-center justify-center gap-2 font-serif font-semibold tracking-[0.18em] uppercase transition-colors duration-200 border rounded-xl';

  const sizes =
    size === 'lg'
      ? 'min-h-11 px-6 py-3 text-[0.68rem] sm:px-8'
      : 'min-h-10 px-4 py-2 text-[0.64rem]';

  const style =
    'border-[var(--color-accent)] bg-[var(--color-accent)] text-[#fffaf0] hover:bg-[var(--color-accent-strong)] hover:border-[var(--color-accent-strong)]';

  const platformIcon = (() => {
    const normalizedLabel = cta.label.toLowerCase();

    if (cta.kind !== 'download') {
      return (
        <svg
          data-testid="platform-icon-fallback"
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
      );
    }

    if (normalizedLabel.includes('mac')) {
      return (
        <svg
          data-testid="platform-icon-macos"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M16.02 7.8c.77-.93 1.2-2.1 1.13-3.3-1.08.06-2.38.72-3.15 1.64-.7.82-1.25 2.06-1.1 3.23 1.18.1 2.37-.6 3.12-1.57zM20.1 17.3c-.37.84-.8 1.63-1.3 2.37-.7 1.03-1.5 2.33-2.56 2.35-1 .02-1.31-.64-2.68-.64s-1.72.62-2.65.66c-1.03.04-1.82-1.05-2.52-2.07-1.45-2.09-2.56-5.92-1.07-8.48.74-1.27 2.08-2.07 3.53-2.09.98-.02 1.9.68 2.68.68.77 0 2.02-.84 3.4-.72.58.02 2.22.24 3.27 1.8-.08.05-1.95 1.14-1.93 3.4.02 2.7 2.36 3.6 2.39 3.62-.02.07-.37 1.08-.76 1.92z" />
        </svg>
      );
    }

    if (normalizedLabel.includes('windows')) {
      return (
        <svg
          data-testid="platform-icon-windows"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M2 4.5l9-1.3v8.1H2V4.5zm10 6.8V3.1L22 1.7v9.6h-10zM2 12.7h9v8.1l-9-1.2v-6.9zm10 8.2v-8.2h10v9.6L12 20.9z" />
        </svg>
      );
    }

    if (normalizedLabel.includes('linux')) {
      return (
        <svg
          data-testid="platform-icon-linux"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2c-2 0-3.5 1.6-3.5 3.7v2.3c0 1.1-.3 2.2-.8 3.2L6.6 13c-.7 1.4-.6 3.1.2 4.4l1.2 1.8c.7 1 1.9 1.6 3.1 1.6h1.8c1.2 0 2.4-.6 3.1-1.6l1.2-1.8c.8-1.3.9-3 .2-4.4l-1.1-1.8c-.6-1-.8-2.1-.8-3.2V5.7C15.5 3.6 14 2 12 2zm-1.6 5.2c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9zm3.2 0c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9z" />
        </svg>
      );
    }

    return (
      <svg
        data-testid="platform-icon-fallback"
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
    );
  })();

  return (
    <a
      href={cta.href}
      className={`${base} ${sizes} ${style}`}
      aria-label={cta.label}
    >
      {cta.label}
      {platformIcon}
    </a>
  );
}
