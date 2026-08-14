import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-start justify-center gap-4">
      <p className="text-sm text-taupe">404</p>
      <h1 className="text-2xl font-semibold">Page introuvable</h1>
      <Link
        to="/"
        className="text-sm text-clay underline underline-offset-4 transition-colors hover:text-ink"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
