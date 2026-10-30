import type { ReactNode } from "react";

/** Shared look for inputs, selects and the textarea. Invalid fields get a caramel border. */
export const CONTROL_CLASS =
  "w-full rounded-md border border-border bg-bg px-3 py-2.5 text-body text-ink transition-colors placeholder:text-muted hover:border-muted focus-visible:border-accent aria-invalid:border-accent";

type ControlProps = {
  id: string;
  name: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

type FormFieldProps = {
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: (control: ControlProps) => ReactNode;
};

/** Label, control and error message, wired together for assistive tech. */
export default function FormField({ name, label, required, error, className = "", children }: FormFieldProps) {
  const id = `inquiry-${name}`;
  const errorId = `${id}-error`;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block font-mono text-meta text-ink-2">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-accent">
            *
          </span>
        )}
      </label>
      {children({
        id,
        name,
        ...(error ? { "aria-invalid": true as const, "aria-describedby": errorId } : {}),
      })}
      {error && (
        <p id={errorId} className="mt-2 text-meta text-ink">
          <span aria-hidden="true" className="mr-1.5 text-accent">
            ↳
          </span>
          {error}
        </p>
      )}
    </div>
  );
}
