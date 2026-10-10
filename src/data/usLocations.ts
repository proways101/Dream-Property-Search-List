export interface USState {
  code: string;
  name: string;
}

export const ALL_US_STATES_AND_TERRITORIES: USState[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  // Territories
  { code: 'AS', name: 'American Samoa' },
  { code: 'GU', name: 'Guam' },
  { code: 'MP', name: 'Northern Mariana Islands' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'VI', name: 'U.S. Virgin Islands' },
];

export const US_CITIES_BY_STATE: Record<string, string[]> = {
  TX: [
    'Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi',
    'Plano', 'Lubbock', 'Irving', 'Laredo', 'Garland', 'Frisco', 'McKinney', 'Amarillo', 'Grand Prairie',
    'Brownsville', 'Killeen', 'Pasadena', 'Mesquite', 'McAllen', 'Denton', 'Waco', 'Carrollton',
    'Round Rock', 'Abilene', 'Pearland', 'College Station', 'Richardson', 'League City', 'Lewisville',
    'Tyler', 'Wichita Falls', 'Edinburg', 'Midland', 'San Angelo', 'Allen', 'Sugar Land', 'Cedar Park',
    'Pflugerville', 'Georgetown', 'Bee Cave', 'Lakeway', 'Buda', 'Kyle', 'San Marcos', 'New Braunfels',
    'Conroe', 'The Woodlands', 'Sugar Land', 'Baytown', 'Beaumont', 'Midland', 'Odessa'
  ],
  CA: [
    'Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach',
    'Oakland', 'Bakersfield', 'Anaheim', 'Stockton', 'Riverside', 'Irvine', 'Santa Ana', 'Chula Vista',
    'Fremont', 'Santa Clarita', 'San Bernardino', 'Modesto', 'Fontana', 'Moreno Valley', 'Oxnard',
    'Huntington Beach', 'Glendale', 'Santa Rosa', 'Oceanside', 'Rancho Cucamonga', 'Ontario', 'Lancaster',
    'Palo Alto', 'Mountain View', 'Sunnyvale', 'Pasadena', 'Berkeley', 'Santa Barbara', 'Newport Beach'
  ],
  FL: [
    'Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Port St. Lucie',
    'Cape Coral', 'Tallahassee', 'Fort Lauderdale', 'Pembroke Pines', 'Hollywood', 'Gainesville',
    'Miramar', 'Coral Springs', 'Palm Bay', 'West Palm Beach', 'Clearwater', 'Lakeland', 'Pompano Beach',
    'Miami Beach', 'Boca Raton', 'Sarasota', 'Bradenton', 'Naples', 'Fort Myers', 'Daytona Beach'
  ],
  NY: [
    'New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon',
    'Schenectady', 'Utica', 'White Plains', 'Hempstead', 'Troy', 'Niagara Falls', 'Binghamton',
    'Freeport', 'Valley Stream', 'Long Beach', 'Ithaca', 'Poughkeepsie', 'Newburgh', 'Saratoga Springs'
  ],
  WA: [
    'Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton', 'Spokane Valley',
    'Federal Way', 'Yakima', 'Kirkland', 'Bellingham', 'Kennewick', 'Auburn', 'Pasco', 'Marysville',
    'Lakewood', 'Redmond', 'Shoreline', 'Richland', 'Olympia', 'Lacey', 'Edmonds', 'Bremerton', 'Puyallup'
  ],
  NC: [
    'Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington',
    'High Point', 'Concord', 'Asheville', 'Greenville', 'Gastonia', 'Apex', 'Jacksonville', 'Chapel Hill',
    'Huntersville', 'Burlington', 'Kannapolis', 'Wake Forest', 'Rocky Mount', 'Mooresville', 'Wilson'
  ],
  GA: [
    'Atlanta', 'Augusta', 'Columbus', 'Macon', 'Savannah', 'Athens', 'Sandy Springs', 'South Fulton',
    'Roswell', 'Johns Creek', 'Warner Robins', 'Albany', 'Alpharetta', 'Marietta', 'Stonecrest', 'Smyrna',
    'Valdosta', 'Dunwoody', 'Gainesville', 'Peachtree Corners', 'Newnan', 'Milton', 'Brookhaven', 'Kennesaw'
  ],
  IL: [
    'Chicago', 'Aurora', 'Joliet', 'Naperville', 'Rockford', 'Elgin', 'Springfield', 'Peoria', 'Champaign',
    'Waukegan', 'Cicero', 'Bloomington', 'Arlington Heights', 'Evanston', 'Decatur', 'Schaumburg',
    'Bolingbrook', 'Palatine', 'Skokie', 'Des Plaines', 'Orland Park', 'Tinley Park', 'Oak Lawn', 'Berwyn'
  ],
  CO: [
    'Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton', 'Arvada', 'Westminster',
    'Pueblo', 'Greeley', 'Centennial', 'Boulder', 'Longmont', 'Loveland', 'Broomfield', 'Castle Rock',
    'Commerce City', 'Parker', 'Littleton', 'Brighton', 'Northglenn', 'Englewood', 'Wheat Ridge', 'Golden'
  ],
  AZ: [
    'Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Gilbert', 'Tempe', 'Peoria',
    'Surprise', 'Yuma', 'Avondale', 'Goodyear', 'Flagstaff', 'Buckeye', 'Lake Havasu City', 'Casa Grande',
    'Maricopa', 'Oro Valley', 'Sierra Vista', 'Prescott', 'Bullhead City', 'Apache Junction', 'Queen Creek'
  ],
  OH: [
    'Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton', 'Youngstown',
    'Lorain', 'Hamilton', 'Springfield', 'Kettering', 'Elyria', 'Lakewood', 'Cuyahoga Falls', 'Euclid',
    'Middletown', 'Mansfield', 'Newark', 'Mentor', 'Cleveland Heights', 'Beavercreek', 'Strongsville', 'Dublin'
  ],
  PA: [
    'Philadelphia', 'Pittsburgh', 'Allentown', 'Reading', 'Erie', 'Upper Darby', 'Scranton', 'Bethlehem',
    'Bensalem', 'Lancaster', 'Lower Merion', 'Millcreek', 'Abington', 'Norristown', 'Chester', 'Penn Hills',
    'Harrisburg', 'Haverford', 'York', 'State College', 'Wilkes-Barre', 'Altoona', 'Hempfield', 'Lower Paxton'
  ],
  VA: [
    'Virginia Beach', 'Chesapeake', 'Norfolk', 'Richmond', 'Newport News', 'Alexandria', 'Hampton',
    'Roanoke', 'Portsmouth', 'Suffolk', 'Lynchburg', 'Harrisonburg', 'Charlottesville', 'Danville',
    'Manassas', 'Petersburg', 'Fredericksburg', 'Winchester', 'Salem', 'Staunton', 'Fairfax', 'Falls Church'
  ],
  MA: [
    'Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton', 'Quincy', 'Lynn', 'New Bedford',
    'Fall River', 'Newton', 'Lawrence', 'Somerville', 'Framingham', 'Haverhill', 'Waltham', 'Malden',
    'Brookline', 'Plymouth', 'Medford', 'Taunton', 'Chicopee', 'Weymouth', 'Revere', 'Peabody', 'Methuen'
  ],
  NJ: [
    'Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Lakewood', 'Edison', 'Woodbridge', 'Toms River',
    'Hamilton', 'Trenton', 'Clifton', 'Cherry Hill', 'Brick', 'Camden', 'Bayonne', 'Passaic', 'Union City',
    'Franklin', 'Middletown', 'Old Bridge', 'Gloucester', 'East Orange', 'Bayonne', 'Hoboken', 'Princeton'
  ],
  MI: [
    'Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing', 'Dearborn', 'Livonia',
    'Troy', 'Westland', 'Flint', 'Farmington Hills', 'Kalamazoo', 'Wyoming', 'Southfield', 'Rochester Hills',
    'Taylor', 'Pontiac', 'St. Clair Shores', 'Royal Oak', 'Novi', 'Dearborn Heights', 'Battle Creek', 'Kentwood'
  ],
  TN: [
    'Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin', 'Johnson City',
    'Jackson', 'Hendersonville', 'Bartlett', 'Kingsport', 'Smyrna', 'Collierville', 'Cleveland', 'Brentwood',
    'Germantown', 'Columbia', 'Spring Hill', 'La Vergne', 'Gallatin', 'Cookeville', 'Oak Ridge', 'Maryville'
  ],
  IN: [
    'Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Fishers', 'Bloomington', 'Hammond',
    'Gary', 'Lafayette', 'Muncie', 'Noblesville', 'Terre Haute', 'Kokomo', 'Greenwood', 'Anderson', 'Elkhart',
    'Mishawaka', 'Lawrence', 'Jeffersonville', 'Columbus', 'Portage', 'Richmond', 'New Albany', 'Westfield'
  ],
  MO: [
    'Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence', 'Lee\'s Summit', 'O\'Fallon',
    'St. Joseph', 'St. Charles', 'Blue Springs', 'Chesterfield', 'Florissant', 'Jefferson City', 'Cape Girardeau',
    'Wildwood', 'University City', 'Ballwin', 'Liberty', 'Raymore', 'Kirkwood', 'Maryland Heights', 'Gladstone'
  ],
  MD: [
    'Baltimore', 'Columbia', 'Germantown', 'Silver Spring', 'Waldorf', 'Frederick', 'Ellicott City', 'Glen Burnie',
    'Gaithersburg', 'Rockville', 'Bethesda', 'Dundalk', 'Bowie', 'Towson', 'Aspen Hill', 'Wheaton',
    'Severn', 'Bethesda', 'Catonsville', 'Bel Air', 'Woodlawn', 'Annapolis', 'College Park', 'Salisbury'
  ],
  WI: [
    'Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha', 'Eau Claire', 'Oshkosh',
    'Janesville', 'West Allis', 'La Crosse', 'Sheboygan', 'Wauwatosa', 'Fond du Lac', 'Brookfield', 'New Berlin',
    'Wausau', 'Beloit', 'Greenfield', 'Menomonee Falls', 'Franklin', 'Oak Creek', 'Sun Prairie', 'Manitowoc'
  ],
  MN: [
    'Minneapolis', 'St. Paul', 'Rochester', 'Bloomington', 'Duluth', 'Brooklyn Park', 'Plymouth', 'Woodbury',
    'Lakeville', 'Blaine', 'Maple Grove', 'St. Cloud', 'Eagan', 'Burnsville', 'Eden Prairie', 'Coon Rapids',
    'Apple Valley', 'Minnetonka', 'Edina', 'St. Louis Park', 'Moorhead', 'Mankato', 'Maplewood', 'Shakopee'
  ],
  CO_DEFAULT: [
    'Denver', 'Boulder', 'Colorado Springs', 'Fort Collins', 'Aurora', 'Lakewood', 'Vail', 'Aspen'
  ]
};

// Default fallback list of major metropolitan hubs for remaining states
const COMMON_US_CITIES = [
  'Springfield', 'Franklin', 'Clinton', 'Greenville', 'Bristol', 'Fairview', 'Salem', 'Madison',
  'Georgetown', 'Arlington', 'Ashland', 'Burlington', 'Manchester', 'Oxford', 'Jackson', 'Milford'
];

export function getCitiesForState(stateCode: string, query: string = ''): string[] {
  const normalizedState = stateCode.toUpperCase();
  const list = US_CITIES_BY_STATE[normalizedState] || [
    ...COMMON_US_CITIES.map(c => `${c}`),
    'Capital City',
    'Metro Center'
  ];

  if (!query || query.trim() === '') {
    return list.slice(0, 20);
  }

  const cleanQuery = query.trim().toLowerCase();
  const filtered = list.filter(city => city.toLowerCase().includes(cleanQuery));

  // If user typed something not yet in the common dictionary, allow that as an option
  if (cleanQuery.length > 1 && !filtered.some(c => c.toLowerCase() === cleanQuery)) {
    const formatted = query.charAt(0).toUpperCase() + query.slice(1);
    return [formatted, ...filtered].slice(0, 20);
  }

  return filtered.slice(0, 20);
}
