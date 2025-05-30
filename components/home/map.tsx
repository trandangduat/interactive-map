"use client"

import "leaflet/dist/leaflet.css";
// import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
// import "leaflet-defaulticon-compatibility";

import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { LatLngExpression } from 'leaflet';
import { useContext, useEffect } from "react";
import { SlideContext } from "@/app/page";
import DrawingLayer from "./drawing-layer";
import InspectingLayer from "./inspecting-layer";
import Layers from "./layers";

const inspectionStyles = `
.custom-corner-marker div {
    transition: transform 0.2s ease;
}
.custom-corner-marker div:hover {
    transform: scale(1.4);
    background-color: #3b82f6;
    cursor: grab;
}
.arrow-head-marker,
.arrow-head-marker-inspection,
.arrow-head-marker-preview {
    pointer-events: none;
}
`;

function UpdateMapState() {
    const { latLng, mapZoom, setLatLng, setMapZoom, mapViewWorkaround } = useContext(SlideContext);

    const map = useMap();

    useEffect(() => {
        // Only update the map view after the latLng and mapZoom have been set to the current slide's values (when mapViewWorkaround increases)
        if (map.getCenter().equals(latLng) && map.getZoom() === mapZoom) {
            return;
        }
        map.flyTo(latLng, mapZoom, {
            duration: 0.2,
        });
    }, [mapViewWorkaround]);

    useEffect(() => {
        const handleMapInteraction = () => {
            const center: LatLngExpression = map.getCenter();
            const zoom: number = map.getZoom();
            // Only update if the values have actually changed to prevent potential loops
            if (latLng && (center.lat !== latLng[0] || center.lng !== latLng[1] || zoom !== mapZoom)) {
                setLatLng([center.lat, center.lng]);
                setMapZoom(zoom);
            }
        };

        map.on('moveend', handleMapInteraction);
        map.on('zoomend', handleMapInteraction);

        return () => {
            map.off('moveend', handleMapInteraction);
            map.off('zoomend', handleMapInteraction);
        };
    }, [latLng, mapZoom]);

    return null;
};

export default function Map() {
    const {
        latLng,
        mapZoom,
    } = useContext(SlideContext);

    useEffect(() => {
        if (!document.getElementById('inspection-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'inspection-styles';
            styleEl.innerHTML = inspectionStyles;
            document.head.appendChild(styleEl);
        }

        return () => {
            const styleEl = document.getElementById('inspection-styles');
            if (styleEl) styleEl.remove();
        };
    }, []);

    return (
        <MapContainer
            // key={currentSlideIndex} // Key to force re-render when drawing state changes
            center={latLng}
            zoom={mapZoom}
            style={{ height: "100%", width: "100%" }}
            keyboard={false}
            doubleClickZoom={false}
        >
            <UpdateMapState />
            <DrawingLayer />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Layers />
            <InspectingLayer />
        </MapContainer>
    )
}
