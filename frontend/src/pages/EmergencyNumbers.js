import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmergencyNumbers.css';
import { Phone, Clock, MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { handlePanicButton } from '../utils/panicButton';

// Dynamic API URL for mobile compatibility
const getApiBaseUrl = () => {
  // If accessing via IP (mobile), use current host's IP
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `http://${window.location.hostname}:5000/api/emergency`;
  }
  // Default localhost for development
  return 'http://localhost:5000/api/emergency';
};

const API_BASE_URL = getApiBaseUrl();

const EmergencyNumbers = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [data, setData] = useState({ hospitals: [], emergencyServices: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported by this browser');
      // Use fallback location for Pakistan
      setLocation({ latitude: 33.6362, longitude: 72.9837 });
      fetchNearbyServices(33.6362, 72.9837);
      return;
    }
    
    setLoading(true);
    
    // Check if we're on HTTP (which blocks geolocation on mobile)
    if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
      console.warn('Geolocation requires HTTPS on mobile devices');
      setError('Location access requires secure connection. Using default Pakistan location.');
      setLocation({ latitude: 33.6362, longitude: 72.9837 });
      fetchNearbyServices(33.6362, 72.9837);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        fetchNearbyServices(latitude, longitude);
      },
      (error) => {
        console.error('Location error:', error);
        let errorMessage = '';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Using default Pakistan location.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Using default Pakistan location.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Using default Pakistan location.';
            break;
          default:
            errorMessage = 'Unable to access location. Using default Pakistan location.';
            break;
        }
        
        setError(errorMessage);
        // Use fallback location for Pakistan
        setLocation({ latitude: 33.6362, longitude: 72.9837 });
        fetchNearbyServices(33.6362, 72.9837);
      },
      { 
        enableHighAccuracy: false, // Less accurate but faster on mobile
        timeout: 15000, // Increased timeout
        maximumAge: 600000 // 10 minutes - longer cache for mobile
      }
    );
  }, []);

  const fetchNearbyServices = async (lat, lon) => {
    try {
        const response = await fetch(`${API_BASE_URL}/nearby?lat=${lat}&lon=${lon}&radius=25000`);
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch nearby services');
      }
      
      setData({
        hospitals: result.hospitals || [],
        emergencyServices: result.emergencyServices || [],
        dataSource: result.dataSource,
        hasLimitedData: result.error
      });
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load nearby emergency services');
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return null;
    // Remove any non-digit characters for tel: link
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    return { display: phone, link: cleanPhone };
  };

  return (
    <div className="emergency-numbers-page">
      {/* Main Content */}
      <main className="main-content">
        {/* Title Section */}
        <div className="title-section">
          <h1 className="page-title">Emergency Numbers</h1>
          <p className="page-subtitle">
            Quick access to Emergency services in your area
          </p>
          {location && (
            <div className="location-info">
              <MapPin size={16} />
              <span>
                {location.latitude === 33.6362 && location.longitude === 72.9837 ? 
                  'Default Pakistan Location' : 
                  `Your Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                }
              </span>
              {data.dataSource && (
                <span className="data-source">
                  {data.dataSource.includes('google') ? '🔍 Live data' : ''}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <Loader2 className="loading-spinner" />
            <p>Finding emergency services near you...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-container">
            <AlertTriangle className="error-icon" />
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        {/* Emergency Services Section */}
        {!loading && !error && (
          <section className="services-section">
            <h2 className="section-title">Emergency Services</h2>
            <div className="services-grid">
              {data.emergencyServices.length > 0 ? (
                data.emergencyServices.map((service, index) => {
                  const phone = formatPhone(service.phone);
                  return (
                    <div key={`${service.type}-${service.id}-${index}`} className="service-card">
                      <div className="card-header">
                        <div>
                          <h3 className="service-title">{service.name}</h3>
                          <p className="service-description">{service.amenity?.replace('_', ' ')}</p>
                        </div>
                        <span className="priority-badge">HIGH</span>
                      </div>
                      <div className="card-footer">
                        <div className="availability">
                          <Clock />
                          <span>24/7</span>
                        </div>
                        {phone && (
                          <a href={`tel:${phone.link}`} className="call-button">
                            <Phone />
                            <span>{phone.display}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-services">
                  <p>Loading emergency services...</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Nearby Hospitals & Clinics Section */}
        {!loading && !error && (
          <section className="hospitals-section">
            <h2 className="section-title">Nearby Hospitals & Clinics</h2>
            <div className="hospitals-list">
              {data.hospitals.length > 0 ? (
                data.hospitals.map((hospital, index) => {
                  const phone = formatPhone(hospital.phone);
                  return (
                    <div key={`${hospital.type}-${hospital.id}-${index}`} className="hospital-card">
                      <div className="hospital-info">
                        <h3 className="hospital-name">{hospital.name}</h3>
                        <div className="hospital-details">
                          <div className="hospital-address">
                            <MapPin />
                            <span>{hospital.address || 'Address not available'}</span>
                          </div>
                          <div className="hospital-availability">
                            <Clock />
                            <span>24/7</span>
                          </div>
                        </div>
                      </div>
                      <div className="hospital-actions">
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lon}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="maps-button"
                        >
                          <MapPin />
                          <span>Directions</span>
                        </a>
                        {phone && (
                          <a href={`tel:${phone.link}`} className="hospital-call-button">
                            <Phone />
                            <span>Call</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-hospitals">
                  <p>Loading nearby hospitals...</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Emergency Float Button */}
      <button className="emergency-float-button" onClick={() => handlePanicButton(navigate)}>
        <AlertTriangle />
      </button>
      

    </div>
  );
};

export default EmergencyNumbers;