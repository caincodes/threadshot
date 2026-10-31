import type { ComponentProps } from "react";

import { cx } from "../../../../lib/cx";

export const BadgeContainer = ({
  children,
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    className={cx(
      "flex shrink items-center justify-center gap-2 rounded-lg border border-gray-200 px-1 py-0.5",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
