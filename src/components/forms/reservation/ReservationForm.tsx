import { X, Calendar, PawPrint } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptySelectItem } from "@/components/ui/EmptySelectItem";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PriceSimulator } from "../price/PriceSimulator";
import { formatDateToBrazilian } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";
import { useReservationForm } from "./useReservationForm";
import type { Reservation } from "@/types/hotel";

interface ReservationFormProps {
  reservation?: Reservation;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReservationForm({
  reservation,
  onClose,
  onSuccess,
}: ReservationFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    errors,
    isSubmitting,
    isEditMode,
    selectedPetId,
    checkInDate,
    checkOutDate,
    dailyRateValue,
    discountValue,
    selectedPet,
    selectedOwner,
    pets,
    owners,
    handleDailyRateChange,
    handleDiscountChange,
    formatCurrency,
    calculateTotalValue,
    onSubmit,
  } = useReservationForm({ reservation, onClose, onSuccess });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85dvh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Editar Reserva" : "Nova Reserva"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {!isEditMode && (
              <div>
                <Label htmlFor="petId">Pet</Label>
                <Select
                  value={selectedPetId}
                  onValueChange={(value) => setValue("petId", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione um pet" />
                  </SelectTrigger>
                  <SelectContent>
                    <EmptySelectItem message="Nenhum pet encontrado" />
                    {pets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name} - {pet.breed} ({pet.size})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.petId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.petId.message}
                  </p>
                )}
              </div>
            )}

            {selectedPet && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <PawPrint className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Pet Selecionado:</span>
                </div>
                <div className="mt-2">
                  <p className="font-medium text-foreground">
                    {selectedPet.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPet.breed} · Tutor: {selectedOwner.name}
                  </p>
                </div>
              </div>
            )}

            <div>
              <Label>Data de Entrada</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "mt-1 w-full justify-start text-left font-normal",
                      !checkInDate && "text-muted-foreground",
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {checkInDate
                      ? formatDateToBrazilian(checkInDate)
                      : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={checkInDate}
                    onSelect={(date) => date && setValue("checkInDate", date)}
                    disabled={(date) => date < today}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Data de Saida</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "mt-1 w-full justify-start text-left font-normal",
                      !checkOutDate && "text-muted-foreground",
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {checkOutDate
                      ? formatDateToBrazilian(checkOutDate)
                      : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={checkOutDate}
                    onSelect={(date) => date && setValue("checkOutDate", date)}
                    disabled={(date) => date < checkInDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="dailyRate">Valor da Diária (R$)</Label>
                <Input
                  id="dailyRate"
                  type="text"
                  {...register("dailyRate")}
                  placeholder="R$ 0,00"
                  onChange={handleDailyRateChange}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Defina o valor da diária manualmente
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Campo editável - valor será multiplicado pelos dias
                </p>
              </div>
              <div>
                <Label htmlFor="discountPercentage">Desconto (%)</Label>
                <Input
                  id="discountPercentage"
                  type="text"
                  {...register("discountPercentage")}
                  placeholder="0%"
                  onChange={handleDiscountChange}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Desconto opcional (0-100%)
                </p>
              </div>
            </div>

            {checkInDate && checkOutDate && selectedPet && (
              <PriceSimulator
                petSize={selectedPet.size}
                checkIn={checkInDate}
                checkOut={checkOutDate}
                dailyRate={dailyRateValue}
                discountPercentage={discountValue}
              />
            )}

            <div>
              <Label htmlFor="notes">Observacoes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Observacoes sobre a estadia..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isEditMode
                  ? isSubmitting
                    ? "Salvando..."
                    : "Salvar Alterações"
                  : isSubmitting
                    ? "Criando..."
                    : "Criar Reserva"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
