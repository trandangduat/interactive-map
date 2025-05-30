"use client"

import Toolbar from "@/components/home/toolbar";
import { cn } from "@/lib/utils";
import { Layer } from "@/types/layer";
import dynamic from "next/dynamic";
import { createContext, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { HistoryStack } from "./history-stack";
import { Action } from "@/types/history-stack";
import Sidebar from "@/components/home/sidebar";
import SlidesControl from "@/components/home/slides-control";
import domtoimage from 'dom-to-image';

const LazyMap = dynamic(() => import("@/components/home/map"), {
  ssr: false,
});

export type DrawingStates = {
  isDrawing: boolean,
  drawingMode: number, // -1: not drawing, 0: rectangle, 1: circle, 2: arrow
  strokeColor?: string,
  fillColor?: string,
  fillOpacity?: number,
};

class Slide {
  layers: Layer[] = [];
  latLng: [number, number] = [21.03, 105.804];
  mapZoom: number = 16;
  slideHistory: HistoryStack = new HistoryStack();
  slideThumbnail?: string | null = null;
};

type SlidesControlContextProps = {
  slides: Slide[],
  currentSlideIndex: number,
  setSlides: Dispatch<SetStateAction<Slide[]>>,
  setCurrentSlideIndex: Dispatch<SetStateAction<number>>,
};

export const SlidesControlContext = createContext<SlidesControlContextProps>({
  slides: [],
  currentSlideIndex: 0,
  setSlides: () => {},
  setCurrentSlideIndex: () => {},
});

type SlideContextProps = {
  layers: Layer[],
  latLng: [number, number],
  currentLayerIndex: number,
  isPresenting: boolean,
  drawingStates: DrawingStates,
  mapZoom: number,
  inspectingLayerId: string | null,
  slideHistory: HistoryStack,
  setLayers: Dispatch<SetStateAction<Layer[]>>,
  setLatLng: Dispatch<SetStateAction<[number, number]>>,
  setIsPresenting: Dispatch<SetStateAction<boolean>>,
  setCurrentLayerIndex: Dispatch<SetStateAction<number>>,
  setDrawingStates: Dispatch<SetStateAction<DrawingStates>>,
  setMapZoom: Dispatch<SetStateAction<number>>,
  setInspectingLayerId: Dispatch<SetStateAction<string | null>>,
  setSlideHistory: Dispatch<SetStateAction<HistoryStack>>,
  undo: () => void,
  redo: () => void,
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
    fillOpacity: 0.2,
  },
  mapZoom: 16,
  inspectingLayerId: null,
  slideHistory: new HistoryStack(),
  setLayers: () => {},
  setLatLng: () => {},
  setIsPresenting: () => {},
  setCurrentLayerIndex: () => {},
  setDrawingStates: () => {},
  setMapZoom: () => {},
  setInspectingLayerId: () => {},
  setSlideHistory: () => {},
  undo: () => {},
  redo: () => {},
});

let count: number = 0;

