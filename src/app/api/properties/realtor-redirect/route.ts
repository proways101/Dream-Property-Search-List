import { NextRequest, NextResponse } from 'next/server';
import { resolveRealtorUrl } from '@/lib/realtorResolver';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address') || '';
  const city = searchParams.get('city') || '';
  const state = searchParams.get('state') || '';
  const zip = searchParams.get('zip') || '';

  if (!address && !city) {
    return NextResponse.redirect('https://www.realtor.com');
  }

  const targetUrl = await resolveRealtorUrl(address, city, state, zip);
  return NextResponse.redirect(targetUrl);
}
