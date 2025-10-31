import { LucideIcon } from 'lucide-react';

export interface DashboardStats {
  daily_revenue: string;
  total_orders: number;
  new_customers: number;
  conversion_rate: string;
  weekly_revenue: string;
  monthly_revenue: string;
  total_revenue: string;
  top_products: Array<{
    id: number;
    name: string;
    sales: number;
  }>;
  recent_orders: Array<{
    id: number;
    customer: string;
    amount: string;
    status: string;
    date: string;
  }>;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: LucideIcon;
  color: string;
}

export type Period = 'day' | 'week' | 'month' | 'year';
