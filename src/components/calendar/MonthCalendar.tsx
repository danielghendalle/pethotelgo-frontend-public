import { useState } from "react";
import { motion } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, PawPrint } from "lucide-react";
import { useHotel } from "@/contexts/useHotelHook";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DayDetailsModalSimple } from "./DayDetailsModalSimple";

export function MonthCalendar() {
  const {
    selectedDate,
    setSelectedDate,
    getPetsCountForDate,
    getReservationsForDate,
    isDateFull,
  } = useHotel();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });

  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedDate(
      direction === "prev"
        ? subMonths(selectedDate, 1)
        : addMonths(selectedDate, 1),
    );
  };

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const getReservationsForDay = (date: Date) => {
    return getReservationsForDate(date);
  };

  const getReservationIndicators = (date: Date) => {
    const reservations = getReservationsForDay(date);
    if (reservations.length === 0) return null;

    return (
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
        {reservations.slice(0, 3).map((_, index) => (
          <div
            key={index}
            className="h-1 w-1 rounded-full bg-primary"
            style={{ opacity: 0.6 + index * 0.2 }}
          />
        ))}
        {reservations.length > 3 && (
          <div className="h-1 w-1 rounded-full bg-muted" />
        )}
      </div>
    );
  };

  const getCapacityColor = (date: Date) => {
    const count = getPetsCountForDate(date);
    const occupancyPercentage = (count / 5) * 100;

    if (occupancyPercentage === 100)
      return "bg-red-600/10 border-red-600 text-red-600";
    if (occupancyPercentage >= 70)
      return "bg-orange-500/10 border-orange-500 text-orange-600";
    if (occupancyPercentage >= 40)
      return "bg-yellow-500/10 border-yellow-500 text-yellow-600";
    if (occupancyPercentage > 0)
      return "bg-success/10 border-success text-success";
    return "";
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedDay(date);
    setShowDetailsModal(true);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-6 shadow-card">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
        <h2 className="font-display text-base sm:text-xl font-semibold capitalize text-foreground truncate">
          {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <div className="flex gap-1 sm:gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 sm:h-10 sm:w-10"
            onClick={() => navigateMonth("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 sm:h-10 sm:w-10"
            onClick={() => navigateMonth("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week days header */}
      <div className="mb-1 sm:mb-2 grid grid-cols-7 gap-0.5 sm:gap-1">
        {weekDays.map((weekDay) => (
          <div
            key={weekDay}
            className="py-1 sm:py-2 text-center text-[10px] sm:text-xs font-medium text-muted-foreground"
          >
            {weekDay}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {days.map((dateItem, i) => {
          const isCurrentMonth = isSameMonth(dateItem, selectedDate);
          const isToday = isSameDay(dateItem, new Date());
          const isSelected = isSameDay(dateItem, selectedDate);
          const petCount = getPetsCountForDate(dateItem);
          const isFull = isDateFull(dateItem);

          return (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDayClick(dateItem)}
              className={cn(
                "relative flex h-12 sm:h-20 flex-col items-center justify-start rounded-md sm:rounded-lg border p-1 sm:p-2 transition-all",
                isCurrentMonth
                  ? "border-border"
                  : "border-transparent opacity-40",
                isSelected &&
                  "ring-2 ring-primary ring-offset-1 sm:ring-offset-2",
                isToday && !isSelected && "border-primary",
                getCapacityColor(dateItem),
              )}
            >
              <span
                className={cn(
                  "text-xs sm:text-sm font-medium",
                  isToday &&
                    "flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-primary text-primary-foreground",
                )}
              >
                {format(dateItem, "d")}
              </span>

              {petCount > 0 && isCurrentMonth && (
                <div className="mt-0.5 sm:mt-1 flex items-center gap-0.5 sm:gap-1">
                  <PawPrint className="h-2 w-2 sm:h-3 sm:w-3" />
                  <span className="text-[10px] sm:text-xs font-semibold">
                    {petCount}
                  </span>
                </div>
              )}

              {/* Reservation Indicators */}
              {isCurrentMonth && getReservationIndicators(dateItem)}

              {isFull && isCurrentMonth && (
                <span className="absolute bottom-0.5 sm:bottom-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">
                  Lotado
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4 border-t border-border pt-3 sm:pt-4 text-[10px] sm:text-xs">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="h-2 w-2 sm:h-3 sm:w-3 rounded border border-success/30 bg-success/10" />
          <span className="text-muted-foreground">Disponível</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="h-2 w-2 sm:h-3 sm:w-3 rounded border border-secondary-foreground/20 bg-secondary" />
          <span className="text-muted-foreground">Parcial</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="h-2 w-2 sm:h-3 sm:w-3 rounded border border-warning bg-warning/10" />
          <span className="text-muted-foreground">Quase Lotado</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="h-2 w-2 sm:h-3 sm:w-3 rounded border border-busy bg-busy/10" />
          <span className="text-muted-foreground">Lotado</span>
        </div>
      </div>

      {/* Day Details Modal */}
      {showDetailsModal && selectedDay && (
        <DayDetailsModalSimple
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          date={selectedDay}
        />
      )}
    </div>
  );
}
