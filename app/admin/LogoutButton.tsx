"use client";

import { useFormStatus } from "react-dom";
import { SpinnerIcon } from "@/app/components/icons";
import { logoutAction } from "./actions";

/**
 * Seule sortie du tableau de bord : la session est détruite et le visiteur est
 * ramené sur le site public. Revenir sur `/admin` réclamera une connexion.
 */
export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && <SpinnerIcon className="h-4 w-4 animate-spin" />}
      {pending ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
