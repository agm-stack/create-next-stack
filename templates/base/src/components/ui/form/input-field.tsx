"use client";

import { Controller } from "react-hook-form";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

import { Field, FieldDescription, FieldError, FieldLabel } from "./field";

import type { FormFieldValues, ReactHookFormFieldProps } from "./types";
import type { InputProps } from "@/components/ui/input";

type Props<T extends FormFieldValues> = InputProps &
  ReactHookFormFieldProps<T> & {
    label?: string,
    description?: string,
    classNames?: {
      container?: string,
      input?: string
    },
    endContent?: React.ReactNode,
    startContent?: React.ReactNode
  };

function InputField<T extends FormFieldValues>(props: Props<T>) {
  const {
    classNames = {}, control, description, endContent, label, name, startContent, ...rest
  } = props;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        return (
          <Field invalid={!!error}>
            {label && <FieldLabel>{label}</FieldLabel>}
            <InputGroup className={classNames.container}>
              {startContent && <InputGroupAddon align="inline-start">{startContent}</InputGroupAddon>}
              <InputGroupInput {...rest} className={classNames.input} value={value} onChange={onChange} />
              {endContent && <InputGroupAddon align="inline-end">{endContent}</InputGroupAddon>}
            </InputGroup>
            {description && <FieldDescription>{description}</FieldDescription>}
            {error && <FieldError>{error.message}</FieldError>}
          </Field>
        );
      }}
    />
  );
}

export { InputField };
