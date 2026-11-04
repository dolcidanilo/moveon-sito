import { CaseIcon, CogIcon, HomeIcon } from './icons';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import type { StructureResolver } from 'sanity/structure';
import { BLOCCHI_TIPI, ICONE_BLOCCHI } from './schemaTypes/blocchi';

/** Menu del pannello, nell'ordine in cui si lavora: pagina, blocchi, portfolio, impostazioni. */
export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Contenuti')
    .items([
      S.listItem()
        .title('Ordine e visibilità dei blocchi')
        .id('pagina')
        .icon(HomeIcon)
        .child(S.document().schemaType('pagina').documentId('pagina').title('Ordine e visibilità dei blocchi')),
      S.divider(),
      ...BLOCCHI_TIPI.map((t) =>
        S.listItem()
          .title(t.title ?? t.name)
          .id(t.name)
          .icon(ICONE_BLOCCHI[t.name])
          .child(S.document().schemaType(t.name).documentId(t.name).title(t.title ?? t.name)),
      ),
      S.divider(),
      orderableDocumentListDeskItem({ type: 'progetto', title: 'Portfolio: progetti', icon: CaseIcon, S, context }),
      S.divider(),
      S.listItem()
        .title('Impostazioni generali')
        .id('impostazioni')
        .icon(CogIcon)
        .child(S.document().schemaType('impostazioni').documentId('impostazioni').title('Impostazioni generali')),
    ]);
