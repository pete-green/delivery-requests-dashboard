import { useState, useEffect } from 'react';
import { estimateDriveTime, formatDistance } from '../utils/distanceCalculator';

interface DriveTimeDisplayProps {
  latitude: number;
  longitude: number;
}

export default function DriveTimeDisplay({ latitude, longitude }: DriveTimeDisplayProps) {
  const [driveTime, setDriveTime] = useState<string>('...');
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
          setDriveTime('N/A');
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
      <div className="text-center">
        <div className="text-6xl font-black text-white animate-pulse mb-2">...</div>
        <div className="text-xl font-bold text-blue-300 uppercase tracking-wider">CALCULATING</div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="text-7xl font-black text-white tabular-nums mb-2">
        {driveTime}
      </div>
      {distance && (
        <div className="text-3xl font-bold text-blue-300">
          {distance}
        </div>
      )}
    </div>
  );
}
