import { apiClient } from './apiClient'
import type {
  EndorsementTemplate,
  CreateTemplatePayload,
} from '../types/template.types'
import type { ApiResponse, ApiSuccessResponse } from '../types/endorsement.types'

export async function listTemplates(): Promise<EndorsementTemplate[]> {
  const { data } = await apiClient.get<ApiResponse<EndorsementTemplate[]>>('/templates')
  if (!data.success) throw new Error(data.error)
  return data.data
}

export async function createTemplate(
  payload: CreateTemplatePayload,
): Promise<EndorsementTemplate> {
  const { data } = await apiClient.post<ApiSuccessResponse<EndorsementTemplate>>(
    '/templates',
    payload,
  )
  return data.data
}

export async function updateTemplate(
  id: number,
  payload: CreateTemplatePayload,
): Promise<EndorsementTemplate> {
  const { data } = await apiClient.put<ApiSuccessResponse<EndorsementTemplate>>(
    `/templates/${id}`,
    payload,
  )
  return data.data
}

export async function deleteTemplate(id: number): Promise<void> {
  await apiClient.delete(`/templates/${id}`)
}
