"use client";

import { useActionState } from "react";
import { Field, FormMessage, inputClass, SubmitButton } from "@/components/admin/form";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-rules";
import { addMember, changeOwnPassword, removeMember, resetPassword, type FormState } from "./actions";

const pwHint = `At least ${MIN_PASSWORD_LENGTH} characters.`;

export function AddMemberForm() {
  const [state, action] = useActionState<FormState, FormData>(addMember, {});
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input name="name" required className={inputClass} />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required className={inputClass} />
        </Field>
        <Field label="Temporary password" hint={pwHint} className="sm:col-span-2">
          <input name="password" type="password" autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} className={inputClass} />
        </Field>
      </div>
      <FormMessage state={state} />
      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ id, name }: { id: string; name: string }) {
  const [state, action] = useActionState<FormState, FormData>(resetPassword, {});
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <Field label={`New password for ${name}`} hint={pwHint}>
        <input name="password" type="password" autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} className={inputClass} />
      </Field>
      <FormMessage state={state} />
      <SubmitButton variant="secondary">Set password</SubmitButton>
    </form>
  );
}

export function RemoveMemberForm({ id, name }: { id: string; name: string }) {
  const [state, action] = useActionState<FormState, FormData>(removeMember, {});
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <FormMessage state={state} />
      <SubmitButton variant="danger" confirm={`Remove ${name}'s account? They won't be able to sign in.`}>
        Remove account
      </SubmitButton>
    </form>
  );
}

export function ChangeOwnPasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(changeOwnPassword, {});
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Current password">
          <input name="current" type="password" autoComplete="current-password" required className={inputClass} />
        </Field>
        <Field label="New password" hint={pwHint}>
          <input name="next" type="password" autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} className={inputClass} />
        </Field>
      </div>
      <FormMessage state={state} />
      <SubmitButton variant="secondary">Change my password</SubmitButton>
    </form>
  );
}
