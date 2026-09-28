import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Parse Brazilian date string (dd/MM/yyyy HH:mm:ss) to Date object
 */
export function parseBrazilianDate(dateString: string): Date {
  // Tenta parsear como string no formato dd/MM/yyyy HH:mm:ss
  if (typeof dateString === 'string' && dateString.includes('/')) {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hours = 0, minutes = 0, seconds = 0] = timePart ? timePart.split(':').map(Number) : [];
    
    // JavaScript months are 0-indexed
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }
  
  // Fallback para parse normal
  return new Date(dateString);
}

/**
 * Formata uma data para o padrão brasileiro dd/MM/yyyy
 */
export function formatDateToBrazilian(date: string | Date): string {
  if (!date) return 'Data inválida';
  
  if (typeof date === 'string') {
    // If it's already in dd/MM/yyyy format, return as-is
    if (date.includes('/')) {
      const datePart = date.split(' ')[0];
      const parts = datePart.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
      }
    }
    // Try to create Date from string
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  }
  
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
}

/**
 * Formata uma data com hora para o padrão brasileiro dd/MM/yyyy HH:mm
 */
export function formatDateTimeToBrazilian(date: string | Date): string {
  if (!date) return 'Data inválida';
  
  if (typeof date === 'string') {
    // Try to create Date from string
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  }
  
  return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
}

/**
 * Formata uma data para exibição completa
 */
export function formatDateFull(date: string | Date): string {
  if (!date) return 'Data não disponível';
  
  if (typeof date === 'string') {
    // Try to create Date from string
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Data não disponível';
    }
    return format(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  }
  
  return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}
