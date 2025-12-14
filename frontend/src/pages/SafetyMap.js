import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Navigation, MapPin, AlertTriangle } from 'lucide-react';
import { handlePanicButton } from '../utils/panicButton';
import './SafetyMap.css';

const SafetyMap = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');

  return (
    <div className="safety-map-container">
    

      {/* Main Content */}
      <main className="main-content">
        <div className="page-title-section">
          <h1>Safety Map</h1>
          <p className="subtitle">Find nearby hospitals, shelters, and emergency services</p>
        </div>

        {/* Search Bar */}
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <MapPin size={20} className="location-icon" />
            <input
              type="text"
              placeholder="Enter your location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="location-input"
            />
          </div>
          <button className="search-button">
            <Search size={20} />
          </button>
          <button className="gps-button">
            <Navigation size={20} />
          </button>
        </div>

        {/* Map Container */}
        <div className="map-container">
          <div className="map-grid"></div>
          <div className="map-placeholder">
            <div className="location-pin-large">
              <MapPin size={40} strokeWidth={2.5} />
            </div>
            <h2>Enter Your Location</h2>
            <p>Search or use GPS to find nearby emergency services</p>
          </div>
        </div>

        {/* Service Filters */}
        <div className="service-filters">
          <button className="service-btn hospital">
            <svg className="service-svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
            </svg>
            Hospital
          </button>
          <button className="service-btn shelter">
            <svg className="service-svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            Shelter
          </button>
          <button className="service-btn fire-station">
            <svg className="service-svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12.9l-2.13 2.09C9.31 15.55 9 16.28 9 17.06 9 18.68 10.35 20 12 20s3-1.32 3-2.94c0-.78-.31-1.52-.87-2.07L12 12.9z"/>
              <path d="M16 6l-.44.55C14.38 8.02 12 7.19 12 5.3V2c-5.05 3.28-6.47 8.25-4.13 12.27-1.23-1.39-1.87-3.18-1.87-5.07 0-1.53.43-3.03 1.25-4.35C8.47 2.85 10.21 1.5 12 1.5V5.3c0 1.89 2.38 2.72 3.56 1.25l.44-.55c-.89 1.33-1 3.06-.25 4.49 1.32 2.52 4.31 3.17 6.48 1.67C21.38 15.02 19 23 12 23c-4.97 0-9-4.03-9-9 0-1.83.55-3.53 1.49-4.95C6.42 6.55 9.06 5.3 12 5.3v-.01z"/>
            </svg>
            Fire Station
          </button>
          <button className="service-btn police">
            <svg className="service-svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
            Police
          </button>
        </div>
      </main>

      

      <button className="fab" onClick={() => handlePanicButton(navigate)}>
        <AlertTriangle />
      </button>

     
    </div>
  );
};

export default SafetyMap;