import { cn } from "@/utils/styles";

type Props = {
  variant?: "swirling" | "pinwheel"
} & SpinnerVariantProps;

type SpinnerVariantProps = {
  className?: string
};

function Spinner(props: Props) {
  const { variant = "swirling", ...rest } = props;
  const VariantComponent = variantsMap[variant];

  if (!VariantComponent) return null;

  return <VariantComponent {...rest} />;
}

export { Spinner };

const variantsMap: Record<string, React.ComponentType<SpinnerVariantProps>> = {
  swirling: Swirling,
};

function Swirling(props: SpinnerVariantProps) {
  const { className } = props;
  return (
    <>
      <style>
        {`@keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        
          @keyframes spin2 {
            0% {
              stroke-dasharray: 1, 800;
              stroke-dashoffset: 0;
            }
            50% {
              stroke-dasharray: 400, 400;
              stroke-dashoffset: -200px;
            }
            100% {
              stroke-dasharray: 800, 1;
              stroke-dashoffset: -800px;
            }
          }
        
          .spin2 {
            transform-origin: center;
            animation: spin2 1.5s ease-in-out infinite,
              spin 2s linear infinite;
            animation-direction: alternate;
          }`}
      </style>

      <div className={cn("size-12", className)}>
        <svg className={cn("size-12", className)} viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <circle
            // spin2 is defined in the <style> block above.
            // eslint-disable-next-line tailwindcss/no-custom-classname
            className="spin2 stroke-primary"
            cx="400"
            cy="400"
            fill="none"
            r="200"
            strokeDasharray="700 1400"
            strokeLinecap="round"
            strokeWidth="50"
          />
        </svg>
      </div>
    </>
  );
}
