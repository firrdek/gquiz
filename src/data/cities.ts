export interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

// Well-known world cities. Used for the daily city quiz.
export const cities: City[] = [
  // Europe
  { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lon: 18.0686 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.405 },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964 },
  { name: 'Oslo', country: 'Norway', lat: 59.9139, lon: 10.7522 },
  { name: 'Helsinki', country: 'Finland', lat: 60.1699, lon: 24.9384 },
  { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lon: 12.5683 },
  { name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lon: -21.9426 },
  { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lon: -9.1393 },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041 },
  { name: 'Brussels', country: 'Belgium', lat: 50.8503, lon: 4.3517 },
  { name: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738 },
  { name: 'Prague', country: 'Czech Republic', lat: 50.0755, lon: 14.4378 },
  { name: 'Warsaw', country: 'Poland', lat: 52.2297, lon: 21.0122 },
  { name: 'Athens', country: 'Greece', lat: 37.9838, lon: 23.7275 },
  { name: 'Budapest', country: 'Hungary', lat: 47.4979, lon: 19.0402 },
  { name: 'Dublin', country: 'Ireland', lat: 53.3498, lon: -6.2603 },
  { name: 'Bucharest', country: 'Romania', lat: 44.4268, lon: 26.1025 },
  { name: 'Belgrade', country: 'Serbia', lat: 44.7866, lon: 20.4489 },
  { name: 'Zagreb', country: 'Croatia', lat: 45.815, lon: 15.9819 },
  { name: 'Zürich', country: 'Switzerland', lat: 47.3769, lon: 8.5417 },
  { name: 'Moscow', country: 'Russia', lat: 55.7558, lon: 37.6173 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784 },

  // Asia
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074 },
  { name: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737 },
  { name: 'Hong Kong', country: 'China', lat: 22.3193, lon: 114.1694 },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.978 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018 },
  { name: 'Mumbai', country: 'India', lat: 19.076, lon: 72.8777 },
  { name: 'New Delhi', country: 'India', lat: 28.6139, lon: 77.209 },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708 },
  { name: 'Jerusalem', country: 'Israel', lat: 31.7683, lon: 35.2137 },
  { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lon: 46.6753 },
  { name: 'Tehran', country: 'Iran', lat: 35.6892, lon: 51.389 },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lon: 106.8456 },
  { name: 'Manila', country: 'Philippines', lat: 14.5995, lon: 120.9842 },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.139, lon: 101.6869 },
  { name: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.8231, lon: 106.6297 },
  { name: 'Hanoi', country: 'Vietnam', lat: 21.0278, lon: 105.8342 },
  { name: 'Taipei', country: 'Taiwan', lat: 25.033, lon: 121.5654 },
  { name: 'Kathmandu', country: 'Nepal', lat: 27.7172, lon: 85.324 },
  { name: 'Tashkent', country: 'Uzbekistan', lat: 41.2995, lon: 69.2401 },
  { name: 'Ulaanbaatar', country: 'Mongolia', lat: 47.8864, lon: 106.9057 },

  // Africa
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357 },
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lon: 3.3792 },
  { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219 },
  { name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lon: 28.0473 },
  { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lon: 18.4241 },
  { name: 'Casablanca', country: 'Morocco', lat: 33.5731, lon: -7.5898 },
  { name: 'Accra', country: 'Ghana', lat: 5.6037, lon: -0.187 },
  { name: 'Addis Ababa', country: 'Ethiopia', lat: 9.0192, lon: 38.7469 },
  { name: 'Algiers', country: 'Algeria', lat: 36.7538, lon: 3.0588 },
  { name: 'Tunis', country: 'Tunisia', lat: 36.8065, lon: 10.1815 },
  { name: 'Dakar', country: 'Senegal', lat: 14.7167, lon: -17.4677 },
  { name: 'Khartoum', country: 'Sudan', lat: 15.5007, lon: 32.5599 },

  // North America
  { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.006 },
  { name: 'Los Angeles', country: 'USA', lat: 34.0522, lon: -118.2437 },
  { name: 'Chicago', country: 'USA', lat: 41.8781, lon: -87.6298 },
  { name: 'San Francisco', country: 'USA', lat: 37.7749, lon: -122.4194 },
  { name: 'Washington D.C.', country: 'USA', lat: 38.9072, lon: -77.0369 },
  { name: 'Miami', country: 'USA', lat: 25.7617, lon: -80.1918 },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832 },
  { name: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207 },
  { name: 'Montréal', country: 'Canada', lat: 45.5017, lon: -73.5673 },
  { name: 'Havana', country: 'Cuba', lat: 23.1136, lon: -82.3666 },
  { name: 'Anchorage', country: 'USA', lat: 61.2181, lon: -149.9003 },

  // South America
  { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333 },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729 },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816 },
  { name: 'Lima', country: 'Peru', lat: -12.0464, lon: -77.0428 },
  { name: 'Bogotá', country: 'Colombia', lat: 4.711, lon: -74.0721 },
  { name: 'Santiago', country: 'Chile', lat: -33.4489, lon: -70.6693 },
  { name: 'Caracas', country: 'Venezuela', lat: 10.4806, lon: -66.9036 },
  { name: 'Quito', country: 'Ecuador', lat: -0.1807, lon: -78.4678 },
  { name: 'La Paz', country: 'Bolivia', lat: -16.5, lon: -68.15 },
  { name: 'Montevideo', country: 'Uruguay', lat: -34.9011, lon: -56.1645 },

  // Oceania
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Melbourne', country: 'Australia', lat: -37.8136, lon: 144.9631 },
  { name: 'Perth', country: 'Australia', lat: -31.9505, lon: 115.8605 },
  { name: 'Brisbane', country: 'Australia', lat: -27.4698, lon: 153.0251 },
  { name: 'Auckland', country: 'New Zealand', lat: -36.8485, lon: 174.7633 },
  { name: 'Wellington', country: 'New Zealand', lat: -41.2866, lon: 174.7756 },
  { name: 'Honolulu', country: 'USA', lat: 21.3069, lon: -157.8583 },
];