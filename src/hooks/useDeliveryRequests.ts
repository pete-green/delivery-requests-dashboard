import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface MaterialRequest {
  id: string;
  request_id: string;
  tech_id: string;
  tech_name: string;
  job_name: string;
  truck_number: string | null;
  needed_date: string | null;
  priority: 'normal' | 'urgent' | 'asap';
  delivery_method: 'delivery' | 'pickup';
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  delivery_address: string | null;
  status: 'pending' | 'approved' | 'processing' | 'fulfilled' | 'cancelled' | 'rejected';
  notes: string | null;
  created_at: string;
  updated_at: string;
  total_items: number;
  total_quantity: number;
  items?: MaterialRequestItem[];
}

export interface MaterialRequestItem {
  id: string;
  request_id: string;
  part_id: string;
  our_part_number: string;
  description: string;
  quantity: number;
  confirmed: boolean;
}

// Fetch pending delivery requests for today
export function useDeliveryRequests() {
  return useQuery({
    queryKey: ['delivery-requests'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { data, error } = await supabase
        .from('material_requests')
        .select(`
          *,
          items:material_request_items(*)
        `)
        .eq('status', 'pending')
        .eq('delivery_method', 'delivery')
        .gte('needed_date', todayISO)
        .order('created_at', { ascending: true }); // Oldest first

      if (error) throw error;
      return data as MaterialRequest[];
    },
    staleTime: 3000, // 3 seconds - very fresh for real-time
    refetchInterval: 5000, // Auto-refetch every 5 seconds
    refetchOnWindowFocus: true,
  });
}
