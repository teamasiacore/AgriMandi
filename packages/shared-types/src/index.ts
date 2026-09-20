// =========================================================
// AgriMandi Domain Models & Enums
// =========================================================

export type UserRole =
  | 'FARMER'
  | 'FPO_MANAGER'
  | 'BUYER'
  | 'GRADER'
  | 'LOGISTICS_PROVIDER'
  | 'WAREHOUSE_OPERATOR'
  | 'GOVT_ADMIN'
  | 'PLATFORM_ADMIN';

export type LotStatus =
  | 'DRAFT'
  | 'READY_FOR_REVIEW'
  | 'PUBLISHED'
  | 'RESERVED'
  | 'SOLD'
  | 'CANCELLED';

export type OfferStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'VIEWED'
  | 'COUNTERED'
  | 'ACCEPTED'
  | 'EXPIRED'
  | 'REJECTED';

export type OrderStatus =
  | 'CREATED'
  | 'LOGISTICS_BOOKED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'QUALITY_ACCEPTED'
  | 'PAYMENT_PENDING'
  | 'PARTIALLY_PAID'
  | 'SETTLED'
  | 'DISPUTED'
  | 'RESOLVED'
  | 'CANCELLED';

export type GrievanceStatus =
  | 'OPEN'
  | 'ACKNOWLEDGED'
  | 'ASSIGNED'
  | 'INVESTIGATING'
  | 'RESOLUTION_PROPOSED'
  | 'RESOLVED'
  | 'APPEALED'
  | 'REVIEWED'
  | 'CLOSED';

export type PaymentStatus =
  | 'PROMISED'
  | 'DUE'
  | 'INITIATED'
  | 'PARTIAL'
  | 'CONFIRMED'
  | 'OVERDUE'
  | 'FAILED'
  | 'DISPUTED';

export type SupportedLanguage = 'mr' | 'hi' | 'en';

export interface MarketObservationDTO {
  id: string;
  source: string;
  sourceRecordId?: string;
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety?: string;
  grade?: string;
  minPrice: number;
  modalPrice: number;
  maxPrice: number;
  unit: string;
  arrivals?: number;
  observedAt: string;
  fetchedAt: string;
  dataStatus: 'CURRENT' | 'STALE' | 'FALLBACK';
  isIndicative: true;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    source?: string;
    lastUpdated?: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
    requestId?: string;
  };
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptimeSeconds: number;
}

export interface CommodityMaster {
  code: string;
  nameEn: string;
  nameMr: string;
  nameHi: string;
  defaultUnit: string;
}

export interface MarketMaster {
  name: string;
  district: string;
  taluka?: string;
  latitude: number;
  longitude: number;
}

export const MAHARASHTRA_COMMODITIES: CommodityMaster[] = [
  { code: 'SOYBEAN', nameEn: 'Soybean', nameMr: 'सोयाबीन', nameHi: 'सोयाबीन', defaultUnit: 'quintal' },
  { code: 'COTTON', nameEn: 'Cotton', nameMr: 'कापूस', nameHi: 'कपास', defaultUnit: 'quintal' },
  { code: 'ONION', nameEn: 'Onion', nameMr: 'कांदा', nameHi: 'प्याज', defaultUnit: 'quintal' },
  { code: 'TUR', nameEn: 'Arhar (Tur/Red Gram)', nameMr: 'तूर', nameHi: 'अरहर (तूर)', defaultUnit: 'quintal' },
  { code: 'CHANA', nameEn: 'Gram (Chana)', nameMr: 'हरभरा (चना)', nameHi: 'चना', defaultUnit: 'quintal' },
  { code: 'WHEAT', nameEn: 'Wheat', nameMr: 'गहू', nameHi: 'गेहूं', defaultUnit: 'quintal' },
  { code: 'MAIZE', nameEn: 'Maize', nameMr: 'मका', nameHi: 'मक्का', defaultUnit: 'quintal' },
];

export const MAHARASHTRA_MARKETS: MarketMaster[] = [
  { name: 'Latur APMC', district: 'Latur', taluka: 'Latur', latitude: 18.4088, longitude: 76.5604 },
  { name: 'Lasalgaon APMC', district: 'Nashik', taluka: 'Niphad', latitude: 20.1478, longitude: 74.2259 },
  { name: 'Solapur APMC', district: 'Solapur', taluka: 'Solapur North', latitude: 17.6599, longitude: 75.9064 },
  { name: 'Jalna APMC', district: 'Jalna', taluka: 'Jalna', latitude: 19.841, longitude: 75.8864 },
  { name: 'Akola APMC', district: 'Akola', taluka: 'Akola', latitude: 20.7002, longitude: 77.0082 },
  { name: 'Pune (Gultekdi) APMC', district: 'Pune', taluka: 'Haveli', latitude: 18.4967, longitude: 73.8647 },
  { name: 'Ahmednagar APMC', district: 'Ahmednagar', taluka: 'Nagar', latitude: 19.0952, longitude: 74.7496 },
  { name: 'Nagpur APMC', district: 'Nagpur', taluka: 'Nagpur', latitude: 21.1458, longitude: 79.0882 },
  { name: 'Yavatmal APMC', district: 'Yavatmal', taluka: 'Yavatmal', latitude: 20.3888, longitude: 78.1204 },
  { name: 'Nanded APMC', district: 'Nanded', taluka: 'Nanded', latitude: 19.1383, longitude: 77.321 },
];

export const DEMO_MARKET_OBSERVATIONS = [
  {
    source: 'AGMARKNET',
    state: 'Maharashtra',
    district: 'Latur',
    marketName: 'Latur APMC',
    commodityCode: 'SOYBEAN',
    commodityRaw: 'Soyabean',
    variety: 'Yellow',
    grade: 'FAQ',
    minPrice: 4620,
    modalPrice: 4850,
    maxPrice: 4940,
    arrivals: 1250,
    unit: 'quintal',
  },
  {
    source: 'AGMARKNET',
    state: 'Maharashtra',
    district: 'Nashik',
    marketName: 'Lasalgaon APMC',
    commodityCode: 'ONION',
    commodityRaw: 'Onion',
    variety: 'Red',
    grade: 'FAQ',
    minPrice: 1850,
    modalPrice: 2450,
    maxPrice: 2750,
    arrivals: 3400,
    unit: 'quintal',
  },
  {
    source: 'AGMARKNET',
    state: 'Maharashtra',
    district: 'Jalna',
    marketName: 'Jalna APMC',
    commodityCode: 'COTTON',
    commodityRaw: 'Cotton',
    variety: 'Medium Staple',
    grade: 'Grade A',
    minPrice: 6900,
    modalPrice: 7250,
    maxPrice: 7450,
    arrivals: 850,
    unit: 'quintal',
  },
  {
    source: 'AGMARKNET',
    state: 'Maharashtra',
    district: 'Latur',
    marketName: 'Latur APMC',
    commodityCode: 'TUR',
    commodityRaw: 'Arhar (Tur/Red Gram)',
    variety: 'White',
    grade: 'FAQ',
    minPrice: 9400,
    modalPrice: 10100,
    maxPrice: 10450,
    arrivals: 420,
    unit: 'quintal',
  },
];
