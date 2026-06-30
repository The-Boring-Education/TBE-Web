import "./index.css";
import "@/lib/httpToasts";

import { AuthProvider } from "@tbe/auth";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);
