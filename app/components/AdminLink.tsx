import Link from "next/link";

/**
 * Raccourci vers l'espace administration. Visible par tous : l'accès réel est
 * protégé par la page de connexion (identifiant + mot de passe), qu'un
 * visiteur ne peut pas franchir.
 */
export default function AdminLink({
  className = "",
  showLabel = true,
}: {
  className?: string;
  /** Sur mobile, seule l'icône est affichée faute de place. */
  showLabel?: boolean;
}) {
  return (
    <Link
      href="/admin/connexion"
      className={className}
      title="Espace administration"
      aria-label="Espace administration"
    >
      <LockIcon className="h-4 w-4" />
      {showLabel && "Administration"}
    </Link>
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
