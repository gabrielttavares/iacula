import { DownloadCTA, DownloadCtaModel } from './DownloadCTA';

interface HeroProps {
  cta: DownloadCtaModel;
}

export function Hero({ cta }: HeroProps) {
  return (
    <section aria-label="Apresentação do Iacula">
      <h1>Iacula</h1>
      <p>
        Um auxílio simples para cultivar a presença de Deus no cotidiano, com jaculatórias
        e lembretes discretos ao longo do dia.
      </p>
      <DownloadCTA cta={cta} />
    </section>
  );
}
