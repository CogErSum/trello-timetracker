const API_BASE_URL = (window as any).__CONFIG__?.API_BASE_URL || '';

interface ApiOptions {
  method?: string;
  body?: unknown;
  memberId?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, memberId } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (memberId) {
    headers['X-Trello-Member-Id'] = memberId;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  timers: {
    start: (memberId: string, cardId: string) =>
      apiRequest('/api/v1/timers/start', {
        method: 'POST',
        memberId,
        body: { card_id: cardId },
      }),

    stop: (memberId: string) =>
      apiRequest('/api/v1/timers/stop', {
        method: 'POST',
        memberId,
      }),

    getActive: (memberId: string) =>
      apiRequest(`/api/v1/timers/active`, {
        memberId,
      }),
  },

  records: {
    list: (memberId: string, params?: { cardId?: string; dateFrom?: string; dateTo?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.cardId) searchParams.set('card_id', params.cardId);
      if (params?.dateFrom) searchParams.set('date_from', params.dateFrom);
      if (params?.dateTo) searchParams.set('date_to', params.dateTo);
      const query = searchParams.toString();
      return apiRequest(`/api/v1/records${query ? `?${query}` : ''}`, { memberId });
    },

    create: (memberId: string, data: { cardId: string; durationMin: number; date: string; comment?: string }) =>
      apiRequest('/api/v1/records', {
        method: 'POST',
        memberId,
        body: {
          card_id: data.cardId,
          duration_min: data.durationMin,
          date: data.date,
          comment: data.comment,
        },
      }),

    update: (memberId: string, recordId: string, data: { durationMin?: number; date?: string; comment?: string }) =>
      apiRequest(`/api/v1/records/${recordId}`, {
        method: 'PATCH',
        memberId,
        body: data,
      }),

    delete: (memberId: string, recordId: string) =>
      apiRequest(`/api/v1/records/${recordId}`, {
        method: 'DELETE',
        memberId,
      }),
  },

  dashboard: {
    get: (memberId: string) =>
      apiRequest('/api/v1/dashboard', { memberId }),
  },

  export: {
    download: (memberId: string, format: 'csv' | 'xlsx', params?: { cardId?: string; dateFrom?: string; dateTo?: string }) => {
      const searchParams = new URLSearchParams({ format, member_id: memberId });
      if (params?.cardId) searchParams.set('card_id', params.cardId);
      if (params?.dateFrom) searchParams.set('date_from', params.dateFrom);
      if (params?.dateTo) searchParams.set('date_to', params.dateTo);
      return `${API_BASE_URL}/api/v1/export?${searchParams.toString()}`;
    },
  },
};
