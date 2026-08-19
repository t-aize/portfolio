export const locales = ["fr", "en"] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = "fr";

interface Dictionary {
  meta: {
    title: string;
    description: string;
  };
  hero: {
    subtitle: string;
  };
  rail: {
    up: string;
    down: string;
  };
  about: {
    eyebrow: string;
    paragraph: string;
  };
  projects: {
    eyebrow: string;
    github: string;
    private: string;
    descriptions: Record<string, string>;
  };
  contact: {
    eyebrow: string;
    open: string;
    descriptions: Record<string, string>;
  };
  footer: {
    contactAria: string;
    backToTop: string;
  };
  notFound: {
    title: string;
    caption: string;
    back: string;
  };
  langSwitch: {
    aria: string;
  };
}

export const dictionaries: Record<Lang, Dictionary> = {
  fr: {
    meta: {
      title: "Tom B. · Portfolio",
      description: "Portfolio de développeur backend.",
    },
    hero: {
      subtitle: "Développeur backend",
    },
    rail: {
      up: "Revenir en haut",
      down: "Découvrir la suite",
    },
    about: {
      eyebrow: "À propos",
      paragraph:
        "Étudiant en BTS SIO option SLAM, autodidacte en développement backend depuis plus de cinq ans. Je travaille surtout en TypeScript et Node.js, avec un faible pour les systèmes temps réel. La plupart des projets ci-dessous sont nés de cet intérêt plutôt que d'un besoin précis.",
    },
    projects: {
      eyebrow: "Projets",
      github: "GitHub ↗",
      private: "Privé",
      descriptions: {
        odm: "Monitoring réseau temps réel d'un site industriel : carte interactive, diagnostic ping ICMP, flux live SSE.",
        aurum:
          "Panel de trading terminal pour l'or (XAUUSD), ordres exécutés en direct via le MCP cTrader, structure de marché calculée en local.",
        zen: "Bot Discord multi-usage : modération, utilitaires, commandes chargées dynamiquement par catégorie.",
        borning:
          "Plateforme web pour le challenge multisport interne d'Alstom, développée en stage à Charleroi.",
      },
    },
    contact: {
      eyebrow: "Contact",
      open: "Ouvrir ↗",
      descriptions: {
        github: "Code, projets personnels, contributions.",
        linkedin: "Parcours, expériences, mises à jour.",
      },
    },
    footer: {
      contactAria: "Contact",
      backToTop: "Haut de page ↑",
    },
    notFound: {
      title: "404 · Tom B. · Portfolio",
      caption: "Page introuvable",
      back: "Retour à l'accueil →",
    },
    langSwitch: {
      aria: "Changer de langue",
    },
  },
  en: {
    meta: {
      title: "Tom B. · Portfolio",
      description: "Backend developer portfolio.",
    },
    hero: {
      subtitle: "Backend developer",
    },
    rail: {
      up: "Back to top",
      down: "Continue",
    },
    about: {
      eyebrow: "About",
      paragraph:
        "BTS SIO (SLAM) student, self-taught backend developer for over five years. I mostly work in TypeScript and Node.js, with a soft spot for real-time systems. Most of the projects below grew out of that interest rather than an actual need.",
    },
    projects: {
      eyebrow: "Projects",
      github: "GitHub ↗",
      private: "Private",
      descriptions: {
        odm: "Real-time network monitoring for an industrial site: interactive map, ICMP ping diagnostics, live SSE feed.",
        aurum:
          "Terminal trading panel for gold (XAUUSD), orders executed live via the cTrader MCP, market structure computed locally.",
        zen: "Multi-purpose Discord bot: moderation, utilities, commands loaded dynamically by category.",
        borning:
          "Web platform for Alstom's internal multi-sport challenge, built during an internship in Charleroi.",
      },
    },
    contact: {
      eyebrow: "Contact",
      open: "Open ↗",
      descriptions: {
        github: "Code, personal projects, contributions.",
        linkedin: "Background, experience, updates.",
      },
    },
    footer: {
      contactAria: "Contact",
      backToTop: "Back to top ↑",
    },
    notFound: {
      title: "404 · Tom B. · Portfolio",
      caption: "Page not found",
      back: "Back home →",
    },
    langSwitch: {
      aria: "Switch language",
    },
  },
};
