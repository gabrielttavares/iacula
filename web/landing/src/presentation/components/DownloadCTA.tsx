export interface DownloadCtaModel {
  kind: 'download' | 'fallback';
  label: string;
  href: string;
}

interface DownloadCTAProps {
  cta: DownloadCtaModel;
}

export function DownloadCTA({ cta }: DownloadCTAProps) {
  return (
    <a className="cta-primary" href={cta.href}>
      {cta.label}
    </a>
  );
}
