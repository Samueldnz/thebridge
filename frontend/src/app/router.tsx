import { createBrowserRouter } from "react-router-dom";
import FoundationDemo from "../pages/FoundationDemo";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <main className="flex min-h-screen items-center justify-center bg-surface-primary">
        <div className="text-center">
          <p className="mb-4 font-body text-label uppercase text-text-muted">
            The Bridge
          </p>

          <h1 className="font-display text-display-md font-bold text-text-primary">
            Frontend Foundation
          </h1>

          <p className="mt-4 font-body text-body-sm text-text-secondary">
            Foundation em construção.
          </p>
        </div>
      </main>
    ),
  },
  {
    path: "/foundation",
    element: <FoundationDemo />,
  },
]);