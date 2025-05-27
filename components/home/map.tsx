"use client"

import "leaflet/dist/leaflet.css";
// import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
// import "leaflet-defaulticon-compatibility";

import { MapContainer, TileLayer, Marker, Popup, Rectangle, SVGOverlay, useMapEvents, useMap } from "react-leaflet";
import L, { bounds, LatLngBoundsExpression, LatLngExpression, LatLngTuple, PointExpression } from 'leaflet';
import { useContext, useEffect, useState } from "react";
import { Layer, SlideContext } from "@/app/page";
import { v4 as uuidv4 } from "uuid";

function DrawingLayer() {
    const [rectOrgin, setRectOrigin] = useState<LatLngTuple | null>();
    const [rectBounds, setRectBounds] = useState<LatLngBoundsExpression | null>();
    const { layers, setLayers, drawingStates, setInspectingLayerId } = useContext(SlideContext);

    const map = useMapEvents({
        mousedown: (e) => {
            if (drawingStates.isDrawing) {
                setRectOrigin([e.latlng.lat, e.latlng.lng]);
            }
        },
        mousemove: (e) => {
            if (rectOrgin) {
                setRectBounds([rectOrgin, [e.latlng.lat, e.latlng.lng]]);
            }
        },
        mouseup: (e) => {
            if (rectOrgin && rectBounds) {
                let newLayer: Layer;
                switch (drawingStates.drawingMode) {
                    case 0: // Rectangle
                        let rectBounds: LatLngBoundsExpression = [
                            rectOrgin,
                            [e.latlng.lat, e.latlng.lng]
                        ];
                        newLayer = {
                            type: "rectangle",
                            order: layers.length,
                            uuid: uuidv4(),
                            isPinned: false,
                            isHidden: false,
                            bounds: rectBounds,
                            pathOptions: {
                                color: drawingStates.strokeColor || 'blue',
                                fillColor: drawingStates.fillColor || 'blue',
                                fillOpacity: drawingStates.fillOpacity || 0.5,
                            },
                        };
                        newLayer.realLifeArea = map.distance(
                            rectBounds[0],
                            [rectBounds[0][0], rectBounds[1][1]]
                        ) * map.distance(
                            rectBounds[0],
                            [rectBounds[1][0], rectBounds[0][1]]
                        );
                        setInspectingLayerId(newLayer.uuid);
                        break;
                    case 1: // Circle
                        break;
                    case 2: // Arrow
                        break;
                    default:
                        return; // No valid drawing mode selected
                }
                setLayers((prevLayers) => [...prevLayers, newLayer]);
            }
            setRectBounds(null);
            setRectOrigin(null);
        },
    });

    if (drawingStates.isDrawing) {
        map.dragging.disable();
    } else {
        map.dragging.enable();
    }

    if (!rectOrgin || !rectBounds) {
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

function InspectingLayer() {
    const { inspectingLayerId, layers } = useContext(SlideContext);

    if (!inspectingLayerId) {
        return null;
    }
    const layer = layers.find(l => l.uuid === inspectingLayerId);
    if (!layer) {
        return null;
    }

    switch (layer.type) {
        case "rectangle":
            const layerBounds = layer.bounds as [LatLngTuple, LatLngTuple];
            const corners = {
                topLeft: [layerBounds[0][0], layerBounds[0][1]],
                topRight: [layerBounds[0][0], layerBounds[1][1]],
                bottomLeft: [layerBounds[1][0], layerBounds[0][1]],
                bottomRight: [layerBounds[1][0], layerBounds[1][1]],
            };

            const areaDisplay = layer.realLifeArea! < 10000
                ? `${layer.realLifeArea!.toFixed(1)} m²`
                : `${(layer.realLifeArea! / 10000).toFixed(2)} ha`;

            return (
                <>
                    <Rectangle
                        key={layer.uuid}
                        bounds={layerBounds}
                        pathOptions={{
                            color: '#3b82f6',
                            weight: 2,
                            fillColor: '#3b82f6',
                        }}
                    >
                    <SVGOverlay bounds={layerBounds}>
                        <g>
                            <rect
                                x="50%"
                                y="50%"
                                width="100"
                                height="30"
                                fill="white"
                                fillOpacity="0.8"
                                stroke="#3b82f6"
                                strokeWidth="1"
                                transform="translate(-50, -15)"
                            />
                            <text
                                x="50%"
                                y="50%"
                                dominantBaseline="middle"
                                textAnchor="middle"
                                fill="#3b82f6"
                                fontSize="16"
                                fontWeight="bold"
                            >
                                {areaDisplay}
                            </text>
                        </g>
                    </SVGOverlay>

                        </Rectangle>

                    {Object.entries(corners).map(([position, coord], idx) => (
                        <Marker
                            key={`corner-${idx}`}
                            position={coord as LatLngTuple}
                            icon={L.divIcon({
                                className: 'custom-corner-marker',
                                html: `<div style="
                                    width: 8px;
                                    height: 8px;
                                    background-color: white;
                                    border: 1px solid #3b82f6;
                                    outline: 1px solid white;
                                "></div>`,
                                iconSize: [8, 8],
                                iconAnchor: [4, 4]
                            })}
                        >
                            <Popup>
                                <div className="text-xs font-mono">
                                    <div>Lat: {(coord as LatLngTuple)[0].toFixed(6)}</div>
                                    <div>Lng: {(coord as LatLngTuple)[1].toFixed(6)}</div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </>
            );
        break;

        case "circle":
            // Handle circle layer inspection
            break;

        case "arrow":
            // Handle arrow layer inspection
            break;

        default:
            return null;
    }
}

// Add custom styles for inspection controls
const inspectionStyles = `
.custom-corner-marker div {
    transition: transform 0.2s ease;
}
.custom-corner-marker div:hover {
    transform: scale(1.4);
    background-color: #3b82f6;
    cursor: grab;
}
`;

export default function Map() {
    const {
        layers,
        currentLayerIndex,
        isPresenting,
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
            <InspectingLayer />
        </MapContainer>
    )
}
