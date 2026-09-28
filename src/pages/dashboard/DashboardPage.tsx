import { TrendingUp, Users, Calendar, PawPrint, Clock } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardStats } from "@/components/dashboard/NewDashboardStats";
import { WeekOverview } from "@/components/dashboard/WeekOverview";
import { UpcomingReservations } from "@/components/dashboard/UpcomingReservations";
import { ReservationForm } from "@/components/forms/reservation/ReservationForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardPage } from "./useDashboardPage";
import { parseBrazilianDate } from "@/utils/dateUtils";

const iconMap = {
  paw: <PawPrint className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
  clock: <Clock className="h-5 w-5" />,
  calendar: <Calendar className="h-5 w-5" />,
  trending: <TrendingUp className="h-5 w-5" />,
};

export function DashboardPage() {
  const {
    stats,
    todayReservations,
    pendingReservations,
    showForm,
    pets,
    owners,
    getOccupancyPercentage,
    getOccupancyColor,
    getUpcomingCheckIns,
    getActiveStays,
    getMonthlyRevenue,
    handleCloseForm,
  } = useDashboardPage();

  return (
    <MainLayout title="Dashboard" subtitle="Bem-vindo ao seu hotel pet">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className={`text-lg sm:text-2xl font-bold ${stat.color}`}>
                    {stat.isCurrency
                      ? new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(stat.value)
                      : stat.value}
                  </p>
                </div>
                <div
                  className={`h-10 w-10 sm:h-12 sm:w-12 ${stat.bgContainer} rounded-full flex items-center justify-center flex-shrink-0 ${stat.color}`}
                >
                  {iconMap[stat.iconName as keyof typeof iconMap]}
                </div>
              </div>
              {stat.max && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Ocupação</span>
                    <span>
                      {getOccupancyPercentage(stat.value, stat.max).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${stat.progressColor}`}
                      style={{
                        width: `${getOccupancyPercentage(stat.value, stat.max)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Week Overview */}
        <div className="lg:col-span-2">
          <WeekOverview />
        </div>

        {/* Upcoming Check-ins */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getUpcomingCheckIns().length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum check-in próximo
                  </p>
                ) : (
                  getUpcomingCheckIns().map((reservation) => {
                    // Parse da data usando a função que já existe no projeto
                    const checkInDate = parseBrazilianDate(reservation.checkIn);

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    // Normalizar a data de check-in
                    const checkInNormalized = new Date(
                      checkInDate.getFullYear(),
                      checkInDate.getMonth(),
                      checkInDate.getDate(),
                      0,
                      0,
                      0,
                      0,
                    );

                    const daysUntilCheckIn = Math.round(
                      (checkInNormalized.getTime() - today.getTime()) /
                        (1000 * 60 * 60 * 24),
                    );

                    return (
                      <div
                        key={reservation.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {reservation.pet?.name || "Pet"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {reservation.owner?.name || "Cliente"} •{" "}
                            {checkInDate.toLocaleDateString("pt-BR", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-primary font-medium mt-1">
                            {daysUntilCheckIn === 1
                              ? "Amanhã"
                              : daysUntilCheckIn === 0
                                ? "Hoje"
                                : `Em ${daysUntilCheckIn} dias`}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reservation Form Modal */}
      {showForm && <ReservationForm onClose={handleCloseForm} />}
    </MainLayout>
  );
}
