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
      <div>
        <div className="text-xl font-semibold text-white/60 tabular-nums leading-none">Calculating...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-3xl font-black text-white tabular-nums leading-none mb-1.5">
        {driveTime}
      </div>
      {distance && (
        <div className="text-base font-medium text-white/60 leading-none">
          {distance}
        </div>
      )}
    </div>
  );
}
