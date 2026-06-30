import { cn } from "@tbe/utils";
import * as React from "react";

import { Label } from "./label";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

const InputField = ({
  label,
  field,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  className,
  error,
  labelClassName,
  inputClassName,
  inputId,
  onBlur,
  autoComplete,
}: {
  label: React.ReactNode;
  field: string;
  value: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  onChange: (field: string, value: string) => void;
  className?: string;
  /** Shown below the input; sets `aria-invalid` and `role="alert"` when set. */
  error?: string;
  labelClassName?: string;
  inputClassName?: string;
  /** Defaults to `field` when omitted. Use when multiple fields share one label scope. */
  inputId?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  autoComplete?: React.ComponentProps<"input">["autoComplete"];
}) => {
  const id = inputId ?? field;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Label
        htmlFor={id}
        className={cn("text-sm font-medium text-contentLight", labelClassName)}
      >
        {label}
        {required ? " *" : null}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        onBlur={onBlur}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "bg-gray-800 border-gray-600 text-white",
          error &&
            "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/25",
          inputClassName,
        )}
        {...(placeholder !== undefined ? { placeholder } : {})}
        {...(autoComplete !== undefined ? { autoComplete } : {})}
      />
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-[11px] font-medium leading-tight text-red-500"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
};

export { Input, InputField };
