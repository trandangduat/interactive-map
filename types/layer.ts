import { LatLngBoundsExpression, PathOptions } from "leaflet"

export interface BaseLayer {
  type: string,
  uuid: string,
  isPinned: boolean,
  isHidden: boolean,
  realLifeArea?: number, // Area in square meters
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

export type Layer = RectLayer | CircleLayer | ArrowLayer;
