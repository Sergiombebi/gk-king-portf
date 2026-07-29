"use client";

import { useActionState } from "react";
import { SpinnerIcon } from "@/app/components/icons";
import { loginAction, type ActionState } from "../actions";

const initialState: ActionState = {};

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="suite" value={next} />

      <div>
        <label
          htmlFor="username"
          className="block text-xs font-semibold uppercase tracking-widest text-white/50"
        >
          Identifiant
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          autoFocus
          className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-brand"
          placeholder="Votre identifiant"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-xs font-semibold uppercase tracking-widest text-white/50"
        >
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-brand"
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <SpinnerIcon className="h-4 w-4 animate-spin" />}
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
