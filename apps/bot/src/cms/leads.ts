export type LeadStatus = 'new' | 'in-progress' | 'won' | 'lost';

export type LeadSummary = {
  id: string;
  status: LeadStatus;
  type: string | null;
  name: string | null;
  phone: string | null;
  createdAt: string;
};

export type LeadDetail = LeadSummary & {
  email: string | null;
  message: string | null;
  request: {
    budget?: string | null;
    budgetCurrency?: string | null;
    origin?: string | null;
    carType?: string | null;
    carBrand?: string | null;
    otherCity?: boolean | null;
    deliveryCity?: string | null;
    priceRange?: string | null;
    addons?: string | null;
    expectedPrice?: string | null;
  } | null;
  source: string | null;
  consent: boolean | null;
  utm: {
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
  } | null;
  readAt: string | null;
  updatedAt: string;
};

export type LeadListQuery = {
  telegramId: string;
  page?: number;
  limit?: number;
  q?: string;
  status?: LeadStatus;
  type?: string;
  origin?: string;
  carBrand?: string;
  datePreset?: string;
};

export type LeadListResult = {
  page: number;
  limit: number;
  totalDocs: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  docs: LeadSummary[];
};
