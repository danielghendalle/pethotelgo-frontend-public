import { motion } from "framer-motion";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PawPrint, Clock } from "lucide-react";
import { useHotel } from "@/contexts/useHotelHook";
import { cn } from "@/lib/utils";
import { parseBrazilianDate } from "@/utils/dateUtils";
import { Badge } from "@/components/ui/badge";

const sizeLabels = {
  pequeno: "P",
  medio: "M",
  grande: "G",
};

const sizeColors = {
  pequeno: "bg-secondary text-secondary-foreground",
  medio: "bg-primary/10 text-primary",
  grande: "bg-accent/10 text-accent",
};

export function UpcomingReservations() {
  const { reservations } = useHotel();

  const upcoming = reservations
    .filter(
      (r) =>
        r.status !== "cancelled" && parseBrazilianDate(r.checkIn) >= new Date(),
    )
    .sort(
      (a, b) =>
        parseBrazilianDate(a.checkIn).getTime() -
        parseBrazilianDate(b.checkIn).getTime(),
    )
    .slice(0, 5);

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, "d 'de' MMM", { locale: ptBR });
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <h2 className="font-display text-base sm:text-lg font-semibold text-foreground truncate">
          Próximas Reservas
        </h2>
        <Badge variant="outline" className="text-muted-foreground shrink-0">
          {upcoming.length} reservas
        </Badge>
      </div>

      <div className="divide-y divide-border">
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <PawPrint className="mb-2 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              Nenhuma reserva futura
            </p>
          </div>
        ) : (
          upcoming.map((res, index) => {
            const pet = res.pet;
            const owner = res.owner;
            if (!pet || !owner) return null;

            return (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <PawPrint className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm sm:text-base text-foreground truncate">
                      {pet.name}
                    </p>
                    <Badge
                      className={cn(
                        "text-xs shrink-0 hidden sm:inline-flex",
                        sizeColors[pet.size],
                      )}
                    >
                      {sizeLabels[pet.size]}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {owner.name}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium text-sm sm:text-base text-foreground">
                    {getDateLabel(parseBrazilianDate(res.checkIn))}
                  </p>
                  <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(parseBrazilianDate(res.checkIn), "HH:mm")}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
