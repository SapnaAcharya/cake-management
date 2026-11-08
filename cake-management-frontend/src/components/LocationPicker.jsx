import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    useMapEvents
} from "react-leaflet";

import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import "../styles/LocationPicker.css";

// Fix default Leaflet marker icons in Vite.
const defaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

// Kathmandu default location.
const DEFAULT_POSITION = [27.7172, 85.3240];

// Nominatim public geocoding service.
// Requests are intentionally user-triggered, not autocomplete.
const NOMINATIM_URL = "https://nominatim.openstreetmap.org";

// Respect the public service's one-request-per-second limit.
let lastNominatimRequest = 0;

const waitForNominatimSlot = async () => {
    const now = Date.now();
    const delay = Math.max(
        0,
        1100 - (now - lastNominatimRequest)
    );

    if (delay > 0) {
        await new Promise((resolve) =>
            setTimeout(resolve, delay)
        );
    }

    lastNominatimRequest = Date.now();
};

// Search or reverse-geocode an address.
const nominatimRequest = async (url) => {
    await waitForNominatimSlot();

    const response = await fetch(url, {
        headers: {
            Accept: "application/json"
        }
    });

    if (!response.ok) {
        throw new Error("Address service is temporarily unavailable.");
    }

    return response.json();
};

// Update map position when a customer selects a location.
const MapUpdater = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, 17, {
                duration: 1
            });
        }
    }, [position, map]);

    return null;
};

// Handle clicking on the map.
const MapClickHandler = ({ onLocationSelect }) => {
    useMapEvents({
        click(event) {
            onLocationSelect([
                event.latlng.lat,
                event.latlng.lng
            ]);
        }
    });

    return null;
};

