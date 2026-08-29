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
  experience: {
    eyebrow: string;
    titles: Record<string, string>;
    periods: Record<string, string>;
    descriptions: Record<string, string>;
  };
  contact: {
    emailAria: string;
  };
  footer: {
    navAria: string;
    backToTop: string;
    veille: string;
    moreLabel: string;
  };
  notFound: {
    title: string;
    caption: string;
    back: string;
  };
  langSwitch: {
    aria: string;
  };
  skipToContent: string;
  veille: {
    meta: { title: string; description: string };
    eyebrow: string;
    title: string;
    intro: string[];
    algorithms: {
      heading: string;
      tags: Record<string, string>;
      descriptions: Record<string, string>;
    };
    timeline: {
      heading: string;
      years: Record<string, string>;
      descriptions: Record<string, string>;
    };
    adoption: {
      heading: string;
      paragraph: string;
      stats: { label: string; value: string }[];
    };
    sources: {
      heading: string;
      descriptions: Record<string, string>;
    };
    backHome: string;
  };
}

export const dictionaries: Record<Lang, Dictionary> = {
  fr: {
    meta: {
      title: "Tom B. · Portfolio",
      description:
        "Développeur backend autodidacte (TypeScript, Node.js), passionné de systèmes temps réel. Actuellement en BTS SIO SLAM. Projets, expérience et veille technique.",
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
        "Je code depuis plus de sept ans : Scratch en CM2 pour commencer, puis plus sérieusement en autodidacte, surtout en TypeScript et Node.js, avec un faible pour les systèmes temps réel. Aujourd'hui en 2ᵉ année de BTS SIO option SLAM. La plupart des projets ci-dessous sont nés de cet intérêt plutôt que d'un besoin précis.",
    },
    projects: {
      eyebrow: "Projets",
      github: "GitHub",
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
    experience: {
      eyebrow: "Expérience",
      titles: {
        mairie: "Support informatique",
        nyxo: "Nyxo.js",
        freelance: "Développement freelance",
        alstom: "Stage développeur",
      },
      periods: {
        mairie: "2023",
        nyxo: "2023 – 2025",
        freelance: "En cours",
        alstom: "Juin – juillet 2026",
      },
      descriptions: {
        mairie:
          "Stage en mairie : maintenance matérielle, administration réseau, support technique de premier niveau.",
        nyxo: "Package TypeScript open source pour construire des bots Discord, pensé pour couvrir l'API en profondeur plutôt que la contourner. Discontinué depuis, mais c'est là-dessus que je me suis vraiment formé, plus de deux ans durant.",
        freelance: "Sites web fullstack pour des clients, en indépendant.",
        alstom:
          "Chez Alstom : refonte du monitoring réseau ODM Monitoring Alstom (voir Projets), puis mission d'assistance technique : remplacement de postes et support matériel.",
      },
    },
    contact: {
      emailAria: "Envoyer un e-mail à Tom B.",
    },
    footer: {
      navAria: "Liens",
      backToTop: "Haut de page",
      veille: "Veille techno",
      moreLabel: "Liens",
    },
    notFound: {
      title: "404 · Tom B. · Portfolio",
      caption: "Page introuvable",
      back: "Retour à l'accueil",
    },
    langSwitch: {
      aria: "Changer de langue",
    },
    skipToContent: "Aller au contenu",
    veille: {
      meta: {
        title: "Cryptographie post-quantique · Veille · Tom B.",
        description:
          "Veille technologique sur la cryptographie post-quantique : normes NIST FIPS 203/204/205, calendrier de bascule et adoption réelle en 2026.",
      },
      eyebrow: "Veille technologique",
      title: "Cryptographie post-quantique",
      intro: [
        "En août 2024, le NIST a transformé une décennie de recherche théorique en normes fédérales concrètes : FIPS 203, 204 et 205. Ce qui n'était qu'un sujet de conférence académique est devenu, du jour au lendemain, une obligation de mise en conformité pour quiconque protège des données à long terme.",
        "L'enjeu tient en une phrase : « harvest now, decrypt later ». Un trafic chiffré aujourd'hui avec des algorithmes classiques (RSA, ECC) peut être intercepté et stocké tel quel, en attendant qu'un ordinateur quantique suffisamment puissant existe pour le déchiffrer rétroactivement. Migrer avant cette date n'est pas une option, c'est une course contre une menace qui n'a pas encore de date.",
      ],
      algorithms: {
        heading: "Les algorithmes retenus",
        tags: {
          mlkem: "Encapsulation",
          mldsa: "Signature",
          slhdsa: "Basé sur le hachage",
        },
        descriptions: {
          mlkem:
            "Établit une clé secrète partagée entre deux parties, l'équivalent post-quantique de l'échange Diffie-Hellman. Fondé sur les réseaux euclidiens (lattices), c'est le plus rapide des trois, donc déjà déployé dans TLS et la messagerie chiffrée.",
          mldsa:
            "Signature numérique dérivée de CRYSTALS-Dilithium, elle aussi fondée sur les lattices. Signatures plus volumineuses que RSA (jusqu'à 4,6 Ko), mais candidat par défaut pour l'authentification de documents et de certificats.",
          slhdsa:
            "Signature à base de fonctions de hachage plutôt que de lattices : une hypothèse mathématique différente, choisie exprès comme filet de sécurité si les réseaux euclidiens s'avéraient un jour cassables. Plus lente et plus lourde (jusqu'à 50 Ko), réservée aux usages où la prudence prime sur la performance.",
        },
      },
      timeline: {
        heading: "Chronologie",
        years: {
          y2016: "2016",
          y2022: "2022",
          y2024: "Août 2024",
          y2025: "Mars 2025",
          y2027: "2027",
          y2030: "2030",
          y2035: "2035",
        },
        descriptions: {
          y2016: "Le NIST lance son concours international de standardisation post-quantique.",
          y2022: "Kyber, Dilithium, SPHINCS+ et Falcon sont sélectionnés comme finalistes.",
          y2024:
            "Publication des normes définitives FIPS 203 (ML-KEM), FIPS 204 (ML-DSA) et FIPS 205 (SLH-DSA).",
          y2025:
            "HQC est retenu comme cinquième algorithme : un second mécanisme d'échange de clé fondé sur les codes correcteurs plutôt que sur les lattices, pour ne pas tout miser sur une seule famille mathématique.",
          y2027:
            "Échéance fixée par la NSA (CNSA 2.0) : tout nouveau système gouvernemental américain doit prendre en charge la cryptographie post-quantique.",
          y2030: "Fin de la période de transition prévue pour les systèmes existants.",
          y2035:
            "Objectif de résistance quantique complète pour l'ensemble des systèmes de sécurité nationale américains.",
        },
      },
      adoption: {
        heading: "Adoption réelle",
        paragraph:
          "Chrome, Edge et Firefox activent par défaut un échange de clé hybride (X25519MLKEM768, qui combine l'ancien et le nouveau standard) ; Signal et iMessage ont déjà basculé leurs protocoles. Chez Cloudflare, la part du trafic TLS chiffré en post-quantique est passée d'environ 2 % début 2024 à plus de 67 % en avril 2026, l'une des migrations cryptographiques les plus rapides jamais mesurées. Le décalage se situe côté entreprises : la plupart testent, peu ont basculé en production.",
        stats: [
          { label: "Trafic TLS post-quantique chez Cloudflare, 2024 → 2026", value: "2 % → 67 %" },
          { label: "Entreprises en test vs entièrement déployées", value: "87 % / 7 %" },
        ],
      },
      sources: {
        heading: "Sources",
        descriptions: {
          nist: "Le dossier de référence du processus de standardisation, algorithme par algorithme.",
          nsa: "Le calendrier de bascule imposé aux systèmes de sécurité nationale américains.",
          cloudflare:
            "Des chiffres d'adoption réels, mesurés sur du trafic TLS en production plutôt qu'annoncés.",
          csa: "Une explication grand public de ce que change concrètement la finalisation des normes.",
        },
      },
      backHome: "Retour à l'accueil",
    },
  },
  en: {
    meta: {
      title: "Tom B. · Portfolio",
      description:
        "Self-taught backend developer (TypeScript, Node.js) focused on real-time systems, currently in a BTS SIO (SLAM) program. Projects, experience, and tech watch.",
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
        "I've been coding for over seven years now: Scratch in primary school to start, then more seriously self-taught, mostly in TypeScript and Node.js, with a soft spot for real-time systems. Now in my second year of BTS SIO (SLAM). Most of the projects below grew out of that interest rather than an actual need.",
    },
    projects: {
      eyebrow: "Projects",
      github: "GitHub",
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
    experience: {
      eyebrow: "Experience",
      titles: {
        mairie: "IT Support",
        nyxo: "Nyxo.js",
        freelance: "Freelance Development",
        alstom: "Developer Internship",
      },
      periods: {
        mairie: "2023",
        nyxo: "2023 – 2025",
        freelance: "Ongoing",
        alstom: "June – July 2026",
      },
      descriptions: {
        mairie:
          "Town hall IT internship: hardware maintenance, network administration, first-line technical support.",
        nyxo: "An open-source TypeScript package for building Discord bots, built to cover the API in depth rather than paper over it. Discontinued now, but it's what I actually learned backend development on, over more than two years.",
        freelance: "Full-stack websites for clients, as an independent freelancer.",
        alstom:
          "At Alstom: rebuilt the ODM Monitoring Alstom network monitoring tool (see Projects), then moved into technical-assistant duties: workstation replacements and hardware support.",
      },
    },
    contact: {
      emailAria: "Send an email to Tom B.",
    },
    footer: {
      navAria: "Links",
      backToTop: "Back to top",
      veille: "Tech watch",
      moreLabel: "Links",
    },
    notFound: {
      title: "404 · Tom B. · Portfolio",
      caption: "Page not found",
      back: "Back home",
    },
    langSwitch: {
      aria: "Switch language",
    },
    skipToContent: "Skip to content",
    veille: {
      meta: {
        title: "Post-quantum cryptography · Tech watch · Tom B.",
        description:
          "A tech watch on post-quantum cryptography: NIST's FIPS 203/204/205 standards, the migration timeline, and real-world adoption in 2026.",
      },
      eyebrow: "Tech watch",
      title: "Post-quantum cryptography",
      intro: [
        "In August 2024, NIST turned a decade of theoretical research into concrete federal standards: FIPS 203, 204, and 205. What used to be an academic conference topic became, overnight, a compliance obligation for anyone protecting long-lived data.",
        "The stakes fit in one phrase: \"harvest now, decrypt later.\" Traffic encrypted today with classical algorithms (RSA, ECC) can be intercepted and stored as-is, waiting for a sufficiently powerful quantum computer to decrypt it retroactively. Migrating before that day isn't optional: it's a race against a threat with no confirmed deadline.",
      ],
      algorithms: {
        heading: "The algorithms",
        tags: {
          mlkem: "Encapsulation",
          mldsa: "Signature",
          slhdsa: "Hash-based",
        },
        descriptions: {
          mlkem:
            "Establishes a shared secret between two parties, the post-quantum equivalent of Diffie-Hellman key exchange. Lattice-based, and the fastest of the three, which is why it's already the one deployed in TLS and encrypted messaging.",
          mldsa:
            "A digital signature scheme derived from CRYSTALS-Dilithium, also lattice-based. Larger signatures than RSA (up to 4.6 KB), but the default candidate for document and certificate authentication.",
          slhdsa:
            "A hash-based signature scheme rather than a lattice-based one: a deliberately different mathematical assumption, kept as a safety net in case lattices ever turn out to be breakable. Slower and heavier (up to 50 KB), reserved for cases where caution outweighs performance.",
        },
      },
      timeline: {
        heading: "Timeline",
        years: {
          y2016: "2016",
          y2022: "2022",
          y2024: "Aug 2024",
          y2025: "Mar 2025",
          y2027: "2027",
          y2030: "2030",
          y2035: "2035",
        },
        descriptions: {
          y2016: "NIST launches its international post-quantum standardization competition.",
          y2022: "Kyber, Dilithium, SPHINCS+, and Falcon are selected as finalists.",
          y2024:
            "FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), and FIPS 205 (SLH-DSA) are published as final standards.",
          y2025:
            "HQC is selected as a fifth algorithm: a second key-exchange mechanism based on error-correcting codes rather than lattices, so the standard doesn't rest on one mathematical family alone.",
          y2027:
            "NSA deadline (CNSA 2.0): every new U.S. government system must support post-quantum cryptography.",
          y2030: "Transition deadline for existing systems.",
          y2035: "Target for full quantum resistance across all U.S. National Security Systems.",
        },
      },
      adoption: {
        heading: "Real-world adoption",
        paragraph:
          "Chrome, Edge, and Firefox now enable a hybrid key exchange by default (X25519MLKEM768, combining the old and new standards); Signal and iMessage have already switched their protocols over. At Cloudflare, the share of TLS traffic encrypted with post-quantum key exchange went from roughly 2% in early 2024 to over 67% by April 2026, one of the fastest cryptographic migrations ever measured. The gap sits on the enterprise side: most are testing, few have shipped it to production.",
        stats: [
          { label: "Cloudflare post-quantum TLS share, 2024 → 2026", value: "2% → 67%" },
          { label: "Enterprises testing vs. fully deployed", value: "87% / 7%" },
        ],
      },
      sources: {
        heading: "Sources",
        descriptions: {
          nist: "The authoritative record of the standardization process, algorithm by algorithm.",
          nsa: "The mandated rollout timeline for U.S. national security systems.",
          cloudflare:
            "Real adoption numbers measured on production TLS traffic, not announcements.",
          csa: "A plain-language explainer of what the finalized standards actually change.",
        },
      },
      backHome: "Back home",
    },
  },
};
