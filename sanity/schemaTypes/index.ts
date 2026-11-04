import { BLOCCHI_TIPI } from './blocchi';
import { impostazioni } from './impostazioni';
import { pagina } from './pagina';
import { progetto } from './progetto';

export const schemaTypes = [impostazioni, pagina, ...BLOCCHI_TIPI, progetto];

/** Documenti unici (uno solo per tipo): niente "crea nuovo", niente elimina o duplica. */
export const SINGOLI = ['impostazioni', 'pagina', ...BLOCCHI_TIPI.map((t) => t.name)];
