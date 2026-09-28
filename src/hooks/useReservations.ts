import { useState, useEffect } from "react";
import { reservationAPI } from "@/services";
import { Reservation, CreateReservationData } from "@/types/hotel";
import { useAuth } from "@/contexts/useAuthHook";

export function useReservations(date?: string) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchReservations = async (filterDate?: string) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const data = await reservationAPI.getAll(filterDate);
      setReservations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch reservations",
      );
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (reservationData: CreateReservationData) => {
    try {
      const newReservation = await reservationAPI.create(reservationData);
      setReservations((prev) => [...prev, newReservation]);
      return newReservation;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create reservation",
      );
    }
  };

  const updateReservation = async (
    id: string,
    reservationData: Partial<Reservation>,
  ) => {
    try {
      const updatedReservation = await reservationAPI.update(
        id,
        reservationData,
      );
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === id ? updatedReservation : reservation,
        ),
      );
      return updatedReservation;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update reservation",
      );
    }
  };

  const deleteReservation = async (id: string) => {
    try {
      await reservationAPI.delete(id);
      setReservations((prev) =>
        prev.filter((reservation) => reservation.id !== id),
      );
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete reservation",
      );
    }
  };

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      const updatedReservation = await reservationAPI.updateStatus(id, status);
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === id ? updatedReservation : reservation,
        ),
      );
      return updatedReservation;
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to update reservation status",
      );
    }
  };

  const getReservationsByPet = async (petId: string) => {
    try {
      return await reservationAPI.getByPet(petId);
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to fetch reservations by pet",
      );
    }
  };

  const checkDayCapacity = async (date: string) => {
    try {
      return await reservationAPI.checkDayCapacity(date);
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to check day capacity",
      );
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchReservations(date);
    } else {
      setReservations([]);
      setLoading(false);
    }
  }, [isAuthenticated, date]);

  return {
    reservations,
    loading,
    error,
    fetchReservations,
    createReservation,
    updateReservation,
    deleteReservation,
    updateReservationStatus,
    getReservationsByPet,
    checkDayCapacity,
  };
}
