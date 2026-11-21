<script setup lang="ts">
import { ref } from 'vue'
import { Key, RefreshCw, CheckCircle2, Eye, EyeOff, X } from '@lucide/vue'

const props = defineProps<{
  token: string
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:token', value: string): void
  (e: 'generate'): void
}>()

const showFullToken = ref(false)

function onInput(e: Event) {
  emit('update:token', (e.target as HTMLInputElement).value.trim())
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg px-4 py-3">
    <div class="flex flex-col sm:flex-row sm:items-center gap-3">
      <div class="flex items-center space-x-2.5 shrink-0">
        <Key class="w-4 h-4 text-gray-400" />
        <span class="text-sm font-medium text-gray-700">Sesión activa</span>
        <span
          v-if="props.token"
          class="inline-flex items-center space-x-1 text-xs text-emerald-700"
        >
          <CheckCircle2 class="w-3.5 h-3.5" />
          <span>Autenticado</span>
        </span>
      </div>

      <div class="flex items-center gap-2 flex-1">
        <div class="relative flex-1">
          <input
            :type="showFullToken ? 'text' : 'password'"
            :value="props.token"
            placeholder="Token de acceso"
            class="w-full pl-3 pr-16 py-1.5 text-xs rounded-md bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            @input="onInput"
          />
          <div class="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center space-x-0.5">
            <button
              v-if="props.token"
              type="button"
              class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Alternar visibilidad"
              @click="showFullToken = !showFullToken"
            >
              <EyeOff v-if="showFullToken" class="w-3.5 h-3.5" />
              <Eye v-else class="w-3.5 h-3.5" />
            </button>
            <button
              v-if="props.token"
              type="button"
              class="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Cerrar sesión"
              @click="emit('update:token', '')"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button
          type="button"
          :disabled="props.isLoading"
          class="shrink-0 inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-900 hover:bg-slate-700 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          @click="emit('generate')"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': props.isLoading }" />
          <span>{{ props.isLoading ? 'Generando...' : 'Ingresar' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
