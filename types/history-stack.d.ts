import { Layer } from "./layer";

export interface Action {
  type: string;
  layer?: Layer;
  oldIndex?: number;
  newIndex?: number;
};

export interface NewLayerAction extends Action {
  type: "NEW_LAYER";
  layer: Layer;
};

export interface DeleteLayerAction extends Action {
  type: "DELETE_LAYER";
  layer: Layer;
  oldIndex: number;
};

export interface PinLayerAction extends Action {
  type: "PIN_LAYER";
  layer: Layer;
};

export interface UnPinLayerAction extends Action {
  type: "UNPIN_LAYER";
  layer: Layer;
};

export interface HideLayerAction extends Action {
  type: "HIDE_LAYER";
  layer: Layer;
};

export interface UnHideLayerAction extends Action {
  type: "UNHIDE_LAYER";
  layer: Layer;
};

export interface ReorderLayerAction extends Action {
  type: "REORDER_LAYER";
  oldIndex: number;
  newIndex: number;
};

export interface HistoryStackInterface {
  actions: Action[];
  currentIndex: number;
  push: (action: Action) => void;
  undo: () => Action | null;
  redo: () => Action | null;
  clear: () => void;
};