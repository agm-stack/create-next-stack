import { MoveDown, MoveLeft, MoveRight, MoveUp } from "lucide-react";

import type { IconProps } from "@/types";

function IconArrow(props: IconProps & { direction?: "right" | "left" | "up" | "down" }) {
  const { direction = "right", ...rest } = props;
  const ArrowComponent = directionMap[direction] || MoveRight;
  return <ArrowComponent {...rest} />;
}

const directionMap: Record<"right" | "left" | "up" | "down", React.ComponentType<IconProps>> = {
  right: MoveRight,
  left: MoveLeft,
  up: MoveUp,
  down: MoveDown,
};

export { IconArrow };
