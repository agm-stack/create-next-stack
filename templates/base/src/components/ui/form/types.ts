import type { Control, FieldValues, Path } from "react-hook-form";

export type FormFieldValues = FieldValues & {
  error?: string
};

export type ReactHookFormFieldProps<T extends FieldValues> = {
  control: Control<T>,
  name: Path<T>
};
