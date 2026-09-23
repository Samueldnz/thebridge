import { createBrowserRouter } from "react-router-dom";

import FoundationDemo from "../pages/FoundationDemo";
import { HomePage } from "../pages/HomePage";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/foundation",
    element: <FoundationDemo />,
  },
]);