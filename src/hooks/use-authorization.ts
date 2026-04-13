"use client";

import { useSession } from "next-auth/react";

export type Role = "admin" | "user";

export function useAuthorization() {
  const { data: session, status } = useSession();

  const user = session?.user;
  const role = user?.role as Role | undefined;

  const isAdmin = role === "admin";
  const isUser = role === "user";
  const isAuthenticated = status === "authenticated";

  const hasRole = (requiredRoles: Role[]) => {
    if (!role) return false;
    return requiredRoles.includes(role);
  };

  return {
    user,
    role,
    isAdmin,
    isUser,
    isAuthenticated,
    hasRole,
    isLoading: status === "loading",
  };
}
