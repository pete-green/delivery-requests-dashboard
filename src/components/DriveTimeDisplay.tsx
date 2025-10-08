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
      <div className="flex items-center gap-4">
        <span className="text-5xl">🚗</span>
        <span className="text-2xl font-black text-blue-300 animate-pulse uppercase tracking-wider">Calculating Route...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-5">
      <span className="text-6xl">🚗</span>
      <div>
        <div className="text-5xl font-black text-white">
          {driveTime}
        </div>
        {distance && (
          <div className="text-2xl font-bold text-blue-300 mt-1">
            {distance}
          </div>
        )}
      </div>
    </div>
  );
}
