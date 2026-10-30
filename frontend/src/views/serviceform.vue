
<!-- MIGRATION_NOTE: Converted serviceform.vue from Options API to Composition API using script setup. -->
<template>
    <main>
        <!--Header-->
        <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
            Create Service
        </h1>
        <div class="px-10 py-20">
            <!--Form-->
            <form @submit.prevent="handleSubmitForm">
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                    <h2 class="text-2xl font-bold">Service Details</h2>

                    <!-- Service Name input field -->
                    <div class="flex flex-col">
                        <label class="block">
                            <span class="text-gray-700">Service Name</span>
                            <span style="color: #ff0000">*</span>
                            <input
                                type="text"
                                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                v-model="service.name"
                            />
                            <span v-if="v$.service.name.$error" class="text-red-500">
                                Service Name is required
                            </span>
                        </label>
                    </div>

                    <!-- Description input field -->
                    <div class="flex flex-col">
                        <label>
                            <span class="text-gray-700">Description:</span>
                            <textarea
                                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                v-model="service.description"
                            ></textarea>
                        </label>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mt-10">
                    <div></div>
                    <div class="flex flex-col">
                        <label class="block">
                            <span class="text-gray-700">Service Status</span>
                            <span style="color: #ff0000">*</span>
                            <div class="mt-1">
                                <label class="inline-flex items-center">
                                    <input
                                        type="radio"
                                        class="form-radio"
                                        value="Active"
                                        v-model="service.status"
                                    />
                                    <span class="ml-2">Active</span>
                                </label>
                                <label class="inline-flex items-center ml-6">
                                    <input
                                        type="radio"
                                        class="form-radio"
                                        value="Inactive"
                                        v-model="service.status"
                                    />
                                    <span class="ml-2">Inactive</span>
                                </label>
                            </div>
                        </label>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                    <div></div>
                    <div class="flex justify-between mt-10 mr-20">
                        <button class="bg-red-700 text-white rounded" type="submit">
                            Add Service
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </main>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { createService } from '../api/api'
import { useToast } from 'vue-toastification'

// MIGRATION_NOTE: Replaced data() with reactive() to preserve service form state.
const service = reactive({
    name: null,
    description: null,
    status: 'Active',
})

// MIGRATION_NOTE: Moved validations() into setup-compatible rules.
const rules = {
    service: {
        name: { required },
    },
}

const v$ = useVuelidate(rules, { service })

// MIGRATION_NOTE: Replaced this.$router with useRouter() and methods with a plain function.
const router = useRouter()
const toast = useToast()

async function handleSubmitForm() {
    const isValid = await v$.value.$validate()

    if (!isValid) {
        return
    }

    try {
        const response = await createService(service)
        toast.success(response)
        await router.push('/findservice')
    } catch (error) {
        // the axios interceptor already produced a readable message
        toast.error(error.message)
    }
}
</script>
