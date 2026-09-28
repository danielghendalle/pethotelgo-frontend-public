import { useState, useEffect, useCallback } from "react";
import { ownerAPI, petAPI } from "@/services";
import { Owner } from "@/types/hotel";
import { useAuth } from "@/contexts/useAuthHook";

export function useOwners() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchOwners = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const data = await ownerAPI.getAll();
      setOwners(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch owners");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const createOwner = async (ownerData: Omit<Owner, "id" | "createdAt">) => {
    try {
      const newOwner = await ownerAPI.create(ownerData);
      setOwners((prev) => [...prev, newOwner]);
      return newOwner;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create owner",
      );
    }
  };

  const updateOwner = async (id: string, ownerData: Partial<Owner>) => {
    try {
      const updatedOwner = await ownerAPI.update(id, ownerData);
      // Não atualizar estado local aqui - deixar para o HotelContext gerenciar
      return updatedOwner;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update owner",
      );
    }
  };

  const deleteOwner = async (id: string) => {
    try {
      await ownerAPI.delete(id);
      // Não atualizar estado local aqui - deixar para o HotelContext gerenciar
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete owner",
      );
    }
  };

  const getOwnerPets = async (ownerId: string) => {
    try {
      return await petAPI.getByOwner(ownerId);
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to fetch owner pets",
      );
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOwners();
    } else {
      setOwners([]);
      setLoading(false);
    }
  }, [isAuthenticated, fetchOwners]);

  return {
    owners,
    loading,
    error,
    fetchOwners,
    createOwner,
    updateOwner,
    deleteOwner,
    getOwnerPets,
  };
}
