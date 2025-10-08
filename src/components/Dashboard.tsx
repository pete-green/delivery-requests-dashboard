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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'asap':
        return 'bg-red-600 text-white animate-pulse';
      case 'urgent':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-2xl">
          <h1 className="text-2xl font-bold text-red-900 mb-4">Connection Error</h1>
          <p className="text-red-700">Unable to connect to database</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-6xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Delivery Requests Dashboard
            </h1>
            <p className="text-2xl text-blue-300">{formatDate(currentTime)}</p>
          </div>
          <div className="text-right">
            <div className="text-7xl font-bold tabular-nums">{formatTime(currentTime)}</div>
            <div className="text-xl text-blue-300 mt-2">
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                <span>{requests?.length || 0} Pending Deliveries</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-4xl font-bold text-blue-400 animate-pulse">
            Loading requests...
          </div>
        </div>
      ) : requests && requests.length > 0 ? (
        <div className="space-y-6">
          {requests.map((request, index) => (
            <div
              key={request.id}
              className="bg-white/10 backdrop-blur-md border-2 border-blue-400/30 rounded-2xl p-6 shadow-2xl hover:shadow-blue-500/50 transition-all"
            >
              <div className="flex items-start justify-between">
                {/* Left: Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-5xl font-black text-blue-400">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{request.tech_name}</div>
                      <div className="text-xl text-blue-300">{request.job_name}</div>
                    </div>
                  </div>

                  {/* Address */}
                  {request.delivery_address && (
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">📍</span>
                      <div className="text-2xl text-gray-200">{request.delivery_address}</div>
                    </div>
                  )}

                  {/* Items */}
                  {request.items && request.items.length > 0 && (
                    <div className="mt-4 bg-black/20 rounded-xl p-4">
                      <div className="text-xl font-bold text-blue-300 mb-2">
                        📦 Items ({request.items.length})
                      </div>
                      <div className="space-y-2">
                        {request.items.slice(0, 5).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-lg"
                          >
                            <span className="text-gray-200">
                              {item.our_part_number} - {item.description}
                            </span>
                            <span className="font-bold text-cyan-400">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        ))}
                        {request.items.length > 5 && (
                          <div className="text-lg text-blue-300 italic">
                            +{request.items.length - 5} more items
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Status & Time */}
                <div className="text-right space-y-4">
                  <div
                    className={`px-6 py-3 rounded-xl font-bold text-2xl ${getPriorityColor(
                      request.priority
                    )}`}
                  >
                    {request.priority.toUpperCase()}
                  </div>
                  <div className="text-xl text-gray-300">
                    <div>Request ID</div>
                    <div className="font-mono font-bold text-cyan-400">
                      {request.request_id}
                    </div>
                  </div>
                  <div className="text-xl">
                    <div className="text-gray-400">Requested</div>
                    <div className="font-bold text-2xl">{formatRequestTime(request.created_at)}</div>
                    <div className="text-yellow-400 font-bold mt-1">
                      {getTimeAgo(request.created_at)}
                    </div>
                  </div>
                  {request.truck_number && (
                    <div className="text-xl">
                      <div className="text-gray-400">Truck</div>
                      <div className="font-bold text-2xl text-green-400">
                        {request.truck_number}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="text-6xl mb-6">✅</div>
          <div className="text-4xl font-bold text-green-400">All Clear!</div>
          <div className="text-2xl text-gray-400 mt-2">No pending delivery requests</div>
        </div>
      )}

      {/* Footer - Auto-refresh indicator */}
      <div className="fixed bottom-4 right-4 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-400/30">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-lg text-gray-300">Auto-refreshing every 5 seconds</span>
        </div>
      </div>
    </div>
  );
}
