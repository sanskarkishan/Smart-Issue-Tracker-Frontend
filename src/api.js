import { API_URL as BASE_URL } from './config'

export async function fetchTasks() {
  const res = await fetch(`${BASE_URL}/api/tasks`)
  if (!res.ok) throw new Error('Failed to fetch tasks')
  return res.json()
}

export async function createTask(task) {
  const res = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  })
  if (!res.ok) throw new Error('Failed to create task')
  return res.json()
}

export async function updateTask(id, updates) {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  if (!res.ok) throw new Error('Failed to update task')
  return res.json()
}

export async function updateTaskStatus(id, status) {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Failed to update status')
  return res.json()
}

export async function deleteTask(id) {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete task')
}


