<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Route,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Truck,
  MapPin,
  ArrowRight,
  Navigation,
} from '@lucide/vue'
import type { RouteResult } from '../types/route.types'

const props = defineProps<{
  result: RouteResult | null
  isLoading: boolean
}>()

const copied = ref(false)

const formattedJson = computed(() => {
  if (!props.result) return ''
  if (props.result.data) {
    return JSON.stringify(props.result.data, null, 2)
  }
  return JSON.stringify(
    {
      status: props.result.status,
      error: props.result.error,
    },
    null,
    2,
  )
})

async function copyToClipboard() {
  if (!formattedJson.value) return
  try {
    await navigator.clipboard.writeText(formattedJson.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
      <h2 class="text-sm font-semibold text-gray-800">Ruta asignada</h2>

      <div class="flex items-center gap-2">
        <span
          v-if="props.isLoading"
          class="inline-flex items-center space-x-1.5 text-xs text-gray-500"
        >
          <Clock class="w-3.5 h-3.5 animate-spin" />
          <span>Calculando...</span>
        </span>

        <span
          v-else-if="props.result && props.result.status === 200"
          class="inline-flex items-center space-x-1.5 text-xs font-medium text-emerald-700"
        >
          <CheckCircle2 class="w-3.5 h-3.5" />
          <span>Ruta encontrada</span>
        </span>

        <span
          v-else-if="props.result"
          class="inline-flex items-center space-x-1.5 text-xs font-medium text-red-600"
        >
          <AlertTriangle class="w-3.5 h-3.5" />
          <span>{{ props.result.status === 0 ? 'Sin conexión' : 'No se pudo calcular' }}</span>
        </span>

        <button
          v-if="props.result"
          type="button"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          @click="copyToClipboard"
        >
          <Check v-if="copied" class="w-3.5 h-3.5 text-emerald-600" />
          <Copy v-else class="w-3.5 h-3.5" />
          <span>{{ copied ? 'Copiado' : 'Copiar' }}</span>
        </button>
      </div>
    </div>

    <div
      v-if="props.result && props.result.status === 200 && props.result.data"
      class="px-4 py-3 bg-gray-50 border-b border-gray-100 grid grid-cols-3 gap-3"
    >
      <div class="flex items-center space-x-2.5">
        <Truck class="w-4 h-4 text-gray-400 shrink-0" />
        <div class="min-w-0">
          <p class="text-[11px] uppercase tracking-wide text-gray-400">Base asignada</p>
          <p class="text-sm font-medium text-gray-800 truncate">{{ props.result.data.fromDepot }}</p>
        </div>
      </div>

      <div class="flex items-center space-x-2.5">
        <Navigation class="w-4 h-4 text-gray-400 shrink-0" />
        <div class="min-w-0">
          <p class="text-[11px] uppercase tracking-wide text-gray-400">Distancia</p>
          <p class="text-sm font-medium text-gray-800">{{ props.result.data.distance }} km</p>
        </div>
      </div>

      <div class="flex items-center space-x-2.5">
        <MapPin class="w-4 h-4 text-gray-400 shrink-0" />
        <div class="min-w-0">
          <p class="text-[11px] uppercase tracking-wide text-gray-400">Destino</p>
          <p class="text-sm font-medium text-gray-800 truncate">{{ props.result.data.to }}</p>
        </div>
      </div>
    </div>

    <div
      v-if="props.result && props.result.status === 200 && props.result.data"
      class="px-4 py-3 bg-white border-b border-gray-100"
    >
      <p class="text-xs font-medium text-gray-500 mb-2">Recorrido</p>
      <div class="flex items-center flex-wrap gap-1.5">
        <template v-for="(stop, idx) in props.result.data.path" :key="idx">
          <span
            class="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium"
            :class="idx === 0
              ? 'bg-slate-900 text-white'
              : idx === props.result.data.path.length - 1
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700'"
          >
            {{ stop }}
          </span>

          <ArrowRight
            v-if="idx < props.result.data.path.length - 1"
            class="w-3.5 h-3.5 text-gray-300 shrink-0"
          />
        </template>
      </div>
    </div>

    <div
      v-if="props.result && props.result.status !== 200"
      class="p-4 bg-red-50 border-b border-red-100 text-xs"
    >
      <div class="flex items-start space-x-2 text-red-700">
        <XCircle class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
        <p class="mt-0.5">{{ props.result.error }}</p>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col">
      <div
        v-if="!props.result && !props.isLoading"
        class="h-full min-h-70 flex flex-col items-center justify-center text-center p-6 space-y-2 text-gray-400"
      >
        <Route class="w-8 h-8 text-gray-300" />
        <p class="text-sm font-medium text-gray-500">Sin resultados aún</p>
        <p class="text-xs text-gray-400 max-w-xs">
          Ingresa el lugar del incidente y las bases disponibles, luego presiona «Buscar grúa más cercana».
        </p>
      </div>

      <pre
        v-else
        class="font-mono text-xs leading-relaxed text-gray-800 whitespace-pre overflow-x-auto"
      ><code>{{ formattedJson }}</code></pre>
    </div>
  </div>
</template>
