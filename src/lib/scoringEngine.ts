import { PropertyListing, ScoredProperty, SearchCriteria, ScoreFactor } from '@/types';
import { calculateMonthlyCost } from './affordability';

/**
 * Calculates geographic distance in miles between two coordinates (Haversine formula)
 */
export function calculateDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function scoreProperty(
  property: PropertyListing, 
  criteria: SearchCriteria,
  centerCoords?: { lat: number; lng: number }
): ScoredProperty {
  const failReasons: string[] = [];
  const scoreBreakdown: ScoreFactor[] = [];
  const currentYear = new Date().getFullYear();

  // 1. HARD FILTERS
  // A. Affordability Ceiling (handles both Buy and Rent)
  const isRent = criteria.intent === 'rent';
  const effectiveCeiling = isRent 
    ? (criteria.maxMonthlyMortgage || 3000)
    : (criteria.calculatedMaxPrice || 500000);

  if (property.price > effectiveCeiling) {
    failReasons.push(
      isRent 
        ? `Rent ($${property.price.toLocaleString()}/mo) exceeds rental budget of $${effectiveCeiling.toLocaleString()}/mo`
        : `Price ($${property.price.toLocaleString()}) exceeds budget ceiling of $${effectiveCeiling.toLocaleString()}`
    );
  }

  // B. Photos Requirement
  if (!property.photos || property.photos.length === 0) {
    failReasons.push('Listing has no verified photos');
  }

  // C. Bedrooms Minimum
  if (criteria.bedrooms > 0 && property.bedrooms < criteria.bedrooms) {
    failReasons.push(`Has ${property.bedrooms} beds; minimum requested is ${criteria.bedrooms}`);
  }

  // D. Bathrooms Minimum
  if (criteria.bathrooms > 0 && property.bathrooms < criteria.bathrooms) {
    failReasons.push(`Has ${property.bathrooms} baths; minimum requested is ${criteria.bathrooms}`);
  }

  // E. Minimum Square Feet
  if (criteria.minSqFt > 0 && property.sqft < criteria.minSqFt) {
    failReasons.push(`Square footage (${property.sqft}) is under minimum ${criteria.minSqFt}`);
  }

  // F. House Type
  if (criteria.houseTypes && criteria.houseTypes.length > 0 && !criteria.houseTypes.includes(property.propertyType)) {
    failReasons.push(`Property type ${property.propertyType} not in selected types`);
  }

  // G. Dynamic Radius check from searched city center
  if (centerCoords && centerCoords.lat && centerCoords.lng && property.lat && property.lng) {
    const dist = calculateDistanceMiles(centerCoords.lat, centerCoords.lng, property.lat, property.lng);
    // Allow a 25% margin for city/postal borders
    const maxRadius = Math.max(criteria.radiusMiles, 10) * 1.25;
    if (dist > maxRadius) {
      failReasons.push(`Located ${dist.toFixed(1)} miles away, exceeds radius ${criteria.radiusMiles} mi`);
    }
  }

  const passedHardFilters = failReasons.length === 0;

  // 2. SOFT PREFERENCES & WEIGHTAGE SCORING (Normalized 0 - 100%)
  const weights = criteria.weights || {
    schools: 25,
    commute: 25,
    safety: 20,
    homeAge: 15,
    recreation: 15,
  };
  const totalWeight = weights.schools + weights.commute + weights.safety + weights.homeAge + weights.recreation || 100;

  // Factor 1: Schools
  const schoolTarget = criteria.minSchoolRating || 6;
  const schoolPassed = property.schoolRating >= schoolTarget;
  let schoolFraction = 0;
  if (property.schoolRating >= schoolTarget) {
    schoolFraction = 1.0;
  } else {
    schoolFraction = Math.max(0, property.schoolRating / schoolTarget);
  }
  const schoolPoints = (weights.schools / totalWeight) * 100 * schoolFraction;
  scoreBreakdown.push({
    factor: 'School Rating',
    weight: weights.schools,
    score: Math.round(schoolPoints),
    reason: `Schools ${property.schoolRating}/10 ${schoolPassed ? '✓' : `(desired ${schoolTarget}+)`}`,
    passed: schoolPassed,
  });

  // Factor 2: Commute
  const commuteTarget = criteria.maxCommuteMinutes || 45;
  const commutePassed = property.commuteTimeMinutes <= commuteTarget;
  let commuteFraction = 0;
  if (commutePassed) {
    commuteFraction = 1.0;
  } else {
    const over = property.commuteTimeMinutes - commuteTarget;
    commuteFraction = Math.max(0, 1 - over / 30);
  }
  const commutePoints = (weights.commute / totalWeight) * 100 * commuteFraction;
  scoreBreakdown.push({
    factor: 'Commute Time',
    weight: weights.commute,
    score: Math.round(commutePoints),
    reason: `Commute ${property.commuteTimeMinutes} min ${commutePassed ? '✓' : `(limit ${commuteTarget}m)`}`,
    passed: commutePassed,
  });

  // Factor 3: Safety Score
  const safetyTarget = criteria.minSafetyScore || 60;
  const safetyPassed = property.safetyScore >= safetyTarget;
  const safetyFraction = property.safetyScore >= safetyTarget ? 1.0 : property.safetyScore / safetyTarget;
  const safetyPoints = (weights.safety / totalWeight) * 100 * safetyFraction;
  scoreBreakdown.push({
    factor: 'Neighborhood Safety',
    weight: weights.safety,
    score: Math.round(safetyPoints),
    reason: `Safety score ${property.safetyScore}/100 ${safetyPassed ? '✓' : `(goal ${safetyTarget})`}`,
    passed: safetyPassed,
  });

  // Factor 4: Home Age
  const propertyAge = Math.max(1, currentYear - property.yearBuilt);
  const maxAllowedAge = criteria.maxHomeAge || 20;
  const agePassed = propertyAge <= maxAllowedAge;
  let ageFraction = 1.0;
  if (propertyAge > maxAllowedAge) {
    const diff = propertyAge - maxAllowedAge;
    ageFraction = Math.max(0, 1 - diff / 25);
  }
  const agePoints = (weights.homeAge / totalWeight) * 100 * ageFraction;
  scoreBreakdown.push({
    factor: 'Home Age',
    weight: weights.homeAge,
    score: Math.round(agePoints),
    reason: `Built ${property.yearBuilt} (${propertyAge} yrs old) ${agePassed ? '✓' : `(preferred ≤ ${maxAllowedAge}y)`}`,
    passed: agePassed,
  });

  // Factor 5: Nearby Recreation
  const recPassed = !criteria.nearbyRecreation || property.hasParksNearby;
  const recFraction = recPassed ? 1.0 : 0.2;
  const recPoints = (weights.recreation / totalWeight) * 100 * recFraction;
  scoreBreakdown.push({
    factor: 'Parks & Recreation',
    weight: weights.recreation,
    score: Math.round(recPoints),
    reason: property.hasParksNearby ? 'Parks & trails within 2 mi ✓' : 'No major parks within 2 mi',
    passed: recPassed,
  });

  const rawScore = schoolPoints + commutePoints + safetyPoints + agePoints + recPoints;
  const dreamScore = Math.min(100, Math.round(rawScore));

  let tier: 'DREAM' | 'GOOD' | 'OKAY' = 'OKAY';
  if (dreamScore >= 90) {
    tier = 'DREAM';
  } else if (dreamScore >= 80) {
    tier = 'GOOD';
  } else {
    tier = 'OKAY';
  }

  // Monthly carrying cost calculation
  const monthlyCost = isRent
    ? property.price
    : calculateMonthlyCost(
        property.price,
        criteria.downPayment,
        criteria.creditScore
      ).totalMonthly;

  return {
    ...property,
    dreamScore,
    tier,
    passedHardFilters,
    hardFilterFailReasons: failReasons,
    scoreBreakdown,
    estimatedMonthlyPayment: monthlyCost,
  };
}

