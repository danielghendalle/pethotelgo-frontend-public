import { useState } from "react";
import { useHotel } from "@/contexts/useHotelHook";

interface UseSchedulePageProps {
  onShowReservationForm?: () => void;
}

export function useSchedulePage({
  onShowReservationForm,
}: UseSchedulePageProps = {}) {
  const [showForm, setShowForm] = useState(false);
  const { refreshReservations } = useHotel();

  const handleShowReservationForm = () => {
    setShowForm(true);
    onShowReservationForm?.();
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleFormSuccess = () => {
    refreshReservations();
    setShowForm(false);
  };

  return {
    showForm,
    handleShowReservationForm,
    handleCloseForm,
    handleFormSuccess,
  };
}
