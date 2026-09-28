import { useState } from "react";
import { useHotel } from "@/contexts/useHotelHook";
import type { Pet } from "@/types/hotel";
import { toast } from "sonner";

const sizeLabels = {
  pequeno: "Pequeno",
  medio: "Médio",
  grande: "Grande",
};

const sociabilityLabels = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

const sociabilityColors = {
  baixa: "bg-busy/10 text-busy hover:bg-busy/20",
  media: "bg-warning/10 text-warning-foreground hover:bg-warning/20",
  alta: "bg-success/10 text-success hover:bg-success/20",
};

const vaccinationCardStyle = {
  badge: "bg-success/10 text-success hover:bg-success/20",
  button: "text-success hover:text-success/80",
};

interface UsePetsPageProps {
  onShowPetForm?: () => void;
  onShowClientForm?: () => void;
}

export function usePetsPage({
  onShowPetForm,
  onShowClientForm,
}: UsePetsPageProps = {}) {
  const { pets, owners, searchQuery, setSearchQuery, deletePet, refreshPets } =
    useHotel();

  const [expandedPet, setExpandedPet] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);

  const filteredPets = pets.filter((pet) => {
    const owner = pet.owner;
    const searchLower = searchQuery.toLowerCase();
    return (
      pet.name.toLowerCase().includes(searchLower) ||
      pet.breed.toLowerCase().includes(searchLower) ||
      owner?.name.toLowerCase().includes(searchLower)
    );
  });

  const togglePetExpansion = (petId: string) => {
    setExpandedPet(expandedPet === petId ? null : petId);
  };

  const handleShowPetForm = () => {
    setShowForm(true);
    onShowPetForm?.();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPet(null);
  };

  const handlePetFormSuccess = async () => {
    try {
      await refreshPets();
    } catch (error) {
      console.error("Erro ao atualizar pets:", error);
    }
  };

  const handleEditPet = (pet: Pet) => {
    setEditingPet(pet);
    setShowForm(true);
  };

  const handleDeletePet = (pet: Pet) => {
    setPetToDelete(pet);
  };

  const confirmDeletePet = async () => {
    if (!petToDelete) return;

    try {
      await deletePet(petToDelete.id);
      toast.success("Pet excluído com sucesso!");
      setPetToDelete(null);
    } catch {
      toast.error("Erro ao excluir pet. Tente novamente.");
    }
  };

  const cancelDeletePet = () => {
    setPetToDelete(null);
  };

  const getPetStatusColor = (pet: Pet) => {
    return "bg-muted text-muted-foreground";
  };

  const getPetStatusText = (pet: Pet) => {
    return "Disponível";
  };

  return {
    // Data
    pets,
    owners,
    filteredPets,
    expandedPet,
    showForm,
    editingPet,
    petToDelete,

    // Constants
    sizeLabels,
    sociabilityLabels,
    sociabilityColors,
    vaccinationCardStyle,

    // Actions
    togglePetExpansion,
    handleShowPetForm,
    handleCloseForm,
    handlePetFormSuccess,
    handleEditPet,
    handleDeletePet,
    confirmDeletePet,
    cancelDeletePet,

    // Helpers
    getPetStatusColor,
    getPetStatusText,

    // Search
    searchQuery,
    setSearchQuery,
  };
}
