// =============================================================================
//  TRADUCTION DES ERREURS DE STOCKAGE
//  Le SDK Vercel Blob renvoie des messages techniques en anglais, tous préfixés
//  « Vercel Blob: … », et ses classes d'erreur ne portent pas de nom
//  exploitable (elles sont minifiées en production). On identifie donc l'erreur
//  par son texte, qui est stable, et on explique QUOI FAIRE.
//  Utilisable côté navigateur comme côté serveur.
// =============================================================================

type Rule = { match: string; message: string };

const RULES: Rule[] = [
  {
    match: "This store does not exist",
    message:
      "Le magasin de photos est introuvable. La clé d'accès du site pointe vers un stockage supprimé ou remplacé : dans Vercel, reliez le magasin au projet (Storage → Projets), supprimez les éventuelles clés BLOB_READ_WRITE_TOKEN en double, puis redéployez le site.",
  },
  {
    match: "This store has been suspended",
    message:
      "Le magasin de photos est suspendu, généralement pour un quota dépassé ou un problème de facturation. Vérifiez son état dans Vercel → Storage.",
  },
  {
    match: "No read-write token found",
    message:
      "Le stockage n'est relié à ce site. Dans Vercel : Storage → votre magasin → Connect Project, puis redéployez.",
  },
  {
    match: "Access denied",
    message:
      "Accès au stockage refusé : la clé BLOB_READ_WRITE_TOKEN est invalide ou périmée. Reconnectez le magasin au projet dans Vercel, puis redéployez.",
  },
  {
    match: "Client token has expired",
    message:
      "L'autorisation d'envoi a expiré, l'opération a pris trop de temps. Réessayez ; si la photo est volumineuse, réduisez-la avant l'envoi.",
  },
  {
    match: "File is too large",
    message:
      "La photo est trop lourde (8 Mo maximum). Réduisez-la avant de l'envoyer.",
  },
  {
    match: "Content type mismatch",
    message:
      "Ce format de fichier n'est pas accepté. Utilisez du JPG, PNG, WEBP ou AVIF.",
  },
  {
    match: "The requested blob does not exist",
    message:
      "Cette photo n'existe plus dans le stockage : elle a sans doute déjà été supprimée. Rafraîchissez la page.",
  },
  {
    match: "not available",
    message:
      "Le service de stockage est momentanément indisponible. Patientez une minute et réessayez.",
  },
  {
    match: "Too many requests",
    message:
      "Trop d'envois en peu de temps. Patientez une minute avant de réessayer.",
  },
  {
    match: "The request was aborted",
    message:
      "L'envoi a été interrompu avant la fin. Vérifiez votre connexion et réessayez.",
  },
  {
    match: "client token",
    message:
      "Le site n'a pas délivré d'autorisation d'envoi. Votre session a probablement expiré : déconnectez-vous et reconnectez-vous.",
  },
  {
    match: "Precondition failed",
    message:
      "La photo a été modifiée entre-temps. Rafraîchissez la page et réessayez.",
  },
  {
    match: "Unknown error",
    message:
      "Le stockage a renvoyé une erreur inconnue. Réessayez ; si cela persiste, vérifiez l'état du magasin dans Vercel.",
  },
];

/**
 * Message compréhensible correspondant à une erreur de stockage.
 * Le texte technique d'origine est conservé entre parenthèses : il reste
 * indispensable pour diagnostiquer un cas non prévu.
 */
export function describeBlobError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Erreur inattendue lors de l'accès au stockage.";
  }

  // Délai dépassé côté navigateur (AbortSignal.timeout)
  if (error.name === "TimeoutError") {
    return "Délai dépassé : l'envoi n'a pas abouti en 90 secondes. Votre connexion est peut-être trop lente, ou le fichier trop lourd.";
  }
  if (error.name === "AbortError") {
    return "Envoi interrompu. Vérifiez votre connexion et réessayez.";
  }
  // Le réseau a lâché avant même d'atteindre le serveur
  if (error instanceof TypeError && /fetch/i.test(error.message)) {
    return "Connexion perdue avec le site. Vérifiez votre accès internet et réessayez.";
  }

  const rule = RULES.find((candidate) =>
    error.message.toLowerCase().includes(candidate.match.toLowerCase()),
  );

  const technical = error.message.replace(/^Vercel Blob:\s*/, "");
  return rule ? `${rule.message} (${technical})` : technical;
}
