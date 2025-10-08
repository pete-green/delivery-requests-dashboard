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
      year: 'numeric',
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

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'asap':
        return {
          gradient: 'from-red-600 via-red-500 to-orange-500',
          bgGradient: 'from-red-950/40 via-red-900/30 to-orange-900/40',
          glow: 'shadow-[0_0_60px_rgba(239,68,68,0.5)]',
          border: 'border-red-500/50',
          animation: 'animate-pulse',
          icon: '🔥',
        };
      case 'urgent':
        return {
          gradient: 'from-orange-600 via-orange-500 to-yellow-500',
          bgGradient: 'from-orange-950/40 via-orange-900/30 to-yellow-900/40',
          glow: 'shadow-[0_0_40px_rgba(249,115,22,0.4)]',
          border: 'border-orange-500/50',
          animation: '',
          icon: '⚡',
        };
      default:
        return {
          gradient: 'from-blue-600 via-blue-500 to-cyan-500',
          bgGradient: 'from-blue-950/40 via-blue-900/30 to-cyan-900/40',
          glow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
          border: 'border-blue-500/50',
          animation: '',
          icon: '📋',
        };
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-gray-900 flex items-center justify-center p-8">
        <div className="bg-white/10 backdrop-blur-xl border-2 border-red-500 p-12 rounded-3xl shadow-2xl max-w-2xl">
          <div className="text-8xl mb-6 text-center">⚠️</div>
          <h1 className="text-5xl font-bold text-red-400 mb-6 text-center">Connection Error</h1>
          <p className="text-2xl text-red-200 text-center mb-8">Unable to connect to database</p>
          <button
            onClick={() => refetch()}
            className="w-full px-8 py-5 bg-gradient-to-r from-red-600 to-red-700 text-white text-2xl rounded-2xl font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-xl"
          >
            🔄 Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 text-white p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <div className="relative mb-8 bg-gradient-to-r from-slate-900/80 via-gray-900/80 to-slate-900/80 backdrop-blur-2xl border-2 border-slate-700/50 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center text-6xl shadow-xl">
              🚚
            </div>
            <div>
              <h1 className="text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 drop-shadow-2xl">
                Delivery Requests
              </h1>
              <p className="text-2xl text-slate-400 font-semibold">{formatDate(currentTime)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-7xl font-black tabular-nums bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text drop-shadow-2xl mb-2">
              {formatTime(currentTime)}
            </div>
            <div className="text-3xl font-black">
              {isLoading ? (
                <span className="text-blue-400 animate-pulse">Loading...</span>
              ) : (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                  {requests?.length || 0} Pending {requests?.length === 1 ? 'Request' : 'Requests'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-8xl mb-6 animate-bounce">📦</div>
            <div className="text-5xl font-bold text-blue-400 animate-pulse">
              Loading requests...
            </div>
          </div>
        </div>
      ) : requests && requests.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {requests.map((request, index) => {
            const priorityConfig = getPriorityConfig(request.priority);
            return (
              <div
                key={request.id}
                className={`relative bg-gradient-to-br ${priorityConfig.bgGradient} backdrop-blur-2xl border-3 ${priorityConfig.border} rounded-3xl p-8 ${priorityConfig.glow} hover:scale-[1.02] transition-all duration-300 overflow-hidden`}
              >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-3xl`}></div>

                {/* Priority stripe and badge */}
                <div className="relative">
                  <div className={`absolute -left-8 top-0 bottom-0 w-2 bg-gradient-to-b ${priorityConfig.gradient} ${priorityConfig.animation}`}></div>

                  {/* Header with order number and priority */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-28 h-28 bg-gradient-to-br ${priorityConfig.gradient} rounded-3xl flex items-center justify-center shadow-2xl ${priorityConfig.animation}`}>
                      <div className="text-6xl font-black text-white drop-shadow-2xl">
                        {index + 1}
                      </div>
                    </div>
                    <div className={`px-6 py-3 rounded-2xl font-black text-2xl bg-gradient-to-r ${priorityConfig.gradient} text-white shadow-xl ${priorityConfig.animation} flex items-center gap-2`}>
                      <span>{priorityConfig.icon}</span>
                      {request.priority.toUpperCase()}
                      <span>{priorityConfig.icon}</span>
                    </div>
                  </div>

                  {/* Tech and Job Info */}
                  <div className="mb-6">
                    <div className="text-5xl font-black text-white mb-2 drop-shadow-lg">
                      {request.tech_name}
                    </div>
                    <div className="text-3xl font-bold text-cyan-300">
                      {request.job_name}
                    </div>
                  </div>

                  {/* Address */}
                  {request.delivery_address && (
                    <div className="mb-6 bg-black/40 rounded-2xl p-6 border border-white/10">
                      <div className="flex items-start gap-4">
                        <span className="text-5xl">📍</span>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-blue-400 mb-2 tracking-wider">DELIVERY ADDRESS</div>
                          <div className="text-2xl font-bold text-white leading-relaxed">
                            {request.delivery_address}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Drive Time */}
                  {request.delivery_latitude && request.delivery_longitude && (
                    <div className="mb-6 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl p-6 border border-blue-500/30">
                      <DriveTimeDisplay
                        latitude={request.delivery_latitude}
                        longitude={request.delivery_longitude}
                      />
                    </div>
                  )}

                  {/* Bottom Info Row */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Request ID */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-4 border border-cyan-500/20">
                      <div className="text-xs font-bold text-cyan-400 mb-1 tracking-wider">REQUEST ID</div>
                      <div className="font-mono font-black text-lg text-white">
                        {request.request_id}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-2xl p-4 border border-yellow-500/20">
                      <div className="text-xs font-bold text-yellow-400 mb-1 tracking-wider">REQUESTED</div>
                      <div className="font-black text-lg text-white">
                        {formatRequestTime(request.created_at)}
                      </div>
                      <div className="text-sm font-bold text-yellow-300 mt-1">
                        {getTimeAgo(request.created_at)}
                      </div>
                    </div>

                    {/* Truck */}
                    {request.truck_number && (
                      <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-2xl p-4 border border-green-500/20">
                        <div className="text-xs font-bold text-green-400 mb-1 tracking-wider">TRUCK</div>
                        <div className="font-black text-2xl text-green-300 flex items-center gap-2">
                          🚛 {request.truck_number}
                        </div>
                      </div>
                    )}

                    {/* Items count if no truck */}
                    {!request.truck_number && (
                      <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-4 border border-purple-500/20">
                        <div className="text-xs font-bold text-purple-400 mb-1 tracking-wider">ITEMS</div>
                        <div className="font-black text-2xl text-purple-300 flex items-center gap-2">
                          📦 {request.items?.length || 0}
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
        <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-green-600/10 to-emerald-600/10 backdrop-blur-xl rounded-3xl border-2 border-green-500/30">
          <div className="text-9xl mb-8 animate-bounce">✅</div>
          <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-4">
            All Clear!
          </div>
          <div className="text-4xl text-slate-400 font-semibold">No pending delivery requests</div>
        </div>
      )}

      {/* Footer - Auto-refresh indicator */}
      <div className="fixed bottom-8 right-8 bg-gradient-to-r from-slate-900/90 to-gray-900/90 backdrop-blur-2xl px-8 py-5 rounded-full border-2 border-green-500/30 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-5 h-5 bg-green-400 rounded-full animate-ping absolute"></div>
            <div className="w-5 h-5 bg-green-400 rounded-full"></div>
          </div>
          <span className="text-2xl font-black text-green-300">Live Updates Every 5 Seconds</span>
        </div>
      </div>
    </div>
  );
}
