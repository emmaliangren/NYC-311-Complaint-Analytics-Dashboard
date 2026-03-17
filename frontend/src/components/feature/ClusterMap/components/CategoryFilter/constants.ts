import type { ComplaintType } from "@/types/api";
import { FIXTURES as F } from "@/mocks/constants";
import type { FilterOptionsResponse } from "@/types/ClusterMap";

export const DEFAULT_LABEL = "All complaint types";
export const LOADING_DELAY_MS = 5000;

export const TEST_ID = "test-filter";
export const TEST_LABEL = "Test Filter";
export const TEST_DEFAULT = "All items";
export const TEST_OPTIONS: ComplaintType[] = ["Noise - Residential", "Heat/Hot Water", "Graffiti"];

export const COMPLAINT_TYPES = F.filterOptions.ok.complaintTypes;
export const BOROUGHS = F.filterOptions.ok.boroughs;
export const STATUSES = F.filterOptions.ok.statuses;

export const ERROR_MESSAGE = "";

export const FALLBACK_OPTIONS: FilterOptionsResponse = {
  complaintTypes: [
    "Noise - Residential",
    "Noise - Commercial",
    "Noise - Street/Sidewalk",
    "Illegal Parking",
    "Blocked Driveway",
    "Heat/Hot Water",
    "Street Condition",
    "Water System",
    "Rodent",
    "Unsanitary Condition",
    "Traffic Signal Condition",
    "Homeless Encampment",
    "Graffiti",
    "Air Quality",
    "Sewer",
  ],
  boroughs: ["MANHATTAN", "BROOKLYN", "QUEENS", "BRONX", "STATEN ISLAND"],
  statuses: ["Open", "Closed", "In Progress", "Assigned", "Started", "Pending"],
};

export const FILTERS = [
  {
    id: "category-filter",
    label: "Category",
    defaultLabel: "All complaint types",
    key: "complaintTypes",
    value: "complaintType",
    setter: "setComplaintType",
  },
  {
    id: "borough-filter",
    label: "Borough",
    defaultLabel: "All boroughs",
    key: "boroughs",
    value: "borough",
    setter: "setBorough",
  },
  {
    id: "status-filter",
    label: "Status",
    defaultLabel: "All statuses",
    key: "statuses",
    value: "status",
    setter: "setStatus",
  },
] as const;
