import { Button } from '@/components/ui/button';
import { DashboardStats } from './DashboardStats';
import { UpcomingReservations } from './UpcomingReservations';
import { WeekOverview } from './WeekOverview';
import { useDashboard } from './hooks/useDashboard';

interface DashboardProps {
  onShowReservationForm?: () => void;
  onShowPetForm?: () => void;
  onShowOwnerForm?: () => void;
}

export function Dashboard({ 
  onShowReservationForm, 
  onShowPetForm, 
  onShowOwnerForm 
}: DashboardProps) {
  const {
    user,
    isAuthenticated,
    loginForm,
    setLoginForm,
    loading,
    handleLogin,
    handleLogout,
    handleCreateOwner,
    handleCreatePet,
    getDashboardStats,
    getUpcomingReservations,
    getWeekOverview
  } = useDashboard({ 
    onShowReservationForm, 
    onShowPetForm, 
    onShowOwnerForm 
  });

  const stats = getDashboardStats();
  const upcomingReservations = getUpcomingReservations();
  const weekOverview = getWeekOverview();

  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Pet Hotel Login
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Pet Hotel Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={onShowReservationForm}
              className="bg-blue-600 hover:bg-blue-700"
            >
              New Reservation
            </Button>
            <Button
              onClick={onShowPetForm}
              className="bg-green-600 hover:bg-green-700"
            >
              Add Pet
            </Button>
            <Button
              onClick={onShowOwnerForm}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Add Owner
            </Button>
          </div>
        </div>

        <DashboardStats stats={stats} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <UpcomingReservations reservations={upcomingReservations} />
          <WeekOverview weekOverview={weekOverview} />
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Test Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={handleCreateOwner} variant="outline">
              Create Test Owner
            </Button>
            <Button onClick={handleCreatePet} variant="outline">
              Create Test Pet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