export function filterAndScoreProperties(
  properties: PropertyListing[],
  criteria: SearchCriteria,
  minDreamScoreThreshold: number = 80 // Default to 80% as requested by user
): ScoredProperty[] {
  // Calculate dynamic search center from the properties
  let centerCoords: { lat: number; lng: number } | undefined = undefined;
  if (properties.length > 0) {
    const matchingProps = properties.filter(p => 
      p.city?.toLowerCase() === criteria.city?.toLowerCase() ||
      p.state?.toLowerCase() === criteria.state?.toLowerCase()
    );
    const targetSet = matchingProps.length > 0 ? matchingProps : properties;
    const avgLat = targetSet.reduce((sum, p) => sum + (p.lat || 0), 0) / targetSet.length;
    const avgLng = targetSet.reduce((sum, p) => sum + (p.lng || 0), 0) / targetSet.length;
    centerCoords = { lat: avgLat, lng: avgLng };
  }

  const scored = properties.map(p => scoreProperty(p, criteria, centerCoords));

  // 1. Properties that pass all hard filters
  const passingHardFilters = scored.filter(p => p.passedHardFilters);

  // 2. Passing properties meeting requested score threshold (e.g. >= 80%)
  const meetingThreshold = passingHardFilters.filter(p => p.dreamScore >= minDreamScoreThreshold);
  if (meetingThreshold.length > 0) {
    return meetingThreshold.sort((a, b) => b.dreamScore - a.dreamScore);
  }

  // 3. If none meet >= 80% but some pass hard filters (e.g. 70-79%), return them!
  if (passingHardFilters.length > 0) {
    return passingHardFilters.sort((a, b) => b.dreamScore - a.dreamScore);
  }

  // 4. If all properties failed hard filters (e.g. budget ceiling was lower than the city's available inventory),
  // return the closest properties in price and score so the user can see what is available!
  return scored
    .sort((a, b) => {
      // Sort primarily by price proximity, secondarily by score
      const priceDiffA = Math.abs(a.price - criteria.calculatedMaxPrice);
      const priceDiffB = Math.abs(b.price - criteria.calculatedMaxPrice);
      return priceDiffA - priceDiffB || b.dreamScore - a.dreamScore;
    })
    .slice(0, 15);
}
