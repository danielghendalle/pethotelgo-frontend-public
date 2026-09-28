import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useHotel } from "@/contexts/useHotelHook";
import { toast } from "sonner";
import { ApiError } from "@/services/core";

const clientSchema = z
  .object({
    ownerMode: z.enum(["new", "existing"]),
    ownerName: z
      .string()
      .min(1, "Nome completo é obrigatório")
      .min(3, "Nome deve ter pelo menos 3 caracteres"),
    // E-mail é obrigatório apenas para login de usuário — o cadastro de
    // cliente (tutor) não exige e-mail, só valida o formato quando informado.
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    phone: z
      .string()
      .min(1, "Telefone é obrigatório")
      .min(14, "Telefone inválido"),
    existingOwnerId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.ownerMode === "new") {
        // Para novo cliente, nome e telefone são obrigatórios
        return (
          data.ownerName &&
          data.ownerName.trim().length > 0 &&
          data.phone &&
          data.phone.replace(/\D/g, "").length >= 11
        );
      } else {
        return data.existingOwnerId;
      }
    },
    {
      message: "Preencha todos os campos obrigatórios",
      path: ["ownerMode"],
    },
  );

type ClientFormData = z.infer<typeof clientSchema>;

interface UseClientRegistrationFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export function useClientRegistrationForm({
  onClose,
  onSuccess,
}: UseClientRegistrationFormProps) {
  const { owners, addOwner } = useHotel();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    control,
    formState: { errors, isValid },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    mode: "onChange",
    defaultValues: {
      ownerMode: "new",
      ownerName: "",
      email: "",
      phone: "",
      existingOwnerId: "",
    },
  });

  // formState.isValid só reflete a realidade depois da primeira validação —
  // dispara uma ao montar para o botão já nascer desabilitado.
  useEffect(() => {
    trigger();
  }, [trigger]);

  const ownerMode = watch("ownerMode");
  const existingOwnerId = watch("existingOwnerId");

  const onSubmit = async (data: ClientFormData) => {
    try {
      setIsSubmitting(true);

      if (data.ownerMode === "new") {
        await addOwner({
          name: data.ownerName || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      } else {
        const owner = owners.find((o) => o.id === data.existingOwnerId);
        if (!owner) {
          toast.error("Tutor não encontrado");
          return;
        }
      }

      toast.success("Cliente cadastrado com sucesso!");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      const message =
        error instanceof ApiError
          ? error.message
          : "Erro ao cadastrar cliente. Tente novamente.";
      toast.error(message);
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
    control,
    errors,
    isSubmitting,
    isValid,
    ownerMode,
    existingOwnerId,
    owners,
    onSubmit,
  };
}

export type { ClientFormData };
