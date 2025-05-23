"use client"

import "leaflet/dist/leaflet.css";
// import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
// import "leaflet-defaulticon-compatibility";

import { MapContainer, TileLayer, Marker, Popup, Rectangle } from "react-leaflet";
import { LatLngExpression, LatLngTuple } from 'leaflet';

interface MapProps {
    posix: LatLngExpression | LatLngTuple,
    zoom?: number,
}

const defaults = {
    zoom: 19,
}

export default function Map (Map: MapProps) {
    const { zoom = defaults.zoom, posix } = Map;

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
            <Popup position={posix}>Haiii</Popup>
            <Rectangle 
                bounds={[
                    [posix[0], posix[1]], 
                    [posix[0] + 0.005, posix[1] + 0.004]
                ]} 
                pathOptions={{ color: "black" }}
            />
        </MapContainer>
    )
}
