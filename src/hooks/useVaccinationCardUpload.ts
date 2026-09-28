import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  vaccinationCardAPI,
  type VaccinationCardResponse,
  type UploadProgressEvent,
} from "@/services";

interface UseVaccinationCardUploadState {
  isLoading: boolean;
  isUploading: boolean;
  progress: number;
  vaccinationCard: VaccinationCardResponse | null;
  error: string | null;
}

export function useVaccinationCardUpload(petId: string | null) {
  const [state, setState] = useState<UseVaccinationCardUploadState>({
    isLoading: false,
    isUploading: false,
    progress: 0,
    vaccinationCard: null,
    error: null,
  });

  // Faz upload de um novo cartão de vacina
  const upload = useCallback(
    async (file: File) => {
      if (!petId) {
        toast.error("Pet ID não encontrado");
        return;
      }

      // Validação de arquivo
      if (file.size > 10 * 1024 * 1024) {
        // 10MB
        toast.error("Arquivo muito grande. Máximo: 10MB");
        return;
      }

      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Tipo de arquivo inválido. Use: JPG, PNG, WebP ou PDF");
        return;
      }

      setState((prev) => ({
        ...prev,
        isUploading: true,
        error: null,
        progress: 0,
      }));

      try {
        const response = await vaccinationCardAPI.upload(
          petId,
          file,
          (progressEvent: UploadProgressEvent) => {
            setState((prev) => ({
              ...prev,
              progress: progressEvent.percentage,
            }));
          },
        );

        // Atualiza o estado com a resposta do servidor
        setState((prev) => ({
          ...prev,
          vaccinationCard: response,
          isUploading: false,
          progress: 100,
        }));

        toast.success("Cartão de vacina enviado com sucesso!");

        return response;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro ao fazer upload";
        setState((prev) => ({
          ...prev,
          isUploading: false,
          error: message,
          progress: 0,
        }));
        toast.error(message);
      }
    },
    [petId],
  );

  // Busca o cartão de vacina existente
  const fetch = useCallback(async () => {
    if (!petId) return;

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const card = await vaccinationCardAPI.get(petId);
      setState((prev) => ({
        ...prev,
        vaccinationCard: card,
        isLoading: false,
      }));
      return card;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao buscar cartão";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      toast.error(message);
    }
  }, [petId]);

  // Deleta o cartão de vacina
  const remove = useCallback(async () => {
    if (!petId) {
      toast.error("Pet ID não encontrado");
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      await vaccinationCardAPI.delete(petId);
      setState((prev) => ({
        ...prev,
        vaccinationCard: null,
        isLoading: false,
      }));
      toast.success("Cartão de vacina removido com sucesso!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao deletar cartão";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      toast.error(message);
    }
  }, [petId]);

  // Reseta o estado do upload (limpa erro e progresso)
  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      progress: 0,
    }));
  }, []);

  return {
    ...state,
    upload,
    fetch,
    remove,
    reset,
  };
}
