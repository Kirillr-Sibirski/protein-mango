import Image from "next/image";

export function Header() {
  return (
    <header className="bg-background border-b">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Protein Mango Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span 
              className="text-lg font-semibold text-[hsl(var(--accent))]"
              style={{ letterSpacing: "0.05em" }}
            >
              Protein Mango
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
}