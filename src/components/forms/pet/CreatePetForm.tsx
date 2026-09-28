import { useState } from "react";
import { X, PawPrint, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
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
import { cn } from "@/lib/utils";
import { useCreatePetForm, type CreatePetFormData } from "./useCreatePetForm";

interface CreatePetFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreatePetForm({ onClose, onSuccess }: CreatePetFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    control,
    errors,
    isSubmitting,
    isValid,
    selectedOwnerId,
    fields,
    append,
    remove,
    owners,
    updateSizeMultiplier,
    onSubmit,
  } = useCreatePetForm({ onClose, onSuccess });

  const onSubmitWrapper = (data: CreatePetFormData) => {
    onSubmit(data);
  };

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
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85dvh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <PawPrint className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Cadastrar Novo Pet
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmitWrapper)} className="space-y-6">
            <div>
              <Label htmlFor="ownerId">Tutor *</Label>
              <Select
                value={selectedOwnerId}
                onValueChange={(value) => setValue("ownerId", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione um tutor" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ownerId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.ownerId.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Pets</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      name: "",
                      breed: "",
                      size: "medio",
                      needsSeparateSpace: false,
                      sociability: "media",
                      allergies: "",
                      specialCare: "",
                      feedingSchedule: "08:00, 12:00, 18:00",
                      feedingAmount: "1 xícara",
                      baseDailyRate: 50,
                      sizeMultiplier: {
                        pequeno: 1.0,
                        medio: 1.0,
                        grande: 1.6,
                      },
                      notificationSettings: {
                        feeding: true,
                        medication: true,
                        checkIn: true,
                        checkOut: true,
                        customReminders: [],
                      },
                      vaccineCard: undefined,
                    })
                  }
                  className="flex items-center gap-2 bg-primary text-primary-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Pet
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-900">
                      Pet {index + 1}
                    </h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`pets.${index}.name`}>Nome do Pet *</Label>
                      <Input
                        id={`pets.${index}.name`}
                        {...register(`pets.${index}.name`)}
                        placeholder="Ex: Rex"
                        className="mt-1"
                      />
                      {errors.pets?.[index]?.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.pets[index]?.name?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`pets.${index}.breed`}>Raça *</Label>
                      <Input
                        id={`pets.${index}.breed`}
                        {...register(`pets.${index}.breed`)}
                        placeholder="Ex: Golden Retriever"
                        className="mt-1"
                      />
                      {errors.pets?.[index]?.breed && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.pets[index]?.breed?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`pets.${index}.size`}>Porte</Label>
                      <Select
                        value={watch(`pets.${index}.size`)}
                        onValueChange={(
                          value: "pequeno" | "medio" | "grande",
                        ) => {
                          setValue(`pets.${index}.size`, value);
                          updateSizeMultiplier(value);
                        }}
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
                      {errors.pets?.[index]?.size && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.pets[index]?.size?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`pets.${index}.sociability`}>
                        Sociabilidade
                      </Label>
                      <Select
                        value={watch(`pets.${index}.sociability`)}
                        onValueChange={(value: "baixa" | "media" | "alta") =>
                          setValue(`pets.${index}.sociability`, value)
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
                      {errors.pets?.[index]?.sociability && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.pets[index]?.sociability?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`pets.${index}.feedingSchedule`}>
                        Horários de Alimentação *
                      </Label>
                      <Input
                        id={`pets.${index}.feedingSchedule`}
                        {...register(`pets.${index}.feedingSchedule`)}
                        placeholder="08:00, 12:00, 18:00"
                        className="mt-1"
                      />
                      {errors.pets?.[index]?.feedingSchedule && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.pets[index]?.feedingSchedule?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`pets.${index}.feedingAmount`}>
                        Quantidade *
                      </Label>
                      <Input
                        id={`pets.${index}.feedingAmount`}
                        {...register(`pets.${index}.feedingAmount`)}
                        placeholder="1 xícara"
                        className="mt-1"
                      />
                      {errors.pets?.[index]?.feedingAmount && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.pets[index]?.feedingAmount?.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor={`pets.${index}.allergies`}>
                        Alergias
                      </Label>
                      <Textarea
                        id={`pets.${index}.allergies`}
                        {...register(`pets.${index}.allergies`)}
                        placeholder="Liste todas as alergias conhecidas"
                        className="mt-1"
                        rows={2}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor={`pets.${index}.specialCare`}>
                        Cuidados Especiais
                      </Label>
                      <Textarea
                        id={`pets.${index}.specialCare`}
                        {...register(`pets.${index}.specialCare`)}
                        placeholder="Medicações, restrições, etc."
                        className="mt-1"
                        rows={2}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <VaccinationCardUpload
                        petId={null}
                        petName={
                          watch(`pets.${index}.name`) || `Pet ${index + 1}`
                        }
                        disabled={false}
                        onChange={(file) => {
                          setValue(`pets.${index}.vaccineCard`, file);
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        O cartão de vacina será salvo após a criação do pet
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`pets.${index}.needsSeparateSpace`}
                        {...register(`pets.${index}.needsSeparateSpace`)}
                      />
                      <Label htmlFor={`pets.${index}.needsSeparateSpace`}>
                        Necessita de espaço separado
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
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
              <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="bg-primary text-primary-foreground"
              >
                {isSubmitting
                  ? "Cadastrando..."
                  : `Cadastrar ${fields.length} Pet(s)`}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
