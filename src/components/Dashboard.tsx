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
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatRequestTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'JUST NOW';
    if (diffMins === 1) return '1 MIN AGO';
    if (diffMins < 60) return `${diffMins} MINS AGO`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 HOUR AGO';
    return `${diffHours} HOURS AGO`;
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'asap':
        return {
          bg: 'from-red-600 via-red-500 to-rose-600',
          accent: 'bg-red-600',
          text: 'text-red-600',
          border: 'border-red-500',
          glow: 'shadow-[0_0_40px_rgba(220,38,38,0.4)]',
          animation: 'animate-pulse',
          icon: '🔥',
          label: 'URGENT',
        };
      case 'urgent':
        return {
          bg: 'from-orange-600 via-orange-500 to-amber-600',
          accent: 'bg-orange-600',
          text: 'text-orange-600',
          border: 'border-orange-500',
          glow: 'shadow-[0_0_30px_rgba(234,88,12,0.4)]',
          animation: '',
          icon: '⚡',
          label: 'PRIORITY',
        };
      default:
        return {
          bg: 'from-blue-600 via-blue-500 to-cyan-600',
          accent: 'bg-blue-600',
          text: 'text-blue-600',
          border: 'border-blue-500',
          glow: 'shadow-[0_0_20px_rgba(37,99,235,0.3)]',
          animation: '',
          icon: '📋',
          label: 'STANDARD',
        };
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-gray-900 flex items-center justify-center p-12">
        <div className="bg-white/95 backdrop-blur-xl border-4 border-red-600 p-16 rounded-3xl shadow-2xl max-w-3xl">
          <div className="text-9xl mb-8 text-center">⚠️</div>
          <h1 className="text-6xl font-black text-red-600 mb-6 text-center">CONNECTION ERROR</h1>
          <p className="text-3xl text-gray-700 text-center mb-10">Unable to reach database</p>
          <button
            onClick={() => refetch()}
            className="w-full px-10 py-6 bg-gradient-to-r from-red-600 to-red-700 text-white text-3xl font-black rounded-2xl hover:from-red-700 hover:to-red-800 transition-all shadow-xl"
          >
            🔄 RETRY CONNECTION
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
      {/* Bold Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-4 border-cyan-500 shadow-2xl">
        <div className="max-w-[1800px] mx-auto px-12 py-8">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Title */}
            <div className="flex items-center gap-8">
              <div className="bg-white p-4 rounded-2xl shadow-xl">
                <img
                  src="https://gogreenplumb.com/wp-content/uploads/2025/07/Go-Green-Logo.svg"
                  alt="Go Green"
                  className="h-16 w-auto"
                />
              </div>
              <div>
                <h1 className="text-5xl font-black text-white tracking-tight mb-2">
                  DELIVERY REQUEST QUEUE
                </h1>
                <div className="text-2xl font-bold text-cyan-400">TODAY • {formatDate(currentTime).toUpperCase()}</div>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="flex items-center gap-8">
              <div className="text-right">
                <div className="text-xl text-gray-400 font-bold mb-1">CURRENT TIME</div>
                <div className="text-6xl font-black text-white tabular-nums tracking-tight">{formatTime(currentTime)}</div>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-700 px-8 py-6 rounded-2xl shadow-2xl border-2 border-green-400">
                <div className="text-sm font-black text-green-100 uppercase tracking-wider mb-1">PENDING</div>
                <div className="text-7xl font-black text-white tabular-nums">
                  {isLoading ? '—' : requests?.length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-12 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="text-9xl mb-10 animate-bounce">📦</div>
            <div className="text-6xl font-black text-white animate-pulse">LOADING REQUESTS...</div>
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="space-y-8">
            {requests.map((request, index) => {
              const priorityConfig = getPriorityConfig(request.priority);
              return (
                <div
                  key={request.id}
                  className={`bg-slate-800/90 backdrop-blur-xl border-4 ${priorityConfig.border} rounded-3xl ${priorityConfig.glow} hover:scale-[1.01] transition-all duration-300 overflow-hidden`}
                >
                  {/* Top Stripe */}
                  <div className={`h-3 bg-gradient-to-r ${priorityConfig.bg} ${priorityConfig.animation}`}></div>

                  <div className="p-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-10 pb-8 border-b-2 border-slate-700">
                      <div className="flex items-center gap-8">
                        {/* Queue Number */}
                        <div className={`w-32 h-32 bg-gradient-to-br ${priorityConfig.bg} rounded-3xl flex items-center justify-center shadow-2xl ${priorityConfig.animation}`}>
                          <div className="text-7xl font-black text-white drop-shadow-2xl">
                            {index + 1}
                          </div>
                        </div>

                        {/* Tech Info */}
                        <div>
                          <div className="text-lg font-black text-cyan-400 uppercase tracking-widest mb-2">TECHNICIAN</div>
                          <div className="text-6xl font-black text-white leading-none mb-3">{request.tech_name}</div>
                          <div className="text-2xl font-bold text-gray-400 uppercase tracking-wider">JOB: {request.job_name}</div>
                        </div>
                      </div>

                      {/* Priority Badge */}
                      <div className={`px-10 py-6 rounded-2xl bg-gradient-to-r ${priorityConfig.bg} shadow-2xl ${priorityConfig.animation}`}>
                        <div className="text-5xl font-black text-white text-center mb-2 flex items-center gap-4">
                          <span className="text-6xl">{priorityConfig.icon}</span>
                          {priorityConfig.label}
                        </div>
                      </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-2 gap-10">
                      {/* Left Column - Location */}
                      <div className="space-y-8">
                        {/* Address */}
                        {request.delivery_address && (
                          <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-8 border-2 border-slate-600">
                            <div className="flex items-start gap-5 mb-4">
                              <span className="text-6xl">📍</span>
                              <div className="flex-1">
                                <div className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-3">DELIVERY ADDRESS</div>
                                <div className="text-3xl font-bold text-white leading-snug">
                                  {request.delivery_address}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Drive Time */}
                        {request.delivery_latitude && request.delivery_longitude && (
                          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 rounded-2xl p-8 border-2 border-blue-600">
                            <div className="text-sm font-black text-blue-300 uppercase tracking-widest mb-4">DRIVE TIME FROM WAREHOUSE</div>
                            <DriveTimeDisplay
                              latitude={request.delivery_latitude}
                              longitude={request.delivery_longitude}
                            />
                          </div>
                        )}
                      </div>

                      {/* Right Column - Details */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* Request ID */}
                        <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-6 border-2 border-slate-600">
                          <div className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-3">REQUEST ID</div>
                          <div className="font-mono font-black text-3xl text-white">
                            {request.request_id}
                          </div>
                        </div>

                        {/* Time */}
                        <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 rounded-2xl p-6 border-2 border-yellow-600">
                          <div className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-3">TIME REQUESTED</div>
                          <div className="font-black text-3xl text-white mb-2">
                            {formatRequestTime(request.created_at)}
                          </div>
                          <div className="text-xl font-black text-yellow-400">
                            {getTimeAgo(request.created_at)}
                          </div>
                        </div>

                        {/* Truck */}
                        {request.truck_number && (
                          <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-2xl p-6 border-2 border-green-600">
                            <div className="text-xs font-black text-green-400 uppercase tracking-widest mb-3">TRUCK</div>
                            <div className="font-black text-4xl text-white flex items-center gap-3">
                              🚛 {request.truck_number}
                            </div>
                          </div>
                        )}

                        {/* Items */}
                        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-2xl p-6 border-2 border-purple-600">
                          <div className="text-xs font-black text-purple-400 uppercase tracking-widest mb-3">ITEMS</div>
                          <div className="font-black text-4xl text-white flex items-center gap-3">
                            📦 {request.items?.length || 0}
                          </div>
                        </div>

                        {/* Notes */}
                        {request.notes && (
                          <div className="col-span-2 bg-gradient-to-br from-amber-900/50 to-amber-800/50 rounded-2xl p-6 border-2 border-amber-600">
                            <div className="text-xs font-black text-amber-400 uppercase tracking-widest mb-3">NOTES</div>
                            <div className="text-xl font-bold text-white">
                              💬 {request.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-3xl border-4 border-green-600">
            <div className="text-[12rem] mb-12 animate-bounce">✅</div>
            <div className="text-8xl font-black text-white mb-6">ALL CLEAR!</div>
            <div className="text-5xl font-bold text-gray-400">NO PENDING DELIVERY REQUESTS</div>
          </div>
        )}
      </div>

      {/* Live Indicator */}
      <div className="fixed bottom-10 right-10 bg-slate-800/90 backdrop-blur-xl border-2 border-green-500 px-8 py-5 rounded-full shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-5 h-5 bg-green-500 rounded-full animate-ping absolute"></div>
            <div className="w-5 h-5 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-2xl font-black text-white uppercase tracking-wider">LIVE • AUTO-UPDATE 5s</span>
        </div>
      </div>
    </div>
  );
}
