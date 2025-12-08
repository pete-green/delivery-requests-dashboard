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
  // Pull tracking
  pull_started_at: string | null;
  pull_completed_at: string | null;
  pulled_by: string | null;
  has_shortages: boolean;
  // Delivery tracking
  delivery_truck_id: string | null;
  dispatched_at: string | null;
  dispatched_by: string | null;
  delivered_at: string | null;
  delivered_by: string | null;
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

// Fetch delivery requests that haven't been dispatched yet
// This shows orders from pending through assigned (until driver leaves)
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
        .eq('delivery_method', 'delivery')
        .is('dispatched_at', null) // Show until dispatched (driver leaves)
        .neq('status', 'fulfilled') // Exclude already fulfilled
        .neq('status', 'cancelled') // Exclude cancelled
        .neq('status', 'rejected') // Exclude rejected
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
