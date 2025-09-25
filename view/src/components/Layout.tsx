import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Telas em que o sidebar não aparece
  const esconderSidebar =
    location.pathname === "/login"

  return (
    <div className="flex">
      {!esconderSidebar && (
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      )}
      <main className={`transition-all duration-300 min-h-screen max-h-screen overflow-y-auto bg-gray-100 w-full max-w-full overflow-x-auto`}>
        <Outlet />
      </main>
    </div>
  );
}