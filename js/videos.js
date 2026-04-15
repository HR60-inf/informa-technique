/**
 * INFORMA-TECHNIQUE R — videos.js
 * ─────────────────────────────────────────────────────────
 * Données de toutes les vidéos / tutoriels.
 *
 * COMMENT AJOUTER UNE VIDÉO :
 * Copiez un bloc { ... } et modifiez les champs.
 * Ou utilisez le panneau Admin (admin/index.html) pour
 * gérer les vidéos via une interface graphique.
 *
 * Champs :
 *   id        → Identifiant unique (nombre entier)
 *   title     → Titre du tutoriel
 *   category  → "securite" | "navigateur" | "crypto" | "demarches" | "astuces"
 *   platform  → Plateforme principale : "youtube" | "facebook" | "tiktok"
 *   thumbnail → URL image de miniature (laisser "" pour utiliser l'emoji)
 *   emoji     → Emoji affiché si pas de miniature
 *   views     → Nombre de vues (texte, ex: "1.2K", "856")
 *   date      → Date relative (ex: "il y a 2 ans", "il y a 3 mois")
 *   desc      → Description courte du tutoriel
 *   tags      → Tableau de mots-clés [String]
 *   links     → Liens vers les plateformes (laisser "" si absent)
 *     .youtube  → URL YouTube
 *     .facebook → URL Facebook
 *     .tiktok   → URL TikTok
 * ─────────────────────────────────────────────────────────
 */

