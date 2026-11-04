'use client';

import { Box, Button, Card, Checkbox, Container, Flex, Heading, Spinner, Stack, Text } from '@sanity/ui';
import { useCallback, useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { seed } from '@/lib/content/seed';
import { apiVersion } from '../env';
import { documentiDaSeed } from './fromSeed';

/**
 * Strumento "Importa contenuti iniziali": copia nel pannello i testi e le foto del prototipo approvato.
 * Gira nel browser con l'accesso di chi è collegato al pannello, quindi non servono chiavi segrete.
 */
export function ImportTool() {
  const client = useClient({ apiVersion });
  const [presenti, setPresenti] = useState<string[] | null>(null);
  const [sostituisci, setSostituisci] = useState(false);
  const [stato, setStato] = useState<'pronto' | 'lavoro' | 'fatto' | 'errore'>('pronto');
  const [log, setLog] = useState<string[]>([]);
  const scrivi = (r: string) => setLog((l) => [...l, r]);

  const controlla = useCallback(async () => {
    const ids: string[] = await client.fetch(
      `*[_id in $singoli || _type == "progetto"]._id`,
      { singoli: ['impostazioni', 'pagina', 'hero', 'nastro', 'chiSiamo', 'pausa', 'servizi', 'portfolio', 'garanzie', 'contatti'] },
    );
    setPresenti(ids);
  }, [client]);

  useEffect(() => {
    controlla().catch(() => setPresenti([]));
  }, [controlla]);

  async function importa() {
    setStato('lavoro');
    setLog([]);
    try {
      const caricate = new Map<string, string>();
      const carica = async (url: string) => {
        if (caricate.has(url)) return caricate.get(url)!;
        const nome = url.split('/').pop() ?? 'immagine';
        scrivi(`Carico l’immagine ${nome}…`);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Non trovo l’immagine ${nome} (${res.status}).`);
        const asset = await client.assets.upload('image', await res.blob(), { filename: nome });
        caricate.set(url, asset._id);
        return asset._id;
      };
      const docs = await documentiDaSeed(seed, carica);
      scrivi(`Salvo ${docs.length} schede…`);
      const tx = client.transaction();
      docs.forEach((d) => (sostituisci ? tx.createOrReplace(d) : tx.createIfNotExists(d)));
      await tx.commit({ visibility: 'sync' });
      scrivi('Contenuti importati e pubblicati.');
      setStato('fatto');
      controlla();
    } catch (e) {
      scrivi(`Errore: ${e instanceof Error ? e.message : String(e)}`);
      setStato('errore');
    }
  }

  const giaPresenti = (presenti?.length ?? 0) > 0;

  return (
    <Container width={1} padding={5}>
      <Stack gap={5}>
        <Heading size={3}>Importa contenuti iniziali</Heading>
        <Text size={2} muted>
          Copia nel pannello i testi, le foto e i progetti di esempio del prototipo approvato. Serve una volta sola, all’inizio: dopo,
          modifichi tutto dalle voci del menu «Contenuti».
        </Text>

        {presenti === null ? (
          <Flex align="center" gap={3}><Spinner muted /><Text size={1} muted>Controllo cosa c’è già nel pannello…</Text></Flex>
        ) : giaPresenti ? (
          <Card padding={4} radius={3} tone="caution" border>
            <Stack gap={4}>
              <Text size={2}>
                Nel pannello ci sono già {presenti.length} schede. L’importazione aggiunge solo quelle che mancano e lascia come sono le
                altre.
              </Text>
              <Flex as="label" align="center" gap={3}>
                <Checkbox checked={sostituisci} onChange={(e) => setSostituisci(e.currentTarget.checked)} />
                <Text size={2}>Sostituisci anche le schede già presenti (le loro modifiche andranno perse)</Text>
              </Flex>
            </Stack>
          </Card>
        ) : (
          <Card padding={4} radius={3} tone="primary" border>
            <Text size={2}>Il pannello è vuoto: è il momento giusto per importare.</Text>
          </Card>
        )}

        <Box>
          <Button
            text={stato === 'lavoro' ? 'Importazione in corso…' : 'Importa contenuti iniziali'}
            tone={sostituisci ? 'critical' : 'primary'}
            fontSize={2}
            padding={4}
            disabled={stato === 'lavoro' || presenti === null}
            onClick={importa}
          />
        </Box>

        {log.length ? (
          <Card padding={4} radius={3} tone={stato === 'errore' ? 'critical' : stato === 'fatto' ? 'positive' : 'transparent'} border>
            <Stack gap={2}>
              {log.map((r, i) => <Text key={i} size={1}>{r}</Text>)}
            </Stack>
          </Card>
        ) : null}

        {stato === 'fatto' ? (
          <Text size={2}>
            Fatto! Apri la voce <b>Contenuti</b> in alto per vedere e modificare le schede. Le foto e i progetti sono quelli di esempio: sostituiscili
            con quelli definitivi quando li hai.
          </Text>
        ) : null}
        {stato === 'errore' ? (
          <Text size={2}>
            Qualcosa non è andato. Se il messaggio parla di «CORS», va aggiunto l’indirizzo del sito nelle impostazioni API di Sanity. Copia il
            messaggio e mandalo a chi ti segue.
          </Text>
        ) : null}
      </Stack>
    </Container>
  );
}
