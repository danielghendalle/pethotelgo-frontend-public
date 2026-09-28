import { motion } from "framer-motion";
import {
  Search,
  Phone,
  PawPrint,
  Plus,
  Edit,
  Trash2,
  Users,
  User,
  Mail,
  MapPin,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ClientRegistrationForm } from "@/components/forms/client/ClientRegistrationForm";
import { EditOwnerForm } from "@/components/forms/owner/EditOwnerForm";
import { cn } from "@/lib/utils";
import { useClientsPage } from "./useClientsPage";

export function ClientsPage() {
  const {
    filteredOwners,
    showForm,
    editingOwner,
    ownerToDelete,
    handleShowClientForm,
    handleCloseForm,
    handleEditOwner,
    handleDeleteOwner,
    confirmDeleteOwner,
    cancelDeleteOwner,
    getOwnerPets,
    getOwnerStats,
    searchQuery,
    setSearchQuery,
  } = useClientsPage();

  const stats = getOwnerStats();

  return (
    <MainLayout title="Clientes" subtitle="Gerencie os tutores e seus pets">
      {/* Search and Actions */}
      <div className="mb-6 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar clientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-sm sm:text-base"
          />
        </div>
        <Button
          onClick={handleShowClientForm}
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="bg-card p-3 sm:p-4 rounded-lg border">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total de Clientes
              </p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {stats.totalOwners}
              </p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="bg-card p-3 sm:p-4 rounded-lg border">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Com Pets
              </p>
              <p className="text-xl sm:text-2xl font-bold text-success">
                {stats.ownersWithPets}
              </p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
              <PawPrint className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="space-y-4">
        {filteredOwners.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery
                ? "Nenhum cliente encontrado"
                : "Nenhum cliente cadastrado"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Tente buscar com outros termos"
                : "Comece cadastrando um novo cliente para gerenciar seus pets"}
            </p>
            {!searchQuery && (
              <Button onClick={handleShowClientForm}>
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Primeiro Cliente
              </Button>
            )}
          </div>
        ) : (
          <motion.div className="space-y-4">
            {filteredOwners.map((owner) => {
              const ownerPets = getOwnerPets(owner.id);

              return (
                <motion.div
                  key={owner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-lg border shadow-sm p-4 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-medium text-foreground truncate">
                            {owner.name}
                          </h3>
                          <Badge
                            variant={
                              ownerPets.length > 0 ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {ownerPets.length}{" "}
                            {ownerPets.length === 1 ? "pet" : "pets"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{owner.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{owner.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <PawPrint className="h-4 w-4" />
                            {ownerPets.length}{" "}
                            {ownerPets.length === 1 ? "pet" : "pets"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditOwner(owner)}
                        className="text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOwner(owner)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Forms Modals */}
      {showForm && !editingOwner && (
        <ClientRegistrationForm onClose={handleCloseForm} />
      )}
      {showForm && editingOwner && (
        <EditOwnerForm owner={editingOwner} onClose={handleCloseForm} />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!ownerToDelete}
        onClose={cancelDeleteOwner}
        onConfirm={confirmDeleteOwner}
        title="Excluir Cliente"
        description={`Tem certeza que deseja excluir o cliente "${ownerToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </MainLayout>
  );
}
