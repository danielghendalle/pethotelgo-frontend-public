import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useHotel } from "@/contexts/useHotelHook";
import type { Pet } from "@/types/hotel";
import { toast } from "sonner";
import { ApiError } from "@/services/core";

const editPetSchema = z.object({
  name: z.string().min(1, "Nome do pet é obrigatório"),
  breed: z.string().min(1, "Raça é obrigatória"),
  size: z.enum(["pequeno", "medio", "grande"]),
  needsSeparateSpace: z.boolean(),
  sociability: z.enum(["baixa", "media", "alta"]),
  allergies: z.string(),
  specialCare: z.string(),
  feedingSchedule: z
    .string()
    .min(1, "Horários de alimentação são obrigatórios"),
  feedingAmount: z.string().min(1, "Quantidade de alimentação é obrigatória"),
});

type EditPetFormData = z.infer<typeof editPetSchema>;

interface UseEditPetFormProps {
  pet: Pet;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function useEditPetForm({
  pet,
  onClose,
  onSuccess,
}: UseEditPetFormProps) {
  const { updatePet } = useHotel();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditPetFormData>({
    resolver: zodResolver(editPetSchema),
    defaultValues: {
      name: pet.name,
      breed: pet.breed,
      size: pet.size,
      needsSeparateSpace: pet.needsSeparateSpace,
      sociability: pet.sociability,
      allergies: pet.allergies || "",
      specialCare: pet.specialCare || "",
      feedingSchedule: pet.feedingSchedule,
      feedingAmount: pet.feedingAmount,
    },
  });

  const selectedSize = watch("size");

  const onSubmit = async (data: EditPetFormData) => {
    try {
      const updatedPet = {
        ...pet,
        ...data,
      };

      await updatePet(pet.id, updatedPet);

      toast.success("Pet atualizado com sucesso!");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Erro ao atualizar pet. Tente novamente.";
      toast.error(message);
    }
  };

  return {
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    isSubmitting,
    selectedSize,
    onSubmit,
  };
}

export type { EditPetFormData };
