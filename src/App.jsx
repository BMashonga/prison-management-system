
import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/visitors'

const navigation = [
  { label: 'Overview', icon: 'OV' },
  { label: 'Inmates', icon: 'IN' },
  { label: 'Visitors', icon: 'VI' },
  { label: 'Staff', icon: 'ST' },
  { label: 'Reports', icon: 'RE' },
  { label: 'Settings', icon: 'SE' },
]

function formatDate(date) {
  if (!date) return '—'

  return new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(time) {
  if (!time) return '—'

  const [hours, minutes] = time.split(':')
  const hour = Number(hours)
  const suffix = hour >= 12 ? 'PM' : 'AM'

  return `${hour % 12 || 12}:${minutes} ${suffix}`
}

function App() {
  const [visitors, setVisitors] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [activeNav, setActiveNav] = useState('Visitors')
  const [showForm, setShowForm] = useState(false)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const [form, setForm] = useState({
    name: '',
    inmate: '',
    phone: '',
    date: '2026-10-14',
    time: '09:00',
  })

  async function loadVisitors() {
    try {
      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('The server could not load visitor records.')
      }

      const data = await response.json()
      setVisitors(data)
    } catch (error) {
      console.error('Loading visitors failed:', error)
      setNotice(
        'Cannot connect to the backend. Make sure node server.js is running on port 5000.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVisitors()
  }, [])

  const pendingCount = visitors.filter(
    (visitor) => visitor.status === 'Pending',
  ).length

  const approvedCount = visitors.filter(
    (visitor) => visitor.status === 'Approved',
  ).length

  const today = new Date().toLocaleDateString('en-CA')

  const todayCount = visitors.filter(
    (visitor) => visitor.date === today,
  ).length

  const filteredVisitors = useMemo(() => {
    const term = search.trim().toLowerCase()

    return visitors.filter((visitor) => {
      const matchesSearch =
        visitor.name.toLowerCase().includes(term) ||
        visitor.visitorId.toLowerCase().includes(term) ||
        visitor.inmate.toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === 'All' || visitor.status === statusFilter

      const matchesDate = !dateFilter || visitor.date === dateFilter

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [visitors, search, statusFilter, dateFilter])

  async function updateStatus(id, status) {
    setBusy(true)

    try {
      const response = await fetch(`${API_URL}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Could not update visitor status.')
      }

      setVisitors((current) =>
        current.map((visitor) => (visitor.id === id ? result : visitor)),
      )

      setNotice(`Visitor request ${status.toLowerCase()}.`)
    } catch (error) {
      console.error('Updating visitor failed:', error)
      setNotice(error.message || 'Could not update visitor.')
    } finally {
      setBusy(false)
    }
  }

  async function deleteVisitor(id) {
    const confirmed = window.confirm(
      'Are you sure you want to remove this visitor record?',
    )

    if (!confirmed) return

    setBusy(true)

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Could not delete visitor.')
      }

      setVisitors((current) =>
        current.filter((visitor) => visitor.id !== id),
      )

      setNotice('Visitor record removed successfully.')
    } catch (error) {
      console.error('Deleting visitor failed:', error)
      setNotice(error.message || 'Could not remove visitor.')
    } finally {
      setBusy(false)
    }
  }

  async function registerVisitor(event) {
    event.preventDefault()

    const visitorData = {
      name: form.name.trim(),
      inmate: form.inmate.trim(),
      phone: form.phone.trim(),
      date: form.date,
      time: form.time,
    }

    if (
      !visitorData.name ||
      !visitorData.inmate ||
      !visitorData.phone ||
      !visitorData.date ||
      !visitorData.time
    ) {
      setNotice('Please complete all visitor details.')
      return
    }

    setBusy(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitorData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Could not register visitor.')
      }

      setVisitors((current) => [result, ...current])
      setSearch('')
      setStatusFilter('All')
      setDateFilter('')
      setForm({
        name: '',
        inmate: '',
        phone: '',
        date: today,
        time: '09:00',
      })
      setShowForm(false)
      setNotice('Visitor registered successfully. Request is pending.')
    } catch (error) {
      console.error('Registering visitor failed:', error)
      setNotice(error.message || 'Could not register visitor.')
    } finally {
      setBusy(false)
    }
  }

  function openRegistration() {
    setNotice('')
    setShowForm(true)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">P</div>
          <div>
            <h2>SecureCore</h2>
            <p>Facility Management</p>
          </div>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="navigation" aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`nav-item ${
                activeNav === item.label ? 'active' : ''
              }`}
              onClick={() => {
                setActiveNav(item.label)
                if (item.label !== 'Visitors') {
                  setNotice(
                    `${item.label} is a navigation placeholder. Your assigned page is Visitors.`,
                  )
                } else {
                  setNotice('')
                }
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.label === 'Visitors' && (
                <span className="nav-count">{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="security-card">
            <div className="security-icon">SC</div>
            <strong>Secure facility</strong>
            <p>
              Visitor records should only be accessed by authorised staff.
            </p>
          </div>

          <div className="sidebar-user">
            <div className="avatar">MP</div>
            <div className="user-details">
              <strong>Officer M. Phiri</strong>
              <span>Prison Personnel</span>
            </div>
            <span className="user-menu">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>Visitors</strong>
          </div>

          <div className="topbar-right">
            <span className="environment-label">DEMO ENVIRONMENT</span>
            <div className="topbar-avatar">MP</div>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <p className="eyebrow">FACILITY OPERATIONS / RECORDS</p>
              <h1>Visitors</h1>
              <p className="page-description">
                Manage visitor records and monitor visit requests.
              </p>
            </div>

            <button
              className="primary-button"
              type="button"
              onClick={openRegistration}
            >
              <span className="plus-sign">+</span>
              Register visitor
            </button>
          </section>

          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              <button
                type="button"
                aria-label="Dismiss message"
                onClick={() => setNotice('')}
              >
                ×
              </button>
            </div>
          )}

          <section className="stats-grid" aria-label="Visitor statistics">
            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Total visitors</span>
                <span className="stat-icon stat-blue">VR</span>
              </div>
              <div className="stat-number">{visitors.length}</div>
              <p className="stat-footnote">All recorded demo visitors</p>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Pending requests</span>
                <span className="stat-icon stat-amber">PR</span>
              </div>
              <div className="stat-number">{pendingCount}</div>
              <p className="stat-footnote">Awaiting a decision</p>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Approved requests</span>
                <span className="stat-icon stat-green">AP</span>
              </div>
              <div className="stat-number">{approvedCount}</div>
              <p className="stat-footnote">Currently approved records</p>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Today's visits</span>
                <span className="stat-icon stat-purple">TV</span>
              </div>
              <div className="stat-number">{todayCount}</div>
              <p className="stat-footnote">Visits scheduled for today</p>
            </article>
          </section>

          <section className="table-card">
            <div className="table-heading">
              <div>
                <h2>Visitor records</h2>
                <p>Review and manage visitor requests.</p>
              </div>
              <span className="records-count">
                {filteredVisitors.length} records
              </span>
            </div>

            <div className="toolbar">
              <label className="search-box">
                <span className="search-symbol">⌕</span>
                <input
                  type="search"
                  placeholder="Search visitor, ID or inmate..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search visitor records"
                />
              </label>

              <select
                className="filter-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by status"
              >
                <option value="All">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <input
                className="date-filter"
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                aria-label="Filter by visit date"
              />
            </div>

            <div className="table-scroll">
              <table className="visitor-table">
                <thead>
                  <tr>
                    <th>VISITOR</th>
                    <th>INMATE TO VISIT</th>
                    <th>VISIT DATE</th>
                    <th>TIME</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        <strong>Loading visitors...</strong>
                        <span>Connecting to the backend.</span>
                      </td>
                    </tr>
                  ) : filteredVisitors.map((visitor) => (
                    <tr key={visitor.id}>
                      <td>
                        <div className="visitor-cell">
                          <div className="visitor-avatar">
                            {visitor.name
                              .split(' ')
                              .map((part) => part[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="visitor-details">
                            <strong>{visitor.name}</strong>
                            <span>{visitor.visitorId}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="inmate-name">{visitor.inmate}</span>
                      </td>

                      <td>{formatDate(visitor.date)}</td>
                      <td>{formatTime(visitor.time)}</td>

                      <td>
                        <span
                          className={`status-badge ${visitor.status.toLowerCase()}`}
                        >
                          <span className="status-dot" />
                          {visitor.status}
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          {visitor.status === 'Pending' ? (
                            <>
                              <button
                                className="action-approve"
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  updateStatus(visitor.id, 'Approved')
                                }
                                aria-label={`Approve ${visitor.name}`}
                                title="Approve request"
                              >
                                Approve
                              </button>
                              <button
                                className="action-reject"
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  updateStatus(visitor.id, 'Rejected')
                                }
                                aria-label={`Reject ${visitor.name}`}
                                title="Reject request"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              className="action-delete"
                              type="button"
                              disabled={busy}
                              onClick={() => deleteVisitor(visitor.id)}
                              aria-label={`Remove ${visitor.name}`}
                              title="Remove visitor record"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && filteredVisitors.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        <strong>No visitors found</strong>
                        <span>
                          Try changing your search or filter settings.
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>
                Showing {filteredVisitors.length} of {visitors.length} records
              </span>
              <button
                className="clear-filters"
                type="button"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('All')
                  setDateFilter('')
                }}
              >
                Clear filters
              </button>
            </div>
          </section>

          <footer className="page-footer">
            <span>Prison Management System</span>
            <span>Visitors module · Frontend demonstration</span>
          </footer>
        </div>
      </main>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) {
              setShowForm(false)
            }
          }}
        >
          <section
            className="registration-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-title"
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">VISITOR MANAGEMENT</p>
                <h2 id="registration-title">Register visitor</h2>
                <p>Enter the details for a new visit request.</p>
              </div>
              <button
                className="close-modal"
                type="button"
                aria-label="Close registration form"
                disabled={busy}
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form className="registration-form" onSubmit={registerVisitor}>
              <label>
                Visitor's full name
                <input
                  required
                  maxLength="100"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Enter full name"
                />
              </label>

              <label>
                Inmate to visit
                <input
                  required
                  maxLength="100"
                  value={form.inmate}
                  onChange={(event) =>
                    setForm({ ...form, inmate: event.target.value })
                  }
                  placeholder="Enter inmate's full name"
                />
              </label>

              <label>
                Contact number
                <input
                  required
                  type="tel"
                  maxLength="30"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                  placeholder="Enter contact number"
                />
              </label>

              <div className="form-row">
                <label>
                  Visit date
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm({ ...form, date: event.target.value })
                    }
                  />
                </label>

                <label>
                  Visit time
                  <input
                    required
                    type="time"
                    value={form.time}
                    onChange={(event) =>
                      setForm({ ...form, time: event.target.value })
                    }
                  />
                </label>
              </div>

              <div className="pending-note">
                New requests start as Pending and require a decision.
              </div>

              <div className="modal-actions">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={busy}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  className="primary-button"
                  type="submit"
                  disabled={busy}
                >
                  {busy ? 'Please wait...' : 'Register visitor'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
