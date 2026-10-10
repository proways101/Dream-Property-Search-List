export type PersonaType = 'family' | 'first_time' | 'relocating' | 'investor' | 'retiree' | 'custom';

export type HouseType = 'Single Family' | 'Townhouse' | 'Condo' | 'Multi-Family';

export interface SearchCriteria {
  id?: string;
  name?: string;
  // Train Stop 1: Location & Region
  state: string;
  city: string;
  zipCode: string;
  radiusMiles: number;

  // Train Stop 2: Lifestyle Persona (Branching Trigger)
  persona: PersonaType;

  // Train Stop 3: Persona Branch Specific
  familyPriorities?: {
    mustHaveYard: boolean;
    quietStreet: boolean;
    schoolImportance: number; // 1-10
  };
  commutePriorities?: {
    workAddress: string;
    maxCommuteMinutes: number;
    highwayAccess: boolean;
  };
  investorPriorities?: {
    strategy: 'cashflow' | 'appreciation' | 'turnkey';
    hoaTolerance: 'none' | 'low' | 'any';
  };
  retireePriorities?: {
    singleStoryOnly: boolean;
    lowMaintenance: boolean;
    peacefulArea: boolean;
  };
  firstTimePriorities?: {
    moveInReady: boolean;
    downPaymentAssistance: boolean;
  };

  // Train Stop 4: Affordability Engine (Specification Formula)
  downPayment: number;
  monthlyIncome: number;
  maxMonthlyMortgage: number;
  creditScore: number;
  calculatedMaxPrice: number;

  // Train Stop 5: Property Hard Filters
  bedrooms: number;
  bathrooms: number;
  minSqFt: number;
  houseTypes: HouseType[];
  maxHomeAge: number;

  // Train Stop 6: Lifestyle Soft Preferences & Weightage
  minSchoolRating: number;
  maxCommuteMinutes: number;
  workAddress: string;
  nearbyRecreation: boolean;
  minSafetyScore: number;
  poolPreferred: boolean;

  // Weights for criteria scoring (sums to 100)
  weights: {
    schools: number;
    commute: number;
    safety: number;
    homeAge: number;
    recreation: number;
  };

  // Offline Search & Notify
  offlineSearchNotify: boolean;
  userEmail: string;
}

export interface PropertyListing {
  id: string;
  mlsNumber: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSizeSqft?: number;
  yearBuilt: number;
  propertyType: HouseType;
  daysOnMarket: number;
  schoolRating: number; // 1-10
  safetyScore: number; // 0-100
  commuteTimeMinutes: number;
  hasParksNearby: boolean;
  hasPool: boolean;
  isSingleStory: boolean;
  annualTax?: number;
  hoaMonthly?: number;
  photos: string[];
  realtorUrl: string;
  description: string;
}

export interface ScoreFactor {
  factor: string;
  weight: number;
  score: number;
  reason: string;
  passed: boolean;
}

export interface ScoredProperty extends PropertyListing {
  dreamScore: number; // 0-100%
  tier: 'DREAM' | 'GOOD' | 'OKAY';
  passedHardFilters: boolean;
  hardFilterFailReasons: string[];
  scoreBreakdown: ScoreFactor[];
  estimatedMonthlyPayment: number;
}

export interface UserProfile {
  email: string;
  name: string;
  picture?: string;
  provider: 'google';
}

export interface SavedSearchItem {
  id: string;
  name: string;
  createdAt: string;
  userEmail: string;
  criteria: SearchCriteria;
  matchedCount: number;
  dreamCount: number;
}
