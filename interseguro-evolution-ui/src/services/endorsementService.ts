import { apiClient } from './apiClient'
import type {
  EndorseInputPayload,
  CoreEndorseOutput,
  ApiSuccessResponse,
  TokenResult,
} from '../types/endorsement.types'

export async function generateDemoToken(
  sub = 'frontend-user',
  role = 'user',
): Promise<TokenResult> {
  const { data } = await apiClient.post<{ success: true; token: string; expiresIn: number }>(
    '/auth/token',
    { sub, role },
  )
  return { token: data.token, expiresIn: data.expiresIn }
}

export async function translateEndorsement(
  payload: EndorseInputPayload,
): Promise<ApiSuccessResponse<CoreEndorseOutput>> {
  const { data } = await apiClient.post<ApiSuccessResponse<CoreEndorseOutput>>(
    '/endorse/translate',
    payload,
  )
  return data
}
