import { motion } from "framer-motion";
import {
  PawPrint,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useHotel } from "@/contexts/useHotelHook";
import { cn } from "@/lib/utils";

export function DashboardStats() {
  const {
    pets,
    owners,
    reservations,
    getReservationsForDate,
    getPetById,
    getOwnerById,
  } = useHotel();

  const today = new Date();
  const todayReservations = getReservationsForDate(today);
  const pendingReservations = reservations.filter(
    (r) => r.status === "pending",
  );

  const stats = [
    {
      label: "Pets Hoje",
      value: todayReservations.length,
      max: 5,
      icon: PawPrint,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Clientes Cadastrados",
      value: owners.length,
      icon: Users,
      color: "text-secondary-foreground",
      bg: "bg-secondary",
    },
    {
      label: "Pets Cadastrados",
      value: pets.length,
      icon: PawPrint,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Reservas Pendentes",
      value: pendingReservations.length,
      icon: Clock,
      color: "text-warning-foreground",
      bg: "bg-warning/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card overflow-hidden"
          >
            <div className="flex items-center justify-between gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg",
                  stat.bg,
                )}
              >
                <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", stat.color)} />
              </div>
              {stat.max && (
                <span className="text-xs sm:text-sm text-muted-foreground">
                  / {stat.max}
                </span>
              )}
            </div>
            <div className="mt-3 sm:mt-4">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {stat.value}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground truncate">
                {stat.label}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
