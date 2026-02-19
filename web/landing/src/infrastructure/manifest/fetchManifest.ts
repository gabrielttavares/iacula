import { DownloadManifest } from '../../domain/download/types';

export async function fetchManifest(url: string): Promise<DownloadManifest> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Falha ao carregar manifesto');
  }

  const data = await response.json();
  if (!data?.version || !data?.assets) {
    throw new Error('Manifesto inválido');
  }

  return data as DownloadManifest;
}
