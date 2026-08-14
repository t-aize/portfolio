import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-start justify-center gap-4">
      <p className="text-sm text-neutral-500">404</p>
      <h1 className="text-2xl font-semibold">Page introuvable</h1>
      <Link to="/" className="text-sm underline underline-offset-4">
        Retour à l'accueil
      </Link>
    </div>
  );
}
