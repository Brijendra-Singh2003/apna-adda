import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./pages/layout";
import Home from "./pages/home";
import GamePage from "./pages/game";

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
        path: "/play",
        element: <GamePage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={BrowserRouter} />;
}

export default App;
