
export interface Order {
  id: string;
  store_id: string;
  customer_id: string;
  customer_name: string;
  items: any[];
  total_amount: number;
  status: string;
  address: string;
  created_at: string;
  updated_at: string;
  courier_assigned?: string;
}
