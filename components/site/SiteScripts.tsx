'use client';

import { useEffect } from 'react';
import { initSite } from './site-motion';

export type SiteData = {
  progetti: {
    nome: string;
    areaLabel: string;
    tipo: string;
    copertina: { url: string; alt: string; pos: string };
    galleria: { url: string; alt: string; width?: number; height?: number }[];
    richiesta: string;
    lavoro: string;
    risultato: string;
  }[];
};

/** Avvia animazioni e comportamenti dopo il caricamento della pagina. */
export default function SiteScripts({ data }: { data: SiteData }) {
  useEffect(() => {
    initSite(data);
  }, [data]);
  return null;
}
