"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("@EventSync:user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((userData: User, token: string) => {
    localStorage.setItem("@EventSync:token", token);
    localStorage.setItem("@EventSync:user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("@EventSync:token");
    localStorage.removeItem("@EventSync:user");
    setUser(null);
    router.push("/");
  }, [router]);

  const isAuthenticated = !!user;
  const isOrganizer = user?.role === "organizer";
  const isParticipant = user?.role === "participant";

  return {
    user,
    isLoading,
    isAuthenticated,
    isOrganizer,
    isParticipant,
    login,
    logout,
  };
}
