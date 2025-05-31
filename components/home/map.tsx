"use client"

import "leaflet/dist/leaflet.css";
// import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
// import "leaflet-defaulticon-compatibility";

import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { LatLngExpression } from 'leaflet';
import { use, useContext, useEffect } from "react";
import { SlideContext, SlidesControlContext } from "@/app/page";
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
    const {
        slides,
        setSlides,
        currentSlideIndex,
        previousSlideIndex
    } = useContext(SlidesControlContext);

    const { mapViewWorkaround } = useContext(SlideContext);

    const map = useMap();

    useEffect(() => {
        // Save the map center and zoom level of the previous slide
        if (previousSlideIndex >= 0) {
            const previousSlide = slides[previousSlideIndex];
            if (previousSlide) {
                previousSlide.latLng = [map.getCenter().lat, map.getCenter().lng];
                previousSlide.mapZoom = map.getZoom();
                setSlides(prevSlides => {
                    const updatedSlides = [...prevSlides];
                    updatedSlides[previousSlideIndex] = {...previousSlide};
                    return updatedSlides;
                });
            }
        }

        // Update the map view to the current slide's center and zoom level
        const { latLng, mapZoom } = slides[currentSlideIndex];
        if (map.getCenter().equals(latLng) && map.getZoom() === mapZoom) {
            return;
        }
        map.flyTo(latLng, mapZoom, {
            duration: 0.2,
        });
    }, [mapViewWorkaround]);

    return null;
};

export default function Map() {
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
            center={[21.03, 105.804]}
            zoom={16}
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
