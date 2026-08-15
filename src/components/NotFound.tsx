import { Link } from "@tanstack/react-router";

/**
 * The 404 in the same voice as the hero's signature: a large serif
 * mark grounded on a hairline rule, a small tracked caption — stated
 * plainly, no illustration. "無" (mu, "nothing") stands in for the
 * missing page the way "完" closes the footer's colophon.
 */
export function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-8 text-center sm:px-16">
      <span aria-hidden="true" className="font-serif text-sm text-taupe">
        無
      </span>

      <h1 className="mt-2 font-serif text-6xl leading-none text-ink sm:text-8xl">404</h1>

      <div aria-hidden="true" className="mt-6 h-px w-44 bg-stone sm:mt-8 sm:w-56" />

      <p className="mt-4 text-xs tracking-[0.3em] text-taupe uppercase sm:text-sm">
        Page introuvable
      </p>

      <Link
        to="/"
        className="mt-10 text-xs tracking-[0.3em] text-taupe uppercase transition-colors hover:text-clay"
      >
        Retour à l'accueil →
      </Link>
    </div>
  );
}
