import type { MinutelyForecast } from "../types/weather";
import { Box, Text } from "@radix-ui/themes";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatTime } from "../utils/weatherApi";

interface PrecipitationChartProps {
  minutelyData: MinutelyForecast[];
}

export default function PrecipitationChart({ minutelyData }: PrecipitationChartProps) {
  if (!minutelyData || minutelyData.length === 0) {
    return null;
  }

  // Format data for the chart
  const chartData = minutelyData.map((item, index) => ({
    name: index % 10 === 0 ? formatTime(item.dt, { minute: '2-digit', hour: '2-digit' }) : '',
    precipitation: item.precipitation,
    dt: item.dt,
  }));

  // Check if there's any precipitation in the next hour
  const hasPrecipitation = minutelyData.some(item => item.precipitation > 0);

  if (!hasPrecipitation) {
    return (
      <Box mb="4">
        <Text size="2" color="gray" mb="2">Precipitation Forecast (60 min)</Text>
        <Box style={{ padding: "20px", textAlign: "center" }}>
          <Text>No precipitation expected in the next hour</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box mb="4">
      <Text size="2" color="gray" mb="2">Precipitation Forecast (60 min)</Text>
      <Box style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="name" />
            <YAxis 
              tickFormatter={(value) => `${value} mm`}
            />
            <Tooltip 
              formatter={(value: number) => [`${value} mm`, 'Precipitation']}
              labelFormatter={(label: string, payload: any) => {
                if (!payload || payload.length === 0) return label;
                const dt = payload[0].payload.dt;
                return formatTime(dt, { hour: '2-digit', minute: '2-digit' });
              }}
            />
            <defs>
              <linearGradient id="colorPrecip" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4b6cb7" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4b6cb7" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="precipitation"
              stroke="#4b6cb7"
              fillOpacity={1}
              fill="url(#colorPrecip)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
