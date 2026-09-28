import { useState } from "react";
import { useAuth } from "@/contexts/useAuthHook";
import { useOwners } from "@/hooks/useOwners";
import { usePets } from "@/hooks/usePets";
import { useReservations } from "@/hooks/useReservations";
import { useStayHistory } from "@/hooks/useStayHistory";

interface UseDashboardProps {
  onShowReservationForm?: () => void;
  onShowPetForm?: () => void;
  onShowOwnerForm?: () => void;
}

export function useDashboard({
  onShowReservationForm,
  onShowPetForm,
  onShowOwnerForm,
}: UseDashboardProps = {}) {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { owners, loading: ownersLoading, createOwner } = useOwners();
  const { pets, loading: petsLoading, createPet } = usePets();
  const { reservations } = useReservations();
  const { stayHistories } = useStayHistory();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginForm);
    } catch (error) {
      alert(
        "Login failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      alert(
        "Logout failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  const handleCreateOwner = async () => {
    try {
      await createOwner({
        name: "John Doe",
        phone: "+1234567890",
      });
      alert("Owner created successfully!");
    } catch (error) {
      alert(
        "Failed to create owner: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  const handleCreatePet = async () => {
    try {
      await createPet({
        name: "Buddy",
        breed: "Golden Retriever",
        size: "medio" as any,
        owner: owners[0],
        baseDailyRate: 50,
        sizeMultiplier: {
          pequeno: 1.0,
          medio: 1.0,
          grande: 1.6,
        },
        notificationSettings: {
          feeding: true,
          medication: true,
          checkIn: true,
          checkOut: true,
        },
      });
      alert("Pet created successfully!");
    } catch (error) {
      alert(
        "Failed to create pet: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  const getDashboardStats = () => {
    return {
      totalOwners: owners.length,
      totalPets: pets.length,
      activeReservations: reservations.filter((r) => r.status === "active")
        .length,
      pendingReservations: reservations.filter((r) => r.status === "pending")
        .length,
      totalStays: stayHistories.length,
      loading: ownersLoading || petsLoading,
    };
  };

  const getUpcomingReservations = () => {
    const today = new Date();
    return reservations
      .filter((r) => new Date(r.checkIn) >= today)
      .sort(
        (a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime(),
      )
      .slice(0, 5);
  };

  const getWeekOverview = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return {
      weekStart,
      weekEnd,
      reservations: reservations.filter((r) => {
        const checkIn = new Date(r.checkIn);
        const checkOut = new Date(r.checkOut);
        return checkIn <= weekEnd && checkOut >= weekStart;
      }),
    };
  };

  return {
    user,
    isAuthenticated,
    loginForm,
    setLoginForm,
    owners,
    pets,
    reservations,
    stayHistories,
    loading: ownersLoading || petsLoading,
    handleLogin,
    handleLogout,
    handleCreateOwner,
    handleCreatePet,
    getDashboardStats,
    getUpcomingReservations,
    getWeekOverview,
    onShowReservationForm,
    onShowPetForm,
    onShowOwnerForm,
  };
}
