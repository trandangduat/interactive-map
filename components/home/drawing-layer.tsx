import { Marker, Rectangle, Circle, Polyline, useMapEvents } from "react-leaflet";
import L, { LatLngBoundsExpression, LatLngTuple, PointExpression } from 'leaflet';
import { useContext, useState } from "react";
import { SlideContext } from "@/app/page";
import { v4 as uuidv4 } from "uuid";
import { Layer } from "@/types/layer";
import { NewLayerAction } from "@/types/history-stack";
import { HistoryStack } from "@/app/history-stack";

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
                    // Create 100 other objects with latlng near to the first object
                    const LIMIT:number = 100;
                    setLayers((prevLayers) => {
                        const newLayers = [newLayer];
                        if (newLayer.type === "rectangle" && Array.isArray(newLayer.bounds)) {
                            const [origin, corner] = newLayer.bounds as [LatLngTuple, LatLngTuple];
                            for (let i = 1; i <= LIMIT; i++) {
                                const offset = i * 0.0005;
                                const shiftedOrigin: LatLngTuple = [origin[0] + offset, origin[1] + offset];
                                const shiftedCorner: LatLngTuple = [corner[0] + offset, corner[1] + offset];
                                newLayers.push({
                                    ...newLayer,
                                    uuid: uuidv4(),
                                    bounds: [shiftedOrigin, shiftedCorner],
                                });
                            }
                        } else if (newLayer.type === "circle" && newLayer.center) {
                            for (let i = 1; i <= LIMIT; i++) {
                                const offset = i * 0.0005;
                                const shiftedCenter: LatLngTuple = [
                                    newLayer.center[0] + offset,
                                    newLayer.center[1] + offset,
                                ];
                                newLayers.push({
                                    ...newLayer,
                                    uuid: uuidv4(),
                                    center: shiftedCenter,
                                });
                            }
                        } else if (newLayer.type === "arrow" && newLayer.start && newLayer.end) {
                            for (let i = 1; i <= LIMIT; i++) {
                                const offset = i * 0.0005;
                                const shiftedStart: LatLngTuple = [
                                    newLayer.start[0] + offset,
                                    newLayer.start[1] + offset,
                                ];
                                const shiftedEnd: LatLngTuple = [
                                    newLayer.end[0] + offset,
                                    newLayer.end[1] + offset,
                                ];
                                newLayers.push({
                                    ...newLayer,
                                    uuid: uuidv4(),
                                    start: shiftedStart,
                                    end: shiftedEnd,
                                });
                            }
                        }
                        return [...prevLayers, ...newLayers];
                    });
                    setSlideHistory((prev: HistoryStack) => {
                        const newSlideHistory = prev.copy();
                        // Add history for the original layer and the 100 new ones
                        for (let i = 0; i < LIMIT + 1; i++) {
                            newSlideHistory.push({
                                type: "NEW_LAYER",
                                layer: { ...newLayer, uuid: i === 0 ? newLayer.uuid : uuidv4() },
                            } as NewLayerAction);
                        }
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