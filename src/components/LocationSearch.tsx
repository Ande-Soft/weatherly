import { useState } from "react";
import { Box, TextField, Button, Flex, Select, IconButton, Card, Text } from "@radix-ui/themes";
import type { GeocodingResult, Coordinates } from "../utils/weatherApi";

interface LocationSearchProps {
  onSearch: (query: string) => void;
  onLocationSelect: (coords: Coordinates, locationName: string, country: string) => void;
  onGetCurrentLocation: () => void;
  regions: { label: string; value: string }[];
  isLoading: boolean;
  isLocationLoading: boolean;
  geocodingResults: GeocodingResult[];
}

export default function LocationSearch({
  onSearch,
  onLocationSelect,
  onGetCurrentLocation,
  regions,
  isLoading,
  isLocationLoading,
  geocodingResults,
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState(regions[0].value);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
      setShowResults(true);
    } else {
      onSearch(region);
      setShowResults(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleLocationSelect = (result: GeocodingResult) => {
    onLocationSelect(
      { lat: result.lat, lon: result.lon },
      result.name,
      result.country
    );
    setQuery("");
    setShowResults(false);
  };

  return (
    <Box>
      <Flex gap="3" align="center" mb="3">
        <TextField.Root style={{ flex: 2, backgroundColor: "rgba(255,255,255,0.2)" }}>
          <input
            style={{
              all: "unset",
              width: "100%",
              padding: "8px 12px",
              color: "white",
            }}
            placeholder="Search city..."
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            onKeyDown={handleKeyDown}
          />
        </TextField.Root>
        <Select.Root
          value={region}
          onValueChange={(v) => {
            setRegion(v);
            setQuery("");
          }}
        >
          <Select.Trigger
            style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
          />
          <Select.Content>
            {regions.map((r) => (
              <Select.Item key={r.value} value={r.value}>
                {r.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <Button
          variant="solid"
          onClick={handleSearch}
          disabled={isLoading}
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          Search
        </Button>
        <IconButton
          variant="ghost"
          onClick={onGetCurrentLocation}
          disabled={isLocationLoading}
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          📍
        </IconButton>
      </Flex>

      {showResults && geocodingResults && geocodingResults.length > 0 && (
        <Card
          style={{
            position: "absolute",
            zIndex: 10,
            width: "100%",
            maxHeight: "300px",
            overflowY: "auto",
            marginTop: "4px",
          }}
        >
          {geocodingResults.map((result, index) => (
            <Box
              key={index}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                borderBottom:
                  index < geocodingResults.length - 1
                    ? "1px solid #eee"
                    : "none",
              }}
              onClick={() => handleLocationSelect(result)}
            >
              <Text weight="medium">{result.name}</Text>
              <Text size="1" color="gray">
                {result.state ? `${result.state}, ` : ""}
                {result.country}
              </Text>
            </Box>
          ))}
        </Card>
      )}
    </Box>
  );
}
