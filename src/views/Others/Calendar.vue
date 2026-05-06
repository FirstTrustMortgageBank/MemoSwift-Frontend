<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div
      class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Loading events...</p>
        </div>
      </div>

      <!-- Calendar -->
      <div v-else class="custom-calendar">
        <FullCalendar ref="calendarRef" class="min-h-screen" :options="calendarOptions" />
      </div>

      <!-- Error Toast -->
      <div
        v-if="errorMessage"
        class="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 text-sm text-white bg-error-500 rounded-lg shadow-lg"
      >
        <span>{{ errorMessage }}</span>
        <button @click="errorMessage = ''" class="ml-2 hover:opacity-80">✕</button>
      </div>

      <!-- Success Toast -->
      <div
        v-if="successMessage"
        class="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 text-sm text-white bg-success-500 rounded-lg shadow-lg"
      >
        <span>{{ successMessage }}</span>
        <button @click="successMessage = ''" class="ml-2 hover:opacity-80">✕</button>
      </div>

      <!-- Modal -->
      <Modal v-if="isOpen" @close="closeModal">
        <template #body>
          <div
            class="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11"
          >
            <h5
              class="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl"
            >
              {{ selectedEvent ? 'Edit Event' : 'Add Event' }}
            </h5>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Plan your next big moment: schedule or edit an event to stay on track
            </p>

            <div class="mt-8">
              <!-- Event Title -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Event Title *
                </label>
                <input
                  v-model="eventTitle"
                  type="text"
                  placeholder="Enter event title"
                  class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              <!-- Event Description -->
              <div class="mt-6">
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Event Description
                </label>
                <textarea
                  v-model="eventDescription"
                  rows="3"
                  placeholder="Enter event description"
                  class="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                ></textarea>
              </div>

              <!-- Event Color -->
              <div class="mt-6">
                <label class="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Event Color *
                </label>
                <div class="flex flex-wrap items-center gap-4 sm:gap-5">
                  <div v-for="(value, key) in calendarsEvents" :key="key" class="n-chk">
                    <div :class="`form-check form-check-${value} form-check-inline`">
                      <label
                        class="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400"
                        :for="`modal${key}`"
                      >
                        <span class="relative">
                          <input
                            type="radio"
                            name="event-level"
                            :value="key"
                            :id="`modal${key}`"
                            v-model="eventLevel"
                            class="sr-only form-check-input"
                          />
                          <span
                            class="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700"
                          >
                            <span class="w-2 h-2 bg-white rounded-full dark:bg-transparent"></span>
                          </span>
                        </span>
                        {{ key }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- All Day Toggle -->
              <div class="mt-6">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="isAllDay"
                    class="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-700"
                  />
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-400">
                    All Day Event
                  </span>
                </label>
              </div>

              <!-- Start Date -->
              <div class="mt-6">
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Start Date *
                </label>
                <input
                  v-model="eventStartDate"
                  :type="isAllDay ? 'date' : 'datetime-local'"
                  class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              <!-- End Date -->
              <div class="mt-6">
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  End Date *
                </label>
                <input
                  v-model="eventEndDate"
                  :type="isAllDay ? 'date' : 'datetime-local'"
                  class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
            </div>

            <div class="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              <button
                @click="closeModal"
                :disabled="isSaving"
                class="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Close
              </button>

              <button
                @click="handleAddOrUpdateEvent"
                :disabled="isSaving || !eventTitle || !eventStartDate || !eventEndDate || !eventLevel"
                class="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isSaving" class="flex items-center gap-2">
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </span>
                <span v-else>{{ selectedEvent ? 'Update Changes' : 'Add Event' }}</span>
              </button>
              <button
                v-if="selectedEvent"
                @click="handleDeleteEvent"
                :disabled="isSaving"
                class="flex w-full justify-center rounded-lg border border-error-500 bg-error-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-error-600 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isDeleting" class="flex items-center gap-2">
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Deleting...
                </span>
                <span v-else>Delete Event</span>
              </button>
            </div>
          </div>
        </template>
      </Modal>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import Modal from '@/components/profile/Modal.vue'
import { calendarService } from '@/services/calendar.service'

const currentPageTitle = ref('Calendar')
const calendarRef = ref(null)
const isOpen = ref(false)
const selectedEvent = ref(null)
const eventTitle = ref('')
const eventDescription = ref('')
const eventStartDate = ref('')
const eventEndDate = ref('')
const eventLevel = ref('')
const isAllDay = ref(true)
const events = ref([])
const isLoading = ref(true)
const isSaving = ref(false)
const isDeleting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const calendarsEvents = reactive({
  Danger: 'danger',
  Success: 'success',
  Primary: 'primary',
  Warning: 'warning',
})

// Helper function to format date for API
const formatDateForAPI = (dateString, isAllDayEvent) => {
  if (!dateString) return null
  
  if (isAllDayEvent) {
    // For all-day events, send just the date at midnight UTC
    return new Date(dateString).toISOString()
  } else {
    // For datetime events, send as is
    return new Date(dateString).toISOString()
  }
}

// Fetch events from API
const fetchEvents = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await calendarService.getEvents()
    console.log('Full API Response:', response)
    
    let eventsArray = []
    
    if (Array.isArray(response)) {
      eventsArray = response
    } else if (response && typeof response === 'object') {
      if (response.data && Array.isArray(response.data)) {
        eventsArray = response.data
      } else if (response.events && Array.isArray(response.events)) {
        eventsArray = response.events
      } else if (response.items && Array.isArray(response.items)) {
        eventsArray = response.items
      } else {
        console.warn('Unexpected response structure:', Object.keys(response))
        eventsArray = []
      }
    }
    
    console.log('Events array:', eventsArray)
    
    events.value = eventsArray.map(event => ({
      id: event.id,
      title: event.title,
      start: event.startDate || event.start,
      end: event.endDate || event.end,
      allDay: event.allDay !== undefined ? event.allDay : true,
      color: event.color,
      extendedProps: {
        calendar: event.color || 'primary',
        description: event.description || '',
      },
    }))
    
    await refreshCalendar()
  } catch (error) {
    console.error('Failed to fetch events:', error)
    errorMessage.value = error.response?.data?.message || 'Failed to load events. Please try again.'
    events.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchEvents()
})

