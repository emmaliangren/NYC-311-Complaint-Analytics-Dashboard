import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div>
      <nav></nav>
      <Outlet />
    </div>
  );
}
