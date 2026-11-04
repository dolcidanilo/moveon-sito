/* Dati del progetto Sanity. Non sono segreti: identificano solo dove stanno i contenuti.
   Si possono sovrascrivere con le variabili d'ambiente su Vercel, se un giorno servisse un altro progetto. */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'vs8r2mfn';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const apiVersion = '2025-10-01';
