import { NextRequest, NextResponse } from 'next/server';

export interface ZipcodePlace {
  city: string;
  state: string;
  stateAbbr: string;
  lat?: number;
  lng?: number;
}

// Built-in fast lookup fallback dictionary for key test zipcodes
const KNOWN_ZIP_LOOKUP: Record<string, ZipcodePlace[]> = {
  '78749': [{ city: 'Austin', state: 'Texas', stateAbbr: 'TX', lat: 30.2084, lng: -97.8542 }],
  '78745': [{ city: 'Austin', state: 'Texas', stateAbbr: 'TX', lat: 30.2195, lng: -97.8105 }],
  '78723': [{ city: 'Austin', state: 'Texas', stateAbbr: 'TX', lat: 30.3015, lng: -97.7050 }],
  '78613': [{ city: 'Cedar Park', state: 'Texas', stateAbbr: 'TX', lat: 30.5050, lng: -97.8200 }],
  '78681': [{ city: 'Round Rock', state: 'Texas', stateAbbr: 'TX', lat: 30.5180, lng: -97.6980 }],
  '78704': [{ city: 'Austin', state: 'Texas', stateAbbr: 'TX', lat: 30.2520, lng: -97.7710 }],
  '78746': [{ city: 'Austin', state: 'Texas', stateAbbr: 'TX', lat: 30.3150, lng: -97.8150 }],
  '78735': [{ city: 'Austin', state: 'Texas', stateAbbr: 'TX', lat: 30.2740, lng: -97.8340 }],
  '78721': [{ city: 'Austin', state: 'Texas', stateAbbr: 'TX', lat: 30.2710, lng: -97.6980 }],
  '78660': [{ city: 'Pflugerville', state: 'Texas', stateAbbr: 'TX', lat: 30.4560, lng: -97.6250 }],
  '90210': [{ city: 'Beverly Hills', state: 'California', stateAbbr: 'CA', lat: 34.0901, lng: -118.4065 }],
  '10001': [{ city: 'New York', state: 'New York', stateAbbr: 'NY', lat: 40.7501, lng: -73.9996 }],
  '98101': [{ city: 'Seattle', state: 'Washington', stateAbbr: 'WA', lat: 47.6101, lng: -122.3344 }],
  '33101': [{ city: 'Miami', state: 'Florida', stateAbbr: 'FL', lat: 25.7743, lng: -80.1937 }],
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get('zip')?.trim() || '';

  if (!zip || zip.length !== 5) {
    return NextResponse.json(
      { error: 'Please provide a valid 5-digit US zipcode' },
      { status: 400 }
    );
  }

  // Check built-in cache first
  if (KNOWN_ZIP_LOOKUP[zip]) {
    return NextResponse.json({
      success: true,
      zip,
      places: KNOWN_ZIP_LOOKUP[zip],
      source: 'local_cache'
    });
  }

  // Query live postal API: api.zippopotam.us
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`https://api.zippopotam.us/us/${zip}`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'DreamPropertySearch/1.0' },
      next: { revalidate: 86400 } // cache 24h
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const places: ZipcodePlace[] = (data.places || []).map((p: any) => ({
        city: p['place name'],
        state: p['state'],
        stateAbbr: p['state abbreviation'],
        lat: parseFloat(p['latitude']),
        lng: parseFloat(p['longitude']),
      }));

      return NextResponse.json({
        success: true,
        zip,
        places,
        source: 'zippopotam_api'
      });
    }
  } catch (err) {
    console.warn(`Zipcode API fetch failed for ${zip}:`, err);
  }

  // Fallback if not found or network offline
  return NextResponse.json({
    success: false,
    zip,
    places: [],
    message: `Zipcode ${zip} could not be resolved automatically.`
  });
}
