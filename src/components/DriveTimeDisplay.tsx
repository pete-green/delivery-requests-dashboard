import { useState, useEffect } from 'react';
import { estimateDriveTime, formatDistance } from '../utils/distanceCalculator';

interface DriveTimeDisplayProps {
  latitude: number;
  longitude: number;
}

export default function DriveTimeDisplay({ latitude, longitude }: DriveTimeDisplayProps) {
  const [driveTime, setDriveTime] = useState<string>('Calculating...');
  const [distance, setDistance] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchDriveData() {
      try {
        const [time, dist] = await Promise.all([
          estimateDriveTime(latitude, longitude),
          formatDistance(latitude, longitude),
        ]);

        if (!cancelled) {
          setDriveTime(time);
          setDistance(dist);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching drive data:', error);
        if (!cancelled) {
          setDriveTime('Unable to calculate');
          setDistance('');
          setIsLoading(false);
        }
      }
    }

    fetchDriveData();

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-3xl">🚗</span>
        <span className="text-lg font-semibold text-gray-600 animate-pulse">Calculating route...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl">🚗</span>
      <div>
        <div className="text-2xl font-black text-gray-900">
          {driveTime}
          {distance && (
            <span className="text-lg text-gray-600 font-semibold ml-2">({distance})</span>
          )}
        </div>
      </div>
    </div>
  );
}
