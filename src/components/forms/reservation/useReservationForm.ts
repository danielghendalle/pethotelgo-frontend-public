import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useHotel } from "@/contexts/useHotelHook";
import { useDailyRate } from "@/hooks/useDailyRate";
import { parseBrazilianDate } from "@/utils/dateUtils";
import type { Reservation } from "@/types/hotel";
import { toast } from "sonner";

const reservationSchema = z
  .object({
    petId: z.string().min(1, "Selecione um pet"),
    checkInDate: z.date(),
    checkOutDate: z.date(),
    notes: z.string(),
    dailyRate: z.string().optional(),
    discountPercentage: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.checkOutDate <= data.checkInDate) {
        return false;
      }
      return true;
    },
    {
      message: "A data de saida deve ser posterior a data de entrada",
      path: ["checkOutDate"],
    },
  );

type ReservationFormData = z.infer<typeof reservationSchema>;

interface UseReservationFormProps {
  reservation?: Reservation;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function useReservationForm({
  reservation,
  onClose,
  onSuccess,
}: UseReservationFormProps) {
  const { pets, owners, addReservation, updateReservation, getPetById, isDateFull } =
    useHotel();
  const { rateForSize } = useDailyRate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(reservation);

  // Reservas podem ser cadastradas a partir de hoje.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const initialDailyRate = reservation?.dailyRate
    ? new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
      }).format(reservation.dailyRate)
    : "";

  const initialDiscount =
    reservation?.discountPercentage != null
      ? `${reservation.discountPercentage}%`
      : "0%";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      petId: reservation?.pet?.id ?? "",
      checkInDate: reservation
        ? parseBrazilianDate(reservation.checkIn)
        : today,
      checkOutDate: reservation
        ? parseBrazilianDate(reservation.checkOut)
        : tomorrow,
      notes: reservation?.notes ?? "",
      dailyRate: initialDailyRate,
      discountPercentage: initialDiscount,
    },
  });

  const selectedPetId = watch("petId");
  const checkInDate = watch("checkInDate");
  const checkOutDate = watch("checkOutDate");
  const dailyRateValue = watch("dailyRate");
  const discountValue = watch("discountPercentage");

  const selectedPet = selectedPetId
    ? pets.find((p) => p.id === selectedPetId)
    : null;
  const selectedOwner = selectedPet
    ? owners.find((o) => o.id === selectedPet.owner?.id)
    : null;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatCurrencyInput = (value: string): string => {
    const numbersOnly = value.replace(/\D/g, "");

    if (!numbersOnly) return "";

    const number = parseInt(numbersOnly) / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(number);
  };

  const handleDailyRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatCurrencyInput(value);
    setValue("dailyRate", formattedValue);
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbersOnly = value.replace(/\D/g, "");

    if (numbersOnly === "") {
      setValue("discountPercentage", "");
    } else {
      const numValue = parseInt(numbersOnly);
      const clampedValue = Math.min(100, Math.max(0, numValue));
      setValue("discountPercentage", formatPercentage(clampedValue));
    }
  };

  const parseCurrency = (value: string): number => {
    if (!value) return 0;
    const cleanValue = value.replace(/[R$\s.]/g, "").replace(",", ".");
    return parseFloat(cleanValue) || 0;
  };

  const parsePercentage = (value: string): number => {
    if (!value) return 0;
    const cleanValue = value.replace(/[%\s]/g, "");
    return parseFloat(cleanValue) || 0;
  };

  const formatPercentage = (value: number): string => {
    return `${value}%`;
  };

  const calculateTotalValue = () => {
    if (!checkInDate || !checkOutDate || !selectedPet) return 0;

    const days = Math.max(
      1,
      Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );
    const baseDailyRate = rateForSize(selectedPet.size);

    const discountValue = watch("discountPercentage") || "0";
    const discountPercentage = parseFloat(discountValue.replace("%", "")) || 0;

    const totalValue = baseDailyRate * days * (1 - discountPercentage / 100);

    return totalValue;
  };

  const discountPercentageValue = watch("discountPercentage");

  useEffect(() => {
    const discountValue = discountPercentageValue || "";
    if (discountValue === "") {
      setValue("discountPercentage", "");
    } else {
      const parsedValue = parseFloat(discountValue.replace("%", ""));
      if (!isNaN(parsedValue)) {
        setValue("discountPercentage", formatPercentage(parsedValue));
      }
    }
  }, [discountPercentageValue, setValue]);

  useEffect(() => {}, [dailyRateValue, discountValue]);

  useEffect(() => {
    if (checkInDate && (!checkOutDate || checkOutDate <= checkInDate)) {
      const nextDay = new Date(checkInDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setValue("checkOutDate", nextDay);
    }
  }, [checkInDate, checkOutDate, setValue]);

  const onSubmit = async (data: ReservationFormData) => {
    try {
      setIsSubmitting(true);

      const pet = getPetById(data.petId);
      if (!pet) {
        toast.error("Pet nao encontrado");
        return;
      }

      // Reservas existentes já ocupam a data; só bloqueia lotação ao criar uma nova.
      if (!isEditMode && isDateFull(data.checkInDate)) {
        toast.error("Data de entrada esta lotada");
        return;
      }

      const checkIn = new Date(data.checkInDate);
      checkIn.setHours(9, 0, 0, 0);

      const checkOut = new Date(data.checkOutDate);
      checkOut.setHours(17, 0, 0, 0);

      if (!isEditMode) {
        // Compara só a data (não o horário exato) para permitir reservar hoje
        // mesmo depois das 9h, horário fixo do check-in.
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        if (checkIn < todayStart) {
          toast.error("A data de entrada nao pode ser no passado");
          return;
        }
      }

      const diffTime = checkOut.getTime() - checkIn.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 1) {
        if (diffDays < 0) {
          toast.error("A data de saida deve ser posterior a data de entrada");
        } else {
          toast.error("A reserva deve ter pelo menos 1 dia de duracao");
        }
        return;
      }

      const dailyRateInput = parseCurrency(data.dailyRate || "0");
      const dailyRate =
        dailyRateInput > 0 ? dailyRateInput : rateForSize(pet.size);
      const discountPercentageValue = parsePercentage(
        data.discountPercentage || "0",
      );

      if (isEditMode && reservation) {
        // O backend deserializa checkIn/checkOut e exige pet/owner completos
        // no mesmo formato retornado pela API (dd/MM/yyyy HH:mm:ss).
        await updateReservation(reservation.id, {
          pet,
          owner: pet.owner,
          checkIn: format(checkIn, "dd/MM/yyyy HH:mm:ss"),
          checkOut: format(checkOut, "dd/MM/yyyy HH:mm:ss"),
          notes: data.notes,
          dailyRate,
          discountPercentage: discountPercentageValue,
        });

        toast.success("Reserva atualizada com sucesso!");
      } else {
        await addReservation({
          petId: data.petId,
          ownerId: pet.owner?.id,
          checkIn,
          checkOut,
          status: "pending",
          notes: data.notes,
          dailyRate: dailyRate,
          discountPercentage: discountPercentageValue,
        });

        toast.success("Reserva criada com sucesso!");
      }

      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast.error(
        isEditMode
          ? "Erro ao atualizar reserva. Tente novamente."
          : "Erro ao criar reserva. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}

export type { ReservationFormData };
