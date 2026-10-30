
<!-- This view displays and searches for services. -->
<template>
  <main>
    <!-- Header -->
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
      Find Services
    </h1>

    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Search Service By</h2>

        <!-- Search selection -->
        <div class="flex flex-col">
          <select
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model="searchBy"
          >
            <option value="Service Name">Service Name</option>
            <option value="Service Description">Service Description</option>
          </select>
        </div>

        <!-- Search by name -->
        <div v-if="searchBy === 'Service Name'" class="flex flex-col">
          <label class="block">
            <input
              type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="name"
              @keyup.enter="handleSubmitForm"
              placeholder="Enter service name"
            />
          </label>
        </div>

        <!-- Search by description -->
        <div v-if="searchBy === 'Service Description'" class="flex flex-col">
          <label class="block">
            <input
              type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="description"
              @keyup.enter="handleSubmitForm"
              placeholder="Enter service description"
            />
          </label>
        </div>
      </div>

      <!-- Search buttons -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <div></div>

        <div class="mt-5 grid-cols-2">
          <button
            class="mr-10 border border-red-700 bg-white text-red-700 rounded"
            @click="loadData"
            type="button"
          >
            Clear Search
          </button>

          <button
            class="bg-red-700 text-white rounded"
            @click="handleSubmitForm"
            type="button"
          >
            Search Service
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />

    <!-- Services table -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Services</h2>
        <h3 class="italic">Click table row to view service details</h3>
      </div>

      <div class="flex flex-col col-span-2">

        <!-- Loading state -->
        <p v-if="loading" class="text-gray-600 p-4">
          Loading services...
        </p>

        <!-- Error state -->
        <div v-else-if="error" class="p-4">
          <p class="text-red-500">{{ error }}</p>
          <button
            type="button"
            class="mt-2 bg-red-700 text-white rounded px-3 py-1"
            @click="execute"
          >
            Retry
          </button>
        </div>

        <!-- MIGRATION NOTE: hand-written <table> replaced by the shared DataTable (F3);
             it shows its own "No results" row when empty -->
        <DataTable v-else :columns="columns" :rows="services || []" @row-click="openService" />
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getServices, searchServices } from '../api/api'
import { useApi } from '../composables/useApi'
import DataTable from '../components/DataTable.vue'

// MIGRATION_NOTE: Converted findservice.vue from Options API
// to Composition API using script setup.

// MIGRATION_NOTE: Replaced data() with ref() for the search fields.
// (hoverId moved into DataTable)

const searchBy = ref('')
const name = ref('')
const description = ref('')
// the search currently applied (null = show every service)
const activeQuery = ref(null)

const router = useRouter()

// MIGRATION_NOTE: the hand-written loading/errorMessage/try-catch is replaced by the useApi composable (F2).
const { data: services, loading, error, execute } = useApi(() =>
  activeQuery.value ? searchServices(activeQuery.value) : getServices()
)

// columns shown by DataTable
const columns = [
  { label: 'Service Name', field: 'name' },
  { label: 'Service Description', field: 'description' }
]

// MIGRATION_NOTE: Replaced mounted() with onMounted().

onMounted(execute)

// MIGRATION_NOTE: Converted methods.loadData()
// into a regular function. Resets the search and reloads all services.

function loadData() {
  searchBy.value = ''
  name.value = ''
  description.value = ''
  activeQuery.value = null
  execute()
}

// MIGRATION_NOTE: Converted methods.handleSubmitForm()
// into a regular function.

function handleSubmitForm() {
  let query = null

  if (searchBy.value === 'Service Name' && name.value) {
    query = {
      searchBy: 'name',
      name: name.value
    }
  } else if (
    searchBy.value === 'Service Description' &&
    description.value
  ) {
    query = {
      searchBy: 'description',
      description: description.value
    }
  }

  if (!query) {
    return
  }

  activeQuery.value = query
  execute()
}

// MIGRATION_NOTE: Replaced this.$router.push()
// with the Composition API useRouter().

function openService(service) {
  router.push({
    name: 'servicedetails',
    params: { id: service._id }
  })
}
</script>
