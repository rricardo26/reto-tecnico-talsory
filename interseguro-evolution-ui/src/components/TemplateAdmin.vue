<script setup lang="ts">
import { computed, watch } from 'vue'
import { Plus, Trash2, Pencil, X } from '@lucide/vue'
import { useTemplateAdmin } from '../composables/useTemplateAdmin'
import type { EndorsementTemplate } from '../types/template.types'

const props = defineProps<{
  token: string
}>()

const {
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
} = useTemplateAdmin({ value: props.token })

watch(
  () => props.token,
  (token) => {
    if (token) refresh()
  },
  { immediate: true },
)

const inputClass =
  'w-full px-3 py-2 text-sm rounded-md bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors'

const inputPreview = computed(() => {
  const t = selected.value
  if (!t) return ''
  const keys = new Set<string>(['policyNumber', 'idEnvio', 'producto', 'tipoEndoso'])
  for (const f of t.dynamicFields) {
    if (f.sourceField) keys.add(f.sourceField)
  }
  const obj: Record<string, string> = {}
  for (const k of keys) obj[k] = '<valor>'
  return JSON.stringify(obj, null, 2)
})

const outputPreview = computed(() => {
  const t = selected.value
  if (!t) return ''
  const sample = {
    policyNumber: '<policyNumber>',
    idEnvio: '<idEnvio>',
    financialPlansEntity: { description: '<frecuencia>' },
    currency: { description: '<moneda>' },
    productEntity: { description: t.productCode },
    eventEntity: {
      description: t.eventDescription,
      dynamicData: t.dynamicFields.map((f) => ({
        etiqueta: f.etiqueta,
        value: f.defaultValue ?? (f.sourceField ? `<${f.sourceField}>` : ''),
      })),
    },
    eventAppliedEntities: t.appliedEvents.map((e) => ({
      description: e.description,
      orderEvent: e.orderEvent,
    })),
    riskUnitEntities: [
      {
        insuranceObjectEntities: [
          {
            insuranceObjectNumber: '1',
            coverageEntities: [],
            participationEntities: [],
          },
        ],
        plansEntity: { description: '<plan>' },
        riskUnitNumber: '1',
      },
    ],
    participationEntities: [],
  }
  return JSON.stringify(sample, null, 2)
})

