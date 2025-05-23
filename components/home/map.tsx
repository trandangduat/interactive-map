"use client"

import "leaflet/dist/leaflet.css";
// import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
// import "leaflet-defaulticon-compatibility";

import { MapContainer, TileLayer, Marker, Popup, Rectangle, SVGOverlay } from "react-leaflet";
import { LatLngExpression, LatLngTuple } from 'leaflet';
import { useContext } from "react";
import { SlideContext } from "@/app/page";

interface MapProps {
    posix: LatLngExpression | LatLngTuple,
    zoom?: number,
}

const defaults = {
    zoom: 19,
}

export default function Map (Map: MapProps) {
    const { zoom = defaults.zoom, posix } = Map;
    const { layers } = useContext(SlideContext);

    console.log("layers", layers);

    return (
        <MapContainer
            center={posix}
            zoom={zoom}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {layers.map((layer, index) => {
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
