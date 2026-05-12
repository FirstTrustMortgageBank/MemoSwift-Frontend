// src/services/calendar.service.ts
import axios from 'axios'
import type { AxiosResponse } from 'axios'

const API_BASE_URL: string ='http://10.100.2.31:9000/api/v1'

interface EventData {
  // Define the shape of your event object
  // Example:
  id?: string
  title?: string
  start?: Date | string
  end?: Date | string
  description?: string
  [key: string]: any // Allow other properties if needed
}

interface GetAuthHeadersResponse {
  Authorization: string
  [key: string]: string
}

const getAuthHeaders = (): GetAuthHeadersResponse => {
  const token = JSON.parse(localStorage.getItem('token') || 'null')
  console.log('Retrieved token from localStorage:', token) // Debugging log
  return {
    Authorization: `Bearer ${token}`,
  }
}

export const calendarService = {
  async getEvents(): Promise<EventData[]> {
    const response: AxiosResponse<EventData[]> = await axios.get(`${API_BASE_URL}/calendar/events`, {
      headers: getAuthHeaders(),
    })
    return response.data
  },

  async createEvent(eventData: EventData): Promise<EventData> {
    const response: AxiosResponse<EventData> = await axios.post(
      `${API_BASE_URL}/calendar/events`,
      eventData,
      { headers: getAuthHeaders() }
    )
    return response.data
  },

  async updateEvent(id: string, eventData: EventData): Promise<EventData> {
    const response: AxiosResponse<EventData> = await axios.put(
      `${API_BASE_URL}/calendar/events/${id}`,
      eventData,
      { headers: getAuthHeaders() }
    )
    return response.data
  },

  async deleteEvent(id: string): Promise<EventData> {
    const response: AxiosResponse<EventData> = await axios.delete(
      `${API_BASE_URL}/calendar/events/${id}`,
      { headers: getAuthHeaders() }
    )
    return response.data
  },
}