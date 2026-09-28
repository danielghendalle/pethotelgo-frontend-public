import React, { useState, useEffect, useCallback, ReactNode } from "react";
import {
  Owner,
  Pet,
  Reservation,
  CalendarView,
  CreatePetData,
  CreateReservationData,
} from "@/types/hotel";
import { useOwners } from "@/hooks/useOwners";
import { usePets } from "@/hooks/usePets";
import { useReservations } from "@/hooks/useReservations";
import { useAuth } from "@/contexts/useAuthHook";
import { HotelContext } from "./contexts";
import { parseBrazilianDate } from "@/utils/dateUtils";

interface HotelContextType {
  owners: Owner[];
  pets: Pet[];
  reservations: Reservation[];
  calendarView: CalendarView;
  selectedDate: Date;
  searchQuery: string;
  setCalendarView: React.Dispatch<React.SetStateAction<CalendarView>>;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  addOwner: (owner: Omit<Owner, "id" | "createdAt">) => Promise<Owner>;
  addPet: (petData: CreatePetData) => Promise<Pet>;
  addReservation: (reservation: CreateReservationData) => Promise<Reservation>;
  updateOwner: (id: string, updates: Partial<Owner>) => Promise<Owner>;
  updatePet: (id: string, updates: Partial<Pet>) => Promise<Pet>;
  deletePet: (id: string) => Promise<void>;
  updateReservation: (
    id: string,
    updates: Partial<Reservation>,
  ) => Promise<Reservation>;
  deleteReservation: (id: string) => Promise<void>;
  deleteOwner: (id: string) => Promise<void>;
  updateReservationStatus: (id: string, status: string) => Promise<Reservation>;
  getPetById: (id: string) => Pet | undefined;
  getOwnerById: (id: string) => Owner | undefined;
  getReservationsForDate: (date: Date) => Reservation[];
  getPetsCountForDate: (date: Date) => number;
  isDateFull: (date: Date) => boolean;
  ownersLoading: boolean;
  petsLoading: boolean;
  reservationsLoading: boolean;
  refreshOwners: () => void;
  refreshPets: () => void;
  refreshReservations: () => void;
}

export type { HotelContextType };

const MAX_CAPACITY = 10;

