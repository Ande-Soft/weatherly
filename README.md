# Weather App

A modern, responsive weather application built with React, TypeScript, and Vite. This app uses the OpenWeather API to provide real-time weather data and forecasts.

![Weather App Screenshot](https://via.placeholder.com/800x450.png?text=Weather+App+Screenshot)

## Features

- Current weather conditions display
- 5-day weather forecast
- Hourly forecast for the current day
- Detailed weather information (humidity, wind speed, pressure, etc.)
- Location-based weather using browser geolocation
- Search for weather by city name
- Quick selection of popular cities
- Toggle between Celsius and Fahrenheit
- Responsive design for all devices
- Beautiful UI with weather condition icons

## Setup Instructions

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- OpenWeather API key (get one for free at [OpenWeather](https://openweathermap.org/api))

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd weather
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file in the root directory with your OpenWeather API key:
   ```
   VITE_OPENWEATHER_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Technologies Used

- React 19
- TypeScript
- Vite
- Radix UI for components
- Recharts for data visualization
- OpenWeather API

## Project Structure

```
/src
  /components
    WeatherDashboard.tsx  # Main weather component
  /utils
    weatherApi.ts         # API functions for OpenWeather
  App.tsx                 # Main application component
  main.tsx               # Entry point
```

## Customization

You can customize the app by:

- Adding more cities to the quick selection list in `WeatherDashboard.tsx`
- Changing the color scheme by modifying the gradient in the header section
- Adding additional weather data points from the OpenWeather API

## License

MIT

## Acknowledgements

- [OpenWeather API](https://openweathermap.org/api) for weather data
- [Radix UI](https://www.radix-ui.com/) for UI components
- [Recharts](https://recharts.org/) for charts

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
