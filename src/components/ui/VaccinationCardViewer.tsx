import { useId } from "react";
import { Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VaccinationCardViewerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly fileUrl: string;
  readonly fileName: string;
  readonly fileType?: string;
}

export function VaccinationCardViewer({
  isOpen,
  onClose,
  fileUrl: initialFileUrl,
  fileName,
  fileType,
}: VaccinationCardViewerProps) {
  const descId = useId();

  // Se não há URL inicial, tenta pegar do sessionStorage (para arquivos locais)
  const fileUrl =
    initialFileUrl || (sessionStorage.getItem("localVaccineCardUrl") ?? "");

  const detectFileType = () => {
    if (fileType) {
      return fileType;
    }

    if (fileUrl.startsWith("data:")) {
      const regex = /data:([^;]+);/;
      const match = regex.exec(fileUrl);
      return match?.[1] || "";
    }

    if (fileName.toLowerCase().endsWith(".pdf")) {
      return "application/pdf";
    }
    if (/\.(jpg|jpeg|png|webp)$/i.test(fileName)) {
      return "image/jpeg";
    }

    return "";
  };

  const detectedFileType = detectFileType();
  const isPdf =
    detectedFileType.includes("pdf") || fileName.toLowerCase().endsWith(".pdf");
  const isImage =
    detectedFileType.includes("image") ||
    /\.(jpg|jpeg|png|webp)$/i.test(fileName);

  const getExtensionFromMimeType = (mimeType: string) => {
    if (mimeType.includes("pdf")) return ".pdf";
    if (mimeType.includes("jpeg")) return ".jpg";
    if (mimeType.includes("png")) return ".png";
    if (mimeType.includes("webp")) return ".webp";
    return ".bin";
  };

  const handleDownload = () => {
    try {
      if (fileUrl.startsWith("data:")) {
        const regex = /data:([^;]+);base64,(.+)/;
        const match = regex.exec(fileUrl);

        if (!match) return;

        const [, mimeType, base64Data] = match;
        const extension = getExtensionFromMimeType(mimeType);
        const downloadFileName = fileName.includes(".")
          ? fileName
          : `${fileName}${extension}`;

        const byteCharacters = atob(base64Data);
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i += 1) {
          byteArray[i] = byteCharacters.codePointAt(i) || 0;
        }

        const blob = new Blob([byteArray], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = downloadFileName;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          link.remove();
        }, 100);

        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 1000);
      } else {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileName;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          link.remove();
        }, 100);
      }
    } catch {
      // Silenciosamente ignora erros de download
    }
  };

  const renderContent = () => {
    if (isPdf) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <object
            data={fileUrl}
            type="application/pdf"
            width="100%"
            height="100%"
            className="rounded-lg border border-gray-200"
          >
            <div className="flex flex-col items-center justify-center space-y-3 p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-600">
                O navegador não conseguiu renderizar o PDF.
              </p>
              <p className="text-xs text-gray-500">
                Clique em Download para abrir em um visualizador externo.
              </p>
            </div>
          </object>
        </div>
      );
    }

    if (isImage) {
      return (
        <img
          src={fileUrl}
          alt={fileName}
          className="max-w-full max-h-full object-contain rounded-lg border border-gray-200 shadow-sm"
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center space-y-3 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400" />
        <p className="text-gray-600">
          Formato de arquivo não suportado para visualização
        </p>
        <p className="text-sm text-gray-500">{fileName}</p>
        <p className="text-xs text-gray-400">Tipo: {detectedFileType}</p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[85dvh] flex flex-col p-0 bg-white"
        aria-describedby={descId}
      >
        <DialogHeader className="border-b p-4">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {fileName}
          </DialogTitle>
        </DialogHeader>

        <div id={descId} className="sr-only">
          Visualizador de cartão de vacina. Tipo: {detectedFileType}
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 p-4 flex items-center justify-center">
          {renderContent()}
        </div>

        <div className="border-t p-4 flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button type="button" onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
