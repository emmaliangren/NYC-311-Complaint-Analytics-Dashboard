import ClusterMap from "@/components/ClusterMap/ClusterMap";

export function ErrorBoundary() {
  return <div>Something went wrong</div>;
}

export default function Dashboard() {
  return (
    <div>
      <ClusterMap />
    </div>
  );
}