export default function Home() {
  // SLIDES CONTROL
  const slideThumbnailRef = useRef<HTMLImageElement | null>(null);
  const [slides, setSlides] = useState<Slide[]>([new Slide()]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  // CURRENT SLIDE
  const [layers, setLayers] = useState<Layer[]>([]);
  const [latLng, setLatLng] = useState<[number, number]>([21.03, 105.804]);
  const [mapZoom, setMapZoom] = useState<number>(16);
  const [drawingStates, setDrawingStates] = useState<DrawingStates>({
    isDrawing: false,
    drawingMode: -1,
    strokeColor: "#000000",
    fillColor: "#000000",
    fillOpacity: 0.2,
  });
  const [isPresenting, setIsPresenting] = useState<boolean>(false);
  const [currentLayerIndex, setCurrentLayerIndex] = useState<number>(-1);
  const [inspectingLayerId, setInspectingLayerId] = useState<string | null>(null);
  const [slideHistory, setSlideHistory] = useState<HistoryStack>(new HistoryStack());

  console.log("========RERENDER: ", count++, "========");
  console.log("currentSlideIndex: ", currentSlideIndex);
  console.log(mapZoom);
  console.log(slides);

  const resetSlide = () => {
    setDrawingStates({
      isDrawing: false,
      drawingMode: -1,
      strokeColor: "#000000",
      fillColor: "#000000",
      fillOpacity: 0.2,
    });
    setCurrentLayerIndex(-1);
    setInspectingLayerId(null);
  };

  useEffect(() => {
    console.log("second")
    resetSlide();
    if (currentSlideIndex >= slides.length) {
      setSlides((prevSlides) => [...prevSlides, new Slide()]);
    } else {
      const currentSlide = slides[currentSlideIndex];
      if (currentSlide) {
        console.log(currentSlide);
        setLayers(currentSlide.layers);
        setLatLng(currentSlide.latLng);
        setMapZoom(currentSlide.mapZoom);
        setSlideHistory(currentSlide.slideHistory);
      }
    }
  }, [currentSlideIndex]);

  useEffect(() => {
    console.log("four" + " " + mapZoom);
    if (currentSlideIndex < slides.length) {
      setSlides((prevSlides) => {
        const updatedSlides = [...prevSlides];
        updatedSlides[currentSlideIndex] = {
          ...updatedSlides[currentSlideIndex],
          layers: layers,
          latLng: latLng,
          mapZoom: mapZoom,
          slideHistory: slideHistory,
        };
        return updatedSlides;
      });
    }
  }, [layers, latLng, mapZoom, slideHistory]);

  // const lastScreenshotTime = useRef<number>(0);
  // useEffect(() => {
  //   if (Date.now() - lastScreenshotTime.current < 200) {
  //     return;
  //   }
  //   if (slideThumbnailRef.current) {
  //     domtoimage.toJpeg(slideThumbnailRef.current, { quality: 0.1 }).then((dataUrl) => {
  //       lastScreenshotTime.current = Date.now();
  //       setSlides((prevSlides) => {
  //         const updatedSlides = [...prevSlides];
  //         updatedSlides[currentSlideIndex] = {
  //           ...updatedSlides[currentSlideIndex],
  //           slideThumbnail: dataUrl,
  //         };
  //         return updatedSlides;
  //       });
  //     }).catch((error) => {
  //       console.error("Error generating slide thumbnail:", error);
  //     });
  //   }
  // }, [layers, latLng, mapZoom]);

  const undo = () => {
    const lastAction: (Action | null) = slideHistory.undo();
    if (lastAction) {
      switch (lastAction.type) {
        case "NEW_LAYER":
          setLayers((prevLayers) => prevLayers.filter(layer => layer.uuid !== lastAction.layer!.uuid));
          break;
        case "DELETE_LAYER":
          setLayers((prevLayers) => {
            const newLayers = [...prevLayers];
            newLayers.splice(lastAction.oldIndex!, 0, lastAction.layer!);
            return newLayers;
          });
          break;
        case "PIN_LAYER":
          setLayers((prevLayers) =>
            prevLayers.map(layer =>
              layer.uuid === lastAction.layer!.uuid
                ? { ...layer, isPinned: false }
                : layer
            )
          );
          break;
        case "UNPIN_LAYER":
          setLayers((prevLayers) =>
            prevLayers.map(layer =>
              layer.uuid === lastAction.layer!.uuid
                ? { ...layer, isPinned: true }
                : layer
            )
          );
          break;
        case "HIDE_LAYER":
          setLayers((prevLayers) =>
            prevLayers.map(layer =>
              layer.uuid === lastAction.layer!.uuid
                ? { ...layer, isHidden: false }
                : layer
            )
          );
          break;
        case "UNHIDE_LAYER":
          setLayers((prevLayers) =>
            prevLayers.map(layer =>
              layer.uuid === lastAction.layer!.uuid
                ? { ...layer, isHidden: true }
                : layer
            )
          );
          break;
        case "REORDER_LAYER":
          setLayers((prevLayers) => {
            const newLayers = [...prevLayers];
            const movedLayer = newLayers.splice(lastAction.newIndex!, 1)[0];
            newLayers.splice(lastAction.oldIndex!, 0, movedLayer);
            return newLayers;
          });
          break;
      }
    }
  };

  const redo = () => {
    const lastAction: (Action | null) = slideHistory.redo();
    if (lastAction) {
      switch (lastAction.type) {
        case "NEW_LAYER":
          setLayers((prevLayers) => [...prevLayers, lastAction.layer!]);
          break;
        case "DELETE_LAYER":
          setLayers((prevLayers) => prevLayers.filter(layer => layer.uuid !== lastAction.layer!.uuid));
          break;
        case "PIN_LAYER":
          setLayers((prevLayers) =>
            prevLayers.map(layer =>
              layer.uuid === lastAction.layer!.uuid
                ? { ...layer, isPinned: true }
                : layer
            )
          );
          break;
        case "UNPIN_LAYER":
          setLayers((prevLayers) =>
            prevLayers.map(layer =>
              layer.uuid === lastAction.layer!.uuid
                ? { ...layer, isPinned: false }
                : layer
            )
          );
          break;
        case "HIDE_LAYER":
          setLayers((prevLayers) =>
            prevLayers.map(layer =>
              layer.uuid === lastAction.layer!.uuid
                ? { ...layer, isHidden: true }
                : layer
            )
          );
          break;
        case "UNHIDE_LAYER":
          setLayers((prevLayers) =>
            prevLayers.map(layer =>
              layer.uuid === lastAction.layer!.uuid
                ? { ...layer, isHidden: false }
                : layer
            )
          );
          break;
        case "REORDER_LAYER":
          setLayers((prevLayers) => {
            const newLayers = [...prevLayers];
            const movedLayer = newLayers.splice(lastAction.oldIndex!, 1)[0];
            newLayers.splice(lastAction.newIndex!, 0, movedLayer);
            return newLayers;
          });
          break;
      }
    }
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

  useEffect(() => {
    const handleUndoRedo = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        if (event.key === "z") {
          undo();
        } else if (event.key === "y") {
          console.log("Redoing action");
          redo();
        }
        event.preventDefault();
      }
    };
    document.addEventListener("keydown", handleUndoRedo);
    return () => {
      document.removeEventListener("keydown", handleUndoRedo);
    }
  }, [slideHistory]);

  return (
    <>
      <SlidesControlContext.Provider value={{
          slides,
          currentSlideIndex,
          setSlides,
          setCurrentSlideIndex,
      }}>
        <SlideContext.Provider value={{
          layers,
          latLng,
          currentLayerIndex,
          isPresenting,
          drawingStates,
          mapZoom,
          inspectingLayerId,
          slideHistory,
          setLayers,
          setLatLng,
          setIsPresenting,
          setCurrentLayerIndex,
          setDrawingStates,
          setMapZoom,
          setInspectingLayerId,
          setSlideHistory,
          undo, redo,
        }}>
          <div className="flex flex-row mx-auto">
            <SlidesControl />
            <div className="flex flex-col flex-1 h-screen">
              <Toolbar />
              <div className={cn("mx-auto w-full h-full z-1 select-none", isPresenting ? "fixed top-0 left-0 z-20" : "relative")} ref={slideThumbnailRef}>
                <LazyMap />
              </div>
            </div>
            <Sidebar />

          </div>
        </SlideContext.Provider>
      </SlidesControlContext.Provider>
    </>
  );
}

