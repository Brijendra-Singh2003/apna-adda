import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/home";
const BrowserRouter = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
]);

function App() {
  return <RouterProvider router={BrowserRouter} />;
}

export default App;
