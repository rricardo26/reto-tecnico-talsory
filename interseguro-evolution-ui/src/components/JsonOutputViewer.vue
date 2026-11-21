<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  FileJson,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
} from '@lucide/vue'
import type { TranslateResult } from '../types/endorsement.types'

const props = defineProps<{
  result: TranslateResult | null
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
      missingFields: props.result.missingFields,
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
      <h2 class="text-sm font-semibold text-gray-800">Resultado</h2>

      <div class="flex items-center gap-2">
        <span
          v-if="props.isLoading"
          class="inline-flex items-center space-x-1.5 text-xs text-gray-500"
        >
          <Clock class="w-3.5 h-3.5 animate-spin" />
          <span>Procesando...</span>
        </span>

        <span
          v-else-if="props.result && props.result.status === 200"
          class="inline-flex items-center space-x-1.5 text-xs font-medium text-emerald-700"
        >
          <CheckCircle2 class="w-3.5 h-3.5" />
          <span>Endoso generado</span>
        </span>

        <span
          v-else-if="props.result"
          class="inline-flex items-center space-x-1.5 text-xs font-medium text-red-600"
        >
          <AlertTriangle v-if="props.result.status === 400 || props.result.status === 404 || props.result.status === 422" class="w-3.5 h-3.5" />
          <XCircle v-else class="w-3.5 h-3.5" />
          <span>{{ props.result.status === 0 ? 'Sin conexión' : 'No se pudo procesar' }}</span>
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
      class="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-4 text-xs text-gray-600 flex-wrap"
    >
      <span class="font-medium text-gray-800">{{ props.result.data.productEntity.description }}</span>
      <span class="text-gray-300">·</span>
      <span>{{ props.result.data.eventEntity.description }}</span>
      <span class="text-gray-300">·</span>
      <span>{{ props.result.data.currency.description }}</span>
      <span class="text-gray-300">·</span>
      <span>{{ props.result.data.eventEntity.dynamicData.length }} campos</span>
    </div>

    <div
      v-if="props.result && props.result.status !== 200"
      class="p-4 bg-red-50 border-b border-red-100 text-xs space-y-2"
    >
      <div class="flex items-start space-x-2 text-red-700">
        <XCircle class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
        <p class="mt-0.5">{{ props.result.error }}</p>
      </div>

      <div v-if="props.result.missingFields.length > 0" class="pl-6">
        <p class="text-gray-600 font-medium">Faltan los siguientes datos obligatorios:</p>
        <div class="flex flex-wrap gap-1.5 mt-1.5">
          <span
            v-for="field in props.result.missingFields"
            :key="field"
            class="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[11px]"
          >
            {{ field }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col">
      <div
        v-if="!props.result && !props.isLoading"
        class="h-full min-h-70 flex flex-col items-center justify-center text-center p-6 space-y-2 text-gray-400"
      >
        <FileJson class="w-8 h-8 text-gray-300" />
        <p class="text-sm font-medium text-gray-500">Sin resultados aún</p>
        <p class="text-xs text-gray-400 max-w-xs">
          Completa el formulario y presiona «Generar endoso» para ver la respuesta.
        </p>
      </div>

      <pre
        v-else
        class="font-mono text-xs leading-relaxed text-gray-800 whitespace-pre overflow-x-auto"
      ><code>{{ formattedJson }}</code></pre>
    </div>
  </div>
</template>
