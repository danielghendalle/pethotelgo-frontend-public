interface DashboardStats {
  totalOwners: number;
  totalPets: number;
  activeReservations: number;
  pendingReservations: number;
  totalStays: number;
}

interface UseDashboardStatsProps {
  stats: DashboardStats;
  loading: boolean;
}

export function useDashboardStats({ stats, loading }: UseDashboardStatsProps) {
  const getStatColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'text-green-600';
    if (value >= threshold / 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatBgColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'bg-green-100';
    if (value >= threshold / 2) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  };

  return {
    getStatColor,
    getStatBgColor,
    formatPercentage,
    stats,
    loading
  };
}
