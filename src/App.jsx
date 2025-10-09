import './App.css'
import { useEffect, useMemo, useState } from 'react'
import { createTask, deleteTask, fetchTasks, updateTaskStatus } from './api'

const STATUSES = ['Todo', 'In Progress', 'Done']

function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    let mounted = true
    fetchTasks()
      .then(data => { if (mounted) { setTasks(data); setLoading(false) } })
      .catch(err => { if (mounted) { setError(err.message); setLoading(false) } })
    return () => { mounted = false }
  }, [])

  const grouped = useMemo(() => {
    const by = { 'Todo': [], 'In Progress': [], 'Done': [] }
    for (const t of tasks) { by[t.status]?.push(t) }
    return by
  }, [tasks])

  const statusStyles = {
    'Todo': {
      border: 'border-t-4 border-slate-300',
      badge: 'bg-slate-200 text-slate-700',
      button: 'bg-slate-600 hover:bg-slate-700',
    },
    'In Progress': {
      border: 'border-t-4 border-amber-400',
      badge: 'bg-amber-100 text-amber-700',
      button: 'bg-amber-600 hover:bg-amber-700',
    },
    'Done': {
      border: 'border-t-4 border-emerald-400',
      badge: 'bg-emerald-100 text-emerald-700',
      button: 'bg-emerald-600 hover:bg-emerald-700',
    },
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    if (!title.trim()) { setError('Title is required'); return }
    try {
      const newTask = await createTask({ title, description })
      setTasks(prev => [newTask, ...prev])
      setTitle('')
      setDescription('')
    } catch (err) {
      setError(err.message)
    }
  }

  async function moveTask(taskId, nextStatus) {
    try {
      const updated = await updateTaskStatus(taskId, nextStatus)
      setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)))
    } catch (err) {
      setError(err.message)
    }
  }

  async function removeTask(taskId) {
    try {
      await deleteTask(taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (err) {
      setError(err.message)
    }
  }

  function onDragStart(e, task) {
    e.dataTransfer.setData('text/plain', JSON.stringify(task))
  }

  function onDrop(e, status) {
    e.preventDefault()
    const raw = e.dataTransfer.getData('text/plain')
    if (!raw) return
    const task = JSON.parse(raw)
    if (task.status !== status) moveTask(task.id, status)
  }

  function onDragOver(e) { e.preventDefault() }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <header className="max-w-6xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500">
              Smart Issue Tracker
            </h1>
            <p className="text-sm text-slate-600">Simple tasks with drag & drop statuses</p>
          </div>
          <span className="hidden md:inline-flex items-center justify-center size-10 rounded-lg bg-slate-100">📝</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <section className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-4 md:p-6 mb-6">
          <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-3">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title"
              aria-label="Task title"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description (optional)"
              aria-label="Task description"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <button
              type="submit"
              className="rounded-lg px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition"
            >
              Add Task
            </button>
          </form>
          {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="size-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
            <span className="ml-3 text-slate-600">Loading tasks…</span>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STATUSES.map(status => (
              <div key={status} className={`bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-3 ${statusStyles[status].border}`}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold">{status}</h2>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                    {grouped[status].length}
                  </span>
                </div>
                <div
                  onDragOver={onDragOver}
                  onDrop={e => onDrop(e, status)}
                  className="min-h-40 space-y-3"
                >
                  {grouped[status].length === 0 && (
                    <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center text-sm text-slate-500">
                      Drag tasks here
                    </div>
                  )}
                  {grouped[status].map(task => (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={e => onDragStart(e, task)}
                      className="border border-slate-200 rounded-lg p-3 bg-slate-50 hover:bg-white transition cursor-move shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusStyles[task.status].badge}`}>{task.status}</span>
                            <h3 className="font-medium truncate">{task.title}</h3>
                          </div>
                          {task.description && (
                            <p className="mt-1 text-sm text-slate-600 break-words">{task.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeTask(task.id)}
                          className="text-red-600 text-sm hover:underline shrink-0"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {STATUSES.filter(s => s !== task.status).map(s => (
                          <button
                            key={s}
                            onClick={() => moveTask(task.id, s)}
                            className="text-xs border border-slate-300 rounded px-2 py-1 hover:bg-slate-100"
                          >
                            Move to {s}
                          </button>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}

export default App
