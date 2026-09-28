import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ownerAPI,
  petAPI,
  reservationAPI,
  stayHistoryAPI,
  settingsAPI,
} from "@/services";
import {
  Owner,
  Pet,
  Reservation,
  StayHistory,
  CreatePetData,
  CreateReservationData,
  UpdateSettingsData,
} from "@/types/hotel";
import { useToast } from "@/hooks/use-toast";

// Query Keys
export const queryKeys = {
  owners: ["owners"] as const,
  owner: (id: string) => ["owners", id] as const,
  pets: ["pets"] as const,
  pet: (id: string) => ["pets", id] as const,
  petsByOwner: (ownerId: string) => ["pets", "owner", ownerId] as const,
  reservations: ["reservations"] as const,
  reservation: (id: string) => ["reservations", id] as const,
  reservationsByDate: (date: string) => ["reservations", "date", date] as const,
  stayHistory: ["stayHistory"] as const,
  stayHistoryByPet: (petId: string) => ["stayHistory", "pet", petId] as const,
  settings: ["settings"] as const,
};

// Owner Hooks
export function useOwners() {
  return useQuery({
    queryKey: queryKeys.owners,
    queryFn: ownerAPI.getAll,
  });
}

export function useOwner(id: string) {
  return useQuery({
    queryKey: queryKeys.owner(id),
    queryFn: () => ownerAPI.getById(id),
    enabled: !!id,
  });
}

export function useCreateOwner() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<Owner, "id" | "createdAt">) =>
      ownerAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.owners });
      toast({
        title: "Sucesso",
        description: "Cliente cadastrado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateOwner() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Owner> }) =>
      ownerAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.owners });
      queryClient.invalidateQueries({
        queryKey: queryKeys.owner(variables.id),
      });
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteOwner() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => ownerAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.owners });
      toast({ title: "Sucesso", description: "Cliente removido com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Pet Hooks
export function usePets() {
  return useQuery({
    queryKey: queryKeys.pets,
    queryFn: petAPI.getAll,
  });
}

export function usePet(id: string) {
  return useQuery({
    queryKey: queryKeys.pet(id),
    queryFn: () => petAPI.getById(id),
    enabled: !!id,
  });
}

export function usePetsByOwner(ownerId: string) {
  return useQuery({
    queryKey: queryKeys.petsByOwner(ownerId),
    queryFn: () => petAPI.getByOwner(ownerId),
    enabled: !!ownerId,
  });
}

export function useCreatePet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreatePetData) => petAPI.create(data),
    onSuccess: (newPet) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pets });
      queryClient.invalidateQueries({
        queryKey: queryKeys.petsByOwner(newPet.owner.id),
      });
      toast({ title: "Sucesso", description: "Pet cadastrado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pet> }) =>
      petAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pets });
      queryClient.invalidateQueries({ queryKey: queryKeys.pet(variables.id) });
      toast({ title: "Sucesso", description: "Pet atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeletePet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => petAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pets });
      toast({ title: "Sucesso", description: "Pet removido com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Reservation Hooks
export function useReservations() {
  return useQuery({
    queryKey: queryKeys.reservations,
    queryFn: () => reservationAPI.getAll(),
  });
}

export function useReservation(id: string) {
  return useQuery({
    queryKey: queryKeys.reservation(id),
    queryFn: () => reservationAPI.getById(id),
    enabled: !!id,
  });
}

export function useReservationsByDate(date: string) {
  return useQuery({
    queryKey: queryKeys.reservationsByDate(date),
    queryFn: () => reservationAPI.getAll(date),
    enabled: !!date,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateReservationData) => reservationAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations });
      toast({ title: "Sucesso", description: "Reserva criada com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Reservation> }) =>
      reservationAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reservation(variables.id),
      });
      toast({
        title: "Sucesso",
        description: "Reserva atualizada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: Reservation["status"];
    }) => reservationAPI.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reservation(variables.id),
      });
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteReservation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => reservationAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations });
      toast({ title: "Sucesso", description: "Reserva removida com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Stay History Hooks
export function useStayHistory() {
  return useQuery({
    queryKey: queryKeys.stayHistory,
    queryFn: stayHistoryAPI.getAll,
  });
}

export function useStayHistoryByPet(petId: string) {
  return useQuery({
    queryKey: queryKeys.stayHistoryByPet(petId),
    queryFn: () => stayHistoryAPI.getByPet(petId),
    enabled: !!petId,
  });
}

export function useCreateStayHistory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<StayHistory, "id">) => stayHistoryAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stayHistory });
      toast({
        title: "Sucesso",
        description: "Histórico registrado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Settings Hooks
export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: settingsAPI.get,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdateSettingsData) => settingsAPI.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.settings, updated);
      // valores da diária mudaram -> revalida telas que os usam
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations });
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
