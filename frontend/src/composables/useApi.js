import { ref } from 'vue'

export function useApi(apiCall) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  let latestRequest = 0
  async function execute() {
    const requestId = ++latestRequest
    loading.value = true
    error.value = null
    try {
      const result = await apiCall()
      if (requestId === latestRequest) data.value = result
    } catch (err) {
      // The axios interceptor already converted the failure into an Error with a readable message
      if (requestId === latestRequest) error.value = err?.message || 'Something went wrong'
    } finally {
      if (requestId === latestRequest) loading.value = false
    }
  }
  return { data, loading, error, execute }
}

//used claude ai to help format the code and to explain hwo to make the API request handling reuseable.//
