import { useState, useEffect } from "react";
import { useHotel } from "@/contexts/useHotelHook";
import { formatCurrency } from "@/utils/format";
import { parseBrazilianDate } from "@/utils/dateUtils";

interface UseDashboardPageProps {
  onShowReservationForm?: () => void;
  onShowPetForm?: () => void;
  onShowOwnerForm?: () => void;
}

export function useDashboardPage({
  onShowReservationForm,
  onShowPetForm,
  onShowOwnerForm,
}: UseDashboardPageProps = {}) {
  const { pets, owners, reservations, getReservationsForDate } = useHotel();
  const [showForm, setShowForm] = useState(false);

  const today = new Date();
  const todayReservations = getReservationsForDate(today);
  const monthlyRevenue = (() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthReservations = reservations.filter((r) => {
      const reservationDate = parseBrazilianDate(r.checkIn);
      return (
        reservationDate.getMonth() === currentMonth &&
        reservationDate.getFullYear() === currentYear &&
        (r.status === "confirmed" || r.status === "pending")
      );
    });

    return monthReservations.reduce((total, r) => {
      // Calcular número de dias
      const checkIn = parseBrazilianDate(r.checkIn);
      const checkOut = parseBrazilianDate(r.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      const days =
        Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
        ) || 1;

      // Calcular valor com desconto
      const dailyRate = r.dailyRate || 0;
      const discount = r.discountPercentage || 0;
      const discountedRate = dailyRate * (1 - discount / 100);
      const totalValue = discountedRate * days;

      return total + totalValue;
    }, 0);
  })();
  const pendingReservations = reservations.filter(
    (r) => r.status === "pending",
  );

  const stats = [
    {
      label: "Ocupação Hoje",
      value: todayReservations.length,
      max: 5,
      iconName: "paw",
      color: "text-primary",
      bgContainer: "bg-primary/10",
      progressColor: "bg-primary",
    },
    {
      label: "Clientes Cadastrados",
      value: owners.length,
      iconName: "users",
      color: "text-blue-600",
      bgContainer: "bg-blue-500/10",
      progressColor: "bg-blue-500",
    },
    {
      label: "Faturamento do Mês",
      value: Math.round(monthlyRevenue),
      iconName: "trending",
      color: "text-green-600",
      bgContainer: "bg-green-500/10",
      progressColor: "bg-green-500",
      isCurrency: true,
    },
    {
      label: "Pets Cadastrados",
      value: pets.length,
      iconName: "calendar",
      color: "text-success",
      bgContainer: "bg-success/10",
      progressColor: "bg-success",
    },
  ];

  const getOccupancyPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 80) return "text-red-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-green-600";
  };

  const getUpcomingCheckIns = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const upcoming = reservations
      .filter((r) => {
        const checkIn = new Date(r.checkIn);
        checkIn.setHours(0, 0, 0, 0);
        const checkInTime = checkIn.getTime();

        const isAfterToday = checkInTime > todayTime;
        const hasValidStatus =
          r.status === "confirmed" || r.status === "pending";

        return isAfterToday && hasValidStatus;
      })
      .sort(
        (a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime(),
      )
      .slice(0, 5);

    return upcoming;
  };

  const getActiveStays = () => {
    const today = new Date();
    return reservations.filter((r) => {
      const checkIn = new Date(r.checkIn);
      const checkOut = new Date(r.checkOut);
      return checkIn <= today && checkOut >= today;
    });
  };

  const getMonthlyRevenue = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return reservations
      .filter((r) => {
        const reservationDate = parseBrazilianDate(r.checkIn);
        return (
          reservationDate.getMonth() === currentMonth &&
          reservationDate.getFullYear() === currentYear &&
          (r.status === "confirmed" || r.status === "pending")
        );
      })
      .reduce((total, r) => {
        // Calcular número de dias
        const checkIn = parseBrazilianDate(r.checkIn);
        const checkOut = parseBrazilianDate(r.checkOut);
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);
        const days =
          Math.ceil(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
          ) || 1;

        // Calcular valor com desconto
        const dailyRate = r.dailyRate || 0;
        const discount = r.discountPercentage || 0;
        const discountedRate = dailyRate * (1 - discount / 100);
        const totalValue = discountedRate * days;

        return total + totalValue;
      }, 0);
  };

  const handleShowReservationForm = () => {
    setShowForm(true);
    onShowReservationForm?.();
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  return {
    stats,
    todayReservations,
    pendingReservations,
    showForm,
    pets,
    owners,
    reservations,
    getOccupancyPercentage,
    getOccupancyColor,
    getUpcomingCheckIns,
    getActiveStays,
    getMonthlyRevenue,
    handleShowReservationForm,
    handleCloseForm,
    onShowPetForm,
    onShowOwnerForm,
  };
}
