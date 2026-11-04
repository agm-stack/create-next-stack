// @if react-query
import type { QueryKey, UseQueryOptions } from "@tanstack/react-query";
// @endif
import type { LucideProps } from "lucide-react";
import type {
  Control, FieldError, FieldPath, FieldValues, RegisterOptions
} from "react-hook-form";

// @if react-query
/* React query */
export type ReactQueryOptions<T, S = T, TError = Error> =
  | Omit<UseQueryOptions<T, TError, S, QueryKey>, "queryKey" | "queryFn">
  | undefined;

export type ReactQueryMutationPayloadCallbacks<TSuccess = unknown, TError = unknown> = {
  onMutate?: () => void,
  onSuccess?: (data: TSuccess, context?: unknown) => void,
  onError?: (error: TError) => void,
  onSettled?: (payload?: { data?: TSuccess | undefined, error?: TError | null }) => void
};

// @endif
// Lucide
export type IconProps = LucideProps;

// React Hook Form
export type ReactHookFormFieldProps<T extends FieldValues> = {
  name: FieldPath<T>,
  control: Control<T>,
  rules?: RegisterOptions<T>
};

export type FormFieldValues = FieldValues;

export type FormFieldError = FieldError;
