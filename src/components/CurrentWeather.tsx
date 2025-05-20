import type { CurrentWeather as CurrentWeatherType } from "../types/weather";
import { Box, Card, Flex, Grid, Text, Badge } from "@radix-ui/themes";
import { formatTime, getWeatherIconUrl } from "../utils/weatherApi";

interface CurrentWeatherProps {
  data: CurrentWeatherType;
  locationName: string;
  country: string;
  unit: "metric" | "imperial";
}

export default function CurrentWeather({ data, locationName, country, unit }: CurrentWeatherProps) {
  if (!data) {
    return null;
  }

  // Format temperature based on selected unit
  const formatTemp = (temp: number) => {
    return `${Math.round(temp)}${unit === "metric" ? "°C" : "°F"}`;
  };

  // Format wind speed based on selected unit
  const formatWindSpeed = (speed: number) => {
    if (unit === "imperial") {
      return `${Math.round(speed * 2.237)} mph`;
    }
    return `${Math.round(speed)} m/s`;
  };

  return (
    <Box>
      <Flex align="center" justify="between" mb="3">
        <Box>
          <Flex align="center" gap="2">
            <Text size="8" weight="bold">
              {locationName}
            </Text>
            <Badge size="1">{country}</Badge>
          </Flex>
          <Text size="2" color="gray">
            {formatTime(data.dt, { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </Box>
      </Flex>

      <Flex align="center" gap="4" mb="4">
        <img
          src={getWeatherIconUrl(data.weather[0].icon, 4)}
          alt={data.weather[0].description}
          style={{ width: '100px', height: '100px' }}
        />
        <Box>
          <Text size="9" weight="bold">
            {formatTemp(data.temp)}
          </Text>
          <Text size="3">
            Feels like {formatTemp(data.feels_like)}
          </Text>
          <Text size="4" weight="medium">
            {data.weather[0].description}
          </Text>
        </Box>
      </Flex>

      <Grid columns={{ initial: "2", md: "4" }} gap="3" mb="4">
        <Card>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">Humidity</Text>
            <Text size="5" weight="bold">{data.humidity}%</Text>
          </Flex>
        </Card>
        <Card>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">Wind</Text>
            <Text size="5" weight="bold">{formatWindSpeed(data.wind_speed)}</Text>
          </Flex>
        </Card>
        <Card>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">Pressure</Text>
            <Text size="5" weight="bold">{data.pressure} hPa</Text>
          </Flex>
        </Card>
        <Card>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">UV Index</Text>
            <Text size="5" weight="bold">{data.uvi.toFixed(1)}</Text>
          </Flex>
        </Card>
      </Grid>

      <Grid columns={{ initial: "2", md: "4" }} gap="3">
        <Card>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">Visibility</Text>
            <Text size="5" weight="bold">{(data.visibility / 1000).toFixed(1)} km</Text>
          </Flex>
        </Card>
        <Card>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">Dew Point</Text>
            <Text size="5" weight="bold">{formatTemp(data.dew_point)}</Text>
          </Flex>
        </Card>
        <Card>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">Sunrise</Text>
            <Text size="5" weight="bold">{formatTime(data.sunrise)}</Text>
          </Flex>
        </Card>
        <Card>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">Sunset</Text>
            <Text size="5" weight="bold">{formatTime(data.sunset)}</Text>
          </Flex>
        </Card>
      </Grid>
    </Box>
  );
}
