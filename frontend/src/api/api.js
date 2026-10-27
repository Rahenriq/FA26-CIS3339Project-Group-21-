// This file contains all API calls to the API endpoints
// import axios to make API calls
import axios from 'axios'

// Create HTTP client with the base URL, and specify that the data sent in the request body is JSON
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_ROOT_API,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------
// If user logs in successfully, this sets a header on "apiClient" called "Authorization" with
// the value "Bearer <token>". This security token is used to validate API calls
export function setAuthHeader(token) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// When user logs out, this function removes the Authorization header from apiClient
export function removeAuthHeader() {
  delete apiClient.defaults.headers.common['Authorization']
}

// Called on 401. api.js cannot import the Pinia store/router (circular import),
// so main.js registers a handler that clears the session and redirects to /login.
let onUnauthorized = () => {}
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

// ---------------------------------------------------------------------------
// Centralized error handling (F2)
// ---------------------------------------------------------------------------
// Pulls a short readable message out of whatever the server sent back
function extractServerMessage(data) {
  if (!data) return null
  if (typeof data === 'string') return data
  let message = data.message ?? data.error
  if (typeof message === 'string') {
    // validation errors may arrive as a JSON string: { errors: [{ msg }] }
    try {
      const json = JSON.parse(message)
      if (json.errors) message = json.errors[0].msg
    } catch (parseError) {
      // not JSON, keep the original string
    }
    return message
  }
  return null
}

// MIGRATION NOTE: this single interceptor replaces ~200 lines of repeated
// `try { ... } catch (error) { throw error.response.data }` in every API function.
// It is the ONLY place that turns errors into messages; components just show error.message.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // No response at all => network failure / backend down
    if (!error.response) {
      return Promise.reject(new Error('Unable to reach the server'))
    }

    const { status, data } = error.response

    // 401 on a protected call => session is invalid/expired: clear token + Pinia state, go to /login.
    // (Login itself returns 400 for bad credentials, so a wrong password does not trigger this.)
    if (status === 401) {
      logoutUser()
      onUnauthorized()
      return Promise.reject(new Error('Your session has expired. Please log in again.'))
    }

    const message = extractServerMessage(data) || `Request failed (${status})`
    return Promise.reject(new Error(message))
  }
)

// ---------------------------------------------------------------------------
// Login related API calls
// ---------------------------------------------------------------------------
// API call to log the user in
export async function loginUser(username, password) {
  const response = await apiClient.post('/users/login', { username, password })
  const token = response.data.token
  localStorage.setItem('authToken', token)
  setAuthHeader(token)
  return token
}

// API call to log the user out
export function logoutUser() {
  localStorage.removeItem('authToken')
  removeAuthHeader()
}

// Org related API calls
export const getOrgName = async () => (await apiClient.get('/org')).data

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
export const getEvents = async () => (await apiClient.get('/events/')).data

export const getEventById = async (id) => (await apiClient.get(`/events/id/${id}`)).data

// GET events based on search query
export const searchEvents = async (query) => {
  const params = {}
  if (query.searchBy === 'name') {
    params.searchBy = query.searchBy
    params.name = query.name || ''
  } else if (query.searchBy === 'date') {
    params.searchBy = 'date'
    params.eventDate = query.eventDate || ''
  }
  return (await apiClient.get('/events/search', { params })).data
}

// GET events for which a client is signed up
export const getClientEvents = async (id) => (await apiClient.get(`/events/client/${id}`)).data

// GET events for which a client is not signed up
export const getNonClientEvents = async (id) =>
  (await apiClient.get(`/events/client/${id}/not-registered`)).data

// GET all attendees for an event
export const getEventAttendees = async (id) => (await apiClient.get(`/events/attendees/${id}`)).data

// GET all events for a given service
export const getEventsByServiceId = async (id) =>
  (await apiClient.get(`/events/service/${id}`)).data

// POST new event
export const createEvent = async (eventData) => (await apiClient.post('/events/', eventData)).data

// PUT update event
export const updateEvent = async (id, eventData) =>
  (await apiClient.put(`/events/update/${id}`, eventData)).data

// PUT add attendee to event
// B1 contract: returns the created record, or { message: 'Already registered' }
export const registerAttendee = async (eventId, clientId) =>
  (await apiClient.put('/events/register', {}, { params: { event: eventId, client: clientId } })).data

// PUT remove attendee from event
// B1 contract: returns the removed record, or { message: 'Not registered' }
export const deregisterAttendee = async (eventId, clientId) =>
  (await apiClient.put('/events/deregister', {}, { params: { event: eventId, client: clientId } }))
    .data

// DELETE event by ID
export const deleteEvent = async (id) => (await apiClient.delete(`/events/${id}`)).data

// GET events for last two months (dashboard)
export const getAttendance = async () => (await apiClient.get('/events/attendance')).data

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------
export const getClients = async () => (await apiClient.get('/clients')).data

export const getClientById = async (id) => (await apiClient.get(`/clients/id/${id}`)).data

// GET clients based on search query
export const searchClients = async (query) => {
  const params = {}
  if (query.searchBy === 'name') {
    params.searchBy = query.searchBy
    params.firstName = query.firstName || ''
    params.lastName = query.lastName || ''
  } else if (query.searchBy === 'number') {
    params.searchBy = query.searchBy
    params.phoneNumber = query.phoneNumber || ''
  }
  return (await apiClient.get('/clients/search', { params })).data
}

export const createClient = async (newClient) => (await apiClient.post('/clients', newClient)).data

export const updateClient = async (id, updatedClient) =>
  (await apiClient.put(`/clients/update/${id}`, updatedClient)).data

export const deleteClientbyId = async (id) => (await apiClient.delete(`/clients/${id}`)).data

// GET client counts per zip code (dashboard)
export const getClientsByZipCode = async () => (await apiClient.get('/clients/byzip')).data

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
export const getServices = async () => (await apiClient.get('/services/')).data

export const getServiceById = async (id) => (await apiClient.get(`/services/id/${id}`)).data

// GET services based on search query
export const searchServices = async (query) => {
  const params = { searchBy: query.searchBy }
  if (query.searchBy === 'name') {
    params.name = query.name || ''
  } else if (query.searchBy === 'description') {
    params.description = query.description
  }
  return (await apiClient.get('/services/search', { params })).data
}

export const createService = async (newService) =>
  (await apiClient.post('/services', newService)).data

export const updateService = async (id, updatedService) =>
  (await apiClient.put(`/services/update/${id}`, updatedService)).data

export const deleteService = async (id) => (await apiClient.delete(`/services/${id}`)).data

// used claude ai to help remove the code to remove repeated try/catch blocks and centralize error handling in one place.