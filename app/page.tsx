"use client"

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LatLngBoundsExpression, PathOptions } from "leaflet";
import { Eye, EyeOff, Lock, LockKeyhole, LockKeyholeOpen, Pin, PinOff, Square } from "lucide-react";
import dynamic from "next/dynamic";
import { createContext, JSX, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

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

type SlideContextProps = {
  layers: Layer[],
  latLng: [number, number],
  currentLayerIndex: number,
  isPresenting: boolean,
  isDrawing?: boolean,
  drawingMode?: number,
};

export const SlideContext = createContext<SlideContextProps>({
  layers: [],
  latLng: [21.03, 105.804],
  currentLayerIndex: -1,
  isPresenting: false,
  isDrawing: false,
  drawingMode: -1,
});

export default function Home() {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [latLng, setLatLng] = useState<[number, number]>([21.03, 105.804]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  /* drawingMode:
    -1: not drawing
    0: rectangle
    1: circle
    2: arrow
  */
  const [drawingMode, setDrawingMode] = useState<number>(-1);
  const [isPresenting, setIsPresenting] = useState<boolean>(false);
  const [currentLayerIndex, setCurrentLayerIndex] = useState<number>(-1);

  const handleRect = () => {
    const newLayer: RectLayer = {
      type: "rectangle",
      order: layers.length,
      uuid: uuidv4(),
      isPinned: false,
      isHidden: false,
      bounds: [[latLng[0] - Math.random() * 0.001, latLng[1] - Math.random() * 0.001], [latLng[0] + Math.random() * 0.001, latLng[1] + Math.random() * 0.001]],
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

  const handlePresent = () => {
    setIsPresenting(true);
    setCurrentLayerIndex(-1);
    document.documentElement.requestFullscreen();
  };

  const toggleLockLayer = (index: number) => {
    setLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[index] = {
        ...newLayers[index],
        isPinned: !newLayers[index].isPinned,
      };
      return newLayers;
    });
  };

  const toggleHideLayer = (index: number) => {
    setLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[index] = {
        ...newLayers[index],
        isHidden: !newLayers[index].isHidden,
      };
      return newLayers;
    });
  };

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
      <SlideContext.Provider value={{ layers, latLng, currentLayerIndex, isPresenting, isDrawing, drawingMode }}>
        <div className="flex flex-row mx-auto">
          <div className="flex flex-col flex-1">
            <div className="mx-auto p-4 z-10 h-fit bg-slate-600 border-1 w-xl flex flex-row gap-2">
              <Button onClick={handleRect}>Rectangle</Button>
              <Button onClick={handleCircle}>Circle</Button>
              <Button onClick={handleArrow}>Arrow</Button>
              <Button onClick={handlePresent}>Present</Button>
            </div>
            <div className={cn("mx-auto w-full h-dvh z-1", isPresenting ? "fixed top-0 left-0 z-20" : "relative")}>
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
                <div
                  key={layer.uuid}
                  className={cn("flex flex-row justify-between items-center p-2 m-2 gap-2 bg-slate-700 rounded-md",
                    layer.isPinned && "bg-slate-800"
                  )}>
                  <div className="flex flex-row items-center gap-2">
                    {layerIcon!}
                    {layer.order + " " + layer.type}
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <div className="cursor-pointer" onClick={() => toggleLockLayer(index)}>
                      {layer.isPinned ? (
                        <PinOff size={16} />
                      ) : (
                        <Pin size={16} />
                      )}
                    </div>
                    <div className="cursor-pointer" onClick={() => toggleHideLayer(index)}>
                      {layer.isHidden ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SlideContext.Provider>
    </>
  );
}

