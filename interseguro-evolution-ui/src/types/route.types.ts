export interface OptimalRouteRequest {
  accidentLocation: string
  depots: string[]
  graph: Record<string, Record<string, number>>
}

export interface OptimalRouteResponse {
  fromDepot: string
  to: string
  path: string[]
  distance: number
}

export interface RouteEdge {
  from: string
  to: string
  distance: number
}

export interface RouteResult {
  status: number
  data: OptimalRouteResponse | null
  error: string | null
}

export interface RouteErrorResponse {
  error: string
}
