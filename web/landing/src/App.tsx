import { useEffect, useMemo, useState } from 'react';
import { buildDownloadCta } from './application/download/buildDownloadCta';
import { detectPlatform } from './domain/download/detectPlatform';
import { DownloadManifest } from './domain/download/types';
import { fetchManifest } from './infrastructure/manifest/fetchManifest';
import { DownloadCtaModel } from './presentation/components/DownloadCTA';
import { Hero } from './presentation/components/Hero';
import { SaintQuotes } from './presentation/components/SaintQuotes';
import { SettingsOverview } from './presentation/components/SettingsOverview';

const FALLBACK_RELEASES_URL = 'https://github.com/gabrielttavares/iacula/releases';
const DEFAULT_CTA: DownloadCtaModel = {
  kind: 'fallback',
  label: 'Ver downloads',
  href: FALLBACK_RELEASES_URL,
};

export default function App() {
  const [manifest, setManifest] = useState<DownloadManifest | null>(null);
  const [platform, setPlatform] = useState<'windows' | 'linux' | 'macos' | 'unknown'>('unknown');

  useEffect(() => {
    setPlatform(detectPlatform(navigator.userAgent));

    fetchManifest('/manifest.json')
      .then((resolvedManifest) => setManifest(resolvedManifest))
      .catch(() => {
        setManifest(null);
      });
  }, []);

  const cta = useMemo(() => {
    const fallbackUrl = manifest?.fallbackUrl || FALLBACK_RELEASES_URL;

    if (!manifest) {
      return {
        ...DEFAULT_CTA,
        href: fallbackUrl,
      };
    }

    return buildDownloadCta(manifest, platform, fallbackUrl);
  }, [manifest, platform]);

  return (
    <main>
      <Hero cta={cta} />
      <section aria-label="Propósito do app">
        <h2>Presença de Deus no cotidiano</h2>
        <p>
          O Iacula foi pensado para ajudar você a manter viva a oração breve no meio
          das tarefas normais do dia.
        </p>
      </section>
      <SaintQuotes />
      <SettingsOverview />
    </main>
  );
}
