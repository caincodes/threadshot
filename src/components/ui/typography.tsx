import type { ComponentProps } from "react";

import { cx } from "../../lib/cx";

type TextProps = ComponentProps<"p">;
type BlockProps = ComponentProps<"div">;

export const Title = ({ className, ...props }: TextProps) => (
  <p className={cx("text-xl font-bold", className)} {...props} />
);

export const Heading = ({ className, ...props }: TextProps) => (
  <p className={cx("text-base font-semibold", className)} {...props} />
);

// A div rather than a p: it holds reddit's rendered HTML, which contains <p>.
export const Paragraph = ({ className, ...props }: BlockProps) => (
  <div className={cx("text-sm font-normal", className)} {...props} />
);

export const Caption = ({
  className,
  bold,
  ...props
}: TextProps & { bold?: boolean }) => (
  <p
    className={cx(
      "text-xs break-keep",
      bold ? "font-bold" : "font-extralight",
      className
    )}
    {...props}
  />
);
