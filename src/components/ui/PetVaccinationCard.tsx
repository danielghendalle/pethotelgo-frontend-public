import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VaccinationCardUpload } from "./VaccinationCardUpload";
import { useVaccinationCardUpload } from "@/hooks/useVaccinationCardUpload";

interface PetVaccinationCardProps {
  readonly petId: string;
  readonly petName: string;
  readonly onCardUpdated?: (hasCard: boolean) => void;
}

export function PetVaccinationCard({
  petId,
  petName,
  onCardUpdated,
}: Readonly<PetVaccinationCardProps>) {
  const { vaccinationCard, fetch, isLoading } = useVaccinationCardUpload(petId);

  // Carrega o cartão quando o componente monta
  useEffect(() => {
    fetch();
  }, [petId, fetch]);

  // Notifica quando o cartão é atualizado
  useEffect(() => {
    onCardUpdated?.(!!vaccinationCard);
  }, [vaccinationCard, onCardUpdated]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cartão de Vacina</CardTitle>
        <CardDescription>
          Gerencie o cartão de vacinação de {petName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VaccinationCardUpload
          petId={petId}
          petName={petName}
          disabled={isLoading}
          onChange={(hasCard) => onCardUpdated?.(hasCard)}
        />
      </CardContent>
    </Card>
  );
}
