import { SelectItem } from '@/components/ui/select';

interface EmptySelectItemProps {
  message: string;
  value?: string;
}

export function EmptySelectItem({ message, value = 'empty' }: EmptySelectItemProps) {
  return (
    <SelectItem value={value} disabled>
      {message}
    </SelectItem>
  );
}
