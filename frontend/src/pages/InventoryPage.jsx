import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../utils/auth'
import { getInventory, createInventoryItem, updateInventoryItem, adjustStock, deleteInventoryItem } from '../utils/api'

const BLANK = { name: '', sku: '', category: '', quantity: 0, unit: 'uds', lowStockThreshold: 5, unitCost: '', supplier: '' }

export default function InventoryPage() {
  const { user, logout } = useAuth()

  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [modal,   setModal]   = useState(null)   // null | 'new' | item (editar)
  const [form,    setForm]    = useState(BLANK)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState(null)

  useEffect(() => {
    getInventory().then(setItems).catch(console.error).finally(() => setLoading(false))
  }, [])

  const openNew  = () => { setForm(BLANK); setModal('new') }
  const openEdit = (item) => {
    setForm({ ...item, unitCost: item.unitCost ?? '', quantity: item.quantity })
    setModal(item)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setMsg(null)
    try {
      const payload = { ...form, quantity: parseInt(form.quantity) || 0, lowStockThreshold: parseInt(form.lowStockThreshold) || 5, unitCost: form.unitCost !== '' ? parseFloat(form.unitCost) : null }
      if (modal === 'new') {
        const created = await createInventoryItem(payload)
        setItems(is => [created, ...is])
      } else {
        const updated = await updateInventoryItem(modal.id, payload)
        setItems(is => is.map(i => i.id === updated.id ? updated : i))
      }
      setModal(null)
    } catch (err) {
      setMsg('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAdjust = async (id, delta) => {
    try {
      const updated = await adjustStock(id, delta)
      setItems(is => is.map(i => i.id === id ? updated : i))
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este artículo?')) return
    try {
      await deleteInventoryItem(id)
      setItems(is => is.filter(i => i.id !== id))
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
  }

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.sku ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (i.category ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const lowStockCount = items.filter(i => i.lowStock).length

  return (
    <>
      <Helmet>
        <title>Inventario | Clínica Dental Alamillo</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-800">Inventario</span>
            {lowStockCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                {lowStockCount} stock bajo
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
            <button onClick={logout} className="text-sm text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
              Salir
            </button>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {msg && (
            <div role="alert" className={`mb-4 px-4 py-3 rounded-xl text-sm border ${
              msg.startsWith('Error') ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
            }`}>{msg}</div>
          )}

          {/* Low-stock banner */}
          {lowStockCount > 0 && (
            <div className="mb-6 px-5 py-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span className="text-sm text-amber-800 font-medium">
                {lowStockCount} artículo{lowStockCount !== 1 ? 's' : ''} con stock bajo — revisa y repón antes de que se agoten.
              </span>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-5">
            <input
              type="search" placeholder="Buscar artículo, SKU, categoría…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
            />
            <button onClick={openNew} className="btn-primary text-sm py-2.5 px-4 shrink-0">
              + Añadir artículo
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-16 text-sm">
              {search ? 'Sin resultados para tu búsqueda' : 'No hay artículos en inventario todavía'}
            </p>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                      {['Artículo', 'SKU / Cat.', 'Stock', 'Umbral', 'Coste unit.', 'Proveedor', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(item => (
                      <tr key={item.id} className={item.lowStock ? 'bg-red-50/50' : 'hover:bg-gray-50 transition-colors'}>
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">{item.name}</span>
                          {item.lowStock && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">BAJO</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {item.sku && <div className="font-mono text-xs">{item.sku}</div>}
                          {item.category && <div className="text-xs text-gray-400">{item.category}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleAdjust(item.id, -1)}
                              className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-gray-500 transition-colors font-bold text-xs">−</button>
                            <span className={`w-10 text-center font-semibold ${item.lowStock ? 'text-red-600' : 'text-gray-800'}`}>
                              {item.quantity}
                            </span>
                            <button onClick={() => handleAdjust(item.id, 1)}
                              className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-green-100 hover:text-green-600 flex items-center justify-center text-gray-500 transition-colors font-bold text-xs">+</button>
                            <span className="text-xs text-gray-400 ml-1">{item.unit}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{item.lowStockThreshold} {item.unit}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {item.unitCost != null ? `${item.unitCost} €` : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{item.supplier ?? '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(item)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors" title="Editar">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Eliminar">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14H6L5 6"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal crear/editar */}
      <AnimatePresence>
        {modal !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={e => { if (e.target === e.currentTarget) setModal(null) }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                {modal === 'new' ? 'Añadir artículo' : 'Editar artículo'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <input required placeholder="Nombre *" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 outline-none transition" />
                  </div>
                  <input placeholder="SKU" value={form.sku ?? ''}
                    onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 outline-none transition" />
                  <input placeholder="Categoría" value={form.category ?? ''}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 outline-none transition" />
                  <input type="number" min="0" placeholder="Cantidad" value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 outline-none transition" />
                  <input placeholder="Unidad (uds, ml…)" value={form.unit}
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 outline-none transition" />
                  <input type="number" min="0" placeholder="Umbral stock bajo" value={form.lowStockThreshold}
                    onChange={e => setForm(f => ({ ...f, lowStockThreshold: e.target.value }))}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 outline-none transition" />
                  <input type="number" min="0" step="0.01" placeholder="Coste unitario (€)" value={form.unitCost ?? ''}
                    onChange={e => setForm(f => ({ ...f, unitCost: e.target.value }))}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 outline-none transition" />
                  <div className="col-span-2">
                    <input placeholder="Proveedor" value={form.supplier ?? ''}
                      onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 outline-none transition" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(null)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 btn-primary justify-center py-2.5 text-sm disabled:opacity-60">
                    {saving ? 'Guardando…' : 'Guardar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
