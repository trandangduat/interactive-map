"use client"

import "leaflet/dist/leaflet.css";
// import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
// import "leaflet-defaulticon-compatibility";

import { MapContainer, TileLayer, Marker, Popup, Rectangle, Circle, Polyline, SVGOverlay, useMapEvents, useMap } from "react-leaflet";
import L, { bounds, latLng, LatLngBoundsExpression, LatLngExpression, LatLngTuple, PointExpression } from 'leaflet';
import { use, useContext, useEffect, useState } from "react";
import { SlideContext, SlidesControlContext } from "@/app/page";
import { v4 as uuidv4 } from "uuid";
import { Layer, CircleLayer, ArrowLayer } from "@/types/layer";
import { NewLayerAction } from "@/types/history-stack";

function DrawingLayer() {
    const [rectOrgin, setRectOrigin] = useState<LatLngTuple | null>();
    const [rectBounds, setRectBounds] = useState<LatLngBoundsExpression | null>();
    const [circleCenter, setCircleCenter] = useState<LatLngTuple | null>();
    const [circleRadius, setCircleRadius] = useState<number>(0);
    const [arrowStart, setArrowStart] = useState<LatLngTuple | null>();
    const [arrowEnd, setArrowEnd] = useState<LatLngTuple | null>();
    const { setLayers, drawingStates, setInspectingLayerId, slideHistory, setSlideHistory } = useContext(SlideContext);

    const map = useMapEvents({
        mousedown: (e) => {
            if (drawingStates.isDrawing) {
                switch (drawingStates.drawingMode) {
                    case 0: // Rectangle
                        setRectOrigin([e.latlng.lat, e.latlng.lng]);
                        break;
                    case 1: // Circle
                        setCircleCenter([e.latlng.lat, e.latlng.lng]);
                        setCircleRadius(0);
                        break;
                    case 2: // Arrow
                        setArrowStart([e.latlng.lat, e.latlng.lng]);
                        break;
                }
            }
        },
        mousemove: (e) => {
            if (drawingStates.isDrawing) {
                switch (drawingStates.drawingMode) {
                    case 0: // Rectangle
                        if (rectOrgin) {
                            setRectBounds([rectOrgin, [e.latlng.lat, e.latlng.lng]]);
                        }
                        break;
                    case 1: // Circle
                        if (circleCenter) {
                            const radius = map.distance(circleCenter, [e.latlng.lat, e.latlng.lng]);
                            setCircleRadius(radius);
                        }
                        break;
                    case 2: // Arrow
                        if (arrowStart) {
                            setArrowEnd([e.latlng.lat, e.latlng.lng]);
                        }
                        break;
                }
            }
        },
        mouseup: (e) => {
            if (drawingStates.isDrawing) {
                let newLayer: Layer;
                switch (drawingStates.drawingMode) {
                    case 0: // Rectangle
                        if (rectOrgin && rectBounds) {
                            let rectBounds: LatLngBoundsExpression = [
                                rectOrgin,
                                [e.latlng.lat, e.latlng.lng]
                            ];
                            newLayer = {
                                type: "rectangle",
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
                        }
                        break;
                    case 1: // Circle
                        if (circleCenter && circleRadius > 0) {
                            newLayer = {
                                type: "circle",
                                uuid: uuidv4(),
                                isPinned: false,
                                isHidden: false,
                                center: circleCenter,
                                radius: circleRadius,
                                pathOptions: {
                                    color: drawingStates.strokeColor || 'blue',
                                    fillColor: drawingStates.fillColor || 'blue',
                                    fillOpacity: drawingStates.fillOpacity || 0.5,
                                },
                            };
                            newLayer.realLifeArea = Math.PI * Math.pow(circleRadius, 2);
                            setInspectingLayerId(newLayer.uuid);
                        }
                        break;
                    case 2: // Arrow
                        if (arrowStart && arrowEnd) {
                            newLayer = {
                                type: "arrow",
                                uuid: uuidv4(),
                                isPinned: false,
                                isHidden: false,
                                start: arrowStart,
                                end: arrowEnd,
                                pathOptions: {
                                    color: drawingStates.strokeColor || 'blue',
                                    weight: 3,
                                },
                            };
                            newLayer.realLifeDistance = map.distance(arrowStart, arrowEnd);
                            setInspectingLayerId(newLayer.uuid);
                        }
                        break;
                    default:
                        return;
                }

                if (newLayer!) {
                    setLayers((prevLayers) => [...prevLayers, newLayer]);
                    setSlideHistory(prev => {
                        const newSlideHistory = prev.copy();
                        newSlideHistory.push({
                            type: "NEW_LAYER",
                            layer: {...newLayer},
                        } as NewLayerAction);
                        return newSlideHistory;
                    });
                }
            }

            // Reset all drawing states
            setRectBounds(null);
            setRectOrigin(null);
            setCircleCenter(null);
            setCircleRadius(0);
            setArrowStart(null);
            setArrowEnd(null);
        },
    });

    if (drawingStates.isDrawing) {
        map.dragging.disable();
    } else {
        map.dragging.enable();
    }

    if (!rectOrgin && !circleCenter && !arrowStart) {
        return null;
    }

    return (
        <>
            {rectOrgin && rectBounds && drawingStates.drawingMode === 0 && (
                <Rectangle
                    bounds={rectBounds}
                    pathOptions={{
                        color: drawingStates.strokeColor || 'blue',
                        weight: 2,
                        fillColor: drawingStates.fillColor || 'blue',
                        fillOpacity: drawingStates.fillOpacity || 0.5,
                    }}
                />
            )}
            {circleCenter && circleRadius > 0 && drawingStates.drawingMode === 1 && (
                <Circle
                    center={circleCenter}
                    radius={circleRadius}
                    pathOptions={{
                        color: drawingStates.strokeColor || 'blue',
                        weight: 2,
                        fillColor: drawingStates.fillColor || 'blue',
                        fillOpacity: drawingStates.fillOpacity || 0.5,
                    }}
                />
            )}
            {arrowStart && arrowEnd && drawingStates.drawingMode === 2 && (() => {
                const dx = arrowEnd[1] - arrowStart[1]; // longitude difference
                const dy = arrowStart[0] - arrowEnd[0]; // latitude difference (flipped for screen coordinates)
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;

                return (
                    <>
                        <Polyline
                            positions={[arrowStart, arrowEnd]}
                            pathOptions={{
                                color: drawingStates.strokeColor || 'blue',
                                weight: 3,
                            }}
                        />
                        <Marker
                            position={arrowEnd}
                            icon={L.divIcon({
                                className: 'arrow-head-marker-preview',
                                html: `<div style="
                                    width: 0;
                                    height: 0;
                                    border-left: 8px solid transparent;
                                    border-right: 8px solid transparent;
                                    border-bottom: 16px solid ${drawingStates.strokeColor || 'blue'};
                                    transform: rotate(${angle + 90}deg);
                                    transform-origin: center;
                                "></div>`,
                                iconSize: [16, 16],
                                iconAnchor: [8, 8]
                            })}
                        />
                    </>
                );
            })()}
        </>
    );
}

function InspectingLayer() {
    const { inspectingLayerId, layers, isPresenting } = useContext(SlideContext);

    if (isPresenting) {
        return null;
    }

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

        case "circle":
            const circleLayer = layer as CircleLayer;
            const circleAreaDisplay = layer.realLifeArea! < 10000
                ? `${layer.realLifeArea!.toFixed(1)} m²`
                : `${(layer.realLifeArea! / 10000).toFixed(2)} ha`;

            const radiusDisplay = circleLayer.radius < 1000
                ? `R: ${circleLayer.radius.toFixed(1)}m`
                : `R: ${(circleLayer.radius / 1000).toFixed(2)}km`;

            return (
                <>
                    <Circle
                        key={layer.uuid}
                        center={circleLayer.center}
                        radius={circleLayer.radius}
                        pathOptions={{
                            color: '#3b82f6',
                            weight: 2,
                            fillColor: '#3b82f6',
                            fillOpacity: 0.2,
                        }}
                    >
                        <SVGOverlay bounds={[
                            [circleLayer.center[0] - 0.001, circleLayer.center[1] - 0.001],
                            [circleLayer.center[0] + 0.001, circleLayer.center[1] + 0.001]
                        ]}>
                            <g>
                                <rect
                                    x="50%"
                                    y="50%"
                                    width="120"
                                    height="40"
                                    fill="white"
                                    fillOpacity="0.8"
                                    stroke="#3b82f6"
                                    strokeWidth="1"
                                    transform="translate(-60, -20)"
                                />
                                <text
                                    x="50%"
                                    y="40%"
                                    dominantBaseline="middle"
                                    textAnchor="middle"
                                    fill="#3b82f6"
                                    fontSize="12"
                                    fontWeight="bold"
                                >
                                    {radiusDisplay}
                                </text>
                                <text
                                    x="50%"
                                    y="60%"
                                    dominantBaseline="middle"
                                    textAnchor="middle"
                                    fill="#3b82f6"
                                    fontSize="12"
                                    fontWeight="bold"
                                >
                                    {circleAreaDisplay}
                                </text>
                            </g>
                        </SVGOverlay>
                        <Marker
                            position={circleLayer.center}
                            icon={L.divIcon({
                                className: 'custom-center-marker',
                                html: `<div style="
                                    width: 8px;
                                    height: 8px;
                                    background-color: #3b82f6;
                                    border: 2px solid white;
                                    border-radius: 50%;
                                    outline: 1px solid #3b82f6;
                                "></div>`,
                                iconSize: [12, 12],
                                iconAnchor: [6, 6]
                            })}
                        >
                            <Popup>
                                <div className="text-xs font-mono">
                                    <div>Center: {circleLayer.center[0].toFixed(6)}, {circleLayer.center[1].toFixed(6)}</div>
                                    <div>Radius: {circleLayer.radius.toFixed(1)} m</div>
                                    <div>Area: {circleAreaDisplay}</div>
                                </div>
                            </Popup>
                        </Marker>
                    </Circle>
                </>
            );

        case "arrow":
            const arrowLayer = layer as ArrowLayer;

            // Calculate arrow direction
            const dx = arrowLayer.end[1] - arrowLayer.start[1];
            const dy = arrowLayer.start[0] - arrowLayer.end[0];
            const angle = Math.atan2(dy, dx) * 180 / Math.PI; // Convert to degrees for CSS rotation

            const distance = arrowLayer.realLifeDistance!;
            const distanceDisplay = distance < 1000
                ? `${distance.toFixed(1)} m`
                : `${(distance / 1000).toFixed(2)} km`;

            return (
                <>
                    <Polyline
                        key={`${layer.uuid}-line`}
                        positions={[arrowLayer.start, arrowLayer.end]}
                        pathOptions={{
                            color: '#3b82f6',
                            weight: 3,
                        }}
                    >
                        <Marker
                            position={arrowLayer.end}
                            icon={L.divIcon({
                                className: 'arrow-head-marker-inspection',
                                html: `<div style="
                                    width: 0;
                                    height: 0;
                                    border-left: 10px solid transparent;
                                    border-right: 10px solid transparent;
                                    border-bottom: 20px solid #3b82f6;
                                    transform: rotate(${angle + 90}deg);
                                    transform-origin: center;
                                "></div>`,
                                iconSize: [20, 20],
                                iconAnchor: [10, 10]
                            })}
                        />
                        <SVGOverlay bounds={[arrowLayer.start, arrowLayer.end]}>
                            <g>
                                <rect
                                    x="50%"
                                    y="50%"
                                    width="80"
                                    height="25"
                                    fill="white"
                                    fillOpacity="0.8"
                                    stroke="#3b82f6"
                                    strokeWidth="1"
                                    transform="translate(-40, -12)"
                                />
                                <text
                                    x="50%"
                                    y="50%"
                                    dominantBaseline="middle"
                                    textAnchor="middle"
                                    fill="#3b82f6"
                                    fontSize="14"
                                    fontWeight="bold"
                                >
                                    {distanceDisplay}
                                </text>
                            </g>
                        </SVGOverlay>
                        <Marker
                            position={arrowLayer.start}
                            icon={L.divIcon({
                                className: 'custom-arrow-marker',
                                html: `<div style="
                                    width: 8px;
                                    height: 8px;
                                    background-color: #3b82f6;
                                    border: 2px solid white;
                                    border-radius: 50%;
                                "></div>`,
                                iconSize: [12, 12],
                                iconAnchor: [6, 6]
                            })}
                        >
                            <Popup>
                                <div className="text-xs font-mono">
                                    <div>Start: {arrowLayer.start[0].toFixed(6)}, {arrowLayer.start[1].toFixed(6)}</div>
                                    <div>End: {arrowLayer.end[0].toFixed(6)}, {arrowLayer.end[1].toFixed(6)}</div>
                                    <div>Distance: {distanceDisplay}</div>
                                </div>
                            </Popup>
                        </Marker>
                    </Polyline>
                </>
            );

        default:
            return null;
    }
}

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
            {layers.map((layer, index) => {
                if (layer.isHidden) {
                    return null;
                }
                if (!layer.isPinned && isPresenting && index > currentLayerIndex) {
                    return null;
                }

                switch (layer.type) {
                    case "rectangle":
                        return (
                            <Rectangle
                                key={index}
                                bounds={layer.bounds}
                                pathOptions={layer.pathOptions}
                            />
                        );
                    case "circle":
                        const circleLayer = layer as CircleLayer;
                        return (
                            <Circle
                                key={index}
                                center={circleLayer.center}
                                radius={circleLayer.radius}
                                pathOptions={circleLayer.pathOptions}
                            />
                        );
                    case "arrow":
                        const arrowLayer = layer as ArrowLayer;

                        // Calculate arrow direction
                        const dx = arrowLayer.end[1] - arrowLayer.start[1];
                        const dy = arrowLayer.start[0] - arrowLayer.end[0];
                        const angle = Math.atan2(dy, dx) * 180 / Math.PI; // Convert to degrees for CSS rotation

                        return (
                            <div key={index}>
                                <Polyline
                                    positions={[arrowLayer.start, arrowLayer.end]}
                                    pathOptions={arrowLayer.pathOptions}
                                />
                                <Marker
                                    position={arrowLayer.end}
                                    icon={L.divIcon({
                                        className: 'arrow-head-marker',
                                        html: `<div style="
                                            width: 0;
                                            height: 0;
                                            border-left: 8px solid transparent;
                                            border-right: 8px solid transparent;
                                            border-bottom: 16px solid ${arrowLayer.pathOptions?.color || '#000'};
                                            transform: rotate(${angle + 90}deg);
                                            transform-origin: center;
                                        "></div>`,
                                        iconSize: [16, 16],
                                        iconAnchor: [8, 8]
                                    })}
                                />
                            </div>
                        );
                    default:
                        return null;
                }
            })}
            <InspectingLayer />
        </MapContainer>
    )
}
