/* Layout del pannello contenuti: separato da quello del sito, così stili e animazioni del sito non lo toccano. */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
