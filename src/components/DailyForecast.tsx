import type { DailyForecast as DailyForecastType } from "../types/weather";
import { Box, Card, Flex, Grid, Text } from "@radix-ui/themes";
import { formatDate, getWeatherIconUrl } from "../utils/weatherApi";

interface DailyForecastProps {
  dailyData: DailyForecastType[];
  unit: "metric" | "imperial";
}

export default function DailyForecast({ dailyData, unit }: DailyForecastProps) {
  if (!dailyData || dailyData.length === 0) {
    return null;
  }

  // Format temperature based on selected unit
  const formatTemp = (temp: number) => {
    return `${Math.round(temp)}${unit === "metric" ? "°C" : "°F"}`;
  };

  return (
    <Box>
      <Text size="2" color="gray" mb="2">7-Day Forecast</Text>
      <Grid columns="1" gap="2" width="100%">
        {dailyData.map((day, index) => (
          <Card key={index} style={{ padding: '12px' }}>
            <Flex justify="between" align="center">
              <Box style={{ width: '25%' }}>
                <Text weight="bold">
                  {index === 0 ? 'Today' : formatDate(day.dt, { weekday: 'short' })}
                </Text>
                <Text size="1" color="gray">
                  {formatDate(day.dt, { month: 'short', day: 'numeric' })}
                </Text>
              </Box>
              
              <Flex align="center" gap="2" style={{ width: '35%' }}>
                <img
                  src={getWeatherIconUrl(day.weather[0].icon)}
                  alt={day.weather[0].description}
                  style={{ width: '36px', height: '36px' }}
                />
                <Box>
                  <Text size="2">{day.weather[0].description}</Text>
                  <Text size="1" color="gray">{day.summary}</Text>
                </Box>
              </Flex>
              
              <Flex gap="2" align="center" style={{ width: '20%' }}>
                <Text size="2" color="blue">{formatTemp(day.temp.min)}</Text>
                <Text>-</Text>
                <Text size="2" color="red">{formatTemp(day.temp.max)}</Text>
              </Flex>
              
              <Flex gap="1" direction="column" style={{ width: '20%', textAlign: 'right' }}>
                <Text size="1">
                  <span style={{ opacity: 0.7 }}>Rain:</span> {Math.round(day.pop * 100)}%
                </Text>
                <Text size="1">
                  <span style={{ opacity: 0.7 }}>Wind:</span> {Math.round(day.wind_speed)}
                  {unit === "metric" ? " m/s" : " mph"}
                </Text>
              </Flex>
            </Flex>
          </Card>
        ))}
      </Grid>
    </Box>
  );
}
