
<!-- This view displays a list of events and allows users to search for events. -->
<template>
  <main>
    <div>
      <!-- Header -->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        List of Events
      </h1>
    </div>

    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Search Event By</h2>

        <!-- Search selection -->
        <div class="flex flex-col">
          <select
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model="searchBy"
          >
            <option value="Event Name">Event Name</option>
            <option value="Event Date">Event Date</option>
          </select>
        </div>

        <!-- Search by event name -->
        <div class="flex flex-col" v-if="searchBy === 'Event Name'">
          <label class="block">
            <input
              type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="name"
              @keyup.enter="handleSubmitForm"
              placeholder="Enter event name"
            />
          </label>
        </div>

        <!-- Search by event date -->
        <div class="flex flex-col" v-if="searchBy === 'Event Date'">
          <input
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            type="date"
            v-model="eventDate"
            @keyup.enter="handleSubmitForm"
          />
        </div>
      </div>

      <!-- Search buttons -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <div></div>

        <div class="mt-5 grid-cols-2">
          <!-- Clear Search -->
          <button
            class="mr-10 border border-red-700 bg-white text-red-700 rounded"
            @click="loadData"
            type="button"
          >
            Clear Search
          </button>

          <!-- Search Event -->
          <button
            class="bg-red-700 text-white rounded"
            @click="handleSubmitForm"
            type="button"
          >
            Search Event
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />

    <!-- Display Found Data -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Events</h2>
        <h3 class="italic">Click table row to view event details</h3>
      </div>

      <div class="flex flex-col col-span-2">

        <!-- Loading state -->
        <p v-if="loading" class="p-4 text-gray-600">
          Loading events...
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
        <DataTable v-else :columns="columns" :rows="events || []" @row-click="openEvent" />
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getEvents, searchEvents } from '../api/api'
import { useApi } from '../composables/useApi'
import DataTable from '../components/DataTable.vue'

// MIGRATION_NOTE: Converted findevents.vue from Options API
// to Composition API using script setup.

// MIGRATION_NOTE: Replaced data() with ref() for the search fields.
// (hoverId moved into DataTable)

const searchBy = ref(null)
const name = ref(null)
const eventDate = ref(null)
// the search currently applied (null = show every event)
const activeQuery = ref(null)

const router = useRouter()

// MIGRATION_NOTE: the hand-written isLoading/errorMessage/try-catch is replaced by the useApi composable (F2).
const { data: events, loading, error, execute } = useApi(() =>
  activeQuery.value ? searchEvents(activeQuery.value) : getEvents()
)

// columns shown by DataTable
const columns = [
  { label: 'Event Name', field: 'name' },
  { label: 'Event Date', field: 'date', render: (e) => formatDate(e.date) },
  { label: 'Event Address', field: 'address.line1' }
]

// MIGRATION_NOTE: Replaced mounted() with onMounted()
// to load events when the component opens.

onMounted(execute)

// MIGRATION_NOTE: Converted methods.loadData()
// into a regular function. Resets the search and reloads all events.

function loadData() {
  searchBy.value = null
  name.value = null
  eventDate.value = null
  activeQuery.value = null
  execute()
}

// MIGRATION_NOTE: Converted methods.handleSubmitForm()
// into a regular function.

function handleSubmitForm() {
  let query = null

  // Search by event name
  if (searchBy.value === 'Event Name' && name.value) {
    query = {
      searchBy: 'name',
      name: name.value
    }
  }

  // Search by event date
  else if (searchBy.value === 'Event Date' && eventDate.value) {
    query = {
      searchBy: 'date',
      eventDate: eventDate.value
    }
  }

  if (!query) {
    return
  }

  activeQuery.value = query
  execute()
}

// MIGRATION_NOTE: Converted methods.formatDate()
// into a regular function to display dates as MM/DD/YYYY.

function formatDate(date) {
  if (!date) return ''

  const isoDate = new Date(date)

  if (isNaN(isoDate.getTime())) {
    return ''
  }

  const year = isoDate.getUTCFullYear()
  const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(isoDate.getUTCDate()).padStart(2, '0')

  return `${month}/${day}/${year}`
}

// MIGRATION_NOTE: Replaced this.$router.push()
// with useRouter() for navigation to event details.

function openEvent(event) {
  router.push({
    name: 'eventdetails',
    params: { id: event._id }
  })
}
</script>
