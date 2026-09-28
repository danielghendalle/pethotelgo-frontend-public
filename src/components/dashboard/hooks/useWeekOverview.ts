interface WeekOverviewData {
  weekStart: Date;
  weekEnd: Date;
  reservations: any[];
}

interface UseWeekOverviewProps {
  weekOverview: WeekOverviewData;
}

export function useWeekOverview({ weekOverview }: UseWeekOverviewProps) {
  const getWeekDays = () => {
    const days = [];
    const current = new Date(weekOverview.weekStart);
    
    for (let i = 0; i < 7; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getReservationsForDay = (day: Date) => {
    return weekOverview.reservations.filter(reservation => {
      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);
      const current = new Date(day);
      current.setHours(0, 0, 0, 0);
      
      return checkIn <= current && current < checkOut;
    });
  };

  const getOccupancyRate = (day: Date) => {
    const dayReservations = getReservationsForDay(day);
    const maxCapacity = 20; // Assumindo capacidade máxima de 20 pets
    return (dayReservations.length / maxCapacity) * 100;
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return 'bg-red-500';
    if (rate >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatDay = (day: Date) => {
    return day.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric'
    });
  };

  const getWeekStats = () => {
    const totalReservations = weekOverview.reservations.length;
    const totalRevenue = weekOverview.reservations.reduce((sum, res) => sum + (res.dailyRate || 0), 0);
    const averageOccupancy = getWeekDays().reduce((sum, day) => sum + getOccupancyRate(day), 0) / 7;
    
    return {
      totalReservations,
      totalRevenue,
      averageOccupancy: Math.round(averageOccupancy)
    };
  };

  return {
    getWeekDays,
    getReservationsForDay,
    getOccupancyRate,
    getOccupancyColor,
    formatDay,
    getWeekStats,
    weekOverview
  };
}
