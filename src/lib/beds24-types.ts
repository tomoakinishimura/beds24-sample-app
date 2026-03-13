export interface Booking {
  id?: number;
  propertyId?: number;
  roomId?: number;
  status?: "confirmed" | "request" | "new" | "cancelled" | "black" | "inquiry";
  arrival?: string;
  departure?: string;
  numAdult?: number;
  numChild?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
  price?: number;
  currency?: string;
  referer?: string;
  apiReference?: string;
  infoItems?: InfoItem[];
}

export interface InfoItem {
  code: string;
  text: string;
}

export interface Property {
  id?: number;
  name?: string;
  address?: string;
  city?: string;
  country?: string;
  currency?: string;
  timezone?: string;
  roomTypes?: RoomType[];
}

export interface RoomType {
  id?: number;
  name?: string;
  qty?: number;
  maxPeople?: number;
  minPrice?: number;
  currency?: string;
}

export interface CalendarDay {
  roomId: number;
  date: string;
  price1?: number;
  avail?: number;
  minStay?: number;
  maxStay?: number;
  closed?: boolean;
  closedOnArrival?: boolean;
  closedOnDeparture?: boolean;
}

export interface RoomOffer {
  roomId: number;
  roomName: string;
  price: number;
  currency: string;
  available: boolean;
}

export interface TokenInfo {
  token: string;
  refreshToken: string;
  expiresAt?: string;
}
