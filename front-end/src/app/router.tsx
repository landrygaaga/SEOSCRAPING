import { createBrowserRouter } from "react-router-dom";

import AppLayout from "./layout/AppLayout";
import HomePage from "@/pages/HomePage";
import AuditPage from "@/pages/AuditPage";
import HistoryPage from "@/pages/HistoryPage";
import AuditDetailPage from "@/pages/AuditDetailPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/audit", element: <AuditPage /> },
      { path: "/audit/preview", element: <AuditDetailPage /> },
      { path: "/historique", element: <HistoryPage /> },
      { path: "/historique/:id", element: <AuditDetailPage /> },
    ],
  },
]);
