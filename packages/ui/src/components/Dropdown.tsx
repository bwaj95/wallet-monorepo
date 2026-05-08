import { cva } from "class-variance-authority";

const inputVariants = cva(
  "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
        error: "border-red-500 focus:border-red-500 focus:ring-red-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function Dropdown({
  className,
  variant,
  options,
  onSelect,
  ...props
}: any) {
  return (
    <select
      className={inputVariants({ variant, className })}
      defaultValue=""
      onChange={(e) => onSelect && onSelect(e.target.value)}
      {...props}
    >
      <option value="" disabled>
        Select an option
      </option>
      {options.map((option: any) => (
        <option
          key={option}
          value={option}
          className=" bg-amber-200 text-black font-semibold "
        >
          {option}
        </option>
      ))}
    </select>
  );
}
