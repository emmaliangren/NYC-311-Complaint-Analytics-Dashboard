import { fetchLastRefresh } from "@/lib/api";

export async function clientLoader() {
  const refresh = await fetchLastRefresh();
  return { refresh };
}
