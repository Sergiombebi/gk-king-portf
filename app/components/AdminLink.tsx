"use client";

/**
 * Bouton d'accès à l'espace administration. Il n'emmène pas sur une autre page :
 * il ouvre la fenêtre de connexion (voir `LoginModal`), gérée par l'en-tête.
 * L'accès réel reste protégé côté serveur (identifiant + mot de passe).
 */
export default function AdminLink({
  className = "",
  showLabel = true,
  onClick,
}: {
  className?: string;
  /** Sur mobile, seule l'icône est affichée faute de place. */
  showLabel?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      title="Espace administration"
      aria-label="Espace administration"
      aria-haspopup="dialog"
    >
      <LockIcon className="h-4 w-4" />
      {showLabel && "Administration"}
    </button>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
