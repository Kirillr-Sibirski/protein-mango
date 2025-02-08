import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
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
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Protein Mango. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}