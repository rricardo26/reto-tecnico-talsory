<script setup lang="ts">
import { Code, Sparkles, Send, Trash2, FileText, UserCheck, Calendar } from '@lucide/vue'
import type { EndorseFormFields } from '../types/endorsement.types'
import type { EndorsementTemplate } from '../types/template.types'

const props = defineProps<{
  form: EndorseFormFields
  rawJson: string
  isJsonMode: boolean
  isLoading: boolean
  templates: EndorsementTemplate[]
}>()

const emit = defineEmits<{
  (e: 'update:rawJson', value: string): void
  (e: 'loadExample'): void
  (e: 'toggleMode'): void
  (e: 'addField'): void
  (e: 'removeField', index: number): void
  (e: 'submit'): void
  (e: 'selectTemplate', template: EndorsementTemplate): void
}>()

function onSelectTemplate(e: Event) {
  const key = (e.target as HTMLSelectElement).value
  const template = props.templates.find(
    (t) => `${t.productCode}|${t.endorsementType}` === key,
  )
  if (template) emit('selectTemplate', template)
}

function onJsonInput(e: Event) {
  emit('update:rawJson', (e.target as HTMLTextAreaElement).value)
}

const inputClass =
  'w-full px-3 py-2 text-sm rounded-md bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors'
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
      <h2 class="text-sm font-semibold text-gray-800">Datos del endoso</h2>

      <div class="flex items-center gap-2">
        <select
          :value="props.form.producto && props.form.tipoEndoso ? `${props.form.producto}|${props.form.tipoEndoso}` : ''"
          class="px-2.5 py-1.5 text-xs rounded-md bg-white border border-gray-300 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-45"
          @change="onSelectTemplate"
        >
          <option value="" disabled>Plantilla...</option>
          <option
            v-for="t in props.templates"
            :key="t.id"
            :value="`${t.productCode}|${t.endorsementType}`"
          >
            {{ t.productCode }} / {{ t.endorsementType }}
          </option>
        </select>

        <button
          type="button"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          @click="emit('loadExample')"
        >
          <Sparkles class="w-3.5 h-3.5" />
          <span>Cargar ejemplo</span>
        </button>

        <button
          type="button"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border"
          :class="props.isJsonMode
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'"
          @click="emit('toggleMode')"
        >
          <Code class="w-3.5 h-3.5" />
          <span>{{ props.isJsonMode ? 'Ver formulario' : 'Editar JSON' }}</span>
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      <div class="sticky top-0 z-10 -mx-4 -mt-4 px-4 py-3 bg-white/95 backdrop-blur border-b border-gray-100 flex justify-end">
        <button
          type="button"
          :disabled="props.isLoading"
          class="inline-flex items-center justify-center space-x-2 px-5 py-2 rounded-md text-sm font-medium bg-slate-900 hover:bg-slate-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="emit('submit')"
        >
          <Send class="w-4 h-4" />
          <span>{{ props.isLoading ? 'Procesando...' : 'Generar endoso' }}</span>
        </button>
      </div>

      <div v-if="props.isJsonMode" class="h-full flex flex-col space-y-2">
        <p class="text-xs text-gray-500 px-1">Edición avanzada del contenido.</p>
        <textarea
          :value="props.rawJson"
          rows="22"
          class="w-full flex-1 p-3 font-mono text-xs text-gray-800 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 leading-relaxed resize-none"
          spellcheck="false"
          @input="onJsonInput"
        ></textarea>
      </div>

      <form v-else class="space-y-6" @submit.prevent="emit('submit')">
        <fieldset class="space-y-3">
          <legend class="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <FileText class="w-3.5 h-3.5" />
            <span>Producto y endoso</span>
          </legend>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">
                Producto <span class="text-red-500">*</span>
              </label>
              <input v-model="props.form.producto" type="text" placeholder="ej. Rumbo" required :class="inputClass" />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">
                Tipo de endoso <span class="text-red-500">*</span>
              </label>
              <input v-model="props.form.tipoEndoso" type="text" placeholder="ej. CambioFrecuencia" required :class="inputClass" />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Plan</label>
              <input v-model="props.form.plan" type="text" placeholder="ej. Protección Integral" :class="inputClass" />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Moneda</label>
              <input v-model="props.form.moneda" type="text" placeholder="PEN o USD" :class="inputClass" />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Frecuencia</label>
              <input v-model="props.form.frecuencia" type="text" placeholder="ej. Mensual" :class="inputClass" />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">ID de envío</label>
              <input v-model="props.form.idEnvio" type="text" placeholder="ej. ENV-44512" :class="inputClass" />
            </div>
          </div>
        </fieldset>

        <fieldset class="space-y-3">
          <legend class="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <UserCheck class="w-3.5 h-3.5" />
            <span>Póliza y operador</span>
          </legend>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">
                Número de póliza <span class="text-red-500">*</span>
              </label>
              <input v-model="props.form.policyNumber" type="text" placeholder="ej. POL-2024-998877" required :class="inputClass" />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">
                Usuario operador <span class="text-red-500">*</span>
              </label>
              <input v-model="props.form.usuario" type="text" placeholder="ej. JPEREZ_OPS" required :class="inputClass" />
            </div>
          </div>
        </fieldset>

        <fieldset class="space-y-3">
          <legend class="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Calendar class="w-3.5 h-3.5" />
            <span>Fechas</span>
          </legend>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">
                Fecha de solicitud <span class="text-red-500">*</span>
              </label>
              <input v-model="props.form.fechaSolicitud" type="date" required :class="inputClass" />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Fecha del cliente</label>
              <input v-model="props.form.fechaCliente" type="date" :class="inputClass" />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">
                Fecha efectiva <span class="text-red-500">*</span>
              </label>
              <input v-model="props.form.fechaEfectiva" type="date" required :class="inputClass" />
            </div>
          </div>
        </fieldset>

        <fieldset class="space-y-3">
          <div class="flex items-center justify-between">
            <legend class="text-xs font-semibold uppercase tracking-wide text-gray-500">Campos adicionales</legend>
            <button
              type="button"
              class="text-xs text-blue-700 hover:text-blue-800 font-medium transition-colors"
              @click="emit('addField')"
            >
              + Agregar campo
            </button>
          </div>

          <p v-if="props.form.extraFields.length === 0" class="text-xs text-gray-400 italic">
            Sin campos adicionales.
          </p>

          <div v-else class="space-y-2">
            <div
              v-for="(extra, idx) in props.form.extraFields"
              :key="idx"
              class="flex items-center gap-2"
            >
              <input
                v-model="extra.key"
                type="text"
                placeholder="Nombre"
                class="flex-1 px-3 py-1.5 text-xs rounded-md bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                v-model="extra.value"
                type="text"
                placeholder="Valor"
                class="flex-1 px-3 py-1.5 text-xs rounded-md bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                class="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-gray-100 transition-colors"
                title="Eliminar campo"
                @click="emit('removeField', idx)"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  </div>
</template>
