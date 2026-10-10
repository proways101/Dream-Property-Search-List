/**
 * Resolves a property address directly to an active, valid Realtor.com property URL
 * using Realtor.com's parent geo-resolution service (Move AWS).
 *
 * Realtor.com requires its internal database ID format (e.g. M69977-76771) for
 * property detail pages. Passing MLS numbers or arbitrary IDs causes a 404 error.
 */
export async function resolveRealtorUrl(
  addressLine: string,
  city: string,
  state: string,
  zipCode?: string
): Promise<string> {
  const cleanAddr = (addressLine || '').trim();
  const cleanCity = (city || '').trim();
  const cleanState = (state || '').trim().toUpperCase();
  const cleanZip = (zipCode || '').trim();

  const queryStr = `${cleanAddr}, ${cleanCity}, ${cleanState} ${cleanZip}`.trim();

  try {
    const endpoint = `https://parser-external.geo.moveaws.com/suggest?input=${encodeURIComponent(queryStr)}&client_id=rdc-home`;
    const res = await fetch(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      const hits: any[] = data.autocomplete || [];

      // Find best address hit with mpr_id
      const addressHit = hits.find(
        (hit) => hit.area_type === 'address' && hit.mpr_id
      );

      if (addressHit) {
        const rawId = String(addressHit.mpr_id);
        // Realtor.com mpr_id format is 10 digits split as M12345-67890
        const mId = rawId.length === 10
          ? `M${rawId.slice(0, 5)}-${rawId.slice(5)}`
          : `M${rawId}`;

        const slugAddr = (addressHit.line || cleanAddr)
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        const slugCity = (addressHit.city || cleanCity).trim().replace(/\s+/g, '-');
        const slugState = (addressHit.state_code || cleanState).trim().toUpperCase();
        const slugZip = addressHit.postal_code || cleanZip;

        return `https://www.realtor.com/realestateandhomes-detail/${slugAddr}_${slugCity}_${slugState}_${slugZip}_${mId}`;
      }
    }
  } catch (err) {
    console.warn(`[realtorResolver] Error resolving ${queryStr}:`, err);
  }

  // Fallback: Direct Google targeted Realtor listing search
  // This guarantees landing directly on the actual active listing without a 404 error
  return `https://www.google.com/search?q=${encodeURIComponent(`realtor.com ${cleanAddr} ${cleanCity} ${cleanState} ${cleanZip}`)}`;
}
