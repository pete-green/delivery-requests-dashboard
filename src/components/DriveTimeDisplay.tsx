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
        <span className="text-4xl">🚗</span>
        <span className="text-2xl font-bold text-blue-300 animate-pulse">Calculating route...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-5xl">🚗</span>
      <div>
        <div className="text-sm font-bold text-blue-400 mb-1">DRIVE TIME FROM WAREHOUSE</div>
        <div className="text-4xl font-black text-white">
          {driveTime}
          {distance && (
            <span className="text-2xl text-blue-300 ml-3">({distance})</span>
          )}
        </div>
      </div>
    </div>
  );
}
