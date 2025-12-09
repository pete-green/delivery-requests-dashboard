import { useEffect, useState, useRef } from 'react';
import { useDeliveryRequests } from '../hooks/useDeliveryRequests';
import DriveTimeDisplay from './DriveTimeDisplay';
import { initializeAudio, playNewRequestAlert, playAgeWarningAlert, isAudioEnabled } from '../utils/audioAlerts';

export default function Dashboard() {
  const { data: requests, isLoading, error, refetch } = useDeliveryRequests();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scrollPosition, setScrollPosition] = useState(0);
  const previousRequestIds = useRef<Set<string>>(new Set());
  const ageAlertTracker = useRef<Map<string, number>>(new Map()); // Track last alert time for each request

  // Auto-scroll state - using refs to avoid closure scope issues
  const scrollStateRef = useRef({
    isScrollingDown: true,
    isPaused: false,
  });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (!requests || requests.length <= 3) {
      // Reset scroll state when not enough items
      scrollStateRef.current = { isScrollingDown: true, isPaused: false };
      return;
    }

    const scrollContainer = document.getElementById('scroll-container');
    if (!scrollContainer) return;

    const scrollSpeed = 0.5; // pixels per frame
    const pauseAtTop = 3000; // ms to pause at top
    const pauseAtBottom = 2000; // ms to pause at bottom

    // Reset scroll state when requests change
    scrollStateRef.current = { isScrollingDown: true, isPaused: false };
    setScrollPosition(0);

    const scroll = () => {
      // Recalculate maxScroll each time in case content changed
      const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;

      if (scrollStateRef.current.isPaused) return;

      if (scrollStateRef.current.isScrollingDown) {
        setScrollPosition((prev) => {
          const next = prev + scrollSpeed;
          if (next >= maxScroll) {
            scrollStateRef.current.isPaused = true;
            timeoutRef.current = setTimeout(() => {
              scrollStateRef.current.isPaused = false;
              scrollStateRef.current.isScrollingDown = false;
            }, pauseAtBottom);
            return maxScroll;
          }
          return next;
        });
      } else {
        setScrollPosition((prev) => {
          const next = prev - scrollSpeed;
          if (next <= 0) {
            scrollStateRef.current.isPaused = true;
            timeoutRef.current = setTimeout(() => {
              scrollStateRef.current.isPaused = false;
              scrollStateRef.current.isScrollingDown = true;
            }, pauseAtTop);
            return 0;
          }
          return next;
        });
      }
    };

    const interval = setInterval(scroll, 16); // ~60fps

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [requests]);

  useEffect(() => {
    const scrollContainer = document.getElementById('scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  // Enable audio on first user interaction
  useEffect(() => {
    const enableAudio = () => {
      if (!isAudioEnabled()) {
        initializeAudio();
      }
    };

    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('keydown', enableAudio, { once: true });

    return () => {
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };
  }, []);

  // Detect new requests and play alert
  useEffect(() => {
    if (!requests || requests.length === 0) return;

    const currentIds = new Set(requests.map(r => r.id));

    // Check for new requests
    currentIds.forEach(id => {
      if (!previousRequestIds.current.has(id)) {
        playNewRequestAlert();
      }
    });

    previousRequestIds.current = currentIds;
  }, [requests]);

  // Check for age warnings every 15 minutes
  useEffect(() => {
    if (!requests || requests.length === 0) return;

    const checkAgeWarnings = () => {
      const now = new Date();

      requests.forEach(request => {
        const created = new Date(request.created_at);
        const ageMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);

        // Calculate which 15-minute milestone this request has reached
        const currentMilestone = Math.floor(ageMinutes / 15);

        // Check if we've reached a 15-minute milestone (15, 30, 45, 60, etc.)
        if (currentMilestone > 0) {
          const lastMilestone = ageAlertTracker.current.get(request.id) || 0;

          // Play alert if we've reached a new milestone
          if (currentMilestone > lastMilestone) {
            playAgeWarningAlert();
            ageAlertTracker.current.set(request.id, currentMilestone);
          }
        }
      });

      // Clean up tracker for requests that no longer exist
      const currentIds = new Set(requests.map(r => r.id));
      Array.from(ageAlertTracker.current.keys()).forEach(id => {
        if (!currentIds.has(id)) {
          ageAlertTracker.current.delete(id);
        }
      });
    };

    // Check immediately, then every 10 seconds
    checkAgeWarnings();
    const interval = setInterval(checkAgeWarnings, 10000);

    return () => clearInterval(interval);
  }, [requests]);

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

  // Get workflow status config based on request state
  const getStatusConfig = (request: typeof requests extends (infer T)[] | undefined ? T : never) => {
    // Truck assigned, awaiting dispatch
    if (request.pull_completed_at && request.delivery_truck_id) {
      return {
        label: 'TRUCK ASSIGNED',
        bg: 'bg-cyan-600',
        icon: '🚛',
        pulse: false,
      };
    }
    // Pulled, awaiting truck
    if (request.pull_completed_at && !request.delivery_truck_id) {
      return {
        label: 'PULLED',
        bg: 'bg-blue-600',
        icon: '📦',
        pulse: false,
      };
    }
    // Being pulled (active)
    if (request.pull_started_at && !request.pull_completed_at) {
      return {
        label: 'BEING PULLED',
        bg: 'bg-purple-600',
        icon: '🏃',
        pulse: true,
      };
    }
    // Default: pending
    return {
      label: 'PENDING',
      bg: 'bg-yellow-600',
      icon: '⏳',
      pulse: false,
    };
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
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Command Center Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-b-4 border-emerald-500 shadow-xl flex-shrink-0">
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

              <div className="bg-emerald-600 rounded-xl shadow-lg" style={{ padding: '20px 32px' }}>
                <div className="text-sm text-emerald-100 font-bold uppercase tracking-wide" style={{ marginBottom: '8px', lineHeight: '1.4' }}>Pending</div>
                <div className="text-5xl font-black text-white tabular-nums leading-none">
                  {isLoading ? '—' : requests?.length || 0}
                </div>
              </div>

              <div className="flex items-center bg-slate-800 rounded-full border-2 border-emerald-500" style={{ padding: '12px 20px', gap: '12px' }}>
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
      <div className="max-w-[1900px] mx-auto overflow-hidden flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 border-8 border-slate-700 border-t-emerald-500 rounded-full animate-spin mb-8"></div>
            <p className="text-3xl text-slate-400 font-bold">Loading requests...</p>
          </div>
        ) : requests && requests.length > 0 ? (
          <div id="scroll-container" className="h-full overflow-y-auto px-10 py-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="pb-8">
            {requests.map((request, index) => {
              const priority = getPriorityConfig(request.priority);
              const status = getStatusConfig(request);
              const timeAgo = getTimeAgo(request.created_at);

              return (
                <div
                  key={request.id}
                  className={`${priority.bg} rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.01] ${priority.pulse ? 'animate-pulse' : ''} border-2 border-white/10`}
                  style={{
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 15px 30px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.2)',
                    marginTop: index > 0 ? '1.5rem' : '0'
                  }}
                >
                  <div className="p-6">
                    <div className="flex gap-5">
                      {/* Position Badge */}
                      <div className="shrink-0 pt-1">
                        <div className="w-24 h-24 bg-gradient-to-br from-black/40 to-black/60 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/20 backdrop-blur-sm">
                          <span className="text-5xl font-black text-white drop-shadow-xl">{index + 1}</span>
                        </div>
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0 flex flex-col gap-4">
                        {/* Badges Row */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className={`${priority.badgeBg} px-6 py-3 rounded-xl shadow-xl border-2 border-white/20`}>
                            <span className="text-sm font-black text-white uppercase tracking-widest">{priority.label}</span>
                          </div>
                          <div className={`flex items-center gap-2 ${status.bg} px-4 py-3 rounded-xl shadow-xl border-2 border-white/20 ${status.pulse ? 'animate-pulse' : ''}`}>
                            <span className="text-xl">{status.icon}</span>
                            <span className="text-sm font-black text-white uppercase tracking-wide">{status.label}</span>
                          </div>
                          <div className="bg-black/25 backdrop-blur-sm rounded-xl shadow-lg border border-white/10 px-4 py-3">
                            <span className="text-xs font-bold text-white/60 uppercase tracking-wide mr-2">ID:</span>
                            <span className="font-mono text-xs text-white/80">{request.request_id}</span>
                          </div>
                        </div>

                        {/* Tech & Job */}
                        <div className="bg-black/25 backdrop-blur-sm rounded-xl shadow-lg border border-white/10 p-5">
                          <div className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Technician</div>
                          <div className="text-4xl font-black text-white leading-tight tracking-tight drop-shadow-lg truncate">{request.tech_name}</div>
                        </div>

                        <div className="bg-black/25 backdrop-blur-sm rounded-xl shadow-lg border border-white/10 p-5">
                          <div className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Job Site</div>
                          <div className="text-2xl font-bold text-white/95 leading-tight truncate">{request.job_name}</div>
                        </div>

                        {request.notes && (
                          <div className="bg-black/30 backdrop-blur-sm rounded-xl shadow-lg border border-white/10 p-5">
                            <div className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Notes</div>
                            <div className="text-base font-medium text-white/95 leading-relaxed">{request.notes}</div>
                          </div>
                        )}
                      </div>

                      {/* Address & Drive Time */}
                      <div className="w-72 shrink-0 flex flex-col gap-4">
                        {request.delivery_address && (
                          <div className="bg-black/25 backdrop-blur-sm rounded-xl shadow-lg border border-white/10 p-5">
                            <div className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Delivery Address</div>
                            <div className="text-base font-semibold text-white leading-relaxed">{request.delivery_address}</div>
                          </div>
                        )}

                        {request.delivery_latitude && request.delivery_longitude && (
                          <div className="bg-gradient-to-br from-emerald-600/30 to-emerald-700/30 backdrop-blur-sm rounded-xl shadow-lg border-2 border-emerald-500/30 p-5">
                            <div className="text-xs font-bold text-emerald-200 uppercase tracking-widest mb-2">Drive Time</div>
                            <DriveTimeDisplay
                              latitude={request.delivery_latitude}
                              longitude={request.delivery_longitude}
                            />
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="w-32 shrink-0 flex flex-col gap-4">
                        <div className="bg-black/30 backdrop-blur-sm rounded-xl text-center shadow-lg border border-white/10 p-4">
                          <div className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Age</div>
                          <div className="text-3xl font-black text-white tabular-nums leading-none drop-shadow-md">{timeAgo}</div>
                        </div>

                        {request.truck_number && (
                          <div className="bg-black/30 backdrop-blur-sm rounded-xl text-center shadow-lg border border-white/10 p-4">
                            <div className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Truck</div>
                            <div className="text-2xl font-black text-white leading-none drop-shadow-md">{request.truck_number}</div>
                          </div>
                        )}

                        <div className="bg-black/30 backdrop-blur-sm rounded-xl text-center shadow-lg border border-white/10 p-4">
                          <div className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Items</div>
                          <div className="text-2xl font-black text-white leading-none drop-shadow-md">{request.items?.length || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-emerald-600 rounded-2xl shadow-xl h-full">
            <div className="text-8xl font-black text-white mb-6">✓</div>
            <h2 className="text-6xl font-black text-white mb-4">ALL CLEAR</h2>
            <p className="text-3xl font-bold text-emerald-100">No pending delivery requests</p>
          </div>
        )}
      </div>
    </div>
  );
}
