"use client";

import { useActionState } from "react";
import { changePasswordAction, type ActionState } from "./actions";

const initialState: ActionState = {};

const fieldClass =
  "mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-brand";
const labelClass =
  "block text-xs font-semibold uppercase tracking-widest text-white/40";

export default function PasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 max-w-xl space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Mot de passe actuel
          <input
            name="current"
            type="password"
            autoComplete="current-password"
            required
            className={`${fieldClass} font-normal normal-case tracking-normal`}
          />
        </label>
        <div />
        <label className={labelClass}>
          Nouveau mot de passe
          <input
            name="next"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className={`${fieldClass} font-normal normal-case tracking-normal`}
          />
        </label>
        <label className={labelClass}>
          Confirmer
          <input
            name="confirm"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className={`${fieldClass} font-normal normal-case tracking-normal`}
          />
        </label>
      </div>

      {state.error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Modifier le mot de passe"}
      </button>
    </form>
  );
}