const videosData = [
  {
    id: 1,
    title: "Désactiver l'autorisation des paiements dans les paramètres Google Chrome",
    category: "navigateur",
    platform: "youtube",
    thumbnail: "",
    emoji: "🌐",
    views: "273",
    date: "il y a 2 ans",
    desc: "Comment désactiver et activer les options de paiement dans les paramètres de Google Chrome pour sécuriser vos transactions en ligne.",
    tags: ["Chrome", "Paiements", "Sécurité", "Navigateur"],
    embedUrl: "",  // ← Coller ici le lien YouTube de la vidéo (ex: https://www.youtube.com/watch?v=XXXXXX)
    links: {
      youtube: "https://www.youtube.com/@Informa-Tech188",
      facebook: "",
      tiktok: ""
    }
  },
  {
    id: 2,
    title: "Comment convertir des crypto-monnaies en euros sur Binance",
    category: "crypto",
    platform: "youtube",
    thumbnail: "",
    emoji: "💰",
    views: "1.2K",
    date: "il y a 1 an",
    desc: "Guide complet pour convertir vos cryptomonnaies (Bitcoin, USDT, etc.) en euros directement sur la plateforme Binance.",
    tags: ["Binance", "Bitcoin", "Euro", "Crypto", "Conversion"],
    embedUrl: "",  // ← Coller ici le lien YouTube de la vidéo
    links: {
      youtube: "https://www.youtube.com/@Informa-Tech188",
      facebook: "https://www.facebook.com/InformaTech188",
      tiktok: "https://www.tiktok.com/@informa_tech188"
    }
  },
  {
    id: 3,
    title: "Comment faire une réclamation CAF en ligne",
    category: "demarches",
    platform: "facebook",
    thumbnail: "",
    emoji: "📋",
    views: "856",
    date: "il y a 8 mois",
    desc: "Tutoriel pas-à-pas pour effectuer une réclamation auprès de la CAF directement depuis votre espace personnel en ligne.",
    tags: ["CAF", "Réclamation", "Démarches", "Allocations"],
    embedUrl: "",
    links: {
      youtube: "",
      facebook: "https://www.facebook.com/InformaTech188",
      tiktok: "https://www.tiktok.com/@informa_tech188"
    }
  },
  {
    id: 4,
    title: "Sécuriser votre smartphone Android contre les hackers",
    category: "securite",
    platform: "tiktok",
    thumbnail: "",
    emoji: "🔒",
    views: "5.4K",
    date: "il y a 3 mois",
    desc: "Les paramètres essentiels à activer sur Android pour protéger votre téléphone contre les attaques et les logiciels malveillants.",
    tags: ["Android", "Sécurité", "Hacker", "Protection", "Mobile"],
    embedUrl: "",
    links: {
      youtube: "https://www.youtube.com/@Informa-Tech188",
      facebook: "https://www.facebook.com/InformaTech188",
      tiktok: "https://www.tiktok.com/@informa_tech188"
    }
  },
  {
    id: 5,
    title: "Activer la double authentification sur vos comptes",
    category: "securite",
    platform: "youtube",
    thumbnail: "",
    emoji: "🛡️",
    views: "2.1K",
    date: "il y a 6 mois",
    desc: "Comment activer la 2FA (double authentification) sur Google, Facebook, Instagram et autres services pour protéger vos comptes.",
    tags: ["2FA", "Double authentification", "Google", "Sécurité"],
    embedUrl: "",
    links: {
      youtube: "https://www.youtube.com/@Informa-Tech188",
      facebook: "https://www.facebook.com/InformaTech188",
      tiktok: ""
    }
  },
  {
    id: 6,
    title: "Détecter et supprimer un virus sur votre téléphone",
    category: "securite",
    platform: "tiktok",
    thumbnail: "",
    emoji: "🦠",
    views: "8.7K",
    date: "il y a 2 mois",
    desc: "Comment détecter si votre téléphone est infecté par un virus et comment le supprimer efficacement sans perdre vos données.",
    tags: ["Virus", "Malware", "Android", "Nettoyage", "Mobile"],
    embedUrl: "",
    links: {
      youtube: "https://www.youtube.com/@Informa-Tech188",
      facebook: "https://www.facebook.com/InformaTech188",
      tiktok: "https://www.tiktok.com/@informa_tech188"
    }
  },
  {
    id: 7,
    title: "Vérifier si votre email a été piraté (Have I Been Pwned)",
    category: "securite",
    platform: "facebook",
    thumbnail: "",
    emoji: "🔍",
    views: "3.3K",
    date: "il y a 4 mois",
    desc: "Utilisez Have I Been Pwned pour vérifier si votre adresse email figure dans une fuite de données et comment réagir.",
    tags: ["Email", "Piratage", "HaveIBeenPwned", "Fuite", "Données"],
    embedUrl: "",
    links: {
      youtube: "",
      facebook: "https://www.facebook.com/InformaTech188",
      tiktok: "https://www.tiktok.com/@informa_tech188"
    }
  },
  {
    id: 8,
    title: "Créer un mot de passe ultra sécurisé — méthode complète",
    category: "astuces",
    platform: "youtube",
    thumbnail: "",
    emoji: "🔑",
    views: "1.9K",
    date: "il y a 5 mois",
    desc: "Toutes les règles pour créer et gérer des mots de passe robustes. Présentation des gestionnaires de mots de passe recommandés.",
    tags: ["Mot de passe", "Sécurité", "Bitwarden", "LastPass"],
    embedUrl: "",
    links: {
      youtube: "https://www.youtube.com/@Informa-Tech188",
      facebook: "https://www.facebook.com/InformaTech188",
      tiktok: ""
    }
  },
  {
    id: 9,
    title: "Bloquer les publicités et trackers sur mobile",
    category: "navigateur",
    platform: "tiktok",
    thumbnail: "",
    emoji: "🚫",
    views: "4.6K",
    date: "il y a 1 mois",
    desc: "Comment bloquer toutes les publicités intrusives et les trackers sur votre téléphone Android ou iPhone — applications et réglages.",
    tags: ["AdBlock", "Publicités", "Trackers", "Mobile", "Vie privée"],
    embedUrl: "",
    links: {
      youtube: "https://www.youtube.com/@Informa-Tech188",
      facebook: "https://www.facebook.com/InformaTech188",
      tiktok: "https://www.tiktok.com/@informa_tech188"
    }
  },
  {
    id: 10,
    title: "Comment créer un compte Binance et acheter des cryptos",
    category: "crypto",
    platform: "youtube",
    thumbnail: "",
    emoji: "₿",
    views: "2.8K",
    date: "il y a 10 mois",
    desc: "Guide de démarrage pour créer votre compte Binance, vérifier votre identité (KYC) et réaliser votre premier achat de cryptomonnaies.",
    tags: ["Binance", "Bitcoin", "Débutant", "KYC", "Crypto"],
    embedUrl: "",
    links: {
      youtube: "https://www.youtube.com/@Informa-Tech188",
      facebook: "https://www.facebook.com/InformaTech188",
      tiktok: "https://www.tiktok.com/@informa_tech188"
    }
  },
  {
    id: 11,
    title: "Récupérer un compte Facebook ou Instagram piraté",
    category: "securite",
    platform: "facebook",
    thumbnail: "",
    emoji: "🆘",
    views: "12.4K",
    date: "il y a 7 mois",
    desc: "Procédure complète pour récupérer l'accès à votre compte Facebook ou Instagram après un piratage, étape par étape.",
    tags: ["Facebook", "Instagram", "Piratage", "Récupération", "Compte"],
    embedUrl: "",
    links: {
      youtube: "https://www.youtube.com/@Informa-Tech188",
      facebook: "https://www.facebook.com/InformaTech188",
      tiktok: "https://www.tiktok.com/@informa_tech188"
    }
  },
  {
    id: 12,
    title: "Astuce : envoyer de gros fichiers gratuitement",
    category: "astuces",
    platform: "tiktok",
    thumbnail: "",
    emoji: "📁",
    views: "7.2K",
    date: "il y a 3 semaines",
    desc: "Les meilleures solutions gratuites pour envoyer des fichiers volumineux sans passer par une messagerie email limitée.",
    tags: ["WeTransfer", "Google Drive", "Fichiers", "Gratuit", "Partage"],
    embedUrl: "",
    links: {
      youtube: "",
      facebook: "https://www.facebook.com/InformaTech188",
      tiktok: "https://www.tiktok.com/@informa_tech188"
    }
  }
  /* ── AJOUTEZ VOS NOUVELLES VIDÉOS ICI ──
  ,{
    id: 13,
    title: "Titre de votre tutoriel",
    category: "securite",          // securite | navigateur | crypto | demarches | astuces
    platform: "youtube",           // youtube | facebook | tiktok
    thumbnail: "",                 // URL image ou laisser vide
    emoji: "🎯",
    views: "0",
    date: "Aujourd'hui",
    desc: "Description de votre tutoriel...",
    tags: ["Tag1", "Tag2"],
    embedUrl: "https://www.youtube.com/watch?v=XXXXXX",  // ← lien YouTube de la vidéo
    links: {
      youtube: "https://www.youtube.com/watch?v=XXXXXX", // ← lien direct vers la vidéo
      facebook: "https://...",
      tiktok: "https://..."
    }
  }
  */
];