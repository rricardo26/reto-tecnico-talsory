import { ref, onMounted } from 'vue'
import {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../services/templateService'
import type {
  EndorsementTemplate,
  CreateTemplatePayload,
} from '../types/template.types'

export interface FieldRow {
  etiqueta: string
  sourceField: string
  defaultValue: string
  isRequired: boolean
}

export interface EventRow {
  description: string
}

export function useTemplateAdmin(jwtToken: { value: string }) {
  const templates = ref<EndorsementTemplate[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref('')

  const form = ref({
    productCode: '',
    endorsementType: '',
    eventDescription: 'SolicitarEndoso',
    isActive: true,
  })

  const fields = ref<FieldRow[]>([
    { etiqueta: '', sourceField: '', defaultValue: '', isRequired: false },
  ])

  const events = ref<EventRow[]>([{ description: 'SolicitarEndoso' }])

  const editingId = ref<number | null>(null)
  const selected = ref<EndorsementTemplate | null>(null)

  async function refresh() {
    isLoading.value = true
    error.value = ''
    try {
      templates.value = await listTemplates()
    } catch {
      error.value = 'No se pudieron cargar las plantillas.'
    } finally {
      isLoading.value = false
    }
  }

  function addField() {
    fields.value.push({ etiqueta: '', sourceField: '', defaultValue: '', isRequired: false })
  }

  function removeField(index: number) {
    fields.value.splice(index, 1)
  }

  function addEvent() {
    events.value.push({ description: '' })
  }

  function removeEvent(index: number) {
    events.value.splice(index, 1)
  }

  function resetForm() {
    form.value = { productCode: '', endorsementType: '', eventDescription: 'SolicitarEndoso', isActive: true }
    fields.value = [{ etiqueta: '', sourceField: '', defaultValue: '', isRequired: false }]
    events.value = [{ description: 'SolicitarEndoso' }]
    editingId.value = null
  }

  function selectTemplate(template: EndorsementTemplate | null) {
    selected.value = template
  }

  function editTemplate(template: EndorsementTemplate) {
    editingId.value = template.id
    selected.value = template
    form.value = {
      productCode: template.productCode,
      endorsementType: template.endorsementType,
      eventDescription: template.eventDescription,
      isActive: template.isActive,
    }
    fields.value = template.dynamicFields.map((f) => ({
      etiqueta: f.etiqueta,
      sourceField: f.sourceField ?? '',
      defaultValue: f.defaultValue ?? '',
      isRequired: f.isRequired,
    }))
    events.value = template.appliedEvents.map((e) => ({ description: e.description }))
    if (fields.value.length === 0) {
      fields.value = [{ etiqueta: '', sourceField: '', defaultValue: '', isRequired: false }]
    }
    if (events.value.length === 0) {
      events.value = [{ description: '' }]
    }
  }

  function cancelEdit() {
    resetForm()
  }

  function buildPayload(): CreateTemplatePayload {
    return {
      productCode: form.value.productCode.trim(),
      endorsementType: form.value.endorsementType.trim(),
      eventDescription: form.value.eventDescription.trim(),
      isActive: form.value.isActive,
      dynamicFields: fields.value
        .filter((f) => f.etiqueta.trim())
        .map((f, i) => ({
          etiqueta: f.etiqueta.trim(),
          sourceField: f.sourceField.trim() || null,
          defaultValue: f.defaultValue.trim() || null,
          isRequired: f.isRequired,
          orderIndex: i + 1,
        })),
      appliedEvents: events.value
        .filter((e) => e.description.trim())
        .map((e, i) => ({ description: e.description.trim(), orderEvent: i + 1 })),
    }
  }

  async function save() {
    isSaving.value = true
    error.value = ''
    try {
      const payload = buildPayload()
      if (editingId.value !== null) {
        await updateTemplate(editingId.value, payload)
      } else {
        await createTemplate(payload)
      }
      resetForm()
      selected.value = null
      await refresh()
    } catch (err: any) {
      error.value = err?.response?.data?.error || 'No se pudo guardar la plantilla.'
    } finally {
      isSaving.value = false
    }
  }

  async function remove(id: number) {
    try {
      await deleteTemplate(id)
      await refresh()
    } catch {
      error.value = 'No se pudo eliminar la plantilla.'
    }
  }

  onMounted(() => {
    if (jwtToken.value) refresh()
  })

  return {
    templates,
    isLoading,
    isSaving,
    error,
    form,
    fields,
    events,
    editingId,
    selected,
    refresh,
    selectTemplate,
    editTemplate,
    cancelEdit,
    addField,
    removeField,
    addEvent,
    removeEvent,
    save,
    remove,
  }
}