function onSelect(template: EndorsementTemplate) {
  selectTemplate(template)
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
    <!-- Formulario de plantilla -->
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-gray-800">
          {{ editingId !== null ? 'Editar plantilla' : 'Nueva plantilla' }}
        </h2>
        <button
          v-if="editingId !== null"
          type="button"
          class="inline-flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
          @click="cancelEdit"
        >
          <X class="w-3.5 h-3.5" />
          <span>Cancelar</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Producto</label>
          <input v-model="form.productCode" type="text" placeholder="ej. Rumbo" :class="inputClass" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Tipo de endoso</label>
          <input v-model="form.endorsementType" type="text" placeholder="ej. CambioFrecuencia" :class="inputClass" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Evento</label>
          <input v-model="form.eventDescription" type="text" placeholder="ej. SolicitarEndoso" :class="inputClass" />
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wide text-gray-500">Campos dinámicos</span>
          <button type="button" class="text-xs text-blue-700 hover:text-blue-800 font-medium" @click="addField">
            + Agregar campo
          </button>
        </div>

        <div
          v-for="(field, idx) in fields"
          :key="idx"
          class="grid grid-cols-12 gap-2 items-center bg-gray-50 border border-gray-200 rounded-md p-2"
        >
          <input v-model="field.etiqueta" type="text" placeholder="Etiqueta" class="col-span-3 px-2 py-1.5 text-xs rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          <input v-model="field.sourceField" type="text" placeholder="Clave del JSON" class="col-span-3 px-2 py-1.5 text-xs rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          <input v-model="field.defaultValue" type="text" placeholder="Valor por defecto" class="col-span-3 px-2 py-1.5 text-xs rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          <label class="col-span-2 flex items-center gap-1 text-xs text-gray-600">
            <input v-model="field.isRequired" type="checkbox" class="rounded border-gray-300" />
            Req.
          </label>
          <button type="button" class="col-span-1 p-1 text-gray-400 hover:text-red-500" @click="removeField(idx)">
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
        <p class="text-[11px] text-gray-400">
          «Clave del JSON» indica qué campo del request alimenta este valor; si se deja vacío se usa el valor por defecto.
        </p>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wide text-gray-500">Eventos aplicados</span>
          <button type="button" class="text-xs text-blue-700 hover:text-blue-800 font-medium" @click="addEvent">
            + Agregar evento
          </button>
        </div>

        <div
          v-for="(event, idx) in events"
          :key="idx"
          class="flex items-center gap-2"
        >
          <span class="text-xs text-gray-400 w-6 text-right">{{ idx + 1 }}.</span>
          <input v-model="event.description" type="text" placeholder="Descripción del evento" :class="inputClass" />
          <button type="button" class="p-1.5 text-gray-400 hover:text-red-500 shrink-0" @click="removeEvent(idx)">
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <p v-if="error" class="text-xs text-red-600">{{ error }}</p>

      <div class="flex justify-end">
        <button
          type="button"
          :disabled="isSaving || !form.productCode.trim() || !form.endorsementType.trim()"
          class="inline-flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium bg-slate-900 hover:bg-slate-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="save"
        >
          <Plus class="w-4 h-4" />
          <span>{{ isSaving ? 'Guardando...' : editingId !== null ? 'Guardar cambios' : 'Guardar plantilla' }}</span>
        </button>
      </div>
    </div>

    <!-- Lista + detalle -->
    <div class="space-y-4">
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
        <h2 class="text-sm font-semibold text-gray-800">Plantillas registradas</h2>

        <p v-if="isLoading" class="text-xs text-gray-400">Cargando...</p>
        <p v-else-if="templates.length === 0" class="text-xs text-gray-400">No hay plantillas.</p>

        <div
          v-for="template in templates"
          :key="template.id"
          class="border rounded-md p-3 space-y-2 cursor-pointer transition-colors"
          :class="selected?.id === template.id
            ? 'border-blue-400 bg-blue-50/50'
            : 'border-gray-200 hover:border-gray-300'"
          @click="onSelect(template)"
        >
          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm font-medium text-gray-800">{{ template.productCode }}</span>
              <span class="text-xs text-gray-400"> / {{ template.endorsementType }}</span>
            </div>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                title="Editar plantilla"
                @click.stop="editTemplate(template)"
              >
                <Pencil class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                class="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                title="Eliminar plantilla"
                @click.stop="remove(template.id)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="field in template.dynamicFields"
              :key="field.id"
              class="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[11px]"
            >
              {{ field.etiqueta }}
              <span v-if="field.isRequired" class="text-red-500">*</span>
            </span>
          </div>

          <p class="text-[11px] text-gray-400">
            {{ template.dynamicFields.length }} campos ·
            {{ template.appliedEvents.map((e) => e.description).join(', ') || 'sin eventos' }}
          </p>
        </div>
      </div>

      <!-- Formato entrada/salida de la plantilla seleccionada -->
      <div
        v-if="selected"
        class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-4"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-800">
            {{ selected.productCode }} / {{ selected.endorsementType }}
          </h3>
          <button
            type="button"
            class="text-xs text-gray-400 hover:text-gray-600"
            @click="selectTemplate(null)"
          >
            Cerrar
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">Entrada (request)</p>
            <pre class="font-mono text-[11px] leading-relaxed text-gray-700 bg-gray-50 border border-gray-200 rounded-md p-3 overflow-x-auto whitespace-pre">{{ inputPreview }}</pre>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">Salida (response)</p>
            <pre class="font-mono text-[11px] leading-relaxed text-gray-700 bg-gray-50 border border-gray-200 rounded-md p-3 overflow-x-auto whitespace-pre">{{ outputPreview }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
