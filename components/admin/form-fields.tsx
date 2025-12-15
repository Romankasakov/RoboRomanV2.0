import type { InputHTMLAttributes, ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type BaseFieldProps = {
  label: string;
  name: string;
  description?: string;
  required?: boolean;
  className?: string;
};

export function FieldSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4 rounded-3xl border border-white/10 bg-black/20 p-6", className)}>
      <header className="space-y-1">
        <p className="text-lg font-semibold text-foreground">{title}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </header>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

type TextFieldProps = BaseFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "children"> & {
    type?: string;
  };

export function TextField({
  label,
  name,
  type = "text",
  placeholder,
  required,
  defaultValue,
  className,
  description,
  ...rest
}: TextFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={name}>{label}</Label>
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        {...rest}
      />
    </div>
  );
}

export function TextareaField({
  label,
  name,
  placeholder,
  rows = 4,
  required,
  description,
  defaultValue,
}: BaseFieldProps & { placeholder?: string; rows?: number; defaultValue?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      <Textarea id={name} name={name} placeholder={placeholder} rows={rows} required={required} defaultValue={defaultValue} />
    </div>
  );
}

export function SelectField({
  label,
  name,
  options,
  placeholder,
  required,
  defaultValue,
}: BaseFieldProps & { options: Array<{ label: string; value: string }>; placeholder?: string; defaultValue?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-foreground shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <option value="">{placeholder ?? "Bitte wählen"}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ToggleField({
  label,
  name,
  description,
}: BaseFieldProps) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/15 p-3 text-sm text-muted-foreground">
      <input
        type="checkbox"
        name={name}
        value="true"
        className="mt-1 h-4 w-4 rounded border-white/20 bg-black/50 text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      />
      <div>
        <span className="font-medium text-foreground">{label}</span>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
    </label>
  );
}
