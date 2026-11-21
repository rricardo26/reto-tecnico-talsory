<script setup lang="ts">
import { Code, Sparkles, Send, Trash2, MapPin, Truck, Network } from '@lucide/vue'
import type { RouteEdge } from '../types/route.types'

const props = defineProps<{
  accidentLocation: string
  depots: string[]
  edges: RouteEdge[]
  newDepot: string
  rawJson: string
  isJsonMode: boolean
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:accidentLocation', val: string): void
  (e: 'update:newDepot', val: string): void
  (e: 'update:rawJson', val: string): void
  (e: 'loadExample'): void
  (e: 'toggleMode'): void
  (e: 'addDepot'): void
  (e: 'removeDepot', index: number): void
  (e: 'addEdge'): void
  (e: 'removeEdge', index: number): void
  (e: 'submit'): void
}>()

function onJsonInput(e: Event) {
  emit('update:rawJson', (e.target as HTMLTextAreaElement).value)
}

const inputClass =
  'w-full px-3 py-2 text-sm rounded-md bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors'
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
      <h2 class="text-sm font-semibold text-gray-800">Solicitud de asistencia vial</h2>

      <div class="flex items-center gap-2">
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
            <MapPin class="w-3.5 h-3.5" />
            <span>Lugar del incidente</span>
          </legend>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">
              Distrito o ubicación <span class="text-red-500">*</span>
            </label>
            <input
              :value="props.accidentLocation"
              type="text"
              placeholder="ej. San Isidro"
              required
              :class="inputClass"
              @input="emit('update:accidentLocation', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </fieldset>

        <fieldset class="space-y-3">
          <legend class="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Truck class="w-3.5 h-3.5" />
            <span>Bases de grúas</span>
          </legend>

          <div class="flex items-center gap-2">
            <input
              :value="props.newDepot"
              type="text"
              placeholder="Nombre del distrito (ej. Miraflores)"
              :class="inputClass"
              @input="emit('update:newDepot', ($event.target as HTMLInputElement).value)"
              @keydown.enter.prevent="emit('addDepot')"
            />
            <button
              type="button"
              class="shrink-0 px-3.5 py-2 rounded-md text-xs font-medium bg-gray-900 hover:bg-gray-700 text-white transition-colors"
              @click="emit('addDepot')"
            >
              Agregar
            </button>
          </div>

          <div class="flex flex-wrap gap-2 pt-1">
            <span
              v-for="(depot, idx) in props.depots"
              :key="idx"
              class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-gray-100 border border-gray-200 text-gray-700 text-xs font-medium"
            >
              <span>{{ depot }}</span>
              <button
                type="button"
                class="text-gray-400 hover:text-red-500 transition-colors ml-1"
                title="Eliminar base"
                @click="emit('removeDepot', idx)"
              >
                &times;
              </button>
            </span>
            <span v-if="props.depots.length === 0" class="text-xs text-amber-600 italic">
              Agrega al menos una base de grúa.
            </span>
          </div>
        </fieldset>

        <fieldset class="space-y-3">
          <div class="flex items-center justify-between">
            <legend class="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <Network class="w-3.5 h-3.5" />
              <span>Recorridos entre distritos</span>
            </legend>
            <button
              type="button"
              class="text-xs text-blue-700 hover:text-blue-800 font-medium transition-colors"
              @click="emit('addEdge')"
            >
              + Agregar recorrido
            </button>
          </div>

          <div class="space-y-2">
            <div
              v-for="(edge, idx) in props.edges"
              :key="idx"
              class="flex items-center gap-2 bg-gray-50 p-2 rounded-md border border-gray-200"
            >
              <input
                v-model="edge.from"
                type="text"
                placeholder="Origen"
                :class="inputClass"
              />
              <span class="text-gray-400 text-xs font-bold shrink-0">→</span>
              <input
                v-model="edge.to"
                type="text"
                placeholder="Destino"
                :class="inputClass"
              />
              <div class="w-20 relative shrink-0">
                <input
                  v-model.number="edge.distance"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full px-2 py-2 pr-8 text-sm rounded-md bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                />
                <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">km</span>
              </div>
              <button
                type="button"
                class="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-gray-100 transition-colors shrink-0"
                title="Eliminar recorrido"
                @click="emit('removeEdge', idx)"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </fieldset>
      </form>
    </div>

    <div class="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
      <button
        type="button"
        :disabled="props.isLoading || props.depots.length === 0 || !props.accidentLocation"
        class="inline-flex items-center justify-center space-x-2 px-5 py-2 rounded-md text-sm font-medium bg-slate-900 hover:bg-slate-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        @click="emit('submit')"
      >
        <Send class="w-4 h-4" />
        <span>{{ props.isLoading ? 'Calculando...' : 'Buscar grúa más cercana' }}</span>
      </button>
    </div>
  </div>
</template>
