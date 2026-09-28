import { Plus } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { CalendarContainer } from "@/components/calendar/CalendarContainer";
import { ReservationForm } from "@/components/forms/reservation/ReservationForm";
import { Button } from "@/components/ui/button";
import { useSchedulePage } from "./useSchedulePage";

export function SchedulePage() {
  const {
    showForm,
    handleShowReservationForm,
    handleCloseForm,
    handleFormSuccess,
  } = useSchedulePage();

  return (
    <MainLayout title="Agendamentos" subtitle="Gerencie reservas e hospedagens">
      {/* Actions */}
      <div className="mb-4 sm:mb-6 flex justify-end">
        <Button
          onClick={handleShowReservationForm}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Reserva
        </Button>
      </div>

      {/* Calendar */}
      <CalendarContainer />

      {/* Form Modal */}
      {showForm && (
        <ReservationForm
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </MainLayout>
  );
}
