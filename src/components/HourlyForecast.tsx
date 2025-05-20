import type { HourlyForecast as HourlyForecastType } from "../types/weather";
import { Box, Card, Flex, Text } from "@radix-ui/themes";
import { formatTime, getWeatherIconUrl } from "../utils/weatherApi";

interface HourlyForecastProps {
  hourlyData: HourlyForecastType[];
  unit: "metric" | "imperial";
  hoursToShow?: number;
}

export default function HourlyForecast({ hourlyData, unit, hoursToShow = 24 }: HourlyForecastProps) {
  if (!hourlyData || hourlyData.length === 0) {
    return null;
  }

  // Format temperature based on selected unit
  const formatTemp = (temp: number) => {
    return `${Math.round(temp)}${unit === "metric" ? "°C" : "°F"}`;
  };

  // Limit the number of hours to show
  const limitedData = hourlyData.slice(0, hoursToShow);

  return (
    <Box>
      <Text size="2" color="gray" mb="2">Hourly Forecast</Text>
      <Box style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <Flex gap="2" style={{ minWidth: "max-content", paddingBottom: "8px" }}>
          {limitedData.map((hour, index) => (
            <Card 
              key={index} 
              style={{ 
                textAlign: 'center', 
                padding: '12px 8px', 
                minWidth: '80px',
                flex: '0 0 auto'
              }}
            >
              <Text size="1" weight={index === 0 ? "bold" : "regular"}>
                {index === 0 ? 'Now' : formatTime(hour.dt)}
              </Text>
              <img
                src={getWeatherIconUrl(hour.weather[0].icon)}
                alt={hour.weather[0].description}
                style={{ width: '40px', height: '40px', margin: '0 auto' }}
              />
              <Text size="3" weight="bold">{formatTemp(hour.temp)}</Text>
              <Flex direction="column" gap="1" mt="1">
                <Text size="1" color="gray">{Math.round(hour.pop * 100)}% rain</Text>
                <Text size="1" color="gray">
                  {Math.round(hour.wind_speed)}
                  {unit === "metric" ? " m/s" : " mph"}
                </Text>
              </Flex>
            </Card>
          ))}
        </Flex>
      </Box>
    </Box>
  );
}
