<!-- This view displays a list of clients. The user can search for clients, and click on a client to redirect to another component to view that client's information -->
<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Find Client
      </h1>
    </div>
    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <!--Search Client By selection-->
        <h2 class="text-2xl font-bold">Search Client By</h2>
        <!-- Displays Client Name search field -->
        <div class="flex flex-col">
          <select
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model="searchBy">
            <option value="Client Name">Client Name</option>
            <option value="Client Number">Client Number</option>
          </select>
        </div>
        <!--Input box for searching by Client First Name-->
        <div class="flex flex-col" v-if="searchBy === 'Client Name'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="firstName" v-on:keyup.enter="handleSubmitForm" placeholder="Enter first name" />
          </label>
        </div>
        <!--Input box for searching by Client Last Name-->
        <div class="flex flex-col" v-if="searchBy === 'Client Name'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="lastName" v-on:keyup.enter="handleSubmitForm" placeholder="Enter last name" />
          </label>
        </div>
        <!-- Displays Client Number search field -->
        <div class="flex flex-col" v-if="searchBy === 'Client Number'">
          <input
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            type="text" v-model="phoneNumber" v-on:keyup.enter="handleSubmitForm"
            placeholder="Enter Client Phone Number" />
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <div></div>
        <!--Clear Search button-->
        <div class="mt-5 grid-cols-2">
          <button class="mr-10 border border-red-700 bg-white text-red-700 rounded" @click="loadData" type="submit">
            Clear Search
          </button>
          <!--Search Client button-->
          <button class="bg-red-700 text-white rounded" @click="handleSubmitForm" type="submit">
            Search Client
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Clients</h2>
        <h3 class="italic">Click table row to view client details</h3>
      </div>
      <!--Table showing list of Clients-->
      <div class="flex flex-col col-span-2">
        <!-- Loading state -->
        <p v-if="loading" class="p-8 text-2xl text-center text-gray-500 animate-pulse">Loading...</p>
        <!-- Error state with retry -->
        <div v-else-if="error" class="p-4 bg-red-50 text-red-900" role="alert">
          <p class="font-bold">{{ error }}</p>
          <button class="mt-2 bg-red-700 text-white rounded" type="button" @click="execute">Retry</button>
        </div>
        <!-- Table (shows its own "No results" row when empty) -->
        <DataTable v-else :columns="columns" :rows="clients || []" @row-click="openClient" />
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getClients, searchClients } from '../api/api'
import { useApi } from '../composables/useApi'
import DataTable from '../components/DataTable.vue'

const router = useRouter()

// MIGRATION NOTE: data() -> ref()
// Parameters for search to occur
const searchBy = ref('')
const firstName = ref('')
const lastName = ref('')
const phoneNumber = ref('')
// the search currently applied (null = show every client)
const activeQuery = ref(null)

// MIGRATION NOTE: the hand-written loading/error/try-catch is replaced by the useApi composable.
// (hoverId moved into DataTable)
const { data: clients, loading, error, execute } = useApi(() =>
  activeQuery.value ? searchClients(activeQuery.value) : getClients()
)

// columns shown by DataTable (the shared DataTable uses `field` to pick the value and to sort)
const columns = [
  {
    label: 'Name',
    field: 'lastName', // sorts by last name; render() controls what is displayed
    render: (c) => `${c.firstName} ${c.lastName}`
  },
  { label: 'Phone number', field: 'phoneNumber.primary' },
  { label: 'City', field: 'address.city' }
]

// MIGRATION NOTE: mounted() -> onMounted()
onMounted(execute)

// MIGRATION NOTE: methods.loadData -> plain function. Resets search fields and reloads all clients
function loadData() {
  searchBy.value = ''
  firstName.value = ''
  lastName.value = ''
  phoneNumber.value = ''
  activeQuery.value = null
  execute()
}

// function called when user searches for clients
function handleSubmitForm() {
  // if user searched by client name
  if (searchBy.value === 'Client Name') {
    if (firstName.value || lastName.value) {
      activeQuery.value = { searchBy: 'name', firstName: firstName.value, lastName: lastName.value }
      execute()
    }
    // if user searches by client phone number
  } else if (searchBy.value === 'Client Number') {
    if (phoneNumber.value) {
      activeQuery.value = { searchBy: 'number', phoneNumber: phoneNumber.value }
      execute()
    }
  }
}

function openClient(client) {
  router.push({ name: 'clientdetails', params: { id: client._id } })
}
</script>