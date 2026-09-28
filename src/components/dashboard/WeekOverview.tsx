import { motion } from "framer-motion";
import { useState } from "react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PawPrint } from "lucide-react";
import { useHotel } from "@/contexts/useHotelHook";
import { cn } from "@/lib/utils";

export function WeekOverview() {
  const { getPetsCountForDate, isDateFull, setSelectedDate, setCalendarView } =
    useHotel();

  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setCalendarView("day");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card">
      <h2 className="mb-4 font-display text-base sm:text-lg font-semibold text-foreground">
        Visão da Semana
      </h2>

      {/* Legenda de ocupação */}
      <div className="mb-4 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span>Baixa (0-40%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <span>Média (40-70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-orange-500" />
          <span>Alta (70-100%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-600" />
          <span>Lotada (100%)</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weekDays.map((day, index) => {
          const count = getPetsCountForDate(day);
          const isFull = isDateFull(day);
          const isToday = index === 0;
          const occupancyPercentage = (count / 5) * 100;

          const getBarColor = () => {
            if (occupancyPercentage === 100) return "bg-red-600";
            if (occupancyPercentage >= 70) return "bg-orange-500";
            if (occupancyPercentage >= 40) return "bg-yellow-500";
            if (occupancyPercentage > 0) return "bg-success";
            return "bg-muted";
          };

          return (
            <motion.button
              key={day.toISOString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleDayClick(day)}
              className={cn(
                "flex flex-col items-center gap-1 sm:gap-2 rounded-lg p-1.5 sm:p-3 transition-colors",
                isToday ? "bg-primary/5 ring-1 ring-primary" : "hover:bg-muted",
              )}
            >
              <span className="text-[9px] sm:text-xs font-medium uppercase text-muted-foreground">
                {format(day, "EEE", { locale: ptBR }).slice(0, 3)}
              </span>
              <span
                className={cn(
                  "text-xs sm:text-sm font-bold",
                  isToday ? "text-primary" : "text-foreground",
                )}
              >
                {format(day, "d")}
              </span>

              {/* Capacity bar */}
              <div className="relative h-8 sm:h-16 w-2 sm:w-4 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(count / 5) * 100}%` }}
                  transition={{ delay: index * 0.05 + 0.2, duration: 0.4 }}
                  className={cn(
                    "absolute bottom-0 left-0 right-0 rounded-full",
                    getBarColor(),
                  )}
                />
              </div>

              <div className="flex items-center gap-0.5 text-[9px] sm:text-xs text-muted-foreground">
                <PawPrint className="h-2 w-2 sm:h-3 sm:w-3" />
                <span>{count}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
