
export interface Courier {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  status: string;
  rating: number;
  deliveries: number;
  notes?: string;
  created_at: string;
  registered_at: string;
  created_by_admin: boolean;
}
