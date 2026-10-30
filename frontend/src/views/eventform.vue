
<!-- This view allows for the creation of a new event -->
<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Create New Event
      </h1>
    </div>

    <div class="px-10 py-20">
      <!--Form-->
      <!-- @submit.prevent stops the submit event from reloading the page -->
      <form @submit.prevent="handleSubmitForm">

        <!-- Event Details -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <h2 class="text-2xl font-bold">Event Details</h2>

          <!-- Event Name Input Field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Event Name</span>
              <span style="color: #ff0000">*</span>
              <input
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                v-model="event.name"
              />
            </label>
            <span v-if="v$.event.name.$error" class="text-red-500">
              Event Name is required
            </span>
          </div>

          <!-- Date Input Field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Date</span>
              <span style="color: #ff0000">*</span>
              <input
                type="date"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                v-model="event.date"
              />
            </label>

            <span v-if="v$.event.date.$error" class="text-red-500">
              <span v-if="v$.event.date.required.$invalid">
                Event Date is required
              </span>
              <span v-else-if="v$.event.date.validDate.$invalid">
                Event Date must be a valid date
              </span>
              <span v-else-if="v$.event.date.notBeforeToday.$invalid">
                New Event Date cannot be in the past.
              </span>
            </span>
          </div>

          <div></div>
          <div></div>

          <!-- Description Input Field -->
          <div class="flex col-span-2 flex-col">
            <label class="block">
              <span class="text-gray-700">Description</span>
              <textarea
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                rows="2"
                v-model="event.description"
              ></textarea>
            </label>
          </div>
        </div>

        <!-- Services Offered at Event -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mt-10">
          <h2 class="text-2xl font-bold">Services Offered at Event</h2>

          <div class="flex flex-col grid-cols-3">
            <div>
              <ul v-if="activeServices.length" class="space-y-2">
                <li
                  v-for="service in activeServices"
                  :key="service._id"
                  :data-service-id="service._id"
                  class="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 transition-colors relative"
                >
                  <label class="block w-full h-full">
                    <input
                      type="checkbox"
                      :id="service._id"
                      :value="service._id"
                      v-model="event.services"
                      class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 mr-2"
                    />
                    <span class="font-medium">{{ service.name }}</span>
                  </label>
                </li>
              </ul>

              <!-- No active services available -->
              <p v-else class="text-gray-600">
                No Active Services Available
              </p>
            </div>
          </div>
        </div>

        <!-- Address Details -->
        <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <h2 class="text-2xl font-bold">Address</h2>

          <!-- Address Line 1 -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Address Line 1</span>
              <input
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                v-model="event.address.line1"
              />
            </label>
          </div>

          <!-- Address Line 2 -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Address Line 2</span>
              <input
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                v-model="event.address.line2"
              />
            </label>
          </div>

          <!-- City -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">City</span>
              <input
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                v-model="event.address.city"
              />
            </label>
          </div>

          <div></div>

          <!-- County -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">County</span>
              <input
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                v-model="event.address.county"
              />
            </label>
          </div>

          <!-- Zip Code -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Zip Code</span>
              <input
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                v-model="event.address.zip"
              />
            </label>
          </div>
        </div>

        <!-- Add New Event Button -->
        <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <div></div>
          <div class="flex justify-between mr-20">
            <button
              class="bg-red-700 text-white rounded"
              type="submit"
            >
              Add New Event
            </button>
          </div>
        </div>

      </form>
    </div>
  </main>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { getServices, createEvent } from '../api/api'
import { useToast } from 'vue-toastification'

// MIGRATION_NOTE: Converted eventform.vue from Options API
// to Composition API using script setup.

// MIGRATION_NOTE: Replaced data() with reactive() for event
// information and ref() for the active services list.

const event = reactive({
  name: null,
  description: null,
  date: null,
  services: [],
  address: {
    line1: null,
    line2: null,
    city: null,
    county: null,
    zip: null
  },
  attendees: []
})

const activeServices = ref([])

// MIGRATION_NOTE: Moved validations() into Composition API rules.
// Preserved required event name, required date, and date checks.

const validDate = (value) => {
  if (!value) return false

  const date = new Date(value)
  return !isNaN(date.getTime())
}

// Prevent event dates earlier than today using local date.
const notBeforeToday = (value) => {
  if (!value) return false

  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  const todayString = `${year}-${month}-${day}`
  return value >= todayString
}

const rules = {
  event: {
    name: { required },
    date: {
      required,
      validDate,
      notBeforeToday
    }
  }
}

const v$ = useVuelidate(rules, { event })

// MIGRATION_NOTE: Replaced this.$router with useRouter()
// and initialized notifications inside script setup.

const router = useRouter()
const toast = useToast()

// MIGRATION_NOTE: Replaced mounted() with onMounted().
// Loads active services when the component opens.

onMounted(async () => {
  try {
    const response = await getServices()

    activeServices.value = response.filter(
      item => item.status === 'Active'
    )
  } catch (error) {
    toast.error(error?.message || 'Error loading services')
  }
})

// MIGRATION_NOTE: Converted methods.handleSubmitForm()
// into a regular async function using Composition API.

async function handleSubmitForm() {
  const isValid = await v$.value.$validate()

  if (!isValid) {
    toast.error('Please fix input field errors')
    return
  }

  try {
    const response = await createEvent(event)

    await router.push('/findevents')
    toast.success(response)
  } catch (error) {
    toast.error(error?.message || 'Error creating new event')
  }
}
</script>
