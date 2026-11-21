import { apiClient } from './apiClient'
import type { OptimalRouteRequest, OptimalRouteResponse } from '../types/route.types'

export async function calculateOptimalRoute(
  payload: OptimalRouteRequest,
): Promise<OptimalRouteResponse> {
  const { data } = await apiClient.post<OptimalRouteResponse>(
    '/routes/optimal',
    payload,
  )
  return data
}
