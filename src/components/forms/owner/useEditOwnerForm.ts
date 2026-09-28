import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useHotel } from "@/contexts/useHotelHook";
import type { Owner } from "@/types/hotel";
import { toast } from "sonner";
import { ApiError } from "@/services/core";

const editOwnerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
});

type EditOwnerFormData = z.infer<typeof editOwnerSchema>;

interface UseEditOwnerFormProps {
  owner: Owner;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function useEditOwnerForm({
  owner,
  onClose,
  onSuccess,
}: UseEditOwnerFormProps) {
  const { updateOwner } = useHotel();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditOwnerFormData>({
    resolver: zodResolver(editOwnerSchema),
    defaultValues: {
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
    },
  });

  const onSubmit = async (data: EditOwnerFormData) => {
    try {
      await updateOwner(owner.id, {
        name: data.name,
        email: data.email,
        phone: data.phone,
      });

      toast.success("Tutor atualizado com sucesso!");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Erro ao atualizar tutor. Tente novamente.";
      toast.error(message);
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
  };
}

export type { EditOwnerFormData };
