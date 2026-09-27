import { apiRequest } from './client';
export type ApiRestaurant = {
  restaurantName: string;
  phone: string;
  instagram: string;
  city: string;
  ordersEnabled: boolean;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  defaultDeliveryFeeToman: number;
  minimumOrderToman: number | null;
  openingHours: {
    dayOfWeek: number;
    openTime: string | null;
    closeTime: string | null;
    isClosed: boolean;
  }[];
  capabilities: { onlinePayment: boolean; smsNotifications: boolean };
};
export const getRestaurant = () =>
  apiRequest<{ restaurant: ApiRestaurant | null }>('/api/v1/restaurant');
