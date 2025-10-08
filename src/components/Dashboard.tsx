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
    const parts = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).split(' ');
    return `${parts[0].toUpperCase()} ${parts[1].toUpperCase()} ${parts[2]}`;
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return { value: '<1', unit: 'MIN' };
    if (diffMins < 60) return { value: diffMins, unit: diffMins === 1 ? 'MIN' : 'MINS' };

    const diffHours = Math.floor(diffMins / 60);
    return { value: diffHours, unit: diffHours === 1 ? 'HR' : 'HRS' };
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'asap':
        return {
          accentBar: 'bg-gradient-to-b from-red-500 via-red-600 to-red-700',
          badge: 'bg-red-600',
          badgeGlow: 'shadow-[0_0_30px_rgba(220,38,38,0.6)]',
          icon: '🔥',
          label: 'ASAP',
          animation: 'animate-pulse',
        };
      case 'urgent':
        return {
          accentBar: 'bg-gradient-to-b from-orange-500 via-orange-600 to-amber-600',
          badge: 'bg-orange-600',
          badgeGlow: 'shadow-[0_0_25px_rgba(234,88,12,0.5)]',
          icon: '⚡',
          label: 'URGENT',
          animation: '',
        };
      default:
        return {
          accentBar: 'bg-gradient-to-b from-blue-500 via-blue-600 to-cyan-600',
          badge: 'bg-blue-600',
          badgeGlow: 'shadow-[0_0_20px_rgba(37,99,235,0.4)]',
          icon: '✓',
          label: 'STANDARD',
          animation: '',
        };
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-12">
        <div className="bg-red-950 border-4 border-red-600 p-20 rounded-3xl shadow-2xl max-w-4xl text-center">
          <div className="text-[10rem] mb-8">⚠️</div>
          <h1 className="text-7xl font-black text-red-500 mb-8 uppercase tracking-wider">SYSTEM ERROR</h1>
          <p className="text-4xl text-red-300 mb-12">Database connection failed</p>
          <button
            onClick={() => refetch()}
            className="px-16 py-8 bg-red-600 text-white text-4xl font-black rounded-2xl hover:bg-red-700 transition-all shadow-2xl uppercase tracking-wider"
          >
            RETRY NOW
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* COMMAND CENTER HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-8 border-cyan-500 shadow-2xl">
        <div className="max-w-[2000px] mx-auto px-16 py-10">
          <div className="grid grid-cols-12 gap-12 items-center">
            {/* Logo */}
            <div className="col-span-2">
              <div className="bg-white p-6 rounded-3xl shadow-2xl">
                <img
                  src="https://gogreenplumb.com/wp-content/uploads/2025/07/Go-Green-Logo.svg"
                  alt="Go Green"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Title */}
            <div className="col-span-4">
              <div className="text-6xl font-black text-white uppercase tracking-tight leading-none mb-3">
                DELIVERY QUEUE
              </div>
              <div className="text-3xl font-bold text-cyan-400 uppercase tracking-wider">
                {formatDate(currentTime)}
              </div>
            </div>

            {/* Time Display */}
            <div className="col-span-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border-4 border-slate-700 shadow-2xl">
              <div className="text-xl font-black text-gray-400 uppercase tracking-widest mb-2 text-center">CURRENT TIME</div>
              <div className="text-7xl font-black text-white tabular-nums text-center tracking-tight">
                {formatTime(currentTime)}
              </div>
            </div>

            {/* Pending Counter */}
            <div className="col-span-3 bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-8 border-4 border-green-400 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative">
                <div className="text-xl font-black text-green-100 uppercase tracking-widest mb-2 text-center">PENDING</div>
                <div className="text-8xl font-black text-white tabular-nums text-center">
                  {isLoading ? '—' : requests?.length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-[2000px] mx-auto px-16 py-16">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center" style={{ height: 'calc(100vh - 300px)' }}>
            <div className="text-[12rem] mb-12 animate-bounce">📦</div>
            <div className="text-7xl font-black text-white uppercase tracking-wider animate-pulse">LOADING...</div>
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="space-y-10">
            {requests.map((request, index) => {
              const priorityConfig = getPriorityConfig(request.priority);
              const timeAgo = getTimeAgo(request.created_at);

              return (
                <div
                  key={request.id}
                  className="bg-slate-800 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.01]"
                >
                  <div className="flex">
                    {/* LEFT ACCENT BAR */}
                    <div className={`w-6 ${priorityConfig.accentBar} ${priorityConfig.animation} flex-shrink-0`}></div>

                    {/* MAIN CONTENT */}
                    <div className="flex-1 p-12">
                      <div className="grid grid-cols-12 gap-10">
                        {/* LEFT SECTION - Queue + Tech + Job */}
                        <div className="col-span-5 space-y-8">
                          {/* Queue Number */}
                          <div className="flex items-center gap-8">
                            <div className="w-36 h-36 bg-gradient-to-br from-gray-700 to-gray-900 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-gray-600">
                              <div className="text-8xl font-black text-white">{index + 1}</div>
                            </div>
                            <div className={`px-10 py-6 ${priorityConfig.badge} rounded-2xl ${priorityConfig.badgeGlow} ${priorityConfig.animation} flex items-center gap-5`}>
                              <span className="text-7xl">{priorityConfig.icon}</span>
                              <span className="text-5xl font-black text-white uppercase tracking-wider">{priorityConfig.label}</span>
                            </div>
                          </div>

                          {/* Technician */}
                          <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-8 border-2 border-slate-600">
                            <div className="text-lg font-black text-cyan-400 uppercase tracking-widest mb-4">👤 TECHNICIAN</div>
                            <div className="text-6xl font-black text-white leading-tight">{request.tech_name}</div>
                          </div>

                          {/* Job */}
                          <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-8 border-2 border-slate-600">
                            <div className="text-lg font-black text-cyan-400 uppercase tracking-widest mb-4">🔧 JOB SITE</div>
                            <div className="text-4xl font-bold text-white">{request.job_name}</div>
                          </div>
                        </div>

                        {/* MIDDLE SECTION - Address + Drive Time */}
                        <div className="col-span-4 space-y-8">
                          {/* Address */}
                          {request.delivery_address && (
                            <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-2xl p-8 border-4 border-indigo-600 h-full flex flex-col justify-center">
                              <div className="flex items-start gap-6">
                                <span className="text-7xl">📍</span>
                                <div className="flex-1">
                                  <div className="text-lg font-black text-indigo-300 uppercase tracking-widest mb-4">DELIVERY ADDRESS</div>
                                  <div className="text-3xl font-bold text-white leading-snug">
                                    {request.delivery_address}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Drive Time */}
                          {request.delivery_latitude && request.delivery_longitude && (
                            <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-2xl p-8 border-4 border-blue-500">
                              <div className="text-lg font-black text-blue-300 uppercase tracking-widest mb-5">🚗 DRIVE TIME</div>
                              <DriveTimeDisplay
                                latitude={request.delivery_latitude}
                                longitude={request.delivery_longitude}
                              />
                            </div>
                          )}
                        </div>

                        {/* RIGHT SECTION - Stats */}
                        <div className="col-span-3 space-y-6">
                          {/* Time Counter */}
                          <div className="bg-gradient-to-br from-yellow-900 to-orange-950 rounded-2xl p-8 border-4 border-yellow-600 text-center">
                            <div className="text-lg font-black text-yellow-400 uppercase tracking-widest mb-4">⏱️ AGE</div>
                            <div className="text-8xl font-black text-white tabular-nums leading-none mb-2">
                              {timeAgo.value}
                            </div>
                            <div className="text-3xl font-black text-yellow-400 uppercase tracking-wider">
                              {timeAgo.unit}
                            </div>
                          </div>

                          {/* Request ID */}
                          <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-6 border-2 border-slate-600">
                            <div className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-3">ID</div>
                            <div className="font-mono font-black text-2xl text-white break-all">
                              {request.request_id}
                            </div>
                          </div>

                          {/* Truck */}
                          {request.truck_number && (
                            <div className="bg-gradient-to-br from-green-900 to-green-950 rounded-2xl p-6 border-2 border-green-600 text-center">
                              <div className="text-sm font-black text-green-400 uppercase tracking-widest mb-3">TRUCK</div>
                              <div className="text-5xl font-black text-white">
                                {request.truck_number}
                              </div>
                            </div>
                          )}

                          {/* Items */}
                          <div className="bg-gradient-to-br from-purple-900 to-purple-950 rounded-2xl p-6 border-2 border-purple-600 text-center">
                            <div className="text-sm font-black text-purple-400 uppercase tracking-widest mb-3">ITEMS</div>
                            <div className="text-5xl font-black text-white">
                              {request.items?.length || 0}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes (if present) */}
                      {request.notes && (
                        <div className="mt-8 bg-gradient-to-br from-amber-900 to-amber-950 rounded-2xl p-8 border-2 border-amber-600">
                          <div className="flex items-start gap-5">
                            <span className="text-5xl">💬</span>
                            <div className="flex-1">
                              <div className="text-lg font-black text-amber-400 uppercase tracking-widest mb-3">NOTES</div>
                              <div className="text-2xl font-bold text-white">{request.notes}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-green-900 to-green-950 rounded-3xl border-8 border-green-600 shadow-2xl" style={{ height: 'calc(100vh - 300px)' }}>
            <div className="text-[15rem] mb-12 animate-bounce">✅</div>
            <div className="text-9xl font-black text-white mb-8 uppercase tracking-wider">ALL CLEAR</div>
            <div className="text-5xl font-bold text-green-400 uppercase tracking-wider">NO PENDING REQUESTS</div>
          </div>
        )}
      </div>

      {/* LIVE INDICATOR */}
      <div className="fixed bottom-12 right-12 bg-slate-800 border-4 border-green-500 px-10 py-6 rounded-full shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-6 h-6 bg-green-500 rounded-full animate-ping absolute"></div>
            <div className="w-6 h-6 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-3xl font-black text-white uppercase tracking-widest">LIVE</span>
        </div>
      </div>
    </div>
  );
}
