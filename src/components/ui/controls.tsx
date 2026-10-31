import type { ChangeEvent, ComponentProps } from "react";

import { cx } from "../../lib/cx";

const fieldClass =
  "rounded-md border border-gray-200 bg-white px-2 py-1 text-sm outline-none hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

interface NumberInputProps {
  defaultValue: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export const NumberInput = ({
  defaultValue,
  min,
  max,
  onChange,
}: NumberInputProps) => (
  <input
    className={cx(fieldClass, "w-20")}
    defaultValue={defaultValue}
    max={max}
    min={min}
    type="number"
    onChange={(event: ChangeEvent<HTMLInputElement>) => {
      const value = event.currentTarget.valueAsNumber;
      if (!Number.isNaN(value)) {
        onChange(Math.min(max, Math.max(min, value)));
      }
    }}
  />
);

interface ToggleProps {
  isChecked: boolean;
  onChange: () => void;
  label: string;
}

export const Toggle = ({ isChecked, onChange, label }: ToggleProps) => (
  <label className="relative inline-flex cursor-pointer items-center">
    <input
      aria-label={label}
      checked={isChecked}
      className="peer sr-only"
      role="switch"
      type="checkbox"
      onChange={onChange}
    />
    <span className="h-4 w-7 rounded-full bg-gray-300 transition-colors peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/60 after:absolute after:top-0.5 after:left-0.5 after:size-3 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-3" />
  </label>
);

export const MultiSelect = ({
  className,
  children,
  ...props
}: ComponentProps<"select">) => (
  <select className={cx(fieldClass, className)} {...props}>
    {children}
  </select>
);
