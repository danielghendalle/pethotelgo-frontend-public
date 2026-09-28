import { useState, useEffect } from "react";
import { stayHistoryAPI } from "@/services";
import { StayHistory } from "@/types/hotel";
import { useAuth } from "@/contexts/useAuthHook";

export function useStayHistory() {
  const [stayHistories, setStayHistories] = useState<StayHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchStayHistories = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const data = await stayHistoryAPI.getAll();
      setStayHistories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch stay histories",
      );
    } finally {
      setLoading(false);
    }
  };

  const createStayHistory = async (historyData: Omit<StayHistory, "id">) => {
    try {
      const newHistory = await stayHistoryAPI.create(historyData);
      setStayHistories((prev) => [...prev, newHistory]);
      return newHistory;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create stay history",
      );
    }
  };

  const updateStayHistory = async (
    id: string,
    historyData: Partial<StayHistory>,
  ) => {
    try {
      const updatedHistory = await stayHistoryAPI.update(id, historyData);
      setStayHistories((prev) =>
        prev.map((history) => (history.id === id ? updatedHistory : history)),
      );
      return updatedHistory;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update stay history",
      );
    }
  };

  const getStayHistoryByPet = async (petId: string) => {
    try {
      return await stayHistoryAPI.getByPet(petId);
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to fetch stay history by pet",
      );
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStayHistories();
    } else {
      setStayHistories([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  return {
    stayHistories,
    loading,
    error,
    fetchStayHistories,
    createStayHistory,
    updateStayHistory,
    getStayHistoryByPet,
  };
}
