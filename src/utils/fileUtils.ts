/**
 * Utilitários para processamento de arquivos
 */

export interface ProcessedFile {
  base64: string;
  name: string;
  type: string;
  size: number;
}

/**
 * Converte um arquivo (PDF ou imagem) para base64
 * @param file - Arquivo a ser processado
 * @returns Promise<ProcessedFile> - Arquivo processado em base64
 */
export const fileToBase64 = (file: File): Promise<ProcessedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const result = reader.result as string;

        // Remove o prefixo data:[<mime-type>];base64, se existir
        const base64 = result.includes("base64,")
          ? result.split("base64,")[1]
          : result;

        const processedFile: ProcessedFile = {
          base64,
          name: file.name,
          type: file.type,
          size: file.size,
        };

        resolve(processedFile);
      } catch {
        reject(new Error("Erro ao processar arquivo para base64"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Erro ao ler arquivo"));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Valida se o arquivo é um tipo aceitável (imagem ou PDF)
 * @param file - Arquivo a ser validado
 * @returns boolean - True se arquivo for válido
 */
export const isValidFileType = (file: File): boolean => {
  const validTypes = [
    // Imagens
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    // PDF
    "application/pdf",
  ];

  return validTypes.includes(file.type);
};

/**
 * Valida o tamanho máximo do arquivo (padrão: 5MB)
 * @param file - Arquivo a ser validado
 * @param maxSizeInMB - Tamanho máximo em MB (padrão: 5)
 * @returns boolean - True se arquivo estiver dentro do limite
 */
export const isValidFileSize = (
  file: File,
  maxSizeInMB: number = 5,
): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Formata o tamanho do arquivo para exibição
 * @param bytes - Tamanho em bytes
 * @returns string - Tamanho formatado (ex: "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

export const formatFileForDatabase = (processedFile: ProcessedFile): string => {
  return `data:${processedFile.type};base64,${processedFile.base64}`;
};

export const parseFileFromDatabase = (
  dataString: string,
): ProcessedFile | null => {
  if (!dataString?.includes("base64,")) {
    return null;
  }

  try {
    const [mimeInfo, base64] = dataString.split("base64,");
    const mimeType = mimeInfo.replace("data:", "").replace(";", "");

    return {
      base64,
      name: "document",
      type: mimeType,
      size: 0,
    };
  } catch {
    return null;
  }
};

export const multipleFilesToBase64 = async (
  files: File[],
): Promise<ProcessedFile[]> => {
  const processedFiles: ProcessedFile[] = [];

  for (const file of files) {
    if (isValidFileType(file) && isValidFileSize(file)) {
      try {
        const processed = await fileToBase64(file);
        processedFiles.push(processed);
      } catch {
        // File processing failed, skip this file
      }
    }
  }

  return processedFiles;
};
