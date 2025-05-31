import { Marker, Rectangle, Circle, Polyline } from "react-leaflet";
import L, {  } from 'leaflet';
import { CircleLayer, ArrowLayer } from "@/types/layer";
import { useContext } from "react";
import { LayersContext, PresentationContext } from "@/app/page";

export default function Layers() {
  const { currentLayerIndex, isPresenting, } = useContext(PresentationContext);
  const { layers } = useContext(LayersContext);

  return (
    <>
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
    </>
  )
}