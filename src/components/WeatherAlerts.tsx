import { useState } from "react";
import type { WeatherAlert } from "../types/weather";
import { formatTime } from "../utils/weatherApi";
import { Box, Card, Flex, Heading, Text, Button, Dialog } from "@radix-ui/themes";

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
}

export default function WeatherAlerts({ alerts }: WeatherAlertsProps) {
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);

  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <Box>
      <Heading size="3" mb="2">
        Weather Alerts ({alerts.length})
      </Heading>
      
      {alerts.map((alert, index) => (
        <Card key={index} style={{ marginBottom: "8px", background: "rgba(255, 0, 0, 0.1)" }}>
          <Flex justify="between" align="center">
            <Box>
              <Text weight="bold">{alert.event}</Text>
              <Text size="1">
                {formatTime(alert.start, { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })} - {formatTime(alert.end, { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </Box>
            <Button 
              variant="soft" 
              color="red" 
              onClick={() => setSelectedAlert(alert)}
            >
              Details
            </Button>
          </Flex>
        </Card>
      ))}

      <Dialog.Root open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
        <Dialog.Content>
          <Dialog.Title>{selectedAlert?.event}</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            From {selectedAlert?.sender_name}
          </Dialog.Description>

          <Box style={{ maxHeight: "300px", overflow: "auto" }}>
            <Text style={{ whiteSpace: "pre-wrap" }}>
              {selectedAlert?.description}
            </Text>
          </Box>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft">Close</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}
