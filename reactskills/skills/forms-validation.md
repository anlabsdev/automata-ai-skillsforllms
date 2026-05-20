# Skill: React Forms & Validation
> @skillsforllms/reactskills · v1.0.0 · Category: Web / React

## Purpose
Teach an AI agent to build robust, accessible forms with proper validation using React Hook Form + Zod.

## When to Use This Skill
- Building registration, login, settings, or checkout forms.
- Implementing real-time field validation with clear error messages.
- Managing multi-step forms or dynamic field arrays.

## Setup
```bash
npm install react-hook-form zod @hookform/resolvers
```

## Basic Form with Zod Validation
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export function SignupForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" {...register("name")} />
        {errors.name && <p role="alert">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register("email")} />
        {errors.email && <p role="alert">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register("password")} />
        {errors.password && <p role="alert">{errors.password.message}</p>}
      </div>
      <div>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input id="confirmPassword" type="password" {...register("confirmPassword")} />
        {errors.confirmPassword && <p role="alert">{errors.confirmPassword.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
}
```

## Reusable Form Field Component
```tsx
import { type FieldError, type UseFormRegisterReturn } from "react-hook-form";

interface FormFieldProps {
  label: string;
  error?: FieldError;
  registration: UseFormRegisterReturn;
  type?: string;
}

export function FormField({ label, error, registration, type = "text" }: FormFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={registration.name}>{label}</label>
      <input id={registration.name} type={type} aria-invalid={!!error} {...registration} />
      {error && <p className="form-field__error" role="alert">{error.message}</p>}
    </div>
  );
}
```

## Dynamic Field Arrays
```tsx
import { useFieldArray } from "react-hook-form";

function InviteForm() {
  const { control, register } = useForm({
    defaultValues: { emails: [{ value: "" }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "emails" });

  return (
    <div>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`emails.${index}.value`)} placeholder="Email" />
          <button type="button" onClick={() => remove(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => append({ value: "" })}>Add Email</button>
    </div>
  );
}
```

## Anti-Patterns
- Do not use `onChange` + `useState` for every field — use React Hook Form's `register`.
- Do not write validation logic inline — define Zod schemas separately.
- Do not skip `noValidate` on the `<form>` — browser validation conflicts with custom errors.
- Do not forget `aria-invalid` and `role="alert"` for accessibility.

## Changelog
- v1.0.0 — Initial release.
