import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

const locations = [
  { name: 'Ottawa, ON', coordinates: [45.4215, -75.6972], date: '2024-05-01' },
  { name: 'Sudbury, ON', coordinates: [46.4917, -80.9930], date: '2024-05-02' },
  { name: 'Wawa, ON', coordinates: [47.9959, -84.7707], date: '2024-05-03' },
  { name: 'Dryden, ON', coordinates: [49.7801, -92.8370], date: '2024-05-04' },
  { name: 'Minnedosa, MB', coordinates: [50.2471, -99.8386], date: '2024-05-05' },
  { name: 'Langham, SK', coordinates: [52.3590, -106.9584], date: '2024-05-06' },
  { name: 'Edson, AB', coordinates: [53.5854, -116.4337], date: '2024-05-07' },
  { name: 'Jasper, AB', coordinates: [52.8737, -118.0814], date: '2024-05-08' },
  { name: 'Kamloops, BC', coordinates: [50.6745, -120.3273], date: '2024-05-09' },
  { name: 'Vancouver, BC', coordinates: [49.2827, -123.1207], date: '2024-05-10' },
];

const InteractiveMap = () => {
  const polylinePositions = locations.map(loc => loc.coordinates);

  return (
    <div className="map-container" style={{ height: '600px', width: '100%', margin: '20px 0' }}>
      <MapContainer
        center={[49.2827, -98.1207]} // Центр Канады
        zoom={4}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Маркеры для каждой локации */}
        {locations.map((location, index) => (
          <Marker 
            key={location.name} 
            position={location.coordinates}
          >
            <Popup>
              <div>
                <h3>{location.name}</h3>
                <p>Дата: {location.date}</p>
                <p>День {index + 1} путешествия</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Линия маршрута */}
        <Polyline
          positions={polylinePositions}
          color="blue"
          weight={3}
          opacity={0.7}
        />
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
