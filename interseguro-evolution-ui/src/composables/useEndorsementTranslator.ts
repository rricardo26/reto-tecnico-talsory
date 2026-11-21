import { ref, computed, watch } from 'vue'
import { generateDemoToken, translateEndorsement } from '../services/endorsementService'
import { listTemplates } from '../services/templateService'
import type {
  EndorseFormFields,
  EndorseInputPayload,
  TranslateResult,
} from '../types/endorsement.types'
import type { EndorsementTemplate } from '../types/template.types'
import axios from 'axios'

const RUMBO_EXAMPLE: EndorseFormFields = {
  producto: 'Rumbo',
  tipoEndoso: 'CambioFrecuencia',
  policyNumber: '08200000049',
  idEnvio: '5984',
  frecuencia: 'Semestral',
  plan: 'PlanRumbo',
  moneda: 'Nuevo Sol',
  usuario: 'interface.servicios',
  fechaSolicitud: '2025-08-27',
  fechaCliente: '2025-08-27',
  fechaEfectiva: '2025-09-01',
  inicioVigenciaEndoso: '',
  responsableAtencion: '',
  extraFields: [],
}

function createEmptyForm(): EndorseFormFields {
  return {
    producto: '',
    tipoEndoso: '',
    policyNumber: '',
    idEnvio: '',
    frecuencia: '',
    plan: '',
    moneda: '',
    usuario: '',
    fechaSolicitud: '',
    fechaCliente: '',
    fechaEfectiva: '',
    inicioVigenciaEndoso: '',
    responsableAtencion: '',
    extraFields: [],
  }
}

function formToPayload(form: EndorseFormFields): EndorseInputPayload {
  const payload: EndorseInputPayload = {
    producto: form.producto.trim(),
    tipoEndoso: form.tipoEndoso.trim(),
    policyNumber: form.policyNumber.trim(),
    idEnvio: Number(form.idEnvio) || 0,
  }

  const optionalFields = [
    'frecuencia',
    'plan',
    'moneda',
    'usuario',
    'fechaSolicitud',
    'fechaCliente',
    'fechaEfectiva',
    'inicioVigenciaEndoso',
    'responsableAtencion',
  ] as const

  for (const key of optionalFields) {
    const value = form[key]
    if (typeof value === 'string' && value.trim()) {
      payload[key] = value.trim()
    }
  }

  for (const { key, value } of form.extraFields) {
    const k = key.trim()
    if (k) payload[k] = value
  }

  return payload
}

export function useEndorsementTranslator() {
  const form = ref<EndorseFormFields>(createEmptyForm())
  const rawJson = ref('')
  const isJsonMode = ref(false)
  const isLoading = ref(false)
  const isTokenLoading = ref(false)
  const result = ref<TranslateResult | null>(null)
  const templates = ref<EndorsementTemplate[]>([])

  const jwtToken = ref<string>(localStorage.getItem('jwt_token') ?? '')

  watch(jwtToken, (token) => {
    if (token) localStorage.setItem('jwt_token', token)
    else localStorage.removeItem('jwt_token')
  })

  const computedPayload = computed(() => formToPayload(form.value))

  watch(
    computedPayload,
    (payload) => {
      if (!isJsonMode.value) {
        rawJson.value = JSON.stringify(payload, null, 2)
      }
    },
    { deep: true, immediate: true },
  )

  function loadRumboExample() {
    form.value = { ...RUMBO_EXAMPLE, extraFields: [] }
    isJsonMode.value = false
    rawJson.value = JSON.stringify(formToPayload(form.value), null, 2)
  }

  async function loadTemplates() {
    try {
      templates.value = await listTemplates()
    } catch {
      templates.value = []
    }
  }

  function applyTemplate(template: EndorsementTemplate) {
    form.value.producto = template.productCode
    form.value.tipoEndoso = template.endorsementType
  }

  function toggleJsonMode() {
    if (!isJsonMode.value) {
      rawJson.value = JSON.stringify(computedPayload.value, null, 2)
      isJsonMode.value = true
      return
    }

    try {
      const parsed = JSON.parse(rawJson.value)
      if (parsed && typeof parsed === 'object') {
        const stringKeys = [
          'producto',
          'tipoEndoso',
          'policyNumber',
          'frecuencia',
          'plan',
          'moneda',
          'usuario',
          'fechaSolicitud',
          'fechaCliente',
          'fechaEfectiva',
          'inicioVigenciaEndoso',
          'responsableAtencion',
        ] as const

        for (const key of stringKeys) {
          if (parsed[key] !== undefined) form.value[key] = String(parsed[key])
        }
        if (parsed.idEnvio !== undefined) form.value.idEnvio = String(parsed.idEnvio)
      }
    } catch {
      // JSON inválido: conserva el modo JSON para que el usuario corrija la sintaxis
    }
    isJsonMode.value = false
  }

  function addExtraField() {
    form.value.extraFields.push({ key: '', value: '' })
  }

  function removeExtraField(index: number) {
    form.value.extraFields.splice(index, 1)
  }

  async function fetchToken() {
    isTokenLoading.value = true
    try {
      const res = await generateDemoToken()
      jwtToken.value = res.token
    } catch (err) {
      console.error('Error generating token:', err)
    } finally {
      isTokenLoading.value = false
    }
  }

  async function translate() {
    isLoading.value = true
    result.value = null

    let payload: EndorseInputPayload
    if (isJsonMode.value) {
      try {
        payload = JSON.parse(rawJson.value) as EndorseInputPayload
      } catch {
        result.value = {
          status: 0,
          data: null,
          error: 'Error de sintaxis: El JSON proporcionado no es válido.',
          missingFields: [],
        }
        isLoading.value = false
        return
      }
    } else {
      payload = computedPayload.value
    }

    try {
      const response = await translateEndorsement(payload)
      result.value = {
        status: 200,
        data: response.data,
        error: null,
        missingFields: [],
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const body = err.response.data as {
          error?: string
          details?: { missingFields?: string[] }
        }
        result.value = {
          status: err.response.status,
          data: null,
          error: body.error || 'Error al procesar la solicitud',
          missingFields: body.details?.missingFields || [],
        }
      } else {
        result.value = {
          status: 0,
          data: null,
          error: 'No se pudo conectar con el servicio de endosos.',
          missingFields: [],
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    form,
    rawJson,
    isJsonMode,
    isLoading,
    isTokenLoading,
    result,
    jwtToken,
    templates,
    loadRumboExample,
    loadTemplates,
    applyTemplate,
    toggleJsonMode,
    addExtraField,
    removeExtraField,
    fetchToken,
    translate,
  }
}
