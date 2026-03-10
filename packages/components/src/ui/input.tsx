import { cn } from "@tbe/utils";
import * as React from "react";

import { Label } from "../ui/label";

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
}: {
  label: string;
  field: string;
  value: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  onChange: (field: string, value: string) => void;
  className?: string;
}) => (
  <div className="flex gap-2 flex-col">
    <Label htmlFor={field} className="text-contentLight">
      {label}
      {required && " *"}
    </Label>
    <Input
      id={field}
      type={type}
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      required={required}
      placeholder={placeholder}
      className={cn("bg-gray-800 border-gray-600 text-white", className)}
    />
  </div>
);

export { Input, InputField };
