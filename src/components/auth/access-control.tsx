"use client";

import { useAuthorization, Role } from "@/hooks/use-authorization";
import { ReactNode } from "react";

interface AccessControlProps {
  children: ReactNode;
  allowedRoles?: Role[];
  fallback?: ReactNode;
  requireAdmin?: boolean;
}

/**
 * A wrapper component that restricts visibility based on user roles.
 */
export function AccessControl({
  children,
  allowedRoles,
  fallback = null,
  requireAdmin = false,
}: AccessControlProps) {
  const { role, isAdmin, isLoading, isAuthenticated } = useAuthorization();

  if (isLoading) return null;
  if (!isAuthenticated) return <>{fallback}</>;

  if (requireAdmin && !isAdmin) {
    return <>{fallback}</>;
  }

  if (allowedRoles && role && !allowedRoles.includes(role as Role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
