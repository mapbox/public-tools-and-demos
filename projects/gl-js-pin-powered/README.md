# GL JS Pin-Powered Demo

A modern React application showcasing interactive Points of Interest (POI) exploration using Mapbox GL JS. This demo features dynamic restaurant and hotel discovery with advanced filtering, search functionality, and detailed place information.

## ✨ Features

### 🗺️ Interactive Map
- **Mapbox GL JS** integration with custom styling
- **Dynamic POI rendering** with custom icons and ratings
- **Smart zoom** and building selection on POI click
- **Dark/light mode** support based on system preferences

### 🍽️ Restaurant Mode
- **Rating-based icons** showing restaurant quality (3.0-4.9 stars)
- **Category filtering** (restaurant, bar, cafe, fast food, nightclub, specialty shop)
- **Favorite system** with visual indicators
- **Detailed information** including photos, descriptions, contact info

### 🏨 Hotel Mode
- **Price display** with dynamic pricing information
- **Visual price indicators** on map markers
- **Favorite functionality** for hotels
- **Seamless switching** between restaurant and hotel views

### 🔍 Search & Discovery
- **Real-time search** with Mapbox Search JS integration
- **Geographic filtering** based on current map viewport
- **Visual feedback** for visited locations
- **Responsive design** for desktop and mobile

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Mapbox access token

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Set up environment**
   - Add your Mapbox access token to `src/constants.ts`
   ```typescript
   export const ACCESS_TOKEN = "your_mapbox_token_here";
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, optimized for the `/gl-js-pin-powered-demo/` base path.

## 🏗️ Architecture

### Technology Stack
- **React 19** with TypeScript
- **Mapbox GL JS** for mapping
- **Mapbox Search JS** for geocoding
- **Vite** for development and building

### Component Structure
```
src/
├── App.tsx                      # Root React component
├── main.tsx                     # React entry point
├── components/
│   ├── Filters                 # Search and category filters
│   ├── MapContainer            # Main map with all interactions
│   ├── POICard                 # Place details sidebar/modal
│   └── SwitchView              # Restaurant/hotel mode toggle
├── api/                        # Mapbox API integration
├── state.ts                    # Global state management
└── style.css                   # Application styles
```

## 🔧 Development

### Project Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally