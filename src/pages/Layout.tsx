import Navbar from "@/components/Navbar";
import { UserContextProvider } from "@/context/User";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <UserContextProvider>
      <div>
        <Navbar />
        <main className="min-h-[calc(100svh-4.1rem)]">
          <Outlet />
        </main>
      </div>
    </UserContextProvider>
  );
}

export default Layout;
