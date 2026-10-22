
import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/visitors'

const INMATES_URL = 'http://localhost:5000/api/inmates'

const VISITOR_STATUSES = ['Pending', 'Approved', 'Rejected']

const EMPTY_FORM = {
  name: '',
  nationalId: '',
  phone: '',
  relationshipToInmate: '',
  inmate: '',
  purpose: '',
  checkedItems: [],
  date: '',
  time: '09:00',
}

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

  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`
}

function formatTimestamp(timestamp) {
  if (!timestamp) return 'Not recorded'

  return new Date(timestamp).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function getStatusClass(status = '') {
  return status.toLowerCase().replaceAll('/', '').replaceAll(' ', '-')
}

function App() {
  const [visitors, setVisitors] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [formBusy, setFormBusy] = useState(false)

  const [inmateSearch, setInmateSearch] = useState('')
  const [inmateResults, setInmateResults] = useState([])
  const [selectedInmate, setSelectedInmate] = useState(null)
  const [lookingUpInmates, setLookingUpInmates] = useState(false)

  const today = new Date().toLocaleDateString('en-CA')

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    date: today,
  })

  async function loadVisitors() {
    try {
      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('The server could not load visitor records.')
      }

      setVisitors(await response.json())
    } catch (error) {
      console.error('Loading visitors failed:', error)
      setNotice(
        'Cannot connect to the backend. Start the mock backend on port 5000.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVisitors()
  }, [])

  useEffect(() => {
    const query = inmateSearch.trim()

    if (query.length < 2 || selectedInmate) {
      setInmateResults([])
      setLookingUpInmates(false)
      return
    }

    let cancelled = false

    async function findInmates() {
      setLookingUpInmates(true)

      try {
        const response = await fetch(
          `${INMATES_URL}?search=${encodeURIComponent(query)}`,
        )

        if (!response.ok) {
          throw new Error('Could not search inmate records.')
        }

        const results = await response.json()

        if (!cancelled) setInmateResults(results)
      } catch (error) {
        if (!cancelled) {
          console.error('Inmate lookup failed:', error)
          setInmateResults([])
        }
      } finally {
        if (!cancelled) setLookingUpInmates(false)
      }
    }

    const timer = setTimeout(findInmates, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [inmateSearch, selectedInmate])

  const pendingCount = visitors.filter(
    (visitor) => visitor.status === 'Pending',
  ).length

  const approvedCount = visitors.filter(
    (visitor) => visitor.status === 'Approved',
  ).length

  const rejectedCount = visitors.filter(
    (visitor) => visitor.status === 'Rejected',
  ).length

  const filteredVisitors = useMemo(() => {
    const term = search.trim().toLowerCase()

    return visitors.filter((visitor) => {
      const matchesSearch =
        (visitor.name || '').toLowerCase().includes(term) ||
        (visitor.visitorId || '').toLowerCase().includes(term) ||
        (visitor.inmate || '').toLowerCase().includes(term) ||
        (visitor.nationalId || '').toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === 'All' || visitor.status === statusFilter

      const matchesDate = !dateFilter || visitor.date === dateFilter

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [visitors, search, statusFilter, dateFilter])

  async function updateStatus(visitor, status) {
    if (busyId !== null) return

    setBusyId(visitor.id)
    setNotice('')

    try {
      const response = await fetch(`${API_URL}/${visitor.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Could not update visitor status.')
      }

      setVisitors((current) =>
        current.map((item) =>
          item.id === visitor.id ? { ...item, ...result } : item,
        ),
      )

      setNotice(`${visitor.name}'s request is now ${status}.`)
    } catch (error) {
      console.error('Updating visitor failed:', error)
      setNotice(error.message || 'Could not update visitor status.')
    } finally {
      setBusyId(null)
    }
  }

  async function recordVisitTime(visitor, action) {
    if (busyId !== null) return

    setBusyId(visitor.id)
    setNotice('')

    try {
      const response = await fetch(
        `${API_URL}/${visitor.id}/${action}`,
        { method: 'POST' },
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Could not record visit time.')
      }

      setVisitors((current) =>
        current.map((item) =>
          item.id === visitor.id ? { ...item, ...result } : item,
        ),
      )

      setNotice(
        action === 'entry'
          ? `Entry time recorded for ${visitor.name}.`
          : `Exit time recorded for ${visitor.name}.`,
      )
    } catch (error) {
      console.error('Recording visit time failed:', error)
      setNotice(error.message || 'Could not record visit time.')
    } finally {
      setBusyId(null)
    }
  }

  async function deleteVisitor(visitor) {
    if (
      !window.confirm(
        `Are you sure you want to remove ${visitor.name}'s visitor record?`,
      )
    ) {
      return
    }

    setBusyId(visitor.id)

    try {
      const response = await fetch(`${API_URL}/${visitor.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Could not delete visitor.')
      }

      setVisitors((current) =>
        current.filter((item) => item.id !== visitor.id),
      )

      setNotice('Visitor record removed successfully.')
    } catch (error) {
      console.error('Deleting visitor failed:', error)
      setNotice(error.message || 'Could not remove visitor.')
    } finally {
      setBusyId(null)
    }
  }

  function resetRegistrationForm() {
    setForm({ ...EMPTY_FORM, date: today })
    setInmateSearch('')
    setInmateResults([])
    setSelectedInmate(null)
  }

  async function registerVisitor(event) {
    event.preventDefault()

    if (!selectedInmate || !selectedInmate.visitationAllowed) {
      setNotice('Search for and select an inmate who is allowed visitors.')
      return
    }

    const visitorData = {
      name: form.name.trim(),
      nationalId: form.nationalId.trim(),
      phone: form.phone.trim(),
      relationshipToInmate: form.relationshipToInmate,
      inmate: selectedInmate.fullName,
      purpose: form.purpose.trim(),
      checkedItems: form.checkedItems,
      date: form.date,
      time: form.time,
    }

    if (
      !visitorData.name ||
      !visitorData.nationalId ||
      !visitorData.phone ||
      !visitorData.relationshipToInmate ||
      !visitorData.purpose ||
      !visitorData.date ||
      !visitorData.time
    ) {
      setNotice('Please complete all required visitor details.')
      return
    }

    setFormBusy(true)
    setNotice('')

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      resetRegistrationForm()
      setShowForm(false)
      setNotice('Visitor registered successfully. Request is pending.')
    } catch (error) {
      console.error('Registering visitor failed:', error)
      setNotice(error.message || 'Could not register visitor.')
    } finally {
      setFormBusy(false)
    }
  }

  function renderActions(visitor) {
    const isBusy = busyId === visitor.id

    return (
      <div className="action-buttons">
        {visitor.status === 'Pending' && (
          <>
            <button
              className="action-approve"
              type="button"
              disabled={busyId !== null}
              onClick={() => updateStatus(visitor, 'Approved')}
            >
              {isBusy ? 'Saving...' : 'Approve'}
            </button>

            <button
              className="action-reject"
              type="button"
              disabled={busyId !== null}
              onClick={() => updateStatus(visitor, 'Rejected')}
            >
              Reject
            </button>
          </>
        )}

        {visitor.status === 'Approved' && !visitor.entryTimestamp && (
          <button
            className="action-approve"
            type="button"
            disabled={busyId !== null}
            onClick={() => recordVisitTime(visitor, 'entry')}
          >
            {isBusy ? 'Saving...' : 'Record Entry'}
          </button>
        )}

        {visitor.status === 'Approved' &&
          visitor.entryTimestamp &&
          !visitor.exitTimestamp && (
            <button
              className="action-approve"
              type="button"
              disabled={busyId !== null}
              onClick={() => recordVisitTime(visitor, 'exit')}
            >
              {isBusy ? 'Saving...' : 'Record Exit'}
            </button>
          )}

        {visitor.status === 'Approved' && visitor.exitTimestamp && (
          <span className="status-badge approved">Visit completed</span>
        )}

        {visitor.status === 'Rejected' && (
          <span className="status-badge rejected">Request rejected</span>
        )}

        <button
          className="action-delete"
          type="button"
          disabled={busyId !== null}
          onClick={() => deleteVisitor(visitor)}
        >
          {isBusy ? 'Please wait...' : 'Remove'}
        </button>
      </div>
    )
  }

  return (
    <div className="app-shell no-sidebar">
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs">
            <strong>Prison Management System</strong>
            <span className="breadcrumb-divider">/</span>
            <span>Visitor Management</span>
          </div>
          <span className="environment-label">DEMO ENVIRONMENT</span>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <p className="eyebrow">FACILITY OPERATIONS / RECORDS</p>
              <h1>Visitor Management</h1>
              <p className="page-description">
                Register visitors, verify visitation rights, and record gate
                entry and exit times.
              </p>
            </div>

            <button
              className="primary-button"
              type="button"
              onClick={() => {
                setNotice('')
                setShowForm(true)
              }}
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
              <p className="stat-footnote">All recorded visitors</p>
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
              <p className="stat-footnote">Approved visits</p>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Rejected requests</span>
                <span className="stat-icon stat-purple">RJ</span>
              </div>
              <div className="stat-number">{rejectedCount}</div>
              <p className="stat-footnote">Requests not approved</p>
            </article>
          </section>

          <section className="table-card">
            <div className="table-heading">
              <div>
                <h2>Visitor records</h2>
                <p>
                  Review requests and record official arrival and departure
                  times.
                </p>
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
                {VISITOR_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
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
                    <th>VISIT STATUS</th>
                    <th>GATE ENTRY</th>
                    <th>GATE EXIT</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="empty-state">
                        <strong>Loading visitors...</strong>
                        <span>Connecting to the backend.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredVisitors.map((visitor) => (
                      <tr key={visitor.id}>
                        <td>
                          <div className="visitor-cell">
                            <div className="visitor-avatar">
                              {(visitor.name || 'V')
                                .split(' ')
                                .map((part) => part[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className="visitor-details">
                              <strong>{visitor.name}</strong>
                              <span>{visitor.visitorId}</span>
                              {visitor.nationalId && (
                                <span>ID: {visitor.nationalId}</span>
                              )}
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
                            className={`status-badge ${getStatusClass(
                              visitor.status,
                            )}`}
                          >
                            <span className="status-dot" />
                            {visitor.status || 'Pending'}
                          </span>
                        </td>
                        <td>
                          <span className="timestamp-text">
                            {formatTimestamp(visitor.entryTimestamp)}
                          </span>
                        </td>
                        <td>
                          <span className="timestamp-text">
                            {formatTimestamp(visitor.exitTimestamp)}
                          </span>
                        </td>
                        <td>{renderActions(visitor)}</td>
                      </tr>
                    ))
                  )}

                  {!loading && filteredVisitors.length === 0 && (
                    <tr>
                      <td colSpan="8" className="empty-state">
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
            <span>Visitor Management · Frontend demonstration</span>
          </footer>
        </div>
      </main>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !formBusy) {
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
                <p>Enter the visitor's information and visit details.</p>
              </div>
              <button
                className="close-modal"
                type="button"
                aria-label="Close registration form"
                disabled={formBusy}
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
                National ID / Passport number
                <input
                  required
                  maxLength="60"
                  value={form.nationalId}
                  onChange={(event) =>
                    setForm({ ...form, nationalId: event.target.value })
                  }
                  placeholder="Enter ID or passport number"
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

              <label>
                Relationship to inmate
                <select
                  required
                  value={form.relationshipToInmate}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      relationshipToInmate: event.target.value,
                    })
                  }
                >
                  <option value="">Select relationship</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Relative">Other relative</option>
                  <option value="Friend">Friend</option>
                  <option value="Lawyer">Lawyer</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                Search inmate
                <input
                  required
                  value={inmateSearch}
                  onChange={(event) => {
                    setInmateSearch(event.target.value)
                    setSelectedInmate(null)
                    setForm({ ...form, inmate: '' })
                  }}
                  placeholder="Type at least 2 letters of the inmate's name"
                />
              </label>

              {lookingUpInmates && <p>Searching inmate records...</p>}

              {inmateResults.length > 0 && !selectedInmate && (
                <div className="inmate-results">
                  {inmateResults.map((inmate) => (
                    <button
                      className="inmate-result"
                      type="button"
                      key={inmate.fullName}
                      onClick={() => {
                        setSelectedInmate(inmate)
                        setForm({ ...form, inmate: inmate.fullName })
                        setInmateSearch(inmate.fullName)
                        setInmateResults([])
                      }}
                    >
                      <strong>{inmate.fullName}</strong>
                      <span>Cell block: {inmate.cellBlock}</span>
                      <span>
                        Visitation:{' '}
                        {inmate.visitationAllowed ? 'Allowed' : 'Restricted'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {inmateSearch.trim().length >= 2 &&
                !lookingUpInmates &&
                !selectedInmate &&
                inmateResults.length === 0 && (
                  <p>No inmate found. Check the spelling and try again.</p>
                )}

              {selectedInmate && (
                <div className="pending-note">
                  <strong>{selectedInmate.fullName}</strong>
                  <p>Cell block: {selectedInmate.cellBlock}</p>
                  <p>
                    Visitation:{' '}
                    {selectedInmate.visitationAllowed
                      ? 'Allowed'
                      : 'Restricted'}
                  </p>
                  <button
                    type="button"
                    className="clear-filters"
                    onClick={() => {
                      setSelectedInmate(null)
                      setInmateSearch('')
                      setForm({ ...form, inmate: '' })
                    }}
                  >
                    Choose another inmate
                  </button>
                </div>
              )}

              <label>
                Purpose of visit
                <textarea
                  required
                  maxLength="500"
                  rows="3"
                  value={form.purpose}
                  onChange={(event) =>
                    setForm({ ...form, purpose: event.target.value })
                  }
                  placeholder="Explain the reason for the visit"
                />
              </label>

              <fieldset className="gate-items">
                <legend>Items checked at the gate</legend>
                {[
                  'Identity verified',
                  'Bags inspected',
                  'Prohibited items checked',
                  'Personal belongings recorded',
                ].map((item) => (
                  <label key={item}>
                    <input
                      type="checkbox"
                      checked={form.checkedItems.includes(item)}
                      onChange={(event) => {
                        const checkedItems = event.target.checked
                          ? [...form.checkedItems, item]
                          : form.checkedItems.filter(
                              (selected) => selected !== item,
                            )

                        setForm({ ...form, checkedItems })
                      }}
                    />
                    {item}
                  </label>
                ))}
              </fieldset>

              <div className="form-row">
                <label>
                  Visit date
                  <input
                    required
                    type="date"
                    min={today}
                    value={form.date}
                    onChange={(event) =>
                      setForm({ ...form, date: event.target.value })
                    }
                  />
                </label>

                <label>
                  Scheduled visit time
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
                New requests start as Pending and require approval. Actual
                gate entry and exit times are recorded separately.
              </div>

              <div className="modal-actions">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={formBusy}
                  onClick={() => {
                    setShowForm(false)
                    resetRegistrationForm()
                  }}
                >
                  Cancel
                </button>
                <button
                  className="primary-button"
                  type="submit"
                  disabled={formBusy}
                >
                  {formBusy ? 'Please wait...' : 'Register visitor'}
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
