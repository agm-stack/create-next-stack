"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

import { Logger } from "@/lib/logger";
import { cn } from "@/utils/styles";

import { CheckboxField } from "./checkbox-field";
import { InputField } from "./input-field";
import { SwitchField } from "./switch-field";

type Props<T> = {
  className?: string,
  fields: FormFieldProps[],
  visibleFields?: (keyof Omit<T, "error">)[]
};

type SharedFormFieldProps = {
  isHidden?: boolean,
  renderBefore?: () => React.ReactNode,
  renderAfter?: () => React.ReactNode
};

type ConditionalFormFieldProps =
  | { type: "input", props: Omit<React.ComponentProps<typeof InputField>, "control"> }
  /* | { type: "date-time-picker", props: Omit<React.ComponentProps<typeof DateTimePicker>, "control"> } */
  | { type: "switch", props: Omit<React.ComponentProps<typeof SwitchField>, "control"> }
  | { type: "checkbox", props: Omit<React.ComponentProps<typeof CheckboxField>, "control"> }
  | { type: "content", content: React.ReactNode | (() => React.ReactNode) }
  | { type: "separator", render?: () => React.ReactNode };

export type FormFieldProps = SharedFormFieldProps & ConditionalFormFieldProps;

function Fields<T>(props: Props<T>) {
  const { className, fields, visibleFields } = props;
  const { control } = useFormContext();

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {fields.map((field, index) => {
        if (field.type === "separator") {
          return field.render ? field.render() : <div key={`${index}-separator`} className="border-t" />;
        }

        if (field.type === "content") {
          return typeof field.content === "function" ? field.content() : field.content;
        }

        const { props: fieldProps, renderAfter, renderBefore, type } = field;

        const { name } = fieldProps || {};

        if (!name || (visibleFields && !visibleFields.includes(name as Exclude<keyof T, "error">))) return null;

        let Field = null;

        switch (type) {
          case "input": {
            Field = <InputField key={name} {...fieldProps} control={control} name={name} />;
            break;
          }

          case "switch": {
            Field = <SwitchField key={name} {...fieldProps} control={control} name={name} />;
            break;
          }

          case "checkbox": {
            Field = <CheckboxField key={name} {...fieldProps} control={control} name={name} />;
            break;
          }

          default: {
            Logger.warn("Unknown field type", { data: { type } });
          }
        }

        return (
          <React.Fragment key={name}>
            {renderBefore && renderBefore()}
            {Field}
            {renderAfter && renderAfter()}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export { Fields };
