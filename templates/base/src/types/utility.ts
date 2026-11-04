export type Nullable<T> = T | null;

export type Empty<T> = T | null | undefined;

export type ValueOf<T> = T[keyof T];

export type Optional<T> = T | null | undefined;

export type SetTimeoutReturnType = ReturnType<typeof setTimeout>;

export type SetIntervalReturnType = ReturnType<typeof setInterval>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ObjectPath = (string | number)[];

export type PropsOf<T extends React.ElementType> = React.ComponentPropsWithRef<T>;
export type PolymorphicRef<T extends React.ElementType> = React.ComponentPropsWithRef<T>["ref"];
export type PolymorphicProps<T extends React.ElementType = React.ElementType, TProps = object> = {
  as?: T
} & TProps & Omit<PropsOf<T>, keyof TProps | "as" | "ref">;
