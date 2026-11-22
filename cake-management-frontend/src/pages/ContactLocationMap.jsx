import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";

import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

import "../styles/ContactLocationMap.css";

// Default bakery location in Kathmandu
const DEFAULT_LOCATION = {
    lat: 27.6923004,
    lng: 85.3332799,
};

// Update map whenever the location props change
function MapUpdater({ latitude, longitude }) {
    const map = useMap();

    useEffect(() => {
        map.setView([latitude, longitude], 16);
    }, [map, latitude, longitude]);

    return null;
}

function ContactLocationMap({
    latitude = DEFAULT_LOCATION.lat,
    longitude = DEFAULT_LOCATION.lng,
    label = "Our Bakery, Kathmandu, Nepal",
}) {
    const lat = Number(latitude);
    const lng = Number(longitude);

    const validLocation =
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180;

    if (!validLocation) {
        return (
            <div className="contact-map-error">
                <p>Unable to display our location.</p>
            </div>
        );
    }

    const position = [lat, lng];

    const directionsUrl =
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    return (
        <div className="contact-location-map">
            <MapContainer
                center={position}
                zoom={16}
                scrollWheelZoom={false}
                className="contact-leaflet-map"
            >
                <MapUpdater
                    latitude={lat}
                    longitude={lng}
                />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={position}>
                    <Popup>
                        <strong>Our Bakery</strong>
                        <br />
                        {label}
                    </Popup>
                </Marker>
            </MapContainer>

            <div className="contact-map-footer">
                <div className="contact-map-address">
                    <strong>Visit Our Bakery</strong>
                    <p>{label}</p>
                </div>

                <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-directions-btn"
                >
                    Get Directions
                </a>
            </div>
        </div>
    );
}

export default ContactLocationMap;
