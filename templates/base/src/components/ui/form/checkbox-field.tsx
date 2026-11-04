"use client";

import { Controller } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";

import { Field, FieldError } from "./field";

import type { FormFieldValues, ReactHookFormFieldProps } from "./types";
import type { CheckboxProps } from "@/components/ui/checkbox";

type Props<T extends FormFieldValues> = CheckboxProps & ReactHookFormFieldProps<T>;

function CheckboxField<T extends FormFieldValues>(props: Props<T>) {
  const {
    control, description, label, name, ...rest
  } = props;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Field>
          <Checkbox
            {...rest}
            checked={Boolean(value)}
            description={description}
            error={!!error}
            label={label}
            onCheckedChange={onChange}
          />
          {error && <FieldError>{error.message}</FieldError>}
        </Field>
      )}
    />
  );
}

export { CheckboxField };
