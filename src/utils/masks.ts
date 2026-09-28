// Funções de máscara para inputs

export const formatCurrencyInput = (value: string): string => {
  const numbersOnly = value.replace(/\D/g, '');
  
  if (!numbersOnly) return '';
  
  const number = parseInt(numbersOnly) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(number);
};

export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  const cleanValue = value.replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

export const formatPercentage = (value: number): string => {
  return `${value}%`;
};

export const parsePercentage = (value: string): number => {
  if (!value) return 0;
  const cleanValue = value.replace(/[%\s]/g, '');
  return parseFloat(cleanValue) || 0;
};

export const formatPhoneInput = (value: string): string => {
  const numbersOnly = value.replace(/\D/g, '');
  
  if (numbersOnly.length <= 2) {
    return numbersOnly;
  } else if (numbersOnly.length <= 7) {
    return `(${numbersOnly.slice(0, 2)}) ${numbersOnly.slice(2)}`;
  } else {
    return `(${numbersOnly.slice(0, 2)}) ${numbersOnly.slice(2, 7)}-${numbersOnly.slice(7, 11)}`;
  }
};

export const parsePhone = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const formatCPFInput = (value: string): string => {
  const numbersOnly = value.replace(/\D/g, '');
  
  if (numbersOnly.length <= 3) {
    return numbersOnly;
  } else if (numbersOnly.length <= 6) {
    return `${numbersOnly.slice(0, 3)}.${numbersOnly.slice(3)}`;
  } else if (numbersOnly.length <= 9) {
    return `${numbersOnly.slice(0, 3)}.${numbersOnly.slice(3, 6)}.${numbersOnly.slice(6)}`;
  } else {
    return `${numbersOnly.slice(0, 3)}.${numbersOnly.slice(3, 6)}.${numbersOnly.slice(6, 9)}-${numbersOnly.slice(9, 11)}`;
  }
};

export const parseCPF = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const formatCNPJInput = (value: string): string => {
  const numbersOnly = value.replace(/\D/g, '');
  
  if (numbersOnly.length <= 2) {
    return numbersOnly;
  } else if (numbersOnly.length <= 5) {
    return `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2)}`;
  } else if (numbersOnly.length <= 8) {
    return `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2, 5)}.${numbersOnly.slice(5)}`;
  } else if (numbersOnly.length <= 12) {
    return `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2, 5)}.${numbersOnly.slice(5, 8)}/${numbersOnly.slice(8, 12)}`;
  } else {
    return `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2, 5)}.${numbersOnly.slice(5, 8)}/${numbersOnly.slice(8, 12)}-${numbersOnly.slice(12, 14)}`;
  }
};

export const parseCNPJ = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const formatCEPInput = (value: string): string => {
  const numbersOnly = value.replace(/\D/g, '');
  
  if (numbersOnly.length <= 5) {
    return numbersOnly;
  } else {
    return `${numbersOnly.slice(0, 5)}-${numbersOnly.slice(5, 8)}`;
  }
};

export const parseCEP = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const formatRGInput = (value: string): string => {
  const numbersOnly = value.replace(/\D/g, '');
  
  if (numbersOnly.length <= 2) {
    return numbersOnly;
  } else if (numbersOnly.length <= 5) {
    return `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2)}`;
  } else if (numbersOnly.length <= 8) {
    return `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2, 5)}.${numbersOnly.slice(5)}`;
  } else {
    return `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2, 5)}.${numbersOnly.slice(5, 8)}-${numbersOnly.slice(8, 12)}`;
  }
};

export const parseRG = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Limitadores de input
export const limitNumber = (value: string, min: number, max: number): string => {
  const num = parseInt(value) || 0;
  return Math.min(max, Math.max(min, num)).toString();
};

export const limitLength = (value: string, maxLength: number): string => {
  return value.slice(0, maxLength);
};

export const limitPercentage = (value: string): string => {
  const num = parseInt(value) || 0;
  return Math.min(100, Math.max(0, num)).toString();
};
