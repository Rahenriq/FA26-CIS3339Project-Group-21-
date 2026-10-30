<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true }, // [{ label, field, render? }]
  rows: { type: Array, default: () => [] },
  pageSize: { type: Number, default: 10 }
})
const emit = defineEmits(['row-click'])

const sortField = ref(null)
const sortDir = ref(null) // null -> 'asc' -> 'desc' -> null
const page = ref(1)

// supports nested fields like 'address.city'
function getValue(row, field) {
  return field.split('.').reduce((obj, key) => obj?.[key], row)
}

function cellValue(row, col) {
  return col.render ? col.render(row) : getValue(row, col.field)
}

function toggleSort(col) {
  if (sortField.value !== col.field) {
    sortField.value = col.field
    sortDir.value = 'asc'
  } else if (sortDir.value === 'asc') {
    sortDir.value = 'desc'
  } else {
    sortField.value = null
    sortDir.value = null
  }
}

function compare(a, b) {
  if (a == null && b == null) return 0
  if (a == null) return 1            // empty values always sort last
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

const sortedRows = computed(() => {
  if (!sortField.value) return props.rows
  const dir = sortDir.value === 'asc' ? 1 : -1
  // copy first so we never mutate the parent's array
  return [...props.rows].sort(
    (a, b) => dir * compare(getValue(a, sortField.value), getValue(b, sortField.value))
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / props.pageSize)))
const pagedRows = computed(() => {
  const start = (page.value - 1) * props.pageSize
  return sortedRows.value.slice(start, start + props.pageSize)
})
const rangeStart = computed(() => (sortedRows.value.length === 0 ? 0 : (page.value - 1) * props.pageSize + 1))
const rangeEnd = computed(() => Math.min(page.value * props.pageSize, sortedRows.value.length))

// "changing pages after a search never leaves stale rows": new data -> back to page 1
watch(() => props.rows, () => { page.value = 1 })
// re-sorting -> back to page 1
watch([sortField, sortDir], () => { page.value = 1 })
// safety net: never sit on a page that no longer exists
watch(totalPages, (n) => { if (page.value > n) page.value = n })

function ariaSort(col) {
  if (sortField.value !== col.field) return 'none'
  return sortDir.value === 'asc' ? 'ascending' : 'descending'
}
</script>

<template>
  <div>
    <table class="min-w-full shadow-md rounded">
      <thead class="bg-gray-50 text-xl">
        <tr>
          <th
            v-for="col in columns"
            :key="col.field"
            class="p-4 text-left cursor-pointer select-none"
            :aria-sort="ariaSort(col)"
            @click="toggleSort(col)"
          >
            {{ col.label }}
            <span v-if="sortField === col.field">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-300">
        <tr v-if="pagedRows.length === 0">
          <td :colspan="columns.length" class="p-4 text-center italic text-gray-500">No results</td>
        </tr>
        <tr
          v-for="(row, i) in pagedRows"
          :key="row._id ?? i"
          class="cursor-pointer hover:bg-red-50"
          @click="emit('row-click', row)"
        >
          <td v-for="col in columns" :key="col.field" class="p-2 text-left">
            {{ cellValue(row, col) }}
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex items-center justify-between mt-3 text-sm">
      <span>Showing {{ rangeStart }}-{{ rangeEnd }} of {{ sortedRows.length }}</span>
      <div class="flex gap-2">
        <button class="border rounded px-3 py-1 disabled:opacity-40" :disabled="page <= 1" @click="page--">Previous</button>
        <span class="px-2 py-1">Page {{ page }} of {{ totalPages }}</span>
        <button class="border rounded px-3 py-1 disabled:opacity-40" :disabled="page >= totalPages" @click="page++">Next</button>
      </div>
    </div>
  </div>
</template>
