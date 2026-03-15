import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
// import { ERROR_MESSAGE } from "./constants";
import type { FilterDropdownProps, FilterValue } from "./types";
import Button from "@/components/ui/Button";
import { FiChevronDown } from "react-icons/fi";

const FilterDropdown = <T extends FilterValue>({
  id,
  label,
  value,
  onChange,
  options,
  loading,
  error,
  defaultLabel = "All",
}: FilterDropdownProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);

  const safeOptions = options ?? [];
  const displayValue = value ?? defaultLabel;

  const close = useCallback(() => {
    setOpen(false);
    setFocusIndex(-1);
  }, []);

  const select = useCallback(
    (val: T | undefined) => {
      onChange(val);
      close();
    },
    [onChange, close]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [close]);

  useEffect(() => {
    if (open && listRef.current) {
      const items = listRef.current.querySelectorAll("[role='option']");
      if (focusIndex >= 0 && items[focusIndex]) {
        (items[focusIndex] as HTMLElement).scrollIntoView({ block: "nearest" });
      }
    }
  }, [focusIndex, open]);

  const handleKeyDown = (e: KeyboardEvent) => {
    const totalItems = safeOptions.length + 1;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setFocusIndex(0);
        } else if (focusIndex === 0) {
          select(undefined);
        } else if (focusIndex > 0) {
          select(safeOptions[focusIndex - 1]);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setFocusIndex(0);
        } else {
          setFocusIndex((prev) => Math.min(prev + 1, totalItems - 1));
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (open) {
          setFocusIndex((prev) => Math.max(prev - 1, 0));
        }
        break;
      case "Escape":
        close();
        break;
      case "Tab":
        close();
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative flex flex-col gap-0.5">
      <label
        id={`${id}-label`}
        className="text-[11px] text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400"
      >
        {label}
      </label>
      <Button
        type="button"
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label`}
        aria-controls={`${id}-listbox`}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-busy={loading}
        disabled={loading}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        variant="dropdown"
      >
        <span
          className={`truncate ${value ? "text-xs" : "text-gray-400 dark:text-gray-500 text-xs"}`}
        >
          {loading ? "Loading…" : displayValue}
        </span>
        <FiChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform dark:text-gray-500 ${open ? "rotate-180" : ""}`}
        />
      </Button>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="absolute left-0 top-full  z-50 mt-1 max-h-50 w-full min-w-[10rem] overflow-y-auto rounded-lg border border-gray-200 py-1 shadow-lg dark:border-gray-700 bg-[#f8f9fb] dark:bg-[#0d0d0d]"
        >
          <li
            role="option"
            aria-selected={value === undefined}
            className={`cursor-pointer px-3 py-1.5 text-xs transition-colors ${
              value === undefined
                ? "bg-gray-200 text-gray-600 dark:bg-blue-900/30 dark:text-gray-400"
                : "text-gray-400 hover:bg-gray-200/50 dark:text-gray-500 dark:hover:bg-gray-700/50"
            } ${focusIndex === 0 ? "bg-gray-100 dark:bg-gray-700" : ""}`}
            onClick={() => select(undefined)}
          >
            {defaultLabel}
          </li>
          {safeOptions.map((opt, i) => (
            <li
              key={opt}
              role="option"
              aria-selected={value === opt}
              className={`cursor-pointer px-3 py-1.5 text-xs transition-colors ${
                value === opt
                  ? "bg-gray-200 text-gray-600 dark:bg-blue-900/30 dark:text-gray-400"
                  : "text-gray-800 hover:bg-gray-200/50 dark:text-gray-100 dark:hover:bg-gray-700/50"
              } ${focusIndex === i + 1 ? "bg-gray-100 dark:bg-gray-700" : ""}`}
              onClick={() => select(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
      {/* {error && ( */}
      {/*   <p */}
      {/*     id={`${id}-error`} */}
      {/*     className="absolute -bottom-4 left-0 text-[10px] text-amber-600 dark:text-amber-400" */}
      {/*     role="alert" */}
      {/*   > */}
      {/*     {ERROR_MESSAGE} */}
      {/*   </p> */}
      {/* )} */}
    </div>
  );
};

export default FilterDropdown;
