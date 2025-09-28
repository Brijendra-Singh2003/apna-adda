import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages";
import Dashboard from "./pages/dashboard";

import { QueryClientProvider } from "@tanstack/react-query";
import Notfound from "./pages/Notfound";
import GamePage from "./pages/world";
import { queryClient } from "./lib/constants";

const BrowserRouter = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/play",
        element: <GamePage />,
      },
      {
        path: "/play/:worldId",
        element: <GamePage />,
      },
      {
        path: "*",
        element: <Notfound />,
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={BrowserRouter} />
    </QueryClientProvider>
  );
}

export default App;
