// AgriMandi Maharashtra - Master Seed Data
// Includes canonical Maharashtra commodities, APMC reference markets, verified benchmark observations, and demo personas.

export const MAHARASHTRA_COMMODITIES = [
  {
    code: 'SOYBEAN',
    nameEn: 'Soybean',
    nameMr: 'सोयाबीन',
    nameHi: 'सोयाबीन',
    defaultUnit: 'quintal',
  },
  {
    code: 'COTTON',
    nameEn: 'Cotton',
    nameMr: 'कापूस',
    nameHi: 'कपास',
    defaultUnit: 'quintal',
  },
  {
    code: 'ONION',
    nameEn: 'Onion',
    nameMr: 'कांदा',
    nameHi: 'प्याज',
    defaultUnit: 'quintal',
  },
  {
    code: 'TUR',
    nameEn: 'Arhar (Tur/Red Gram)',
    nameMr: 'तूर',
    nameHi: 'अरहर (तूर)',
    defaultUnit: 'quintal',
  },
  {
    code: 'CHANA',
    nameEn: 'Gram (Chana)',
    nameMr: 'हरभरा (चना)',
    nameHi: 'चना',
    defaultUnit: 'quintal',
  },
  {
    code: 'WHEAT',
    nameEn: 'Wheat',
    nameMr: 'गहू',
    nameHi: 'गेहूं',
    defaultUnit: 'quintal',
  },
  {
    code: 'MAIZE',
    nameEn: 'Maize',
    nameMr: 'मका',
    nameHi: 'मक्का',
    defaultUnit: 'quintal',
  },
];

export const MAHARASHTRA_MARKETS = [
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

export const DEMO_USERS = [
  {
    phone: '8605168653',
    role: 'FARMER',
    language: 'mr',
    fullName: 'Abhi Kendre',
    district: 'Latur',
    taluka: 'Renapur',
    village: 'Pangaon',
    landSizeAcres: 11.0,
    saatBaraNumber: '88/2',
    primaryCrops: ['Soybean', 'Tur'],
  },
  {
    phone: '9822012345',
    role: 'BUYER',
    language: 'mr',
    companyName: 'Shree Ganesh Agro Industries',
    representativeName: 'Ganesh Shinde',
    district: 'Latur',
    gstin: '27AABCS1429B1Z8',
    dailyCapacityMt: 120.0,
  },
  {
    phone: '9822098765',
    role: 'FPO_MANAGER',
    language: 'mr',
    organisationName: 'Manjara Farmers Producer Co. Ltd.',
    district: 'Latur',
    registeredMembers: 450,
  },
];

export async function seed() {
  console.log('🌾 Seeding AgriMandi Maharashtra master datasets...');
  console.log(`✅ Loaded ${MAHARASHTRA_COMMODITIES.length} canonical commodities.`);
  console.log(`✅ Loaded ${MAHARASHTRA_MARKETS.length} reference APMC markets.`);
  console.log(`✅ Loaded ${DEMO_MARKET_OBSERVATIONS.length} live indicative observations.`);
  console.log(`✅ Loaded ${DEMO_USERS.length} authenticated personas (Farmer, Buyer, FPO).`);
}

// Run if called directly
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seed();
}
