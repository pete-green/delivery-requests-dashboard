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
          badge: 'bg-gradient-to-r from-red-600 to-red-500 text-white',
          border: 'border-red-200',
          animation: 'animate-pulse',
          icon: '🔥',
        };
      case 'urgent':
        return {
          badge: 'bg-gradient-to-r from-orange-600 to-orange-500 text-white',
          border: 'border-orange-200',
          animation: '',
          icon: '⚡',
        };
      default:
        return {
          badge: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white',
          border: 'border-blue-200',
          animation: '',
          icon: '📋',
        };
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white border-2 border-red-300 p-12 rounded-2xl shadow-xl max-w-2xl">
          <div className="text-8xl mb-6 text-center">⚠️</div>
          <h1 className="text-4xl font-bold text-red-600 mb-4 text-center">Connection Error</h1>
          <p className="text-xl text-gray-700 text-center mb-8">Unable to connect to database</p>
          <button
            onClick={() => refetch()}
            className="w-full px-8 py-4 bg-red-600 text-white text-xl rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg"
          >
            🔄 Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner */}
      <div className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="https://gogreenplumb.com/wp-content/uploads/2025/07/Go-Green-Logo.svg"
                alt="Go Green"
                className="h-12 w-auto"
              />
              <div className="border-l-2 border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Delivery Request Queue - Today
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-gray-500 font-medium">{formatDate(currentTime)}</div>
                <div className="text-2xl font-bold text-gray-900 tabular-nums">{formatTime(currentTime)}</div>
              </div>
              <div className="bg-green-100 border-2 border-green-300 px-4 py-2 rounded-lg">
                <div className="text-xs font-bold text-green-700 uppercase tracking-wide">Pending Requests</div>
                <div className="text-3xl font-black text-green-700">
                  {isLoading ? '...' : requests?.length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-8xl mb-6 animate-bounce">📦</div>
              <div className="text-4xl font-bold text-gray-600 animate-pulse">
                Loading requests...
              </div>
            </div>
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="space-y-6">
            {requests.map((request, index) => {
              const priorityConfig = getPriorityConfig(request.priority);
              return (
                <div
                  key={request.id}
                  className={`bg-white border-2 ${priorityConfig.border} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}
                >
                  <div className="p-8">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-6 pb-6 border-b-2 border-gray-100">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center shadow-lg">
                          <div className="text-4xl font-black text-white">
                            {index + 1}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Technician
                          </div>
                          <div className="text-3xl font-black text-gray-900">
                            {request.tech_name}
                          </div>
                        </div>
                      </div>
                      <div className={`px-6 py-3 rounded-xl font-black text-xl ${priorityConfig.badge} shadow-lg ${priorityConfig.animation} flex items-center gap-2`}>
                        <span>{priorityConfig.icon}</span>
                        {request.priority.toUpperCase()}
                      </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Left Column */}
                      <div className="space-y-6">
                        {/* Job Name */}
                        <div>
                          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Job Name
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {request.job_name}
                          </div>
                        </div>

                        {/* Address */}
                        {request.delivery_address && (
                          <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                              Delivery Address
                            </div>
                            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
                              <span className="text-3xl">📍</span>
                              <div className="text-xl font-semibold text-gray-900 leading-relaxed">
                                {request.delivery_address}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Drive Time */}
                        {request.delivery_latitude && request.delivery_longitude && (
                          <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                              Drive Time from Warehouse
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                              <DriveTimeDisplay
                                latitude={request.delivery_latitude}
                                longitude={request.delivery_longitude}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        {/* Request Details */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                              Request ID
                            </div>
                            <div className="font-mono font-black text-lg text-gray-900">
                              {request.request_id}
                            </div>
                          </div>

                          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                            <div className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2">
                              Time Requested
                            </div>
                            <div className="font-black text-lg text-gray-900">
                              {formatRequestTime(request.created_at)}
                            </div>
                            <div className="text-sm font-bold text-yellow-600 mt-1">
                              {getTimeAgo(request.created_at)}
                            </div>
                          </div>

                          {request.truck_number && (
                            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                              <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">
                                Truck Number
                              </div>
                              <div className="font-black text-2xl text-gray-900 flex items-center gap-2">
                                🚛 {request.truck_number}
                              </div>
                            </div>
                          )}

                          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                            <div className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
                              Total Items
                            </div>
                            <div className="font-black text-2xl text-gray-900 flex items-center gap-2">
                              📦 {request.items?.length || 0}
                            </div>
                          </div>
                        </div>

                        {/* Notes if any */}
                        {request.notes && (
                          <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                              Notes
                            </div>
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                              <div className="text-base text-gray-900">
                                💬 {request.notes}
                              </div>
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
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
            <div className="text-9xl mb-8 animate-bounce">✅</div>
            <div className="text-6xl font-black text-gray-900 mb-4">
              All Clear!
            </div>
            <div className="text-3xl text-gray-500 font-semibold">No pending delivery requests</div>
          </div>
        )}
      </div>

      {/* Footer - Auto-refresh indicator */}
      <div className="fixed bottom-6 right-6 bg-white border-2 border-green-300 px-6 py-3 rounded-full shadow-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-ping absolute"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-sm font-bold text-gray-700">Live Updates Every 5 Seconds</span>
        </div>
      </div>
    </div>
  );
}
