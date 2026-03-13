const API_BASE = "https://beds24.com/api/v2";

interface Beds24Error {
  error: string;
  message?: string;
}

interface TokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export class Beds24Client {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${API_BASE}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const headers: Record<string, string> = {
      token: this.token,
      "Content-Type": "application/json",
    };

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as Beds24Error;
      throw new Error(
        err.message || err.error || `Beds24 API error: ${res.status}`
      );
    }

    return res.json() as Promise<T>;
  }

  // === Authentication ===

  static async setup(inviteCode: string): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE}/authentication/setup`, {
      headers: { code: inviteCode },
    });
    if (!res.ok) {
      throw new Error(`Setup failed: ${res.status}`);
    }
    return res.json();
  }

  static async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE}/authentication/token`, {
      headers: { refreshToken },
    });
    if (!res.ok) {
      throw new Error(`Token refresh failed: ${res.status}`);
    }
    return res.json();
  }

  static async getTokenDetails(token: string) {
    const res = await fetch(`${API_BASE}/authentication/details`, {
      headers: { token },
    });
    if (!res.ok) {
      throw new Error(`Token details failed: ${res.status}`);
    }
    return res.json();
  }

  // === Bookings ===

  async getBookings(filters?: Record<string, string>) {
    return this.request("GET", "/bookings", undefined, filters);
  }

  async getBooking(id: string) {
    return this.request("GET", "/bookings", undefined, { id });
  }

  async createBooking(booking: unknown) {
    return this.request("POST", "/bookings", [booking]);
  }

  async updateBooking(booking: unknown) {
    return this.request("POST", "/bookings", [booking]);
  }

  async deleteBooking(id: string) {
    return this.request("DELETE", "/bookings", undefined, { id });
  }

  // === Properties ===

  async getProperties(params?: Record<string, string>) {
    return this.request("GET", "/properties", undefined, params);
  }

  async createProperty(property: unknown) {
    return this.request("POST", "/properties", [property]);
  }

  // === Inventory ===

  async getRoomOffers(params: Record<string, string>) {
    return this.request("GET", "/inventory/rooms/offers", undefined, params);
  }

  async getRoomAvailability(params: Record<string, string>) {
    return this.request(
      "GET",
      "/inventory/rooms/availability",
      undefined,
      params
    );
  }

  async getCalendar(params: Record<string, string>) {
    return this.request(
      "GET",
      "/inventory/rooms/calendar",
      undefined,
      params
    );
  }

  async updateCalendar(data: unknown) {
    return this.request("POST", "/inventory/rooms/calendar", data);
  }

  // === Booking Messages ===

  async getMessages(params?: Record<string, string>) {
    return this.request("GET", "/bookings/messages", undefined, params);
  }

  async sendMessage(message: unknown) {
    return this.request("POST", "/bookings/messages", message);
  }
}
