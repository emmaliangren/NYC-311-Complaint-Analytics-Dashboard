import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div>
      <nav></nav>
      <main id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
