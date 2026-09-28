import { useState } from 'react';
import { toast } from 'sonner';

interface NotificationSettingsData {
  feeding: boolean;
  medication: boolean;
  checkIn: boolean;
  checkOut: boolean;
  customReminders?: string[];
}

interface UseNotificationSettingsProps {
  value: NotificationSettingsData;
  onChange: (settings: NotificationSettingsData) => void;
  feedingSchedule?: string;
}

export function useNotificationSettings({ value, onChange, feedingSchedule }: UseNotificationSettingsProps) {
  const [newReminder, setNewReminder] = useState('');

  const handleToggle = (key: keyof NotificationSettingsData) => {
    onChange({
      ...value,
      [key]: !value[key]
    });
  };

  const addCustomReminder = () => {
    if (newReminder.trim()) {
      const reminders = value.customReminders || [];
      onChange({
        ...value,
        customReminders: [...reminders, newReminder.trim()]
      });
      setNewReminder('');
      toast.success('Lembrete adicionado');
    }
  };

  const removeCustomReminder = (index: number) => {
    const reminders = value.customReminders || [];
    onChange({
      ...value,
      customReminders: reminders.filter((_, i) => i !== index)
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'feeding':
        return '🍽️';
      case 'medication':
        return '💊';
      case 'checkIn':
        return '📅';
      case 'checkOut':
        return '🏠';
      default:
        return '🔔';
    }
  };

  const getNotificationLabel = (type: string) => {
    switch (type) {
      case 'feeding':
        return 'Alimentação';
      case 'medication':
        return 'Medicação';
      case 'checkIn':
        return 'Check-in';
      case 'checkOut':
        return 'Check-out';
      default:
        return 'Notificação';
    }
  };

  const getNotificationDescription = (type: string) => {
    switch (type) {
      case 'feeding':
        return feedingSchedule ? `Lembrete de alimentação: ${feedingSchedule}` : 'Lembrete de alimentação';
      case 'medication':
        return 'Lembrete de medicamentos';
      case 'checkIn':
        return 'Notificação de chegada';
      case 'checkOut':
        return 'Notificação de saída';
      default:
        return 'Notificação personalizada';
    }
  };

  return {
    newReminder,
    setNewReminder,
    handleToggle,
    addCustomReminder,
    removeCustomReminder,
    getNotificationIcon,
    getNotificationLabel,
    getNotificationDescription,
    value
  };
}
