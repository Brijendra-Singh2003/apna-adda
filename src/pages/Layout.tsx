import Navbar from "@/components/Navbar";
import { UserContextProvider } from "@/context/User";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <UserContextProvider>
      <div>
        <Navbar />
        <Outlet />
      </div>
    </UserContextProvider>
  );
}

export default Layout;
