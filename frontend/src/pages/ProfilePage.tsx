import { useState, useEffect } from "react";
import { authService, type User } from "../services/auth";
import { ResearcherProfilePage } from "./ResearcherProfilePage";
import { CompanyProfilePage } from "./CompanyProfilePage";

export function ProfilePage() {
  const [user, setUser] = useState<User | null>(authService.getStoredUser());

  useEffect(() => {
    setUser(authService.getStoredUser());
  }, []);

  if (user?.profileType === "RESEARCHER") {
    return <ResearcherProfilePage />;
  }

  return <CompanyProfilePage />;
}

export { ResearcherProfilePage, CompanyProfilePage };
