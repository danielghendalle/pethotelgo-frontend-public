import { useState } from "react";
import { useHotel } from "@/contexts/useHotelHook";
import { Owner } from "@/types/hotel";
import { toast } from "sonner";

interface UseClientsPageProps {
  onShowClientForm?: () => void;
}

export function useClientsPage({ onShowClientForm }: UseClientsPageProps = {}) {
  const {
    owners,
    pets,
    searchQuery,
    setSearchQuery,
    updateOwner,
    deleteOwner,
  } = useHotel();
  const [showForm, setShowForm] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [ownerToDelete, setOwnerToDelete] = useState<Owner | null>(null);

  const filteredOwners = owners.filter((owner) => {
    if (!owner || !owner.id) {
      return false;
    }

    const ownerPets = pets.filter((p) => {
      if (!p || !p.owner) {
        return false;
      }
      return p.owner.id === owner.id;
    });

    const searchLower = searchQuery.toLowerCase();
    return (
      owner.name?.toLowerCase().includes(searchLower) ||
      owner.phone?.includes(searchQuery) ||
      ownerPets.some((p) => p.name?.toLowerCase().includes(searchLower))
    );
  });

  const getOwnerPets = (ownerId: string) => {
    return pets.filter((p) => p.owner?.id === ownerId);
  };

  const handleShowClientForm = () => {
    setShowForm(true);
    onShowClientForm?.();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingOwner(null);
  };

  const handleEditOwner = (owner: Owner) => {
    setEditingOwner(owner);
    setShowForm(true);
  };

  const handleDeleteOwner = (owner: Owner) => {
    if (!owner) {
      return;
    }
    setOwnerToDelete(owner);
  };

  const confirmDeleteOwner = async () => {
    if (!ownerToDelete) {
      return;
    }

    try {
      await deleteOwner(ownerToDelete.id);
      toast.success("Cliente excluído com sucesso!");
      setOwnerToDelete(null);
    } catch (error) {
      toast.error("Erro ao excluir cliente. Tente novamente.");
    }
  };

  const cancelDeleteOwner = () => {
    setOwnerToDelete(null);
  };

  const getOwnerStats = () => {
    const totalOwners = owners.length;
    const ownersWithPets = owners.filter((owner) =>
      pets.some((pet) => pet.owner?.id === owner.id),
    ).length;
    const totalPets = pets.length;

    return {
      totalOwners,
      ownersWithPets,
      totalPets,
      averagePetsPerOwner:
        totalOwners > 0 ? (totalPets / totalOwners).toFixed(1) : "0",
    };
  };

  return {
    // Data
    owners,
    pets,
    filteredOwners,
    showForm,
    editingOwner,
    ownerToDelete,

    // Actions
    handleShowClientForm,
    handleCloseForm,
    handleEditOwner,
    handleDeleteOwner,
    confirmDeleteOwner,
    cancelDeleteOwner,

    // Helpers
    getOwnerPets,
    getOwnerStats,

    // Search
    searchQuery,
    setSearchQuery,
  };
}
