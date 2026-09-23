import { createBrowserRouter } from "react-router-dom";

import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ContentsListPage } from "../pages/ContentsListPage";
import { ContentDetailPage } from "../pages/ContentDetailPage";
import { MatchingServicesPage } from "../pages/MatchingServicesPage";
import { OurHistoryPage } from "../pages/OurHistoryPage";
import { SolutionsPage } from "../pages/SolutionsPage";
import { DashboardPage } from "../pages/DashboardPage";
import { SubmitProjectPage } from "../pages/SubmitProjectPage";
import { SubmitOpportunityPage } from "../pages/SubmitOpportunityPage";
import { MySubmissionsPage } from "../pages/MySubmissionsPage";
import { MatchingResultsPage } from "../pages/MatchingResultsPage";
import { ProfilePage } from "../pages/ProfilePage";
import FoundationDemo from "../pages/FoundationDemo";
import { HomePage } from "../pages/HomePage";
import { PreviewLayoutPage } from "../pages/PreviewLayoutPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signin",
    element: <LoginPage />,
  },
  {
    path: "/cadastro",
    element: <RegisterPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/dashboard/projetos",
    element: <MySubmissionsPage />,
  },
  {
    path: "/dashboard/projetos/novo",
    element: <SubmitProjectPage />,
  },
  {
    path: "/dashboard/projetos/editar/:id",
    element: <SubmitProjectPage />,
  },
  {
    path: "/dashboard/demandas",
    element: <MySubmissionsPage />,
  },
  {
    path: "/dashboard/demandas/nova",
    element: <SubmitOpportunityPage />,
  },
  {
    path: "/dashboard/demandas/editar/:id",
    element: <SubmitOpportunityPage />,
  },
  {
    path: "/dashboard/matching",
    element: <MatchingResultsPage />,
  },
  {
    path: "/dashboard/perfil",
    element: <ProfilePage />,
  },
  {
    path: "/conteudos",
    element: <ContentsListPage />,
  },
  {
    path: "/conteudos/:slug",
    element: <ContentDetailPage />,
  },
  {
    path: "/matching",
    element: <MatchingServicesPage />,
  },
  {
    path: "/nossa-historia",
    element: <OurHistoryPage />,
  },
  {
    path: "/sobre",
    element: <OurHistoryPage />,
  },
  {
    path: "/quem-somos",
    element: <OurHistoryPage />,
  },
  {
    path: "/solucoes",
    element: <SolutionsPage />,
  },
  {
    path: "/foundation",
    element: <FoundationDemo />,
  },
  {
    path: "/preview",
    element: <PreviewLayoutPage />,
  },
]);