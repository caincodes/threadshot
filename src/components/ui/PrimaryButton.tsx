import type { ComponentProps } from "react";

import { cx } from "../../lib/cx";
import { Heading } from "./typography";

interface PrimaryButtonProps extends ComponentProps<"button"> {
  isLoading?: boolean;
}

export const PrimaryButton = ({
  children,
  className,
  isLoading,
  disabled,
  ...props
}: PrimaryButtonProps) => (
  <button
    className={cx(
      "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary p-1 px-4 text-white",
      "hover:bg-primary-hover hover:text-surface-300 active:bg-primary-active active:text-surface-300",
      "disabled:cursor-not-allowed disabled:opacity-40",
      className
    )}
    disabled={disabled || isLoading}
    type="button"
    {...props}
  >
    {isLoading && <Spinner className="size-4 border-white/40 border-t-white" />}
    <Heading>{children}</Heading>
  </button>
);

export const Spinner = ({ className }: { className?: string }) => (
  <span
    aria-label="Loading"
    className={cx(
      "inline-block size-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary",
      className
    )}
    role="status"
  />
);
