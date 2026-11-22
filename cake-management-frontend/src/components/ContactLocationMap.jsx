import { useEffect } from "react";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "../styles/ContactLocationMap.css";

// Fix default Leaflet marker icons
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const customMarkerIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Update map position when backend coordinates change
const MapUpdater = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        map.flyTo(position, map.getZoom());
    }, [map, position]);

    return null;
};

const ContactLocationMap = ({
    latitude,
    longitude,
    label = "Our Bakery Location",
}) => {
    const lat = Number(latitude);
    const lng = Number(longitude);

    const validCoordinates =
        latitude !== null &&
        latitude !== undefined &&
        latitude !== "" &&
        longitude !== null &&
        longitude !== undefined &&
        longitude !== "" &&
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180;

    // Do not display a fake/default location
    if (!validCoordinates) {
        return (
            <div className="contact-map-unavailable">
                <p>
                    Bakery location is currently unavailable.
                </p>
            </div>
        );
    }

    const position = [lat, lng];

    return (
        <div className="contact-location-map-wrapper">

            <MapContainer
                center={position}
                zoom={15}
                scrollWheelZoom={true}
                className="contact-location-map"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater position={position} />

                <Marker
                    position={position}
                    icon={customMarkerIcon}
                >
                    <Popup>
                        <div className="contact-map-popup">
                            <strong>Our Bakery</strong>
                            <p>{label}</p>
                        </div>
                    </Popup>
                </Marker>

            </MapContainer>

        </div>
    );
};

export default ContactLocationMap;
