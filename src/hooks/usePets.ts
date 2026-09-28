import { useState, useEffect } from "react";
import { petAPI } from "@/services";
import { Pet, CreatePetData } from "@/types/hotel";
import { useAuth } from "@/contexts/useAuthHook";

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchPets = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await petAPI.getAll();
      setPets(data);
    } catch (err) {
      console.error("Erro no fetchPets:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch pets");
    } finally {
      setLoading(false);
    }
  };

  const createPet = async (petData: CreatePetData) => {
    try {
      const newPet = await petAPI.create(petData);
      setPets((prev) => [...prev, newPet]);
      return newPet;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create pet",
      );
    }
  };

  const updatePet = async (id: string, petData: Partial<Pet>) => {
    try {
      const updatedPet = await petAPI.update(id, petData);
      // Não atualizar estado local aqui - deixar para o HotelContext gerenciar
      return updatedPet;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update pet",
      );
    }
  };

  const deletePet = async (id: string) => {
    try {
      if (!id || id.trim() === "") {
        throw new Error("Pet ID is empty or invalid");
      }
      console.debug(`[usePets] Attempting to delete pet with ID: ${id}`);
      await petAPI.delete(id);
      // Não atualizar estado local aqui - deixar para o HotelContext gerenciar
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete pet",
      );
    }
  };

  const getPetsByOwner = async (ownerId: string) => {
    try {
      return await petAPI.getByOwner(ownerId);
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to fetch pets by owner",
      );
    }
  };

  const getPetReservations = async (petId: string) => {
    try {
      return await petAPI.getReservations(petId);
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to fetch pet reservations",
      );
    }
  };

  const getPetStayHistory = async (petId: string) => {
    try {
      return await petAPI.getStayHistory(petId);
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to fetch pet stay history",
      );
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPets();
    } else {
      setPets([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  return {
    pets,
    loading,
    error,
    fetchPets,
    createPet,
    updatePet,
    deletePet,
    getPetsByOwner,
    getPetReservations,
    getPetStayHistory,
  };
}
