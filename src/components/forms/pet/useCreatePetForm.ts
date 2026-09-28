import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useHotel } from "@/contexts/useHotelHook";
import { PetSize, SociabilityLevel, type CreatePetData } from "@/types/hotel";
import { toast } from "sonner";
import { ApiError } from "@/services/core";
import {
  fileToBase64,
  isValidFileType,
  isValidFileSize,
  formatFileForDatabase,
  formatFileSize,
} from "@/utils/fileUtils";

const petSchema = z.object({
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
  baseDailyRate: z
    .number()
    .min(0, "Taxa diária deve ser maior ou igual a zero"),
  sizeMultiplier: z.object({
    pequeno: z.number().min(0),
    medio: z.number().min(0),
    grande: z.number().min(0),
  }),
  notificationSettings: z.object({
    feeding: z.boolean(),
    medication: z.boolean(),
    checkIn: z.boolean(),
    checkOut: z.boolean(),
    customReminders: z.array(z.string()).optional(),
  }),
  vaccineCard: z
    .any()
    .optional()
    .nullable()
    .refine(
      (value) => {
        // Aceita null, undefined, ou File instance
        if (value === null || value === undefined) return true;
        // Se for File instance, é válido
        if (value instanceof File) return true;
        // Se for FileList com arquivos, é válido
        if (value instanceof FileList && value.length > 0) return true;
        // Se for objeto com propriedades (DOM), mas não for File/FileList, é inválido
        if (
          typeof value === "object" &&
          value !== null &&
          !(value instanceof File) &&
          !(value instanceof FileList)
        ) {
          return false;
        }
        // Qualquer outro caso é válido
        return true;
      },
      {
        message: "Arquivo inválido",
      },
    ),
});

const createPetSchema = z.object({
  ownerId: z.string().min(1, "Selecione um tutor"),
  pets: z.array(petSchema).min(1, "É necessário cadastrar pelo menos um pet"),
});

type CreatePetFormData = z.infer<typeof createPetSchema>;

interface UseCreatePetFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export function useCreatePetForm({
  onClose,
  onSuccess,
}: UseCreatePetFormProps) {
  const { owners, addPet } = useHotel();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    control,
    formState: { errors, isValid },
  } = useForm<CreatePetFormData>({
    resolver: zodResolver(createPetSchema),
    mode: "onChange",
    defaultValues: {
      ownerId: "",
      pets: [
        {
          name: "",
          breed: "",
          size: "medio",
          needsSeparateSpace: false,
          sociability: "media",
          allergies: "",
          specialCare: "",
          feedingSchedule: "08:00, 12:00, 18:00",
          feedingAmount: "1 xícara",
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
            customReminders: [],
          },
          vaccineCard: undefined,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pets",
  });

  // formState.isValid só reflete a realidade depois da primeira validação —
  // dispara uma ao montar para o botão já nascer desabilitado.
  useEffect(() => {
    trigger();
  }, [trigger]);

  const selectedOwnerId = watch("ownerId");

  const updateSizeMultiplier = (size: PetSize) => {
    // Função mantida para compatibilidade, mas não faz mais nada
  };

  const onSubmit = async (data: CreatePetFormData) => {
    try {
      setIsSubmitting(true);

      if (!data.ownerId) {
        toast.error("Selecione um tutor para o pet");
        return;
      }

      const selectedOwner = owners.find((owner) => owner.id === data.ownerId);
      if (!selectedOwner) {
        toast.error("Tutor não encontrado");
        return;
      }

      // Cadastrar todos os pets
      for (const petData of data.pets) {
        let vaccineCardData = undefined;
        let fileToProcess = null;

        // Extrair arquivo do vaccineCard (pode ser File, FileList, ou null)
        if (petData.vaccineCard) {
          if (petData.vaccineCard instanceof File) {
            fileToProcess = petData.vaccineCard;
          } else if (
            petData.vaccineCard instanceof FileList &&
            petData.vaccineCard.length > 0
          ) {
            fileToProcess = petData.vaccineCard[0]; // Pega o primeiro arquivo
          }
        }

        // Processar o cartão de vacina se for um arquivo válido
        if (fileToProcess) {
          try {
            // Reduzir limite para 1MB para evitar problemas no backend
            if (!isValidFileSize(fileToProcess, 1)) {
              toast.error(
                `Arquivo muito grande para ${petData.name}. Tamanho máximo: 1MB. Arquivo: ${formatFileSize(fileToProcess.size)}`,
              );
              continue;
            }

            // Converter para base64
            const processedFile = await fileToBase64(fileToProcess);
            vaccineCardData = formatFileForDatabase(processedFile);
          } catch (error) {
            toast.error(
              `Erro ao processar cartão de vacina para ${petData.name}. Pet cadastrado sem o documento.`,
            );
          }
        }

        // Criar objeto limpo sem o campo vaccineCard
        const { vaccineCard, ...petDataClean } = petData;

        const petDataToSubmit: CreatePetData = {
          name: petDataClean.name || "",
          breed: petDataClean.breed || "",
          size: petDataClean.size || "medio",
          needsSeparateSpace: petDataClean.needsSeparateSpace || false,
          sociability: petDataClean.sociability || "media",
          allergies: petDataClean.allergies || "",
          specialCare: petDataClean.specialCare || "",
          feedingSchedule: petDataClean.feedingSchedule || "",
          feedingAmount: petDataClean.feedingAmount || "",
          ownerId: selectedOwner.id,
          vaccinationCardUrl: vaccineCardData,
        };

        await addPet(petDataToSubmit);
      }

      toast.success(`${data.pets.length} pet(s) cadastrado(s) com sucesso!`);

      onSuccess?.();
      onClose?.();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Erro ao cadastrar pet(s). Tente novamente.";
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
    selectedOwnerId,
    fields,
    append,
    remove,
    owners,
    updateSizeMultiplier,
    onSubmit,
  };
}

export type { CreatePetFormData };
