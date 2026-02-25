import React from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function OrbMap() {
    const position = [51.505, -0.09] // Default to London or somewhere cool

    return (
        <div className="glass-card" style={{ padding: '1rem', height: '100%' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '2px', marginBottom: '1rem' }}>
                GLOBAL ACCESS TOPOLOGY
            </div>
            <MapContainer center={position} zoom={13} scrollWheelZoom={false} attributionControl={false}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>
                        ORB CORE: UBUNTU2.LOCAL <br /> STATUS: LINKED
                    </Popup>
                </Marker>
                <Circle center={position} radius={500} pathOptions={{ color: '#00f2ff', fillColor: '#00f2ff' }} />
            </MapContainer>
        </div>
    )
}