export function HotelProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [owners, setOwners] = useState<Owner[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [ownersLoading, setOwnersLoading] = useState(false);
  const [petsLoading, setPetsLoading] = useState(false);
  const [reservationsLoading, setReservationsLoading] = useState(false);

  // Import hooks at the top level
  const ownersHook = useOwners();
  const petsHook = usePets();
  const reservationsHook = useReservations();

  const addOwner = async (
    ownerData: Omit<Owner, "id" | "createdAt">,
  ): Promise<Owner> => {
    try {
      setOwnersLoading(true);

      const newOwner = await ownersHook.createOwner(ownerData);
      setOwners((prev) => [...prev, newOwner]);
      return newOwner;
    } catch (error) {
      console.error("HotelContext: Failed to create owner:", error);
      throw error;
    } finally {
      setOwnersLoading(false);
    }
  };

  const addPet = async (petData: CreatePetData): Promise<Pet> => {
    try {
      setPetsLoading(true);

      const newPet = await petsHook.createPet(petData);
      setPets((prev) => [...prev, newPet]);
      return newPet;
    } catch (error) {
      console.error("HotelContext: Failed to create pet:", error);
      throw error;
    } finally {
      setPetsLoading(false);
    }
  };

  const addReservation = async (
    reservationData: CreateReservationData,
  ): Promise<Reservation> => {
    try {
      setReservationsLoading(true);

      const newReservation =
        await reservationsHook.createReservation(reservationData);
      setReservations((prev) => [...prev, newReservation]);

      // Refresh para garantir sincronização com backend
      await refreshReservations();

      return newReservation;
    } catch (error) {
      console.error("HotelContext: Failed to create reservation:", error);
      throw error;
    } finally {
      setReservationsLoading(false);
    }
  };

  const updateReservation = async (
    id: string,
    updates: Partial<Reservation>,
  ): Promise<Reservation> => {
    try {
      setReservationsLoading(true);
      const updatedReservation = await reservationsHook.updateReservation(
        id,
        updates,
      );
      setReservations((prev) =>
        prev.map((res) => (res.id === id ? updatedReservation : res)),
      );
      return updatedReservation;
    } catch (error) {
      console.error("Failed to update reservation:", error);
      throw error;
    } finally {
      setReservationsLoading(false);
    }
  };

  const updateOwner = async (
    id: string,
    updates: Partial<Owner>,
  ): Promise<Owner> => {
    try {
      setOwnersLoading(true);
      const updatedOwner = await ownersHook.updateOwner(id, updates);
      setOwners((prev) =>
        prev.map((owner) => (owner.id === id ? updatedOwner : owner)),
      );
      return updatedOwner;
    } catch (error) {
      console.error("Failed to update owner:", error);
      // Recarregar dados para sincronizar com backend
      await refreshOwners();
      throw error;
    } finally {
      setOwnersLoading(false);
    }
  };

  const updatePet = async (id: string, updates: Partial<Pet>): Promise<Pet> => {
    try {
      setPetsLoading(true);
      const updatedPet = await petsHook.updatePet(id, updates);
      setPets((prev) => prev.map((pet) => (pet.id === id ? updatedPet : pet)));
      return updatedPet;
    } catch (error) {
      console.error("Failed to update pet:", error);
      // Recarregar dados para sincronizar com backend
      await refreshPets();
      throw error;
    } finally {
      setPetsLoading(false);
    }
  };

  const deleteOwner = async (id: string) => {
    try {
      setOwnersLoading(true);
      await ownersHook.deleteOwner(id);
      setOwners((prev) => prev.filter((owner) => owner.id !== id));

      // Remover também os pets associados a este owner
      setPets((prev) => prev.filter((pet) => pet.owner?.id !== id));

      // Refresh para garantir sincronização com backend
      await refreshOwners();
      await refreshPets();
    } catch (error) {
      console.error("Failed to delete owner:", error);

      // Se o erro for "not found", remover da UI sem mostrar erro
      if (error instanceof Error && error.message.includes("not found")) {
        setOwners((prev) => prev.filter((owner) => owner.id !== id));
        // Remover também os pets associados
        setPets((prev) => prev.filter((pet) => pet.owner?.id !== id));
        // Refresh mesmo em caso de not found
        await refreshOwners();
        await refreshPets();
        return; // Não mostrar erro para o usuário
      }

      // Para outros erros, recarregar dados
      await refreshOwners();
      await refreshPets();
      throw error;
    } finally {
      setOwnersLoading(false);
    }
  };

  const deletePet = async (id: string) => {
    try {
      setPetsLoading(true);
      await petsHook.deletePet(id);
      setPets((prev) => prev.filter((pet) => pet.id !== id));

      // Refresh para garantir sincronização com backend
      await refreshPets();
    } catch (error) {
      console.error("Failed to delete pet:", error);

      // Se o erro for "not found", remover da UI sem mostrar erro
      if (error instanceof Error && error.message.includes("not found")) {
        setPets((prev) => prev.filter((pet) => pet.id !== id));
        // Refresh mesmo em caso de not found
        await refreshPets();
        return; // Não mostrar erro para o usuário
      }

      // Para outros erros, recarregar dados
      await refreshPets();
      throw error;
    } finally {
      setPetsLoading(false);
    }
  };

  const deleteReservation = async (id: string): Promise<void> => {
    try {
      setReservationsLoading(true);
      await reservationsHook.deleteReservation(id);
      setReservations((prev) => prev.filter((res) => res.id !== id));
    } catch (error) {
      console.error("Failed to delete reservation:", error);
      throw error;
    } finally {
      setReservationsLoading(false);
    }
  };

  const updateReservationStatus = async (
    id: string,
    status: string,
  ): Promise<Reservation> => {
    try {
      setReservationsLoading(true);
      const updatedReservation = await reservationsHook.updateReservationStatus(
        id,
        status,
      );
      setReservations((prev) =>
        prev.map((res) => (res.id === id ? updatedReservation : res)),
      );
      return updatedReservation;
    } catch (error) {
      console.error("Failed to update reservation status:", error);
      throw error;
    } finally {
      setReservationsLoading(false);
    }
  };

  const getPetById = (id: string) => pets.find((pet) => pet.id === id);
  const getOwnerById = (id: string) => owners.find((owner) => owner.id === id);

  const getReservationsForDate = (date: Date): Reservation[] => {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    return reservations.filter((res) => {
      const checkIn = parseBrazilianDate(res.checkIn);
      const checkOut = parseBrazilianDate(res.checkOut);

      return (
        res.status !== "cancelled" &&
        checkIn <= dateEnd &&
        checkOut >= dateStart
      );
    });
  };

  const getPetsCountForDate = (date: Date): number => {
    return getReservationsForDate(date).length;
  };

  const isDateFull = (date: Date): boolean => {
    return getPetsCountForDate(date) >= MAX_CAPACITY;
  };

  const refreshOwners = useCallback(async () => {
    try {
      setOwnersLoading(true);
      await ownersHook.fetchOwners();
    } catch (error) {
      console.error("Failed to refresh owners:", error);
    } finally {
      setOwnersLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshPets = useCallback(async () => {
    try {
      setPetsLoading(true);
      await petsHook.fetchPets();
    } catch (error) {
      console.error("Failed to refresh pets:", error);
    } finally {
      setPetsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshReservations = useCallback(async () => {
    try {
      setReservationsLoading(true);
      await reservationsHook.fetchReservations();
    } catch (error) {
      console.error("Failed to refresh reservations:", error);
    } finally {
      setReservationsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize data from hooks
  useEffect(() => {
    setOwners(ownersHook.owners);
    setPets(petsHook.pets);
    setReservations(reservationsHook.reservations);
  }, [
    ownersHook.owners,
    petsHook.pets,
    reservationsHook.reservations,
    isAuthenticated,
  ]);

  // Force initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      refreshOwners();
      refreshPets();
      refreshReservations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <HotelContext.Provider
      value={{
        owners,
        pets,
        reservations,
        calendarView,
        selectedDate,
        searchQuery,
        setCalendarView,
        setSelectedDate,
        setSearchQuery,
        addOwner,
        addPet,
        addReservation,
        updateOwner,
        updatePet,
        deletePet,
        updateReservation,
        deleteReservation,
        deleteOwner,
        updateReservationStatus,
        getPetById,
        getOwnerById,
        getReservationsForDate,
        getPetsCountForDate,
        isDateFull,
        ownersLoading,
        petsLoading,
        reservationsLoading,
        refreshOwners,
        refreshPets,
        refreshReservations,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
}
