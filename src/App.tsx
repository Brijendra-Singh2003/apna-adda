import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/home";
import SignupPage from "./pages/signUp";
const BrowserRouter = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/signup", // Add this new route for the signup page
    element: <SignupPage />,
  },
]);

function App() {
  return <RouterProvider router={BrowserRouter} />;
}

export default App;
