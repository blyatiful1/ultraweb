import Link from "next/link";

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-6">
        <Link href="/" className="type-meta text-foreground">
          BLOCKOUT
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/maps" className="type-meta hover:text-foreground">
            Atlas
          </Link>
        </nav>
      </div>
    </header>
  );
}
