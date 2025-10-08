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
      year: 'numeric',
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

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'asap':
        return {
          badge: 'bg-red-500 text-white',
          border: 'border-l-4 border-red-500',
          glow: 'shadow-red-500/20',
        };
      case 'urgent':
        return {
          badge: 'bg-orange-500 text-white',
          border: 'border-l-4 border-orange-500',
          glow: 'shadow-orange-500/20',
        };
      default:
        return {
          badge: 'bg-blue-500 text-white',
          border: 'border-l-4 border-blue-500',
          glow: 'shadow-blue-500/20',
        };
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-3">Connection Error</h2>
          <p className="text-slate-600 mb-6">Unable to load delivery requests</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-6">
              <div className="bg-white rounded-xl shadow-sm p-3 border border-slate-200">
                <img
                  src="https://gogreenplumb.com/wp-content/uploads/2025/07/Go-Green-Logo.svg"
                  alt="Go Green"
                  className="h-12 w-auto"
                />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Delivery Requests</h1>
                <p className="text-sm text-slate-500">{formatDate(currentTime)}</p>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-6">
              {/* Time */}
              <div className="text-right">
                <div className="text-sm text-slate-500 font-medium">Current Time</div>
                <div className="text-2xl font-semibold text-slate-900 tabular-nums">{formatTime(currentTime)}</div>
              </div>

              {/* Divider */}
              <div className="h-12 w-px bg-slate-200"></div>

              {/* Pending Count */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-3">
                <div className="text-sm text-emerald-700 font-medium mb-1">Pending Deliveries</div>
                <div className="text-3xl font-bold text-emerald-600 tabular-nums">
                  {isLoading ? '—' : requests?.length || 0}
                </div>
              </div>

              {/* Live Indicator */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                <div className="relative">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-xs font-medium text-slate-700">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center" style={{ height: 'calc(100vh - 200px)' }}>
            <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mb-6"></div>
            <p className="text-slate-500 font-medium">Loading requests...</p>
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="grid gap-6">
            {requests.map((request, index) => {
              const priorityStyle = getPriorityStyle(request.priority);
              const timeAgo = getTimeAgo(request.created_at);

              return (
                <div
                  key={request.id}
                  className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all ${priorityStyle.border}`}
                >
                  <div className="p-8">
                    <div className="flex items-start gap-8">
                      {/* Queue Number */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                          <span className="text-3xl font-bold text-slate-700">{index + 1}</span>
                        </div>
                      </div>

                      {/* Main Content Grid */}
                      <div className="flex-1 grid grid-cols-12 gap-8">
                        {/* Left Column - Primary Info */}
                        <div className="col-span-5 space-y-6">
                          {/* Priority Badge */}
                          <div>
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide ${priorityStyle.badge}`}>
                              {request.priority}
                            </span>
                          </div>

                          {/* Technician */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Technician</span>
                            </div>
                            <p className="text-2xl font-semibold text-slate-900">{request.tech_name}</p>
                          </div>

                          {/* Job Site */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Job Site</span>
                            </div>
                            <p className="text-lg font-medium text-slate-700">{request.job_name}</p>
                          </div>

                          {/* Notes */}
                          {request.notes && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                              <div className="flex items-start gap-2 mb-2">
                                <svg className="w-4 h-4 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Notes</span>
                              </div>
                              <p className="text-sm text-amber-900">{request.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Middle Column - Delivery Info */}
                        <div className="col-span-4 space-y-6">
                          {/* Address */}
                          {request.delivery_address && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                              <div className="flex items-start gap-3 mb-3">
                                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <div className="flex-1">
                                  <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Delivery Address</div>
                                  <p className="text-base font-medium text-blue-900 leading-relaxed">{request.delivery_address}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Drive Time */}
                          {request.delivery_latitude && request.delivery_longitude && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                              <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-slate-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                </svg>
                                <div className="flex-1">
                                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Drive Time</div>
                                  <DriveTimeDisplay
                                    latitude={request.delivery_latitude}
                                    longitude={request.delivery_longitude}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Column - Metadata */}
                        <div className="col-span-3 space-y-4">
                          {/* Age */}
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Age</div>
                            <div className="text-2xl font-bold text-slate-900 tabular-nums">{timeAgo}</div>
                          </div>

                          {/* Truck */}
                          {request.truck_number && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">Truck</div>
                              <div className="text-2xl font-bold text-emerald-600">{request.truck_number}</div>
                            </div>
                          )}

                          {/* Items */}
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                            <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">Items</div>
                            <div className="text-2xl font-bold text-purple-600">{request.items?.length || 0}</div>
                          </div>

                          {/* Request ID */}
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">ID</div>
                            <div className="font-mono text-xs text-slate-700 break-all">{request.request_id}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-200" style={{ height: 'calc(100vh - 200px)' }}>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">All Clear</h2>
            <p className="text-slate-500">No pending delivery requests</p>
          </div>
        )}
      </div>
    </div>
  );
}
