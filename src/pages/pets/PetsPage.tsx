import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Search,
  PawPrint,
  FileText,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Syringe,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { CreatePetForm } from "@/components/forms/pet/CreatePetForm";
import { EditPetForm } from "@/components/forms/pet/edit/EditPetForm";
import { VaccinationCardViewer } from "@/components/ui/VaccinationCardViewer";
import { usePetsPage } from "./usePetsPage";

const openBase64File = (
  base64Data: string,
  filename: string = "cartao-vacina",
) => {
  try {
    const mimeTypeMatch = /data:([^;]+);base64,/.exec(base64Data);
    const mimeType = mimeTypeMatch?.[1] || "application/octet-stream";

    const base64Content = base64Data.split("base64,")[1];

    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.codePointAt(i) || 0;
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    const blobUrl = URL.createObjectURL(blob);

    globalThis.open(blobUrl, "_blank");

    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch {
    globalThis.open(base64Data, "_blank");
  }
};

export function PetsPage() {
  const {
    pets,
    filteredPets,
    expandedPet,
    showForm,
    editingPet,
    petToDelete,
    sizeLabels,
    sociabilityLabels,
    sociabilityColors,
    vaccinationCardStyle,
    togglePetExpansion,
    handleShowPetForm,
    handleCloseForm,
    handlePetFormSuccess,
    handleEditPet,
    handleDeletePet,
    confirmDeletePet,
    cancelDeletePet,
    searchQuery,
    setSearchQuery,
  } = usePetsPage();

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerData, setViewerData] = useState<{
    url: string;
    fileName: string;
    fileType?: string;
  } | null>(null);

  const handleViewVaccinationCard = (
    url: string,
    petName: string,
    fileType?: string,
  ) => {
    setViewerData({
      url,
      fileName: `Cartão de Vacina - ${petName}`,
      fileType,
    });
    setViewerOpen(true);
  };

  return (
    <MainLayout title="Pets" subtitle="Gerencie os pets cadastrados">
      {/* Search and Actions */}
      <div className="mb-6 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar pets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-sm sm:text-base"
          />
        </div>
        <Button
          onClick={handleShowPetForm}
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          Novo Pet
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="bg-card p-3 sm:p-4 rounded-lg border">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total de Pets
              </p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {pets.length}
              </p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <PawPrint className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="bg-card p-3 sm:p-4 rounded-lg border">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Pets com Cartão de Vacina
              </p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {pets.filter((pet) => pet.vaccinationCardUrl).length}
              </p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Syringe className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Pets List */}
      <div className="space-y-4">
        {filteredPets.length === 0 ? (
          <div className="text-center py-12">
            <PawPrint className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? "Nenhum pet encontrado" : "Nenhum pet cadastrado"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Tente buscar com outros termos"
                : "Comece cadastrando um novo pet para gerenciar suas hospedagens"}
            </p>
            {!searchQuery && (
              <Button onClick={handleShowPetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Primeiro Pet
              </Button>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {filteredPets.map((pet) => {
              const isExpanded = expandedPet === pet.id;

              return (
                <motion.div
                  key={pet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-card rounded-lg border shadow-sm"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
                      <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <PawPrint className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-medium text-foreground truncate mb-3">
                            {pet.name}
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-muted-foreground mb-3">
                            <div>
                              <span className="font-medium">Raça:</span>{" "}
                              <span className="block sm:inline">
                                {pet.breed}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Porte:</span>{" "}
                              <span className="block sm:inline">
                                {sizeLabels[pet.size]}
                              </span>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <span className="font-medium">Tutor:</span>{" "}
                              <span className="block sm:inline">
                                {pet.owner?.name}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              className={`${sociabilityColors[pet.sociability]} transition-colors text-xs`}
                            >
                              <span className="hidden sm:inline">
                                Sociabilidade:{" "}
                              </span>
                              <span className="sm:hidden">Sociabilidade: </span>
                              {sociabilityLabels[pet.sociability]}
                            </Badge>
                            {pet.needsSeparateSpace && (
                              <Badge variant="outline" className="text-xs">
                                Espaço Separado
                              </Badge>
                            )}
                            {pet.vaccinationCardUrl && (
                              <Badge
                                className={`${vaccinationCardStyle.badge} text-xs flex items-center gap-1`}
                              >
                                <Syringe className="w-3 h-3" />
                                <span className="hidden sm:inline">
                                  Possui cartão de vacina
                                </span>
                                <span className="sm:hidden">
                                  Possui Cartão de vacina
                                </span>
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end space-x-1 sm:space-x-2 self-end sm:self-start">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePetExpansion(pet.id)}
                          className="text-muted-foreground p-1 sm:p-2"
                          title="Expandir detalhes"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transform transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </Button>
                        {pet.vaccinationCardUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleViewVaccinationCard(
                                pet.vaccinationCardUrl,
                                pet.name,
                              )
                            }
                            className={`${vaccinationCardStyle.button} transition-colors p-1 sm:p-2`}
                            title="Visualizar Cartão de Vacina"
                          >
                            <Syringe className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPet(pet)}
                          className="text-primary p-1 sm:p-2"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePet(pet)}
                          className="text-destructive p-1 sm:p-2"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-foreground mb-2 flex items-center gap-2 text-sm sm:text-base">
                                  <FileText className="h-4 w-4" />
                                  Informações de Cuidado
                                </h4>
                                <div className="space-y-2 text-xs sm:text-sm">
                                  <div>
                                    <span className="font-medium">
                                      Alimentação:
                                    </span>{" "}
                                    {pet.feedingSchedule}
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Quantidade:
                                    </span>{" "}
                                    {pet.feedingAmount}
                                  </div>
                                  {pet.allergies && (
                                    <div>
                                      <span className="font-medium">
                                        Alergias:
                                      </span>{" "}
                                      {pet.allergies}
                                    </div>
                                  )}
                                  {pet.specialCare && (
                                    <div>
                                      <span className="font-medium">
                                        Cuidados Especiais:
                                      </span>{" "}
                                      {pet.specialCare}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Forms Modals */}
      {showForm && !editingPet && (
        <CreatePetForm
          onClose={handleCloseForm}
          onSuccess={handlePetFormSuccess}
        />
      )}
      {showForm && editingPet && (
        <EditPetForm
          pet={editingPet}
          onClose={handleCloseForm}
          onSuccess={handlePetFormSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!petToDelete}
        onClose={cancelDeletePet}
        onConfirm={confirmDeletePet}
        title="Excluir Pet"
        description={`Tem certeza que deseja excluir o pet "${petToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />

      {/* Vaccination Card Viewer Modal */}
      {viewerData && (
        <VaccinationCardViewer
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          fileUrl={viewerData.url}
          fileName={viewerData.fileName}
          fileType={viewerData.fileType}
        />
      )}
    </MainLayout>
  );
}
