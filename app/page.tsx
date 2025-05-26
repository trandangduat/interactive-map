"use client"

import LayerSidebar from "@/components/home/layer-sidebar";
import Toolbar from "@/components/home/toolbar";
import { cn } from "@/lib/utils";
import { LatLngBoundsExpression, PathOptions } from "leaflet";
import dynamic from "next/dynamic";
import { createContext, Dispatch, SetStateAction, useEffect, useState } from "react";

const LazyMap = dynamic(() => import("@/components/home/map"), {
  ssr: false,
});

export interface BaseLayer {
  type: string,
  order: number,
  uuid: string,
  isPinned: boolean,
  isHidden: boolean,
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

export type Layer = RectLayer | CircleLayer | ArrowLayer

export type DrawingStates = {
  isDrawing: boolean,
  drawingMode: number, // -1: not drawing, 0: rectangle, 1: circle, 2: arrow
  strokeColor?: string,
  fillColor?: string,
  fillOpacity?: number,
};

type SlideContextProps = {
  layers: Layer[],
  latLng: [number, number],
  currentLayerIndex: number,
  isPresenting: boolean,
  drawingStates: DrawingStates,
  mapZoom: number,
  setLayers: Dispatch<SetStateAction<Layer[]>>,
  setLatLng: Dispatch<SetStateAction<[number, number]>>,
  setIsPresenting: Dispatch<SetStateAction<boolean>>,
  setCurrentLayerIndex: Dispatch<SetStateAction<number>>,
  setDrawingStates: Dispatch<SetStateAction<DrawingStates>>,
  setMapZoom: Dispatch<SetStateAction<number>>,
};

export const SlideContext = createContext<SlideContextProps>({
  layers: [],
  latLng: [21.03, 105.804],
  currentLayerIndex: -1,
  isPresenting: false,
  drawingStates: {
    isDrawing: false,
    drawingMode: -1,
    strokeColor: "#000000",
    fillColor: "#000000",
    fillOpacity: 0.5,
  },
  mapZoom: 16,
  setLayers: () => {},
  setLatLng: () => {},
  setIsPresenting: () => {},
  setCurrentLayerIndex: () => {},
  setDrawingStates: () => {},
  setMapZoom: () => {},
});

export default function Home() {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [latLng, setLatLng] = useState<[number, number]>([21.03, 105.804]);
  const [mapZoom, setMapZoom] = useState<number>(16); // Default zoom level
  const [drawingStates, setDrawingStates] = useState<DrawingStates>({
    isDrawing: false,
    drawingMode: -1,
    strokeColor: "#000000",
    fillColor: "#000000",
    fillOpacity: 0.5,
  });
  const [isPresenting, setIsPresenting] = useState<boolean>(false);
  const [currentLayerIndex, setCurrentLayerIndex] = useState<number>(-1);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsPresenting(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleNextPresentingLayer = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setCurrentLayerIndex((prev) => {
          let nextId: number = prev + 1;
          while (nextId + 1 < layers.length && (layers[nextId].isPinned || layers[nextId].isHidden)) {
            nextId++;
          }
          if (nextId >= layers.length) {
            nextId = layers.length - 1;
          }
          return nextId;
        });
      } else if (event.key === "ArrowLeft") {
        setCurrentLayerIndex((prev) => {
          let nextId: number = prev - 1;
          while (nextId - 1 >= 0 && (layers[nextId].isPinned || layers[nextId].isHidden)) {
            nextId--;
          }
          if (nextId < 0) {
            nextId = -1;
          }
          return nextId;
        });
      }
    }
    if (isPresenting) {
      document.addEventListener("keydown", handleNextPresentingLayer);
    } else {
      document.removeEventListener("keydown", handleNextPresentingLayer);
    }

    return () => {
      document.removeEventListener("keydown", handleNextPresentingLayer);
    };
  }, [isPresenting, layers]);

  return (
    <>
      <SlideContext.Provider value={{
        layers,
        latLng,
        currentLayerIndex,
        isPresenting,
        drawingStates,
        mapZoom,
        setLayers,
        setLatLng,
        setIsPresenting,
        setCurrentLayerIndex,
        setDrawingStates,
        setMapZoom,
      }}>
        <div className="flex flex-row mx-auto">
          <div className="flex flex-col flex-1">
            <Toolbar />
            <div className={cn("mx-auto w-full h-dvh z-1", isPresenting ? "fixed top-0 left-0 z-20" : "relative")}>
              <LazyMap />
            </div>
          </div>
          <LayerSidebar />
        </div>
      </SlideContext.Provider>
    </>
  );
}

