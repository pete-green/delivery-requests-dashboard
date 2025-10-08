const WAREHOUSE_LAT = 36.06715075699162; // 300 Pomona Drive, Greensboro, NC 27407
const WAREHOUSE_LON = -79.86406380887415;

// Cache for route data to avoid excessive API calls
const routeCache = new Map<string, { distance: number; duration: number; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

// Fetch routing data from OSRM (OpenStreetMap routing service)
async function fetchRouteData(lat: number, lon: number): Promise<{ distance: number; duration: number } | null> {
  const cacheKey = `${lat},${lon}`;

  // Check cache first
  const cached = routeCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { distance: cached.distance, duration: cached.duration };
  }

  try {
    // OSRM demo server - format: lon,lat (note: longitude comes first!)
    const url = `https://router.project-osrm.org/route/v1/driving/${WAREHOUSE_LON},${WAREHOUSE_LAT};${lon},${lat}?overview=false`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('OSRM API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error('No route found');
      return null;
    }

    const route = data.routes[0];
    const distanceInMiles = route.distance * 0.000621371; // meters to miles
    const durationInMinutes = route.duration / 60; // seconds to minutes

    // Cache the result
    routeCache.set(cacheKey, {
      distance: distanceInMiles,
      duration: durationInMinutes,
      timestamp: Date.now(),
    });

    return { distance: distanceInMiles, duration: durationInMinutes };
  } catch (error) {
    console.error('Error fetching route data:', error);
    return null;
  }
}

// Fallback: Calculate straight-line distance using Haversine formula
function calculateStraightLineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Estimate drive time using OSRM API, with fallback to approximation
export async function estimateDriveTime(deliveryLat: number, deliveryLon: number): Promise<string> {
  const routeData = await fetchRouteData(deliveryLat, deliveryLon);

  let timeInMinutes: number;

  if (routeData) {
    // Use actual route duration from OSRM
    timeInMinutes = Math.round(routeData.duration);
  } else {
    // Fallback to approximation
    const straightLineDistance = calculateStraightLineDistance(WAREHOUSE_LAT, WAREHOUSE_LON, deliveryLat, deliveryLon);
    const roadDistance = straightLineDistance * 2; // Circuity factor
    const avgSpeed = 22; // mph
    timeInMinutes = Math.round((roadDistance / avgSpeed) * 60);
  }

  if (timeInMinutes < 60) {
    return `${timeInMinutes} min`;
  } else {
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

// Format distance using OSRM API, with fallback to approximation
export async function formatDistance(deliveryLat: number, deliveryLon: number): Promise<string> {
  const routeData = await fetchRouteData(deliveryLat, deliveryLon);

  let distance: number;

  if (routeData) {
    // Use actual route distance from OSRM
    distance = routeData.distance;
  } else {
    // Fallback to approximation
    const straightLineDistance = calculateStraightLineDistance(WAREHOUSE_LAT, WAREHOUSE_LON, deliveryLat, deliveryLon);
    distance = straightLineDistance * 2; // Circuity factor
  }

  return `${distance.toFixed(1)} mi`;
}
