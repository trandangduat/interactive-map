"use client"

import { Button } from "@/components/ui/button";
import { LatLngBoundsExpression, PathOptions } from "leaflet";
import { Square } from "lucide-react";
import dynamic from "next/dynamic";
import { createContext, JSX, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const LazyMap = dynamic(() => import("@/components/home/map"), {
  ssr: false,
});

export interface BaseLayer {
  type: string,
  order: number,
  uuid: string,
}

export interface RectLayer extends BaseLayer {
  type: "rectangle"
  bounds: LatLngBoundsExpression
  pathOptions: PathOptions
}

export interface CircleLayer extends BaseLayer {
  type: "circle"
  center: LatLngBoundsExpression
  radius: number
  pathOptions: PathOptions
}

export interface ArrowLayer extends BaseLayer {
  type: "arrow"
  start: LatLngBoundsExpression
  end: LatLngBoundsExpression
  pathOptions: PathOptions
}

// Thay đổi Layer thành union của 3 loại trên
export type Layer = RectLayer | CircleLayer | ArrowLayer

type SlideContextProps = {
  layers: Layer[],
  setLayers: (layers: Layer[]) => void,
  latLng: [number, number],
  setLatLng: (latLng: [number, number]) => void,
};

export const SlideContext = createContext<SlideContextProps>({
  layers: [],
  setLayers: () => { },
  latLng: [21.03, 105.804],
  setLatLng: () => { },
});

export default function Home() {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [latLng, setLatLng] = useState<[number, number]>([21.03, 105.804]);

  const handleRect = () => {
    const newLayer: RectLayer = {
      type: "rectangle",
      order: layers.length,
      uuid: uuidv4(),
      bounds: [latLng, [latLng[0] + Math.random() * 0.001, latLng[1] + Math.random() * 0.001]],
      pathOptions: {
        color: "red",
        fillColor: "red",
        fillOpacity: 0.5,
      },
    };
    setLayers([...layers, newLayer]);
  };

  const handleCircle = () => {
  };

  const handleArrow = () => {
  };

  return (
    <>
      <SlideContext.Provider value={{ layers, setLayers, latLng, setLatLng }}>
        <div className="flex flex-row w-7xl mx-auto">
          <div className="flex flex-col flex-1">
            <div className="mx-auto p-4 z-10 h-fit bg-slate-600 border-1 w-xl flex flex-row gap-2">
              <Button onClick={handleRect}>Rectangle</Button>
              <Button onClick={handleCircle}>Circle</Button>
              <Button onClick={handleArrow}>Arrow</Button>
            </div>
            <div className="mx-auto my-5 w-[98%] h-dvh z-1 relative">
              <LazyMap posix={latLng} />
            </div>
          </div>
          <div className="bg-slate-600 text-white border-1 w-64">
            <p className="text-white text-2xl m-2">Layers</p>
            {layers.map((layer, index) => {
              let layerIcon: JSX.Element;
              switch (layer.type) {
                case "rectangle":
                  layerIcon = <Square size={16} />;
                  break;
              }
              return (
                <div key={layer.uuid} className="flex flex-row items-center p-2 m-2 gap-2 bg-slate-700 rounded-md">
                  {layerIcon!}
                  {layer.order + layer.type}
                </div>
              );
            })}
          </div>
        </div>
      </SlideContext.Provider>
    </>
  );
}

