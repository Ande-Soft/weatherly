// OpenWeather API configuration
const API_KEY = import.meta.env.VITE_WEATHER_API_TOKEN;
const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";
const ONECALL_BASE_URL = "https://api.openweathermap.org/data/3.0/onecall";
const GEO_BASE_URL = "https://api.openweathermap.org/geo/1.0";
const ICON_URL = "https://openweathermap.org/img/wn";

// Interface for location coordinates
export interface Coordinates {
  lat: number;
  lon: number;
}

// Interface for geocoding result
export interface GeocodingResult {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

// Geocode a city name to coordinates
export async function geocodeCity(city: string, limit: number = 5): Promise<GeocodingResult[]> {
  const res = await fetch(
    `${GEO_BASE_URL}/direct?q=${encodeURIComponent(city)}&limit=${limit}&appid=${API_KEY}`
  );
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    if (errorData && errorData.message) {
      throw new Error(errorData.message);
    } else if (res.status === 404) {
      throw new Error("Geocoding service not found.");
    } else if (res.status === 401) {
      throw new Error("Invalid API key. Please check your OpenWeather API key.");
    } else {
      throw new Error(`Failed to geocode city: ${res.statusText}`);
    }
  }
  
  const data = await res.json();
  if (!data || data.length === 0) {
    throw new Error("City not found. Please check the spelling and try again.");
  }
  
  return data;
}

// Fetch current weather using the 2.5 API (kept for compatibility)
export async function fetchCurrentWeather(city: string) {
  const res = await fetch(
    `${WEATHER_BASE_URL}/weather?q=${encodeURIComponent(
      city
    )}&appid=${API_KEY}&units=metric`
  );
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    if (errorData && errorData.message) {
      throw new Error(errorData.message);
    } else if (res.status === 404) {
      throw new Error("City not found. Please check the spelling and try again.");
    } else if (res.status === 401) {
      throw new Error("Invalid API key. Please check your OpenWeather API key.");
    } else {
      throw new Error(`Failed to fetch current weather: ${res.statusText}`);
    }
  }
  
  return res.json();
}

// Fetch forecast using the 2.5 API (kept for compatibility)
export async function fetchForecast(city: string) {
  const res = await fetch(
    `${WEATHER_BASE_URL}/forecast?q=${encodeURIComponent(
      city
    )}&appid=${API_KEY}&units=metric`
  );
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    if (errorData && errorData.message) {
      throw new Error(errorData.message);
    } else if (res.status === 404) {
      throw new Error("City not found. Please check the spelling and try again.");
    } else if (res.status === 401) {
      throw new Error("Invalid API key. Please check your OpenWeather API key.");
    } else {
      throw new Error(`Failed to fetch forecast: ${res.statusText}`);
    }
  }
  
  return res.json();
}

// Fetch comprehensive weather data using the One Call API 3.0
export async function fetchOneCallWeather(
  coords: Coordinates, 
  units: 'metric' | 'imperial' = 'metric',
  exclude: string[] = []
) {
  const excludeParam = exclude.length > 0 ? `&exclude=${exclude.join(',')}` : '';
  
  const res = await fetch(
    `${ONECALL_BASE_URL}?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=${units}${excludeParam}`
  );
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    if (errorData && errorData.message) {
      throw new Error(errorData.message);
    } else if (res.status === 404) {
      throw new Error("Weather data not found for this location.");
    } else if (res.status === 401) {
      throw new Error("Invalid API key. Please check your OpenWeather API key.");
    } else {
      throw new Error(`Failed to fetch weather data: ${res.statusText}`);
    }
  }
  
  return res.json();
}

// Helper function to get weather icon URL
export function getWeatherIconUrl(iconCode: string, size: 2 | 4 = 2) {
  return `${ICON_URL}/${iconCode}@${size}x.png`;
}

// Get user's location using browser geolocation API
export function getUserLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        reject(new Error(`Unable to retrieve your location: ${error.message}`));
      }
    );
  });
}

// Format a timestamp to a readable time string
export function formatTime(timestamp: number, options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }): string {
  return new Date(timestamp * 1000).toLocaleTimeString([], options);
}

// Format a timestamp to a readable date string
export function formatDate(timestamp: number, options: Intl.DateTimeFormatOptions = { weekday: 'short' }): string {
  return new Date(timestamp * 1000).toLocaleDateString(undefined, options);
}

// Get the day or night suffix for weather icons based on time
export function getDayNightSuffix(timestamp: number): 'd' | 'n' {
  const hours = new Date(timestamp * 1000).getHours();
  return (hours >= 6 && hours < 18) ? 'd' : 'n';
}

// Fetch weather by coordinates (using the 2.5 API for compatibility)
export async function fetchWeatherByCoords(lat: number, lon: number) {
  const res = await fetch(
    `${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    if (errorData && errorData.message) {
      throw new Error(errorData.message);
    } else {
      throw new Error(`Failed to fetch weather by coordinates: ${res.statusText}`);
    }
  }
  
  return res.json();
}

// Fetch forecast by coordinates (using the 2.5 API for compatibility)
export async function fetchForecastByCoords(lat: number, lon: number) {
  const res = await fetch(
    `${WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    if (errorData && errorData.message) {
      throw new Error(errorData.message);
    } else {
      throw new Error(`Failed to fetch forecast by coordinates: ${res.statusText}`);
    }
  }
  
  return res.json();
}

// Reverse geocoding to get location name from coordinates
export async function reverseGeocode(coords: Coordinates, limit: number = 1): Promise<GeocodingResult[]> {
  const res = await fetch(
    `${GEO_BASE_URL}/reverse?lat=${coords.lat}&lon=${coords.lon}&limit=${limit}&appid=${API_KEY}`
  );
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    if (errorData && errorData.message) {
      throw new Error(errorData.message);
    } else {
      throw new Error(`Failed to reverse geocode: ${res.statusText}`);
    }
  }
  
  return res.json();
}
