
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
        <div v-else-if="errorMessage" class="p-4">
          <p class="text-red-500">{{ errorMessage }}</p>
          <button
            type="button"
            class="mt-2 bg-red-700 text-white rounded px-3 py-1"
            @click="loadData"
          >
            Retry
          </button>
        </div>

        <table v-else class="min-w-full shadow-md rounded">
          <thead class="bg-gray-50 text-xl">
            <tr>
              <th class="p-4 text-left" style="width: 25%;">
                Service Name
              </th>
              <th class="p-4 text-left" style="width: 75%;">
                Service Description
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-300">
            <tr
              v-for="service in services"
              :key="service._id"
              @click="openService(service._id)"
              class="cursor-pointer"
              :class="{ hoverRow: hoverId === service._id }"
              @mouseenter="hoverId = service._id"
              @mouseleave="hoverId = null"
            >
              <td class="p-4 text-left">
                {{ service.name }}
              </td>
              <td class="p-4 text-left text-sm">
                {{ service.description }}
              </td>
            </tr>

            <!-- Empty state -->
            <tr v-if="services.length === 0">
              <td colspan="2" class="p-4 text-center text-gray-500">
                No results
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getServices, searchServices } from '../api/api'
import { useToast } from 'vue-toastification'

// MIGRATION_NOTE: Converted findservice.vue from Options API
// to Composition API using script setup.

// MIGRATION_NOTE: Replaced data() with ref() for service
// records, search fields, and hovered row state.

const services = ref([])
const searchBy = ref('')
const name = ref('')
const description = ref('')
const hoverId = ref(null)

const loading = ref(false)
const errorMessage = ref('')

const router = useRouter()
const toast = useToast()

// MIGRATION_NOTE: Replaced mounted() with onMounted().

onMounted(() => {
  loadData()
})

// MIGRATION_NOTE: Converted methods.loadData()
// into a regular async function.

async function loadData() {
  searchBy.value = ''
  name.value = ''
  description.value = ''

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await getServices()
    services.value = response
  } catch (error) {
    services.value = []
    errorMessage.value = error?.message || 'Unable to load services'
    toast.error(errorMessage.value)
  } finally {
    loading.value = false
  }
}

// MIGRATION_NOTE: Converted methods.handleSubmitForm()
// into a regular async function.

async function handleSubmitForm() {
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

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await searchServices(query)
    services.value = response
  } catch (error) {
    services.value = []
    errorMessage.value = error?.message || 'Unable to search services'
    toast.error(errorMessage.value)
  } finally {
    loading.value = false
  }
}

// MIGRATION_NOTE: Replaced this.$router.push()
// with the Composition API useRouter().

function openService(id) {
  router.push({
    name: 'servicedetails',
    params: { id }
  })
}
</script>
