import { useEffect, useState } from 'react';
import { useDeliveryRequests } from '../hooks/useDeliveryRequests';
import DriveTimeDisplay from './DriveTimeDisplay';

export default function Dashboard() {
  const { data: requests, isLoading, error, refetch } = useDeliveryRequests();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return '<1 min';
    if (diffMins < 60) return `${diffMins} min`;

    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    if (diffHours < 24) {
      return remainingMins > 0 ? `${diffHours}h ${remainingMins}m` : `${diffHours}h`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'asap':
        return {
          bg: 'bg-gradient-to-br from-red-600 to-red-700',
          text: 'text-white',
          label: 'ASAP',
          badgeBg: 'bg-red-800',
          pulse: true,
        };
      case 'urgent':
        return {
          bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
          text: 'text-white',
          label: 'URGENT',
          badgeBg: 'bg-orange-700',
          pulse: false,
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-blue-600 to-blue-700',
          text: 'text-white',
          label: 'NORMAL',
          badgeBg: 'bg-blue-800',
          pulse: false,
        };
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
        <div className="bg-red-600 rounded-xl shadow-2xl p-16 max-w-2xl text-center">
          <h2 className="text-5xl font-black text-white mb-4">CONNECTION ERROR</h2>
          <p className="text-2xl text-red-100 mb-8">Unable to load delivery requests</p>
          <button
            onClick={() => refetch()}
            className="px-12 py-5 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors font-bold text-2xl"
          >
            Retry Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Command Center Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-b-4 border-emerald-500 shadow-xl">
        <div className="max-w-[1900px] mx-auto px-10 py-6">
          <div className="flex items-center justify-between">
            {/* Left: Logo & Title */}
            <div className="flex items-center gap-8">
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <img
                  src="https://gogreenplumb.com/wp-content/uploads/2025/07/Go-Green-Logo.svg"
                  alt="Go Green"
                  className="h-14 w-auto"
                />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">DELIVERY REQUESTS</h1>
                <p className="text-lg text-emerald-400 font-semibold">{formatDate(currentTime)}</p>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="flex items-center gap-8">
              <div className="text-right">
                <div className="text-sm text-slate-400 font-bold uppercase tracking-wide">Current Time</div>
                <div className="text-4xl font-black text-white tabular-nums">{formatTime(currentTime)}</div>
              </div>

              <div className="w-px h-16 bg-slate-600"></div>

              <div className="bg-emerald-600 rounded-xl px-8 py-4 shadow-lg">
                <div className="text-sm text-emerald-100 font-bold uppercase tracking-wide mb-1">Pending</div>
                <div className="text-5xl font-black text-white tabular-nums">
                  {isLoading ? '—' : requests?.length || 0}
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-800 rounded-full px-5 py-3 border-2 border-emerald-500">
                <div className="relative">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-sm font-bold text-white uppercase tracking-wide">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1900px] mx-auto px-10 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center" style={{ height: 'calc(100vh - 180px)' }}>
            <div className="w-20 h-20 border-8 border-slate-700 border-t-emerald-500 rounded-full animate-spin mb-8"></div>
            <p className="text-3xl text-slate-400 font-bold">Loading requests...</p>
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="space-y-6">
            {requests.map((request, index) => {
              const priority = getPriorityConfig(request.priority);
              const timeAgo = getTimeAgo(request.created_at);

              return (
                <div
                  key={request.id}
                  className={`${priority.bg} rounded-2xl shadow-xl ${priority.pulse ? 'animate-pulse' : ''}`}
                >
                  <div className="p-8">
                    <div className="grid grid-cols-12 gap-8">
                      {/* Position Badge */}
                      <div className="col-span-1 flex items-center justify-center">
                        <div className="w-24 h-24 bg-black/30 rounded-2xl flex items-center justify-center">
                          <span className="text-6xl font-black text-white">{index + 1}</span>
                        </div>
                      </div>

                      {/* Main Info */}
                      <div className="col-span-5 space-y-4">
                        <div className={`inline-block ${priority.badgeBg} px-5 py-2 rounded-lg`}>
                          <span className="text-xl font-black text-white uppercase tracking-wider">{priority.label}</span>
                        </div>

                        <div>
                          <div className="text-sm font-bold text-white/80 uppercase tracking-wider mb-2">Technician</div>
                          <div className="text-4xl font-black text-white">{request.tech_name}</div>
                        </div>

                        <div>
                          <div className="text-sm font-bold text-white/80 uppercase tracking-wider mb-2">Job Site</div>
                          <div className="text-2xl font-bold text-white/95">{request.job_name}</div>
                        </div>

                        {request.notes && (
                          <div className="bg-black/20 rounded-xl p-4 mt-4">
                            <div className="text-sm font-bold text-white/80 uppercase tracking-wider mb-2">Notes</div>
                            <div className="text-lg font-semibold text-white/95">{request.notes}</div>
                          </div>
                        )}
                      </div>

                      {/* Address & Drive Time */}
                      <div className="col-span-4 space-y-4">
                        {request.delivery_address && (
                          <div className="bg-black/20 rounded-xl p-5">
                            <div className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3">Delivery Address</div>
                            <div className="text-xl font-bold text-white leading-relaxed">{request.delivery_address}</div>
                          </div>
                        )}

                        {request.delivery_latitude && request.delivery_longitude && (
                          <div className="bg-black/20 rounded-xl p-5">
                            <div className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3">Drive Time</div>
                            <DriveTimeDisplay
                              latitude={request.delivery_latitude}
                              longitude={request.delivery_longitude}
                            />
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="col-span-2 space-y-4">
                        <div className="bg-black/20 rounded-xl p-4 text-center">
                          <div className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Age</div>
                          <div className="text-3xl font-black text-white tabular-nums">{timeAgo}</div>
                        </div>

                        {request.truck_number && (
                          <div className="bg-black/20 rounded-xl p-4 text-center">
                            <div className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Truck</div>
                            <div className="text-3xl font-black text-white">{request.truck_number}</div>
                          </div>
                        )}

                        <div className="bg-black/20 rounded-xl p-4 text-center">
                          <div className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Items</div>
                          <div className="text-3xl font-black text-white">{request.items?.length || 0}</div>
                        </div>

                        <div className="bg-black/20 rounded-xl p-4">
                          <div className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">ID</div>
                          <div className="font-mono text-xs text-white/90 break-all">{request.request_id}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-emerald-600 rounded-2xl shadow-xl" style={{ height: 'calc(100vh - 180px)' }}>
            <div className="text-8xl font-black text-white mb-6">✓</div>
            <h2 className="text-6xl font-black text-white mb-4">ALL CLEAR</h2>
            <p className="text-3xl font-bold text-emerald-100">No pending delivery requests</p>
          </div>
        )}
      </div>
    </div>
  );
}
