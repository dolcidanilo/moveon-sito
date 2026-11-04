'use client';

import { Box, Button, Card, Flex, Stack, Text } from '@sanity/ui';
import { set, unset, useFormValue, type StringInputProps } from 'sanity';

const contaParole = (s?: string) => (s ?? '').trim().split(/\s+/).filter(Boolean).length;
const contaFrasi = (s?: string) => (s ?? '').split(/[.!?]+(?:\s|$)/).map((x) => x.trim()).filter(Boolean).length;

type Limiti = { max?: number; maxParole?: number; maxFrasi?: number };

/** Campo di testo con contatore sotto (caratteri, parole o frasi). */
export function ContatoreInput(props: StringInputProps) {
  const l = (props.schemaType.options ?? {}) as Limiti;
  const v = typeof props.value === 'string' ? props.value : '';
  const parti: { testo: string; oltre: boolean }[] = [];
  if (l.max) parti.push({ testo: `${v.length} / ${l.max} caratteri`, oltre: v.length > l.max });
  if (l.maxParole) parti.push({ testo: `${contaParole(v)} / ${l.maxParole} parole`, oltre: contaParole(v) > l.maxParole });
  if (l.maxFrasi) parti.push({ testo: `${contaFrasi(v)} / ${l.maxFrasi} frasi`, oltre: contaFrasi(v) > l.maxFrasi });
  const oltre = parti.some((p) => p.oltre);
  return (
    <Stack gap={2}>
      {props.renderDefault(props)}
      <Text size={1} muted={!oltre} style={oltre ? { color: 'var(--card-badge-caution-fg-color, #b45309)' } : undefined}>
        {parti.map((p) => p.testo).join(' · ')}
        {oltre ? ' · oltre il consigliato' : ''}
      </Text>
    </Stack>
  );
}

/** Scelta della parola sottolineata in giallo, tra le parole del titolo della hero. */
export function ParolaInput(props: StringInputProps) {
  const titolo = useFormValue(['titolo']) as string | undefined;
  const parole = (titolo ?? '').split(/\s+/).filter(Boolean);
  const scelta = props.value;
  return (
    <Stack gap={3}>
      {parole.length ? (
        <Flex wrap="wrap" gap={2}>
          {parole.map((w, i) => (
            <Button
              key={`${w}-${i}`}
              text={w}
              mode={w === scelta ? 'default' : 'ghost'}
              tone={w === scelta ? 'primary' : 'default'}
              onClick={() => props.onChange(set(w))}
              disabled={props.readOnly}
            />
          ))}
          <Button text="Nessuna" mode="bleed" onClick={() => props.onChange(unset())} disabled={props.readOnly} />
        </Flex>
      ) : (
        <Text size={1} muted>Scrivi prima il titolo principale: qui compariranno le sue parole.</Text>
      )}
      {scelta && !parole.includes(scelta) ? (
        <Card padding={3} radius={2} tone="caution">
          <Text size={1}>La parola «{scelta}» non è più nel titolo: scegline un’altra.</Text>
        </Card>
      ) : null}
    </Stack>
  );
}

/** Descrizione per Google con anteprima di come appare nei risultati di ricerca. */
export function AnteprimaGoogleInput(props: StringInputProps) {
  const titolo = (useFormValue(['seoTitolo']) as string | undefined) || 'Titolo della pagina';
  const descr = (typeof props.value === 'string' && props.value) || 'Qui comparirà la descrizione.';
  const tronca = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
  return (
    <Stack gap={3}>
      <ContatoreInput {...props} />
      <Card padding={4} radius={3} shadow={1} tone="default">
        <Stack gap={2}>
          <Text size={1} muted>Anteprima su Google</Text>
          <Text size={1} style={{ color: '#4d5156' }}>moveonstudio.it</Text>
          <Text size={3} style={{ color: '#1a0dab' }}>{tronca(titolo, 60)}</Text>
          <Box>
            <Text size={1} style={{ color: '#4d5156', lineHeight: 1.5 }}>{tronca(descr, 160)}</Text>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
