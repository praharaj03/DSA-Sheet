import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import DashboardClient from "../../components/DashboardClient";
import "../../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DashboardClient />
    <Toaster theme="dark" />
  </StrictMode>,
);
