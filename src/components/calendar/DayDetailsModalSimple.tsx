import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Calendar,
  DollarSign,
  Pencil,
  Trash2,
  Pill,
  Utensils,
  PawPrint,
  User,
  Phone,
  Mail,
} from "lucide-react";
import { format, differenceInCalendarDays, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useHotel } from "@/contexts/useHotelHook";
import { useDailyRate } from "@/hooks/useDailyRate";
import { useToast } from "@/hooks/use-toast";
import { parseBrazilianDate } from "@/utils/dateUtils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ReservationForm } from "@/components/forms/reservation/ReservationForm";
import type { Reservation } from "@/types/hotel";

const sizeLabels = {
  pequeno: "Pequeno",
  medio: "Médio",
  grande: "Grande",
};

const sociabilityLabels = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
}

export function DayDetailsModalSimple({
  isOpen,
  onClose,
  date,
}: DayDetailsModalProps) {
  const { getReservationsForDate, getPetById, getOwnerById, deleteReservation } =
    useHotel();
  const { standardRate } = useDailyRate();
  const { toast } = useToast();
  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);
  const [deletingReservation, setDeletingReservation] =
    useState<Reservation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const reservations = getReservationsForDate(date);

  const handleConfirmDelete = async () => {
    if (!deletingReservation) return;

    try {
      setIsDeleting(true);
      await deleteReservation(deletingReservation.id);
      toast({
        title: "Reserva excluída",
        description: "A reserva foi removida com sucesso.",
      });
      setDeletingReservation(null);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Não foi possível excluir a reserva",
        description:
          err instanceof Error ? err.message : "Tente novamente mais tarde.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const totalValue = reservations.reduce((sum, res) => {
    const dailyRate = res.dailyRate || standardRate;
    const discount = res.discountPercentage || 0;
    const discountedRate = dailyRate * (1 - discount / 100);
    return sum + discountedRate;
  }, 0);

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
        onClick={onClose}
      >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85dvh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-card p-6 shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">
                {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {reservations.length}{" "}
                {reservations.length === 1 ? "reserva" : "reservas"} •{" "}
                {reservations.length} pets
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-2">
              <PawPrint className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Quantidade de pets</span>
            </div>
            <p className="text-2xl font-bold mt-1">{reservations.length}</p>
          </div>

          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Valor Total</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">
              R$ {totalValue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Reservations */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Reservas do Dia
          </h3>

          {reservations.length === 0 ? (
            <div className="border rounded-lg p-8 text-center bg-card">
              <PawPrint className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Nenhuma reserva para este dia
              </p>
            </div>
          ) : (
            reservations.map((reservation) => {
              const reservationWithIds = reservation as typeof reservation & {
                petId?: string;
                ownerId?: string;
              };

              const pet =
                reservation.pet ??
                (reservationWithIds.petId
                  ? getPetById(reservationWithIds.petId)
                  : undefined);
              const owner =
                reservation.owner ??
                (reservationWithIds.ownerId
                  ? getOwnerById(reservationWithIds.ownerId)
                  : undefined);

              const checkIn = parseBrazilianDate(reservation.checkIn);
              const checkOut = parseBrazilianDate(reservation.checkOut);
              // Diária cobrada por dia corrido ocupado (check-in e check-out
              // contam cada um como uma diária), não por noite.
              const days =
                isValid(checkIn) && isValid(checkOut)
                  ? Math.max(1, differenceInCalendarDays(checkOut, checkIn) + 1)
                  : 1;
              const dailyRate = reservation.dailyRate || standardRate;
              const discount = reservation.discountPercentage || 0;
              const discountedRate = dailyRate * (1 - discount / 100);
              const totalValue = discountedRate * days;

              return (
                <div
                  key={reservation.id}
                  className="border rounded-lg p-4 bg-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <PawPrint className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold">
                          {pet?.name || "Pet não encontrado"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {pet?.breed || "Raça não informada"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs border px-2 py-1 rounded">
                            <span className="font-medium">Porte:</span>{" "}
                            {pet?.size
                              ? sizeLabels[pet.size]
                              : "não informado"}
                          </span>
                          <span className="text-xs border px-2 py-1 rounded">
                            <span className="font-medium">Sociabilidade:</span>{" "}
                            {pet?.sociability
                              ? sociabilityLabels[pet.sociability]
                              : "não informada"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          R$ {discountedRate.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Valor por pet no dia
                        </p>
                        {days > 1 && (
                          <p className="text-xs text-muted-foreground/80">
                            Total da hospedagem: R$ {totalValue.toFixed(2)}
                          </p>
                        )}
                        {discount > 0 && (
                          <span className="text-xs border px-2 py-1 rounded bg-secondary text-secondary-foreground mt-1">
                            -{discount}% desconto
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditingReservation(reservation)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {reservation.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeletingReservation(reservation)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {/* Owner Info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{owner?.name || "Tutor não encontrado"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{owner?.phone || "Telefone não informado"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{owner?.email || "Email não informado"}</span>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {isValid(checkIn) && isValid(checkOut)
                            ? `${format(checkIn, "dd/MM/yyyy", { locale: ptBR })} - ${format(checkOut, "dd/MM/yyyy", { locale: ptBR })}`
                            : "Data não disponível"}
                        </span>
                      </div>
                    </div>

                    {/* Care Schedule */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm mb-3">
                        Programa de Cuidados
                      </h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        {/* Feeding */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Utensils className="h-4 w-4 text-orange-600" />
                            <div>
                              <p className="text-sm font-medium">Alimentação</p>
                              <p className="text-xs text-muted-foreground">
                                {pet?.feedingSchedule}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {pet?.feedingAmount}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {pet?.feedingSchedule
                                ? "Agendado"
                                : "Não agendado"}
                            </span>
                          </div>
                        </div>

                        {/* Medication */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Pill className="h-4 w-4 text-red-600" />
                            <div>
                              <p className="text-sm font-medium">Medicação</p>
                              <p className="text-xs text-muted-foreground">
                                {pet?.specialCare ||
                                  "Nenhuma medicação necessária"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {pet?.specialCare ? "Agendado" : "Não agendado"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Special Care */}
                      {pet?.allergies && (
                        <div className="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                          <p className="text-sm font-medium text-yellow-800">
                            Alergias
                          </p>
                          <p className="text-xs text-yellow-700">
                            {pet.allergies}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {reservation.notes && (
                      <div className="border-t pt-3">
                        <p className="text-sm font-medium mb-1">Observações</p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
      </motion.div>

      {editingReservation && (
        <ReservationForm
          reservation={editingReservation}
          onClose={() => setEditingReservation(null)}
          onSuccess={() => setEditingReservation(null)}
        />
      )}

      <AlertDialog
        open={deletingReservation !== null}
        onOpenChange={(open) => !open && setDeletingReservation(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir reserva</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a reserva de{" "}
              {deletingReservation?.pet?.name || "este pet"}? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
