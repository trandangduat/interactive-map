"use client"

import "leaflet/dist/leaflet.css";
// import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
// import "leaflet-defaulticon-compatibility";

import { MapContainer, TileLayer, Marker, Popup, Rectangle, SVGOverlay, useMapEvents } from "react-leaflet";
import { LatLngBoundsExpression, LatLngExpression, LatLngTuple } from 'leaflet';
import { useContext, useState } from "react";
import { SlideContext } from "@/app/page";

interface MapProps {
    posix: LatLngExpression | LatLngTuple,
    zoom?: number,
}

const defaults = {
    zoom: 16,
}

function DrawingLayer() {
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
    const [rectOrgin, setRectOrigin] = useState<LatLngTuple | null>();
    const [rectBounds, setRectBounds] = useState<LatLngBoundsExpression | null>();
    const { drawingStates } = useContext(SlideContext);

    const map = useMapEvents({
        mousedown: (e) => {
            console.log(e.latlng);
            setIsMouseDown(true);
            setRectOrigin([e.latlng.lat, e.latlng.lng]);
        },
        mousemove: (e) => {
            if (isMouseDown && rectOrgin) {
                console.log("Mouse is moving", e.latlng);
                console.log("Rect origin", rectOrgin);
                setRectBounds([rectOrgin, [e.latlng.lat, e.latlng.lng]]);
            }
        },
        mouseup: (e) => {
            console.log("Mouse is up", e.latlng);
            setIsMouseDown(false);
            setRectBounds(null);
            setRectOrigin(null);
        },
    });

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

export default function Map (Map: MapProps) {
    const { zoom = defaults.zoom, posix } = Map;
    const { layers, currentLayerIndex, isPresenting, drawingStates } = useContext(SlideContext);

    return (
        <MapContainer
            key={drawingStates.isDrawing ? "drawing" : "view"} // Key to force re-render when drawing state changes
            center={posix}
            zoom={zoom}
            style={{ height: "100%", width: "100%" }}
            keyboard={false}
            className={drawingStates.isDrawing ? "cursor-crosshair" : ""}
            dragging={drawingStates.isDrawing ? false : true}
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