const openModal = () => {
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
  resetModalFields()
}

const resetModalFields = () => {
  eventTitle.value = ''
  eventDescription.value = ''
  eventStartDate.value = ''
  eventEndDate.value = ''
  eventLevel.value = ''
  isAllDay.value = true
  selectedEvent.value = null
  errorMessage.value = ''
}

const handleDateSelect = (selectInfo) => {
  resetModalFields()
  
  // Handle start date
  eventStartDate.value = selectInfo.startStr
  
  // Handle end date - for all-day events, FullCalendar gives exclusive end date
  const endDate = new Date(selectInfo.end)
  if (selectInfo.allDay) {
    endDate.setDate(endDate.getDate() - 1)
    eventEndDate.value = endDate.toISOString().split('T')[0]
    isAllDay.value = true
  } else {
    eventEndDate.value = selectInfo.endStr
    isAllDay.value = false
  }
  
  // Set default color
  eventLevel.value = 'Primary'
  
  openModal()
}

const handleEventClick = (clickInfo) => {
  const event = clickInfo.event
  selectedEvent.value = event
  eventTitle.value = event.title
  eventDescription.value = event.extendedProps?.description || ''
  isAllDay.value = event.allDay || false
  
  // Format dates based on all-day status
  if (event.allDay) {
    eventStartDate.value = event.start?.toISOString().split('T')[0] || ''
    if (event.end) {
      const endDate = new Date(event.end)
      endDate.setDate(endDate.getDate() - 1)
      eventEndDate.value = endDate.toISOString().split('T')[0]
    } else {
      eventEndDate.value = eventStartDate.value
    }
  } else {
    eventStartDate.value = event.start?.toISOString().slice(0, 16) || ''
    eventEndDate.value = event.end?.toISOString().slice(0, 16) || ''
  }
  
  eventLevel.value = event.extendedProps?.calendar || event.color || 'Primary'
  openModal()
}

