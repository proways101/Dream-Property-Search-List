import { SearchCriteria, PersonaType } from '@/types';
import { calculateMaxHomePrice } from './affordability';

export interface TrainStopDefinition {
  id: string;
  stepNumber: number;
  title: string;
  shortLabel: string;
  subtitle: string;
  iconName: string;
  isDynamicBranch?: boolean;
}

export const TRAIN_STOPS: TrainStopDefinition[] = [
  {
    id: 'origin_location',
    stepNumber: 1,
    title: 'Stop 1: Journey Origin & Geographic Perimeter',
    shortLabel: 'Location',
    subtitle: 'Where is your dream centered?',
    iconName: 'MapPin',
  },
  {
    id: 'lifestyle_persona',
    stepNumber: 2,
    title: 'Stop 2: Lifestyle Persona & Buyer DNA',
    shortLabel: 'Persona Fork',
    subtitle: 'Choose your journey path — dynamic branch ahead',
    iconName: 'GitFork',
  },
  {
    id: 'persona_branch',
    stepNumber: 3,
    title: 'Stop 3: Tailored Lifestyle Priorities',
    shortLabel: 'Tailored Needs',
    subtitle: 'Questions dynamically unlocked by your persona choice',
    iconName: 'Sparkles',
    isDynamicBranch: true,
  },
  {
    id: 'affordability_engine',
    stepNumber: 4,
    title: 'Stop 4: Affordability & True Price Ceiling',
    shortLabel: 'Affordability',
    subtitle: 'Calculated with exact Texas property tax, PMI, and 28% DTI cap',
    iconName: 'DollarSign',
  },
  {
    id: 'property_specs',
    stepNumber: 5,
    title: 'Stop 5: Property Structure & Hard Requirements',
    shortLabel: 'Home Specs',
    subtitle: 'Must-have bedrooms, baths, sq ft, and dwelling types',
    iconName: 'Home',
  },
  {
    id: 'lifestyle_weights',
    stepNumber: 6,
    title: 'Stop 6: Soft Preferences & Dream Weightage',
    shortLabel: 'Weights & Match',
    subtitle: 'Assign custom percentage weights to rank your dream score',
    iconName: 'Sliders',
  },
  {
    id: 'offline_notify',
    stepNumber: 7,
    title: 'Stop 7: Offline Search & Daily Dream Alerts',
    shortLabel: 'Offline Alert',
    subtitle: 'Automated daily MLS batch matching for 90%+ properties',
    iconName: 'Bell',
  },
];

export const DEFAULT_SEARCH_CRITERIA: SearchCriteria = {
  // Stop 1
  state: 'TX',
  city: 'Austin',
  zipCode: '',
  radiusMiles: 25,

  // Stop 2
  persona: 'family',

  // Stop 3 branches
  familyPriorities: {
    mustHaveYard: true,
    quietStreet: true,
    schoolImportance: 8,
  },
  commutePriorities: {
    workAddress: 'Downtown Austin / 500 W 2nd St',
    maxCommuteMinutes: 30,
    highwayAccess: true,
  },
  investorPriorities: {
    strategy: 'cashflow',
    hoaTolerance: 'low',
  },
  retireePriorities: {
    singleStoryOnly: true,
    lowMaintenance: true,
    peacefulArea: true,
  },
  firstTimePriorities: {
    moveInReady: true,
    downPaymentAssistance: false,
  },

  // Stop 4 Affordability Defaults from Specification
  downPayment: 50000,
  monthlyIncome: 8000,
  maxMonthlyMortgage: 3000,
  creditScore: 720,
  calculatedMaxPrice: 378000,

  // Stop 5 Defaults
  bedrooms: 3,
  bathrooms: 2,
  minSqFt: 1500,
  houseTypes: ['Single Family', 'Townhouse'],
  maxHomeAge: 20,

  // Stop 6 Soft Preferences
  minSchoolRating: 6,
  maxCommuteMinutes: 45,
  workAddress: 'Austin, TX',
  nearbyRecreation: true,
  minSafetyScore: 60,
  poolPreferred: false,

  // Soft weights (Default: balanced 100%)
  weights: {
    schools: 25,
    commute: 25,
    safety: 20,
    homeAge: 15,
    recreation: 15,
  },

  // Stop 7
  offlineSearchNotify: false,
  userEmail: '',
};

export function updateCriteriaAffordability(criteria: SearchCriteria): SearchCriteria {
  const { maxPrice } = calculateMaxHomePrice(
    criteria.downPayment,
    criteria.monthlyIncome,
    criteria.maxMonthlyMortgage,
    criteria.creditScore
  );
  return {
    ...criteria,
    calculatedMaxPrice: maxPrice,
  };
}
