"use client"

import "leaflet/dist/leaflet.css";
// import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
// import "leaflet-defaulticon-compatibility";

import { MapContainer, TileLayer, Marker, Popup, Rectangle, SVGOverlay, useMapEvents, useMap } from "react-leaflet";
import { LatLngBoundsExpression, LatLngExpression, LatLngTuple } from 'leaflet';
import { useContext, useEffect, useState } from "react";
import { Layer, SlideContext } from "@/app/page";
import { v4 as uuidv4 } from "uuid";

function DrawingLayer() {
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
    const [rectOrgin, setRectOrigin] = useState<LatLngTuple | null>();
    const [rectBounds, setRectBounds] = useState<LatLngBoundsExpression | null>();
    const { layers, setLayers, drawingStates } = useContext(SlideContext);

    const map = useMapEvents({
        mousedown: (e) => {
            if (drawingStates.isDrawing) {
                setIsMouseDown(true);
                setRectOrigin([e.latlng.lat, e.latlng.lng]);
            }
        },
        mousemove: (e) => {
            if (isMouseDown && rectOrgin) {
                setRectBounds([rectOrgin, [e.latlng.lat, e.latlng.lng]]);
            }
        },
        mouseup: (e) => {
            if (isMouseDown && rectOrgin && rectBounds) {
                let newLayer: Layer;
                switch (drawingStates.drawingMode) {
                    case 0: // Rectangle
                        newLayer = {
                            type: "rectangle",
                            order: layers.length,
                            uuid: uuidv4(),
                            isPinned: false,
                            isHidden: false,
                            bounds: [rectOrgin, [e.latlng.lat, e.latlng.lng]],
                            pathOptions: {
                                color: drawingStates.strokeColor || 'blue',
                                fillColor: drawingStates.fillColor || 'blue',
                                fillOpacity: drawingStates.fillOpacity || 0.5,
                            },
                        };
                        break;
                    case 1: // Circle
                        break;
                    case 2: // Arrow
                        break;
                    default:
                        return; // No valid drawing mode selected
                }
                setLayers((prevLayers) => [...prevLayers, newLayer]);
                setIsMouseDown(false);
                setRectBounds(null);
                setRectOrigin(null);
            }
        },
    });

    if (drawingStates.isDrawing) {
        map.dragging.disable();
    } else {
        map.dragging.enable();
    }

    if (!isMouseDown || !rectOrgin || !rectBounds) {
        return null;
    }

    return (
        <Rectangle
            bounds={rectBounds}
            pathOptions={{
                color: drawingStates.strokeColor || 'blue',
                weight: 2,
                fillColor: drawingStates.fillColor || 'blue',
                fillOpacity: drawingStates.fillOpacity || 0.5,
            }}
        />
    );
}

export default function Map() {
    const {
        layers,
        currentLayerIndex,
        isPresenting,
        drawingStates,
        latLng,
        mapZoom,
    } = useContext(SlideContext);

    return (
        <MapContainer
            // key={drawingStates.isDrawing ? "drawing" : "view"} // Key to force re-render when drawing state changes
            center={latLng}
            zoom={mapZoom}
            style={{ height: "100%", width: "100%" }}
            keyboard={false}
        >
            <DrawingLayer />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {layers.map((layer, index) => {
                if (layer.isHidden) {
                    return null;
                }
                if (!layer.isPinned && isPresenting && index > currentLayerIndex) {
                    return null;
                }
                if (layer.type === "rectangle") {
                    return (
                        <Rectangle
                            key={index}
                            bounds={layer.bounds}
                            pathOptions={layer.pathOptions}
                        />
                    )
                }
            })}
        </MapContainer>
    )
}