// Refresh the calendar with current events
const refreshCalendar = async () => {
  await nextTick()
  if (calendarRef.value) {
    const calendarApi = calendarRef.value.getApi()
    calendarApi.removeAllEvents()
    events.value.forEach(event => {
      calendarApi.addEvent(event)
    })
  }
}

// Show temporary success message
const showSuccess = (message) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// Show temporary error message
const showError = (message) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

const handleAddOrUpdateEvent = async () => {
  // Validate required fields
  if (!eventTitle.value || !eventStartDate.value || !eventEndDate.value || !eventLevel.value) {
    showError('Please fill in all required fields')
    return
  }

  isSaving.value = true
  errorMessage.value = ''

  try {
    // Prepare the payload according to your backend DTO
    const payload = {
      title: eventTitle.value,
      description: eventDescription.value || '',
      startDate: formatDateForAPI(eventStartDate.value, isAllDay.value),
      endDate: formatDateForAPI(eventEndDate.value, isAllDay.value),
      color: eventLevel.value.toLowerCase(),
      allDay: isAllDay.value,
    }

    console.log('Sending payload:', payload) // Debug log

    if (selectedEvent.value) {
      // Update existing event via API
      const updatedEvent = await calendarService.updateEvent(selectedEvent.value.id, payload)
      console.log('Updated event:', updatedEvent)
      
      // Update local events array
      events.value = events.value.map((event) =>
        event.id === selectedEvent.value.id
          ? {
              id: updatedEvent.id,
              title: updatedEvent.title,
              start: updatedEvent.startDate,
              end: updatedEvent.endDate,
              allDay: updatedEvent.allDay,
              color: updatedEvent.color,
              extendedProps: {
                calendar: updatedEvent.color,
                description: updatedEvent.description,
              },
            }
          : event
      )
      
      showSuccess('Event updated successfully')
    } else {
      // Create new event via API
      const newEvent = await calendarService.createEvent(payload)
      console.log('Created event:', newEvent)
      
      // Add to local events array
      events.value = [...events.value, {
        id: newEvent.id,
        title: newEvent.title,
        start: newEvent.startDate,
        end: newEvent.endDate,
        allDay: newEvent.allDay,
        color: newEvent.color,
        extendedProps: {
          calendar: newEvent.color,
          description: newEvent.description,
        },
      }]
      
      showSuccess('Event created successfully')
    }

    // Refresh the calendar to show changes
    closeModal()
    await refreshCalendar()
  } catch (error) {
    console.error('Failed to save event:', error)
    console.error('Error details:', error.response?.data)
    showError(error.response?.data?.message || 'Failed to save event. Please try again.')
  } finally {
    isSaving.value = false
  }
}

const handleDeleteEvent = async () => {
  if (!selectedEvent.value) return

  isDeleting.value = true
  errorMessage.value = ''

  try {
    await calendarService.deleteEvent(selectedEvent.value.id)
    
    // Remove from local events array
    events.value = events.value.filter((event) => event.id !== selectedEvent.value.id)
    
    // Refresh the calendar
    await refreshCalendar()
    closeModal()
    
    showSuccess('Event deleted successfully')
  } catch (error) {
    console.error('Failed to delete event:', error)
    showError(error.response?.data?.message || 'Failed to delete event. Please try again.')
  } finally {
    isDeleting.value = false
  }
}

const renderEventContent = (eventInfo) => {
  const calendarValue = eventInfo.event.extendedProps?.calendar || 'primary'
  const colorClass = `fc-bg-${calendarValue.toLowerCase()}`
  return {
    html: `
      <div class="event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm">
        <div class="fc-daygrid-event-dot"></div>
        <div class="fc-event-time">${eventInfo.timeText}</div>
        <div class="fc-event-title">${eventInfo.event.title}</div>
      </div>
    `,
  }
}

const calendarOptions = reactive({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next addEventButton',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  events: events,
  selectable: true,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventContent: renderEventContent,
  customButtons: {
    addEventButton: {
      text: 'Add Event +',
      click: openModal,
    },
  },
})
</script>