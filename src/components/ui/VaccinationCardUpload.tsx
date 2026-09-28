import { useRef, useEffect, useState } from "react";
import { Upload, Trash2, FileCheck, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { cn } from "@/lib/utils";
import { useVaccinationCardUpload } from "@/hooks/useVaccinationCardUpload";
import { VaccinationCardViewer } from "@/components/ui/VaccinationCardViewer";

interface VaccinationCardUploadProps {
  readonly petId: string | null;
  readonly petName: string;
  readonly disabled?: boolean;
  readonly onChange?: (file: File | null) => void;
  readonly onUploadSuccess?: () => void;
}

export function VaccinationCardUpload({
  petId,
  petName,
  disabled = false,
  onChange,
  onUploadSuccess,
}: VaccinationCardUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const {
    isLoading,
    isUploading,
    progress,
    vaccinationCard,
    error,
    upload,
    fetch,
    remove,
  } = useVaccinationCardUpload(petId);

  useEffect(() => {
    if (petId) {
      fetch();
    }
  }, [petId, fetch]);

  useEffect(() => {
    if (petId && !isUploading && progress === 100 && progress > 0) {
      const timer = setTimeout(() => {
        fetch();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isUploading, progress, petId, fetch]);

  useEffect(() => {
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener("dragover", preventDefaults);
    document.addEventListener("drop", preventDefaults);

    return () => {
      document.removeEventListener("dragover", preventDefaults);
      document.removeEventListener("drop", preventDefaults);
    };
  }, []);

  const handleFileSelect = async (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.DragEvent<HTMLButtonElement>,
  ) => {
    let file: File | undefined;

    if ("currentTarget" in event && "files" in event.currentTarget) {
      // Input change event
      file = event.currentTarget.files?.[0];
    } else if ("dataTransfer" in event) {
      // Drag and drop event
      file = event.dataTransfer.files?.[0];
    }

    if (!file) return;

    // Se não há petId, apenas armazena localmente
    if (!petId) {
      setLocalFile(file);
      onChange?.(file);
      // Limpa o input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    // Se há petId, faz upload imediatamente
    const result = await upload(file);
    if (result) {
      onChange?.(file);
      onUploadSuccess?.();
    }

    // Limpa o input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      e.currentTarget.classList.add("border-blue-400", "bg-blue-100");
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("border-blue-400", "bg-blue-100");
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("border-blue-400", "bg-blue-100");
    if (!disabled && !isUploading) {
      handleFileSelect(e);
    }
  };

  const handleRemove = async () => {
    // Se há um arquivo local e sem petId, apenas remove localmente
    if (!petId && localFile) {
      setLocalFile(null);
      onChange?.(null);
      setIsConfirmingDelete(false);
      return;
    }

    // Se há petId, remove via API
    await remove();
    onChange?.(null);
    setIsConfirmingDelete(false);
  };

  const handleViewFile = () => {
    if (vaccinationCard?.url) {
      setIsViewerOpen(true);
    } else if (localFile) {
      // Cria uma URL para visualizar arquivo local
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        // Armazena temporariamente para visualização
        sessionStorage.setItem("localVaccineCardUrl", dataUrl);
        setIsViewerOpen(true);
      };
      reader.readAsDataURL(localFile);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          htmlFor="vaccination-card-input"
          className="text-sm font-medium text-gray-700"
        >
          Cartão de Vacina
        </label>
        {vaccinationCard || localFile ? (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <FileCheck className="h-4 w-4" />
            {vaccinationCard ? "Enviado" : "Selecionado"}
          </span>
        ) : null}
      </div>

      {/* Estado: Carregando */}
      {isLoading && (
        <div className="flex items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          <span className="ml-2 text-sm text-gray-500">Carregando...</span>
        </div>
      )}

      {/* Estado: Com arquivo */}
      {!isLoading && vaccinationCard && !isUploading && (
        <div className="border-2 border-green-200 rounded-lg bg-green-50 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {vaccinationCard.fileName}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Enviado em{" "}
                {new Date(vaccinationCard.uploadedAt).toLocaleDateString(
                  "pt-BR",
                )}
              </p>
            </div>
            <FileCheck className="h-5 w-5 text-green-600 flex-shrink-0 ml-2" />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleViewFile}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setIsConfirmingDelete(true)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Estado: Com arquivo local (sem petId ainda) */}
      {!isLoading && !vaccinationCard && localFile && !isUploading && (
        <div className="border-2 border-blue-200 rounded-lg bg-blue-50 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {localFile.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(localFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <FileCheck className="h-5 w-5 text-blue-600 flex-shrink-0 ml-2" />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleViewFile}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setIsConfirmingDelete(true)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Estado: Fazendo upload */}
      {isUploading && (
        <div className="border-2 border-blue-200 rounded-lg bg-blue-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              Enviando...
            </span>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Estado: Sem arquivo */}
      {!isLoading && !vaccinationCard && !localFile && !isUploading && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (!disabled) {
              inputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            pointerEvents: disabled ? "none" : "auto",
          }}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors w-full",
            disabled
              ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
              : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 cursor-pointer",
          )}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium text-gray-900">
            {petName ? `Cartão de Vacina de ${petName}` : "Selecione o arquivo"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Clique para selecionar ou arraste um arquivo
          </p>
          <p className="text-xs text-gray-400 mt-2">
            JPG, PNG, WebP ou PDF • Máximo 10MB
          </p>
        </button>
      )}

      {/* Erro */}
      {error && (
        <div className="border-l-4 border-red-500 bg-red-50 p-3 rounded">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Input hidden */}
      <input
        id="vaccination-card-input"
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
        aria-label={`Selecionar cartão de vacina para ${petName}`}
      />

      {/* Modal de confirmação de exclusão */}
      <ConfirmationModal
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        onConfirm={handleRemove}
        title="Remover Cartão de Vacina"
        description="Tem certeza que deseja remover o cartão de vacinação? Esta ação não pode ser desfeita."
        confirmText="Remover"
        cancelText="Cancelar"
        variant="destructive"
      />

      {/* Modal de visualização */}
      <VaccinationCardViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        fileUrl={vaccinationCard?.url || ""}
        fileName={vaccinationCard?.fileName || localFile?.name || "Arquivo"}
        fileType={vaccinationCard?.fileType}
      />
    </div>
  );
}
