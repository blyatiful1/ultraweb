export function Hero({ configured }: { configured: boolean }) {
  return (
    <header>
      <h1>Closed books, not seats.</h1>
      <a href="/shop">Browse the roasts</a>
      {configured ? null : <p>Shop opens soon.</p>}
    </header>
  );
}
