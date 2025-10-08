import { useEffect, useState } from 'react';
import { useDeliveryRequests } from '../hooks/useDeliveryRequests';

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
          glow: 'shadow-[0_0_30px_rgba(239,68,68,0.6)]',
          border: 'border-red-400',
          animation: 'animate-pulse',
        };
      case 'urgent':
        return {
          gradient: 'from-orange-600 via-orange-500 to-yellow-500',
          glow: 'shadow-[0_0_20px_rgba(249,115,22,0.5)]',
          border: 'border-orange-400',
          animation: '',
        };
      default:
        return {
          gradient: 'from-blue-600 via-blue-500 to-cyan-500',
          glow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]',
          border: 'border-blue-400',
          animation: '',
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <div className="relative mb-6 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 backdrop-blur-xl border-2 border-blue-500/30 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-5xl shadow-xl">
              🚚
            </div>
            <div>
              <h1 className="text-5xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg">
                Delivery Requests Dashboard
              </h1>
              <p className="text-xl text-blue-300 font-semibold">{formatDate(currentTime)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-6xl font-black tabular-nums bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text drop-shadow-lg">
              {formatTime(currentTime)}
            </div>
            <div className="text-2xl font-bold mt-2 bg-gradient-to-r from-green-400 to-emerald-400 text-transparent bg-clip-text">
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                <span>{requests?.length || 0} Pending {requests?.length === 1 ? 'Delivery' : 'Deliveries'}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">📦</div>
            <div className="text-4xl font-bold text-blue-400 animate-pulse">
              Loading requests...
            </div>
          </div>
        </div>
      ) : requests && requests.length > 0 ? (
        <div className="relative space-y-4">
          {requests.map((request, index) => {
            const priorityConfig = getPriorityConfig(request.priority);
            return (
              <div
                key={request.id}
                className={`relative bg-gradient-to-r from-slate-800/90 via-slate-900/90 to-slate-800/90 backdrop-blur-xl border-2 ${priorityConfig.border} rounded-3xl p-6 ${priorityConfig.glow} hover:scale-[1.01] transition-all duration-300`}
              >
                {/* Priority stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-b ${priorityConfig.gradient} rounded-l-3xl ${priorityConfig.animation}`}></div>

                <div className="flex items-start justify-between gap-6 ml-4">
                  {/* Left: Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-6 mb-4">
                      {/* Order number badge */}
                      <div className={`w-24 h-24 bg-gradient-to-br ${priorityConfig.gradient} rounded-2xl flex items-center justify-center shadow-xl ${priorityConfig.animation}`}>
                        <div className="text-5xl font-black text-white drop-shadow-lg">
                          {index + 1}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="text-4xl font-black text-white mb-1 drop-shadow-lg">
                          {request.tech_name}
                        </div>
                        <div className="text-2xl font-semibold text-blue-300">
                          {request.job_name}
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    {request.delivery_address && (
                      <div className="flex items-start gap-4 mb-4 bg-black/30 rounded-2xl p-4 border border-blue-500/20">
                        <span className="text-4xl">📍</span>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-blue-400 mb-1">DELIVERY ADDRESS</div>
                          <div className="text-2xl font-semibold text-gray-100">
                            {request.delivery_address}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    {request.items && request.items.length > 0 && (
                      <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 backdrop-blur-sm rounded-2xl p-5 border border-blue-500/20">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-3xl">📦</span>
                          <div className="text-2xl font-black text-blue-300">
                            Items to Prepare ({request.items.length})
                          </div>
                        </div>
                        <div className="space-y-2">
                          {request.items.slice(0, 5).map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-xl bg-black/30 rounded-xl p-3 border border-blue-500/10"
                            >
                              <span className="text-gray-100 font-semibold">
                                <span className="text-cyan-400 font-black">{item.our_part_number}</span> - {item.description}
                              </span>
                              <span className="font-black text-2xl text-green-400 bg-green-500/20 px-4 py-1 rounded-lg">
                                {item.quantity}
                              </span>
                            </div>
                          ))}
                          {request.items.length > 5 && (
                            <div className="text-xl text-blue-300 italic font-semibold text-center pt-2">
                              +{request.items.length - 5} more items
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Status & Time */}
                  <div className="flex flex-col items-end gap-4 min-w-[300px]">
                    {/* Priority Badge */}
                    <div
                      className={`px-8 py-4 rounded-2xl font-black text-3xl bg-gradient-to-r ${priorityConfig.gradient} text-white shadow-xl ${priorityConfig.animation}`}
                    >
                      {request.priority === 'asap' && '🔥 '}
                      {request.priority.toUpperCase()}
                      {request.priority === 'asap' && ' 🔥'}
                    </div>

                    {/* Request ID */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 border border-cyan-500/30 w-full">
                      <div className="text-sm font-bold text-cyan-400 mb-1">REQUEST ID</div>
                      <div className="font-mono font-black text-xl text-white">
                        {request.request_id}
                      </div>
                    </div>

                    {/* Time Info */}
                    <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-2xl p-4 border border-yellow-500/30 w-full">
                      <div className="text-sm font-bold text-yellow-400 mb-1">REQUESTED AT</div>
                      <div className="font-black text-2xl text-white">
                        {formatRequestTime(request.created_at)}
                      </div>
                      <div className="text-xl font-bold text-yellow-300 mt-2 flex items-center gap-2">
                        ⏱️ {getTimeAgo(request.created_at)}
                      </div>
                    </div>

                    {/* Truck Number */}
                    {request.truck_number && (
                      <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-2xl p-4 border border-green-500/30 w-full">
                        <div className="text-sm font-bold text-green-400 mb-1">TRUCK</div>
                        <div className="font-black text-3xl text-green-300 flex items-center gap-2">
                          🚛 {request.truck_number}
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
          <div className="text-9xl mb-6 animate-bounce">✅</div>
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
            All Clear!
          </div>
          <div className="text-3xl text-gray-400 mt-4 font-semibold">No pending delivery requests</div>
        </div>
      )}

      {/* Footer - Auto-refresh indicator */}
      <div className="fixed bottom-6 right-6 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-xl px-6 py-4 rounded-full border-2 border-green-500/30 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-4 h-4 bg-green-400 rounded-full animate-ping absolute"></div>
            <div className="w-4 h-4 bg-green-400 rounded-full"></div>
          </div>
          <span className="text-xl font-bold text-green-300">Live Updates Every 5 Seconds</span>
        </div>
      </div>
    </div>
  );
}
