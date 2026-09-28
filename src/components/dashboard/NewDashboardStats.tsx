import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardStats } from './hooks/useDashboardStats';

interface DashboardStatsProps {
  stats: {
    totalOwners: number;
    totalPets: number;
    activeReservations: number;
    pendingReservations: number;
    totalStays: number;
  };
  loading: boolean;
}

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
  const { getStatColor, getStatBgColor, formatPercentage } = useDashboardStats({ stats, loading });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Owners',
      value: stats.totalOwners,
      icon: '👥',
      color: getStatColor(stats.totalOwners, 10),
      bgColor: getStatBgColor(stats.totalOwners, 10),
    },
    {
      title: 'Total Pets',
      value: stats.totalPets,
      icon: '🐕',
      color: getStatColor(stats.totalPets, 20),
      bgColor: getStatBgColor(stats.totalPets, 20),
    },
    {
      title: 'Active Reservations',
      value: stats.activeReservations,
      icon: '📅',
      color: getStatColor(stats.activeReservations, 5),
      bgColor: getStatBgColor(stats.activeReservations, 5),
    },
    {
      title: 'Pending Reservations',
      value: stats.pendingReservations,
      icon: '⏳',
      color: getStatColor(stats.pendingReservations, 3),
      bgColor: getStatBgColor(stats.pendingReservations, 3),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <Card key={index} className={card.bgColor}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">{card.icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Card className="bg-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">📊</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stays</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalStays}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
