import { X, PawPrint } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VaccinationCardUpload } from "@/components/ui/VaccinationCardUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useEditPetForm } from "./useEditPetForm";
import type { Pet } from "@/types/hotel";
interface EditPetFormProps {
  readonly pet: Pet;
  readonly onClose: () => void;
  readonly onSuccess?: () => void;
}

export function EditPetForm({ pet, onClose, onSuccess }: EditPetFormProps) {
  const [vaccinationCardUpdated, setVaccinationCardUpdated] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    isSubmitting,
    selectedSize,
    onSubmit,
  } = useEditPetForm({ pet, onClose, onSuccess });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85dvh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Editar Pet</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <PawPrint className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{pet.name}</h3>
                <p className="text-sm text-gray-500">
                  {pet.breed} • {pet.size}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Nome do Pet</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Ex: Rex"
                  className="mt-1"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="breed">Raça</Label>
                <Input
                  id="breed"
                  {...register("breed")}
                  placeholder="Ex: Golden Retriever"
                  className="mt-1"
                />
                {errors.breed && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.breed.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="size">Porte</Label>
                <Select
                  value={selectedSize}
                  onValueChange={(value) => setValue("size", value as "pequeno" | "medio" | "grande")}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o porte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pequeno">Pequeno</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="grande">Grande</SelectItem>
                  </SelectContent>
                </Select>
                {errors.size && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.size.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="sociability">Sociabilidade</Label>
                <Select
                  value={watch("sociability")}
                  onValueChange={(value) =>
                    setValue("sociability", value as "baixa" | "media" | "alta")
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
                {errors.sociability && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.sociability.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="feedingSchedule">Horários de Alimentação</Label>
                <Input
                  id="feedingSchedule"
                  {...register("feedingSchedule")}
                  placeholder="Ex: 08:00, 12:00, 18:00"
                  className="mt-1"
                />
                {errors.feedingSchedule && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.feedingSchedule.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="feedingAmount">Quantidade</Label>
                <Input
                  id="feedingAmount"
                  {...register("feedingAmount")}
                  placeholder="Ex: 1 xícara, 200g"
                  className="mt-1"
                />
                {errors.feedingAmount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.feedingAmount.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="allergies">Alergias</Label>
                <Textarea
                  id="allergies"
                  {...register("allergies")}
                  placeholder="Liste todas as alergias conhecidas"
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="specialCare">Cuidados Especiais</Label>
                <Textarea
                  id="specialCare"
                  {...register("specialCare")}
                  placeholder="Medicações, restrições, etc."
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div className="md:col-span-2">
                <VaccinationCardUpload
                  petId={pet.id}
                  petName={pet.name}
                  disabled={false}
                  onUploadSuccess={() => {
                    setVaccinationCardUpdated(true);
                    // Mostra mensagem de sucesso
                    setTimeout(() => {
                      setVaccinationCardUpdated(false);
                    }, 3000);
                  }}
                />
                {vaccinationCardUpdated && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                    ✓ Cartão de vacina atualizado com sucesso!
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="needsSeparateSpace"
                  {...register("needsSeparateSpace")}
                />
                <Label htmlFor="needsSeparateSpace">
                  Necessita de espaço separado
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Atualizando..." : "Atualizar Pet"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
