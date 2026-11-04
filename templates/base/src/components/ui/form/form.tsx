"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import * as React from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { useText } from "@/hooks/use-text";
import { HTTP_STATUS_CODES, isHttpClientError } from "@/lib/http";
import { cn } from "@/utils/styles";

import { Fields } from "./fields";

import type { FormFieldProps } from "./fields";

import type { ButtonProps } from "@/components/ui/button";
import type {
  DefaultValues, FieldValues, Path, SubmitHandler, UseFormReturn
} from "react-hook-form";
import type { ZodType } from "zod";

export type RenderFormProps<T extends FieldValues = Record<string, string>, C = unknown, V extends FieldValues = T> = {
  isLoading?: boolean,
  error?: string,
  formMethods: UseFormReturn<T, C, V>
};

export type FormMethods<
  T extends FieldValues = Record<string, string>,
  C = unknown,
  V extends FieldValues = T,
> = UseFormReturn<T, C, V>;

type FormButtonProps = ButtonProps & {
  isVisible?: boolean,
  label?: string
};

type SharedProps<T extends FieldValues, C = unknown, V extends FieldValues = T> = {
  className?: string,
  classNames?: {
    root?: string,
    actions?: string,
    fields?: string
  },
  onSubmit?: (
    data: V,
    formMethods: FormMethods<T, C, V>,
    onError: (err: unknown) => void,
    onSuccess: (value: unknown) => void
  ) => void,
  onCancel?: () => void,
  submitButtonProps?: FormButtonProps,
  cancelButtonProps?: FormButtonProps,
  shouldSubmitOnBlur?: boolean,
  submitLabel?: string,
  cancelLabel?: string,
  isLoading?: boolean,
  initialValues?: Partial<T>,
  validationSchema?: ZodType<T>,
  withoutActions?: boolean,
  renderActions?: (renderFormProps: RenderFormProps<T, C, V>) => React.ReactNode,
  renderActionsBefore?: () => React.ReactNode,
  renderActionsAfter?: () => React.ReactNode,
  renderBefore?: (renderFormProps: RenderFormProps<T, C, V>) => React.ReactNode,
  renderAfter?: (renderFormProps: RenderFormProps<T, C, V>) => React.ReactNode
};

type ConditionalProps<T extends FieldValues, C = unknown, V extends FieldValues = T> =
  | {
    children?: React.ReactNode,
    renderForm?: never,
    fields?: never,
    visibleFields?: never
  }
  | {
    children?: never,
    renderForm?: (renderFormProps: RenderFormProps<T, C, V>) => React.JSX.Element,
    fields?: never,
    visibleFields?: never
  }
  | {
    children?: never,
    renderForm?: never,
    fields?: FormFieldProps[],
    visibleFields?: (keyof Omit<T, "error">)[]
  };

type Props<T extends FieldValues, C = unknown, V extends FieldValues = T> = SharedProps<T, C, V> &
  ConditionalProps<T, C, V>;

function Form<T extends FieldValues, C = unknown, V extends FieldValues = T>(props: Props<T, C, V>) {
  const {
    cancelButtonProps,
    children,
    className,
    classNames = {},
    fields,
    initialValues,
    isLoading,
    onCancel,
    onSubmit,
    renderActions,
    renderActionsAfter,
    renderActionsBefore,
    renderAfter,
    renderBefore,
    renderForm,
    shouldSubmitOnBlur,
    submitButtonProps,
    validationSchema,
    visibleFields,
    withoutActions,
  } = props;

  const t = useText("common");

  const {
    disabled: isSubmitButtonDisabled,
    isVisible: isSubmitVisible = true,
    label: submitLabel = t("form.submit"),
    loading: isSubmitButtonLoading,
    ...restSubmitButtonProps
  } = submitButtonProps || {};

  const {
    disabled: isCancelButtonDisabled,
    isVisible: isCancelVisible = false,
    label: cancelLabel = t("form.cancel"),
    ...restCancelButtonProps
  } = cancelButtonProps || {};

  const formMethods = useForm<T, C, V>({
    ...(validationSchema ? { resolver: standardSchemaResolver(validationSchema) } : {}),
    defaultValues: React.useMemo(() => (initialValues as DefaultValues<T>) || undefined, [initialValues]),
  });

  const { clearErrors, formState, handleSubmit, setError } = formMethods;
  const { errors } = formState;

  const onSubmitError = (err: unknown) => {
    if (isHttpClientError(err)) {
      if (err?.response?.status === HTTP_STATUS_CODES.BAD_REQUEST) {
        const message = err?.message || t("form.genericError");
        setError("error" as Path<T>, { type: "custom", message });
        return;
      }
    }
    setError("error" as Path<T>, {
      type: "custom",
      message: t("form.genericError"),
    });
  };

  const onSubmitSuccess = () => {
    //
  };

  const onSubmitInternal: SubmitHandler<V> = async (data: V) => {
    if (onSubmit) {
      clearErrors();
      onSubmit(data, formMethods, onSubmitError, onSubmitSuccess);
    }
  };

  const genericError = errors?.error?.message?.toString() || "";
  const renderProps = { isLoading, error: genericError, formMethods };

  return (
    <FormProvider {...formMethods}>
      <form
        className={cn(className, classNames.root)}
        onBlur={() => {
          if (shouldSubmitOnBlur) {
            handleSubmit((data) => onSubmitInternal(data))();
          }
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit((data) => onSubmitInternal(data))(e);
        }}
      >
        {renderBefore && renderBefore(renderProps)}
        {renderForm ? (
          renderForm(renderProps)
        ) : (
          <>
            {children && children}
            {fields && <Fields<T> className={classNames.fields} fields={fields} visibleFields={visibleFields} />}
          </>
        )}
        {!withoutActions ? (
          <div
            className={cn(
              "mt-4 flex flex-wrap items-center gap-2",
              classNames.actions,
            )}
          >
            {renderActionsBefore && renderActionsBefore()}
            {renderActions ? (
              renderActions(renderProps)
            ) : (
              <>
                {isCancelVisible && (
                  <Button disabled={isLoading || isCancelButtonDisabled} onClick={onCancel} {...restCancelButtonProps}>
                    {cancelLabel}
                  </Button>
                )}
                {isSubmitVisible && (
                  <Button
                    disabled={isLoading || isSubmitButtonDisabled}
                    loading={isLoading || isSubmitButtonLoading}
                    type="submit"
                    {...restSubmitButtonProps}
                  >
                    {submitLabel}
                  </Button>
                )}
              </>
            )}
            {renderActionsAfter && renderActionsAfter()}
          </div>
        ) : null}
        {renderAfter && renderAfter(renderProps)}
      </form>
    </FormProvider>
  );
}
export { Form };
