import { Bell, Clock, Pill, Utensils, Calendar, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNotificationSettings } from './useNotificationSettings';

interface NotificationSettingsProps {
  value: {
    feeding: boolean;
    medication: boolean;
    checkIn: boolean;
    checkOut: boolean;
    customReminders?: string[];
  };
  onChange: (settings: any) => void;
  feedingSchedule?: string;
}

export function NotificationSettings({ value, onChange, feedingSchedule }: NotificationSettingsProps) {
  const {
    newReminder,
    setNewReminder,
    handleToggle,
    addCustomReminder,
    removeCustomReminder,
    getNotificationIcon,
    getNotificationLabel,
    getNotificationDescription
  } = useNotificationSettings({ value, onChange, feedingSchedule });

  const notificationTypes = [
    { key: 'feeding', icon: Utensils, color: 'bg-blue-500' },
    { key: 'medication', icon: Pill, color: 'bg-red-500' },
    { key: 'checkIn', icon: Calendar, color: 'bg-green-500' },
    { key: 'checkOut', icon: Clock, color: 'bg-orange-500' },
  ] as const;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Configurações de Notificação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {notificationTypes.map(({ key, icon: Icon, color }) => (
            <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">{getNotificationLabel(key)}</h4>
                  <p className="text-sm text-gray-500">{getNotificationDescription(key)}</p>
                </div>
              </div>
              <Switch
                checked={value[key as keyof typeof value]}
                onCheckedChange={() => handleToggle(key as keyof typeof value)}
              />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Lembretes Personalizados</h4>
            <Badge variant="outline">
              {value.customReminders?.length || 0} lembretes
            </Badge>
          </div>

          <div className="flex space-x-2">
            <Input
              placeholder="Adicionar lembrete personalizado..."
              value={newReminder}
              onChange={(e) => setNewReminder(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomReminder()}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={addCustomReminder}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </Button>
          </div>

          {value.customReminders && value.customReminders.length > 0 && (
            <div className="space-y-2">
              {value.customReminders.map((reminder, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getNotificationIcon('custom')}</span>
                    <span className="text-sm">{reminder}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomReminder(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Como funcionam as notificações</p>
              <ul className="space-y-1 text-xs">
                <li>• Você receberá notificações para as opções selecionadas</li>
                <li>• As notificações serão enviadas conforme os horários configurados</li>
                <li>• Lembretes personalizados podem ser adicionados conforme necessário</li>
                <li>• Você pode desativar as notificações a qualquer momento</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
