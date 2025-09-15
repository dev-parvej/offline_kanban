import { CheckIcon } from "@heroicons/react/24/solid";


function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}


export type CheckboxProps = {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};


export function Checkbox({ label, checked, onChange, disabled, className }: CheckboxProps) {
  return (
  <label className={cx("flex items-center gap-2 cursor-pointer", disabled && "opacity-60 cursor-not-allowed", className)}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      disabled={disabled}
      className="peer hidden"
    />
    <span className={cx(
      "flex h-5 w-5 items-center justify-center rounded border transition",
      "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900",
      "peer-checked:bg-indigo-600 peer-checked:border-indigo-600"
      )}
    >
      {checked && <CheckIcon className="h-4 w-4 text-white" />}
    </span>
      {label && <span className="text-gray-900 dark:text-gray-100">{label}</span>}
  </label>
  );
}