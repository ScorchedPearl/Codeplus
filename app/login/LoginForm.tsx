"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { Field, inputClass, SubmitButton } from "@/components/admin/form";

export function LoginForm() {
  const [state, action] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="space-y-4">
      <Field label="Email">
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          className={inputClass}
        />
      </Field>
      <Field label="Password">
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      {state.error && (
        <p role="alert" className="rounded-lg bg-accent-tint px-3 py-2 text-sm text-accent-ink">
          {state.error}
        </p>
      )}
      <SubmitButton className="w-full">Sign in</SubmitButton>
    </form>
  );
}
