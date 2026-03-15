import FilterDropdown from "./FilterDropdown";
import { useFilters } from "@/context/FilterProvider";
import type { FilterValue } from "./types";
import { FILTERS } from "./constants";

const CategoryFilter = () => {
  const filters = useFilters();
  return (
    <div className="flex flex-col gap-3">
      {FILTERS.map(({ id, label, defaultLabel, key, value, setter }) => (
        <FilterDropdown
          key={id}
          id={id}
          label={label}
          defaultLabel={defaultLabel}
          value={filters[value] as FilterValue}
          onChange={filters[setter] as (value: FilterValue | undefined) => void}
          options={filters.options[key]}
          loading={filters.loading}
          error={filters.error}
        />
      ))}
    </div>
  );
};

export default CategoryFilter;