const LocationPicker = ({ onSelect }) => {
    const [position, setPosition] = useState(
        DEFAULT_POSITION
    );

    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const [selectedAddress, setSelectedAddress] =
        useState("");

    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [error, setError] = useState("");

    // Notify Checkout.jsx about the selected location.
    const selectLocation = (address, lat, lng) => {
        setSelectedAddress(address);

        onSelect?.({
            address,
            lat,
            lng
        });
    };

    // Reverse geocode coordinates into an address.
    const reverseGeocode = async (lat, lng) => {
        setLoading(true);
        setError("");

        try {
            const url =
                `${NOMINATIM_URL}/reverse?format=jsonv2` +
                `&lat=${lat}&lon=${lng}` +
                "&addressdetails=1";

            const data = await nominatimRequest(url);

            const address =
                data.display_name ||
                `Selected location (${lat.toFixed(6)}, ${lng.toFixed(6)})`;

            selectLocation(address, lat, lng);
        } catch (err) {
            console.error("Reverse geocoding error:", err);

            const address =
                `Selected location (${lat.toFixed(6)}, ${lng.toFixed(6)})`;

            selectLocation(address, lat, lng);

            setError(
                "The location was selected, but its address could not be retrieved. You can edit the address manually."
            );
        } finally {
            setLoading(false);
        }
    };

    // Select a map location.
    const handleMapSelection = (newPosition) => {
        setPosition(newPosition);

        reverseGeocode(
            newPosition[0],
            newPosition[1]
        );
    };

    // Search for an address using Nominatim.
    const handleSearch = async (e) => {
        e.preventDefault();

        const query = searchText.trim();

        if (!query) {
            setError("Please enter a location to search.");
            return;
        }

        setLoading(true);
        setError("");
        setSearchResults([]);

        try {
            const url =
                `${NOMINATIM_URL}/search?format=jsonv2` +
                `&q=${encodeURIComponent(query)}` +
                "&countrycodes=np" +
                "&addressdetails=1" +
                "&limit=5";

            const results = await nominatimRequest(url);

            if (!results.length) {
                setError("No matching locations found.");
                return;
            }

            setSearchResults(results);
        } catch (err) {
            console.error("Location search error:", err);

            setError(
                "Unable to search locations. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Select one of the search results.
    const handleSearchResult = (result) => {
        const lat = Number(result.lat);
        const lng = Number(result.lon);

        const newPosition = [lat, lng];

        setPosition(newPosition);
        setSearchResults([]);
        setSearchText(result.display_name);

        selectLocation(
            result.display_name,
            lat,
            lng
        );

        setError("");
    };
  
const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        return;
    }

    setLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            console.log("Current latitude:", latitude);
            console.log("Current longitude:", longitude);
            console.log("GPS accuracy:", accuracy, "meters");

            const currentPosition = [latitude, longitude];

            // Move the marker and map to the detected position
            setPosition(currentPosition);

            // Retrieve the readable address
            await reverseGeocode(latitude, longitude);

            setLocating(false);
        },
        (error) => {
            console.error("Geolocation error:", error);

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    setError("Please allow location permission to detect your current location.");
                    break;

                case error.POSITION_UNAVAILABLE:
                    setError("Your current location is unavailable. Please try again.");
                    break;

                case error.TIMEOUT:
                    setError("Location request timed out. Please try again.");
                    break;

                default:
                    setError("Unable to detect your current location.");
            }

            setLocating(false);
        },
        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        }
    );
};


    return (
        <div className="location-picker">

            <div className="location-picker-header">
                <h3>Choose Delivery Location</h3>

                <p>
                    Search your address or select your
                    delivery location on the map.
                </p>
            </div>

            {/* Address search */}
            {/* <form
                className="location-search"
                onSubmit={handleSearch}
            >
                <input
                    type="text"
                    value={searchText}
                    onChange={(e) =>
                        setSearchText(e.target.value)
                    }
                    placeholder="Search Kathmandu, Lalitpur, Bhaktapur..."
                />

                <button
                    type="submit"
                    disabled={loading || !searchText.trim()}
                >
                    Search
                </button>
            </form> */}

            {/* Address search (a div, because this component sits inside the checkout form) */}
<div className="location-search">
    <input
        type="text"
        value={searchText}
        onChange={(e) =>
            setSearchText(e.target.value)
        }
        onKeyDown={(e) => {
            if (e.key === "Enter") {
                e.preventDefault(); // don't submit the checkout form
                handleSearch(e);
            }
        }}
        placeholder="Search Kathmandu, Lalitpur, Bhaktapur..."
    />

    <button
        type="button"
        onClick={handleSearch}
        disabled={loading || !searchText.trim()}
    >
        Search
    </button>
</div>

            {/* Search results */}
            {searchResults.length > 0 && (
                <div className="location-search-results">
                    {searchResults.map((result) => (
                        <button
                            type="button"
                            key={result.place_id}
                            onClick={() =>
                                handleSearchResult(result)
                            }
                        >
                            <span>📍</span>
                            <span>{result.display_name}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Current location button */}
            <button
                type="button"
                className="current-location-btn"
                onClick={handleCurrentLocation}
                disabled={locating || loading}
            >
                {locating
                    ? "Detecting Location..."
                    : "◎ Use My Current Location"}
            </button>

            {/* Interactive map */}
            <div className="google-map-container">
                <MapContainer
                    center={DEFAULT_POSITION}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="leaflet-map"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapUpdater position={position} />

                    <MapClickHandler
                        onLocationSelect={handleMapSelection}
                    />

                    <Marker
                        position={position}
                        draggable={true}
                        eventHandlers={{
                            dragend: (event) => {
                                const marker =
                                    event.target;

                                const newPosition =
                                    marker.getLatLng();

                                handleMapSelection([
                                    newPosition.lat,
                                    newPosition.lng
                                ]);
                            }
                        }}
                    />
                </MapContainer>
            </div>

            {/* Selected address */}
            {selectedAddress && (
                <div className="selected-location">
                    <strong>Selected Delivery Location</strong>

                    <p>{selectedAddress}</p>

                    <small>
                        Drag the marker or click on the map
                        to adjust your delivery location.
                    </small>

                    <small>
                        Latitude: {position[0].toFixed(6)}
                        {" | "}
                        Longitude: {position[1].toFixed(6)}
                    </small>
                </div>
            )}

            {loading && (
                <p className="location-loading">
                    Retrieving location information...
                </p>
            )}

            {error && (
                <div className="location-error">
                    {error}
                </div>
            )}

        </div>
    );
};

export default LocationPicker;
