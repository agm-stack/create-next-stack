"use client";

import { Controller } from "react-hook-form";

import { Switch } from "@/components/ui/switch";

import { Field, FieldError } from "./field";

import type { FormFieldValues, ReactHookFormFieldProps } from "./types";
import type { SwitchProps } from "@/components/ui/switch";

type Props<T extends FormFieldValues> = SwitchProps & ReactHookFormFieldProps<T>;

function SwitchField<T extends FormFieldValues>(props: Props<T>) {
  const {
    control, description, label, name, ...rest
  } = props;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Field>
          <Switch
            {...rest}
            checked={Boolean(value)}
            description={description}
            label={label}
            onCheckedChange={onChange}
          />
          {error && <FieldError>{error.message}</FieldError>}
        </Field>
      )}
    />
  );
}

export { SwitchField };
