import { useState, useEffect, useRef } from "react";

export interface Option {
  value: string;
  label: string;
}

interface SearchSelectProps {
  options: Option[];
  value: Option | null;
  onChange: (option: Option) => void;
  placeholder?: string;
  open?: boolean; // external control
  onOpenChange?: (isOpen: boolean) => void; // notify parent
}

export const SearchSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  open: controlledOpen,
  onOpenChange,
}: SearchSelectProps) => {
  const [query, setQuery] = useState("");
  const [internalOpen, setInternalOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (val: boolean) => {
    if (!isControlled) {
      setInternalOpen(val);
    }
    onOpenChange?.(val);
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative w-64">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-600 px-3 py-2 text-left"
      >
        {value ? value.label : <span className="text-gray-400">{placeholder}</span>}
      </button>

      {open && (
        <div className="absolute mt-1 w-full rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-600 shadow-lg z-10">
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border-b dark:border-gray-600 outline-none bg-gray-50 dark:bg-gray-700"
          />

          <ul className="max-h-48 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {opt.label}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500 dark:text-gray-400">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
