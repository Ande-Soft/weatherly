import { useState, useEffect } from "react";
import {
  Flex,
  Box,
  TextField,
  Button,
  Select,
  Card,
  Heading,
  Text,
  Spinner,
  Grid,
  Container,
  IconButton,
  Tabs,
  Badge,
} from "@radix-ui/themes";
import {
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import {
  fetchCurrentWeather,
  fetchForecast,
  getWeatherIconUrl,
  getUserLocation,
  fetchWeatherByCoords,
  fetchForecastByCoords,
} from "../utils/weatherApi";

const regions = [
  { label: "New York, US", value: "New York,US" },
  { label: "London, UK", value: "London,UK" },
  { label: "Tokyo, JP", value: "Tokyo,JP" },
  { label: "Lagos, NG", value: "Lagos,NG" },
  { label: "Sydney, AU", value: "Sydney,AU" },
  { label: "Paris, FR", value: "Paris,FR" },
  { label: "Berlin, DE", value: "Berlin,DE" },
  { label: "Mumbai, IN", value: "Mumbai,IN" },
  { label: "Cairo, EG", value: "Cairo,EG" },
  { label: "Rio de Janeiro, BR", value: "Rio de Janeiro,BR" },
];

// Weather condition icons mapping - keeping for reference but using OpenWeather icons directly
/*
const weatherIcons = {
  "01d": "☀️",  // clear sky day
  "01n": "🌙",  // clear sky night
  "02d": "⛅",  // few clouds day
  "02n": "☁️",  // few clouds night
  "03d": "☁️",  // scattered clouds
  "03n": "☁️",  // scattered clouds
  "04d": "☁️",  // broken clouds
  "04n": "☁️",  // broken clouds
  "09d": "🌧️",  // shower rain
  "09n": "🌧️",  // shower rain
  "10d": "🌦️",  // rain day
  "10n": "🌧️",  // rain night
  "11d": "⛈️",  // thunderstorm
  "11n": "⛈️",  // thunderstorm
  "13d": "❄️",  // snow
  "13n": "❄️",  // snow
  "50d": "🌫️",  // mist
  "50n": "🌫️",  // mist
};
*/

export default function WeatherDashboard() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState(regions[0].value);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [activeTab, setActiveTab] = useState("today");
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);

  // Load weather for default city on first render
  useEffect(() => {
    handleSearch();
  }, []);
  
  // Process forecast data when it changes
  useEffect(() => {
    if (forecastData && forecastData.list) {
      // Extract hourly data for the next 24 hours
      const next24Hours = forecastData.list.slice(0, 8);
      setHourlyData(next24Hours.map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon,
        description: item.weather[0].description,
        precipitation: item.pop * 100, // Probability of precipitation as percentage
        humidity: item.main.humidity,
        windSpeed: Math.round(item.wind.speed),
      })));
    }
  }, [forecastData]);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const city = query || region;
      const [weather, forecast] = await Promise.all([
        fetchCurrentWeather(city),
        fetchForecast(city),
      ]);
      setWeatherData(weather);
      setForecastData(forecast);
    } catch (err: any) {
      setError(err.message || "Failed to fetch weather data");
      setWeatherData(null);
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Get user's current location weather
  const handleGetLocationWeather = async () => {
    setLocationLoading(true);
    setError("");
    try {
      const { lat, lon } = await getUserLocation();
      const [weather, forecast] = await Promise.all([
        fetchWeatherByCoords(lat, lon),
        fetchForecastByCoords(lat, lon),
      ]);
      setWeatherData(weather);
      setForecastData(forecast);
      setQuery(""); // Clear the search query
    } catch (err: any) {
      setError(err.message || "Failed to get location weather");
    } finally {
      setLocationLoading(false);
    }
  };
  
  // Toggle temperature unit between Celsius and Fahrenheit
  const toggleUnit = () => {
    setUnit(unit === "metric" ? "imperial" : "metric");
  };
  
  // Convert temperature based on selected unit
  const formatTemp = (temp: number) => {
    if (unit === "imperial") {
      return `${Math.round(temp * 9/5 + 32)}°F`;
    }
    return `${Math.round(temp)}°C`;
  };

  // Prepare chart data from forecast
  interface DayForecast {
    name: string;
    temp: number;
    minTemp: number;
    maxTemp: number;
    icon: string;
    description: string;
  }
  
  let chartData: DayForecast[] = [];
  if (forecastData && forecastData.list) {
    // Group forecast by day
    const dailyData = forecastData.list.reduce((acc: Record<string, any[]>, item: any) => {
      const date = item.dt_txt.split(' ')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {} as Record<string, any[]>);
    
    // Get min/max for each day
    chartData = Object.entries(dailyData).map(([date, items]) => {
      // Type assertion to handle items as an array of forecast items
      const typedItems = items as Array<{
        main: { temp: number };
        dt_txt: string;
        weather: Array<{ icon: string; description: string }>;
      }>;
      
      const temps = typedItems.map((item) => item.main.temp);
      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);
      // Use the noon forecast for the icon if available, otherwise use the first one
      const noonForecast = typedItems.find((item) => item.dt_txt.includes('12:00:00')) || typedItems[0];
      
      return {
        name: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
        temp: Math.round(temps.reduce((sum: number, temp: number) => sum + temp, 0) / temps.length), // average
        minTemp: Math.round(minTemp),
        maxTemp: Math.round(maxTemp),
        icon: noonForecast.weather[0].icon,
        description: noonForecast.weather[0].description,
      };
    }).slice(0, 5); // Get next 5 days
  }

  return (
    <Container size="3" style={{ padding: "20px 0" }}>
      <Card style={{ 
        padding: 0, 
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        borderRadius: '16px',
      }}>
        {/* Header with gradient background */}
        <Box style={{ 
          background: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)', 
          padding: '24px',
          color: 'white'
        }}>
          <Flex justify="between" align="center" mb="3" wrap="wrap" gap="2">
            <Flex align="center" gap="2">
              <img 
                src="/weatherly-logo.svg" 
                alt="Weatherly Logo" 
                style={{ width: '32px', height: '32px' }}
              />
              <Heading size="6" style={{ color: 'white' }}>Weatherly</Heading>
            </Flex>
            <Flex gap="2">
              <Button 
                variant={unit === "metric" ? "solid" : "outline"} 
                onClick={toggleUnit}
                style={{ 
                  background: unit === "metric" ? 'rgba(255,255,255,0.2)' : 'transparent',
                  borderColor: 'white',
                  color: 'white',
                  padding: '0 10px',
                  minWidth: '40px'
                }}
              >
                °C
              </Button>
              <Button 
                variant={unit === "imperial" ? "solid" : "outline"} 
                onClick={toggleUnit}
                style={{ 
                  background: unit === "imperial" ? 'rgba(255,255,255,0.2)' : 'transparent',
                  borderColor: 'white',
                  color: 'white',
                  padding: '0 10px',
                  minWidth: '40px'
                }}
              >
                °F
              </Button>
            </Flex>
          </Flex>
          
          {/* Search controls */}
          <Flex 
            direction={{ initial: "column", sm: "row" }} 
            gap="3" 
            align={{ initial: "stretch", sm: "center" }} 
            mb="3"
          >
            <TextField.Root 
              style={{ 
                flex: 2, 
                backgroundColor: 'rgba(255,255,255,0.2)',
                width: '100%',
                height: '35px',
                color: 'white',
                padding: "0px",
                fontSize: '20px'
              }}
              className="white-placeholder"
              placeholder="Search city..."
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setQuery(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                e.key === "Enter" && handleSearch()
              }
            />
            
            <Flex gap="2" width={{ initial: "100%", sm: "auto" }}>
              <Flex style={{ flex: 1 }}>
                <Select.Root
                  value={region}
                  onValueChange={(v) => {
                    setRegion(v);
                    setQuery("");
                  }}
                >
                <Select.Trigger 
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    width: '100%'
                  }} 
                />
                <Select.Content>
                  {regions.map((r) => (
                    <Select.Item key={r.value} value={r.value}>
                      {r.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              </Flex>
              
              <Flex gap="2" align="center" style={{ height: '35px' }}>
                <Button 
                  variant="solid" 
                  onClick={handleSearch} 
                  disabled={loading}
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    height: '100%'
                  }}
                >
                  Search
                </Button>
                <IconButton 
                  variant="ghost" 
                  onClick={handleGetLocationWeather} 
                  disabled={locationLoading}
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    height: '70%'
                  }}
                >
                  📍
                </IconButton>
              </Flex>
            </Flex>
          </Flex>
          
          {/* Current weather display */}
          {loading && (
            <Flex align="center" justify="center" p="4">
              <Spinner />
              <Text ml="2" style={{ color: 'white' }}>Loading weather data...</Text>
            </Flex>
          )}
          
          {error && (
            <Box p="4" style={{ backgroundColor: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>
              <Text style={{ color: 'white' }}>{error}</Text>
            </Box>
          )}
          
          {weatherData && !loading && (
            <Flex 
              direction={{ initial: "column", sm: "row" }} 
              align={{ initial: "start", sm: "center" }} 
              justify="between"
              gap="3"
              mt="3"
            >
              <Box>
                <Heading 
                  size={{ initial: "6", sm: "8" }} 
                  style={{ color: 'white', marginBottom: '4px' }}
                >
                  {weatherData.name}, {weatherData.sys?.country}
                </Heading>
                <Flex 
                  align="center" 
                  gap="2" 
                  wrap="wrap"
                >
                  <Text size="4" style={{ color: 'white', opacity: 0.9 }}>
                    {weatherData.weather?.[0]?.description}
                  </Text>
                  <Badge size="1" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    {new Date().toLocaleDateString(undefined, { weekday: 'long' })}
                  </Badge>
                </Flex>
              </Box>
              <Flex 
                align="center" 
                gap="2"
                mt={{ initial: "2", sm: "0" }}
              >
                <img 
                  src={getWeatherIconUrl(weatherData.weather?.[0]?.icon, 4)} 
                  alt={weatherData.weather?.[0]?.description}
                  style={{ width: '64px', height: '64px' }}
                />
                <Text 
                  size={{ initial: "7", sm: "9" }} 
                  weight="bold" 
                  style={{ color: 'white' }}
                >
                  {formatTemp(weatherData.main.temp)}
                </Text>
              </Flex>
            </Flex>
          )}
        </Box>
        
        {/* Weather details section */}
        {weatherData && !loading && (
          <Box p="4">
            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
              <Tabs.List>
                <Tabs.Trigger value="today">Today</Tabs.Trigger>
                <Tabs.Trigger value="forecast">5-Day Forecast</Tabs.Trigger>
                <Tabs.Trigger value="details">Details</Tabs.Trigger>
              </Tabs.List>
              
              {/* Today tab with hourly forecast */}
              <Box py="3">
                <Tabs.Content value="today">
                  <Text size="2" color="gray" mb="3">Hourly Forecast</Text>
                  <Grid columns="4" gap="3" width="100%">
                    {hourlyData.map((hour, index) => (
                      <Card key={index} style={{ textAlign: 'center', padding: '12px 8px' }}>
                        <Text size="1">{hour.time}</Text>
                        <img 
                          src={getWeatherIconUrl(hour.icon)} 
                          alt={hour.description}
                          style={{ width: '40px', height: '40px', margin: '0 auto' }}
                        />
                        <Text size="3" weight="bold">{formatTemp(hour.temp)}</Text>
                        <Text size="1" color="gray">{hour.precipitation}% rain</Text>
                      </Card>
                    ))}
                  </Grid>
                </Tabs.Content>
                
                {/* 5-day forecast tab */}
                <Tabs.Content value="forecast">
                  <Grid columns="1" gap="2" width="100%">
                    {chartData.map((day, index) => (
                      <Card key={index} style={{ padding: '12px' }}>
                        <Flex justify="between" align="center">
                          <Text weight="bold">{day.name}</Text>
                          <Flex align="center" gap="2">
                            <img 
                              src={getWeatherIconUrl(day.icon)} 
                              alt={day.description}
                              style={{ width: '36px', height: '36px' }}
                            />
                            <Text size="2">{day.description}</Text>
                          </Flex>
                          <Flex gap="2" align="center">
                            <Text size="2" color="blue">{formatTemp(day.minTemp)}</Text>
                            <Text>-</Text>
                            <Text size="2" color="red">{formatTemp(day.maxTemp)}</Text>
                          </Flex>
                        </Flex>
                      </Card>
                    ))}
                  </Grid>
                  
                  {/* Temperature chart */}
                  <Box mt="4" style={{ height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4b6cb7" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4b6cb7" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip 
                          formatter={(value: any) => [`${value}${unit === "metric" ? "°C" : "°F"}`, "Temperature"]}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="temp" 
                          stroke="#4b6cb7" 
                          fillOpacity={1} 
                          fill="url(#colorTemp)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Tabs.Content>
                
                {/* Details tab */}
                <Tabs.Content value="details">
                  <Grid columns="2" gap="3" width="100%">
                    <Card>
                      <Flex direction="column" gap="1">
                        <Text size="1" color="gray">Feels Like</Text>
                        <Text size="5" weight="bold">{formatTemp(weatherData.main.feels_like)}</Text>
                      </Flex>
                    </Card>
                    <Card>
                      <Flex direction="column" gap="1">
                        <Text size="1" color="gray">Humidity</Text>
                        <Text size="5" weight="bold">{weatherData.main.humidity}%</Text>
                      </Flex>
                    </Card>
                    <Card>
                      <Flex direction="column" gap="1">
                        <Text size="1" color="gray">Wind Speed</Text>
                        <Text size="5" weight="bold">
                          {unit === "metric" 
                            ? `${Math.round(weatherData.wind.speed)} m/s` 
                            : `${Math.round(weatherData.wind.speed * 2.237)} mph`}
                        </Text>
                      </Flex>
                    </Card>
                    <Card>
                      <Flex direction="column" gap="1">
                        <Text size="1" color="gray">Pressure</Text>
                        <Text size="5" weight="bold">{weatherData.main.pressure} hPa</Text>
                      </Flex>
                    </Card>
                    <Card>
                      <Flex direction="column" gap="1">
                        <Text size="1" color="gray">Visibility</Text>
                        <Text size="5" weight="bold">{(weatherData.visibility / 1000).toFixed(1)} km</Text>
                      </Flex>
                    </Card>
                    <Card>
                      <Flex direction="column" gap="1">
                        <Text size="1" color="gray">Sunrise & Sunset</Text>
                        <Flex gap="2">
                          <Text size="2">🌅 {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                          <Text size="2">🌇 {new Date(weatherData.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                        </Flex>
                      </Flex>
                    </Card>
                  </Grid>
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          </Box>
        )}
      </Card>
      
      {/* Footer */}
      <Box mt="3" style={{ textAlign: 'center', padding: "10px 0 20px" }}>
        <Text size="1" color="gray">
          Powered by Weatherly {new Date().getFullYear()}
        </Text>
      </Box>
    </Container>
  );
}
