import { Marker, Rectangle, Circle, Polyline, useMapEvents } from "react-leaflet";
import L, { LatLngBoundsExpression, LatLngTuple, PointExpression } from 'leaflet';
import { useContext, useState } from "react";
import { SlideContext } from "@/app/page";
import { v4 as uuidv4 } from "uuid";
import { Layer } from "@/types/layer";
import { NewLayerAction } from "@/types/history-stack";

export default function DrawingLayer() {
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