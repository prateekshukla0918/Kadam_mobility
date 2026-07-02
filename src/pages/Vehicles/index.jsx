import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdSearch, MdFilterList, MdAdd, MdEdit, MdDelete, MdChevronRight,
  MdClose, MdDirectionsCar, MdPerson, MdBuild, MdTimer, MdFlashOn,
  MdInfo, MdDescription, MdHistory, MdBatteryAlert, MdSpeed, MdSave,
  MdCheckCircle, MdAssignmentInd, MdCloudUpload
} from 'react-icons/md';
import { useApp } from '../../context/AppContext';

const STATUS_COLORS = {
  Running: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  Charging: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  Idle: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  Offline: { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af' },
  Maintenance: { bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
  Emergency: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
};

export default function Vehicles() {
  const {
    vehicles, addVehicle, updateVehicle, deleteVehicle,
    drivers, trips, maintenanceLogs
  } = useApp();

  // Selected row tracking for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Filtering & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [batteryFilter, setBatteryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modal / Drawer visibility states
  const [detailVehicleId, setDetailVehicleId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [assignDriverVehicle, setAssignDriverVehicle] = useState(null);
  const [serviceVehicle, setServiceVehicle] = useState(null);

  // Form Fields
  const [addForm, setAddForm] = useState({
    id: '', vehicleNumber: '', model: 'Tata Nexon EV', driver: '',
    status: 'Idle', battery: 80, speed: 0, region: 'Gurgaon',
    color: 'White', year: 2024, odometer: 12000
  });

  const [editForm, setEditForm] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');

  // Handle Sort toggle
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Filtered & Sorted vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter(v => {
        const matchSearch =
          v.id.toLowerCase().includes(search.toLowerCase()) ||
          v.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
          (v.driver || '').toLowerCase().includes(search.toLowerCase());

        const matchStatus = statusFilter === 'All' || v.status === statusFilter;
        
        let matchBattery = true;
        if (batteryFilter === 'High') matchBattery = v.battery >= 80;
        else if (batteryFilter === 'Medium') matchBattery = v.battery >= 30 && v.battery < 80;
        else if (batteryFilter === 'Low') matchBattery = v.battery < 30;

        return matchSearch && matchStatus && matchBattery;
      })
      .sort((a, b) => {
        let valA = a[sortBy] ?? '';
        let valB = b[sortBy] ?? '';
        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        } else {
          return sortOrder === 'asc'
            ? valA - valB
            : valB - valA;
        }
      });
  }, [vehicles, search, statusFilter, batteryFilter, sortBy, sortOrder]);

  const selectedVehicleObj = vehicles.find(v => v.id === detailVehicleId);

  // Checkbox interactions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredVehicles.map(v => v.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} vehicles?`)) {
      selectedIds.forEach(id => deleteVehicle(id));
      setSelectedIds([]);
    }
  };

  const handleBulkStartMaintenance = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach(id => {
      const v = vehicles.find(x => x.id === id);
      if (v) {
        updateVehicle({ ...v, status: 'Maintenance', speed: 0 });
      }
    });
    setSelectedIds([]);
    alert(`Status updated to 'Maintenance' for selected vehicles.`);
  };

  // Add Form Submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addForm.id || !addForm.vehicleNumber) {
      alert('Please fill all required fields');
      return;
    }
    if (vehicles.some(v => v.id === addForm.id)) {
      alert('Vehicle ID already exists');
      return;
    }
    const newV = {
      ...addForm,
      battery: Number(addForm.battery),
      speed: Number(addForm.speed),
      year: Number(addForm.year),
      odometer: Number(addForm.odometer),
      tripDistance: 0,
      range: Math.round(addForm.battery * 4.2),
      latitude: 28.6139 + (Math.random() - 0.5) * 0.1,
      longitude: 77.2090 + (Math.random() - 0.5) * 0.1,
      totalTrips: 0,
      totalDistance: Number(addForm.odometer),
      fuelSaved: 0,
      co2Saved: 0,
      insuranceExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastMaintenance: new Date().toISOString().split('T')[0],
    };
    addVehicle(newV);
    setIsAddOpen(false);
    // Reset form
    setAddForm({
      id: '', vehicleNumber: '', model: 'Tata Nexon EV', driver: '',
      status: 'Idle', battery: 80, speed: 0, region: 'Gurgaon',
      color: 'White', year: 2024, odometer: 12000
    });
  };

  // Edit Form Submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editForm.vehicleNumber) {
      alert('Please enter a vehicle number');
      return;
    }
    updateVehicle(editForm);
    setEditVehicle(null);
  };

  // Assign Driver
  const handleAssignDriverSubmit = () => {
    const matchedDriver = drivers.find(d => d.id === selectedDriverId);
    if (!matchedDriver || !assignDriverVehicle) return;
    
    updateVehicle({
      ...assignDriverVehicle,
      driver: matchedDriver.name,
      driverId: matchedDriver.id
    });
    setAssignDriverVehicle(null);
    setSelectedDriverId('');
  };

  // Service Schedule
  const handleScheduleService = () => {
    if (!serviceVehicle) return;
    updateVehicle({
      ...serviceVehicle,
      status: 'Maintenance',
      speed: 0,
      lastMaintenance: new Date().toISOString().split('T')[0],
    });
    setServiceVehicle(null);
    alert(`Service scheduled. Status changed to 'Maintenance' for ${serviceVehicle.id}.`);
  };

  return (
    <div style={{ padding: '24px 28px', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Vehicle Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Monitor, edit, and configure the fleet list ({vehicles.length} total vehicles)
          </p>
        </div>
        <button className="btn-primary" onClick={() => setIsAddOpen(true)}>
          <MdAdd size={18} /> Add Vehicle
        </button>
      </div>

      {/* Filters and Actions Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <MdSearch size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input-field"
            placeholder="Search ID, number or driver..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Status</span>
          <select
            className="input-field"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ width: 130 }}
          >
            <option value="All">All Statuses</option>
            <option value="Running">Running</option>
            <option value="Charging">Charging</option>
            <option value="Idle">Idle</option>
            <option value="Offline">Offline</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        {/* Battery Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Battery</span>
          <select
            className="input-field"
            value={batteryFilter}
            onChange={e => setBatteryFilter(e.target.value)}
            style={{ width: 130 }}
          >
            <option value="All">All Levels</option>
            <option value="High">High (&ge; 80%)</option>
            <option value="Medium">Medium (30% - 80%)</option>
            <option value="Low">Low (&lt; 30%)</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Panel */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card glow-blue"
            style={{
              padding: '12px 20px',
              marginBottom: 20,
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-blue-light)' }}>
              {selectedIds.length} vehicles selected
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={handleBulkStartMaintenance}>
                <MdBuild size={14} /> Maintenance
              </button>
              <button className="btn-danger" style={{ padding: '6px 12px', fontSize: 12 }} onClick={handleBulkDelete}>
                <MdDelete size={14} /> Delete Selected
              </button>
              <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setSelectedIds([])}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vehicles Table Card */}
      <div className="card" style={{ flex: 1, overflowX: 'auto', borderRadius: 16, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40, paddingRight: 0 }}>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={filteredVehicles.length > 0 && selectedIds.length === filteredVehicles.length}
                />
              </th>
              <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                Vehicle ID {sortBy === 'id' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('vehicleNumber')}>
                Number {sortBy === 'vehicleNumber' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('model')}>
                Model {sortBy === 'model' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('driver')}>
                Driver {sortBy === 'driver' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('status')}>
                Status {sortBy === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('battery')}>
                Battery {sortBy === 'battery' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('speed')}>
                Speed {sortBy === 'speed' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th>Location</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map(v => {
              const statusCfg = STATUS_COLORS[v.status] || STATUS_COLORS.Idle;
              const isSelected = selectedIds.includes(v.id);
              return (
                <tr key={v.id} style={{ background: isSelected ? 'rgba(59, 130, 246, 0.04)' : 'transparent' }}>
                  <td style={{ paddingRight: 0 }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectRow(v.id)}
                    />
                  </td>
                  <td
                    onClick={() => setDetailVehicleId(v.id)}
                    style={{ fontWeight: 700, color: 'var(--accent-blue-light)', cursor: 'pointer' }}
                  >
                    {v.id}
                  </td>
                  <td>{v.vehicleNumber}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{v.model}</td>
                  <td>{v.driver || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>}</td>
                  <td>
                    <span
                      style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
                        background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.color}25`
                      }}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 24, height: 12, border: '1px solid var(--border-color)', borderRadius: 3,
                        position: 'relative', background: 'rgba(0,0,0,0.1)'
                      }}>
                        <div style={{
                          width: `${v.battery}%`, height: '100%',
                          background: v.battery > 50 ? '#10b981' : v.battery > 20 ? '#f59e0b' : '#ef4444'
                        }} />
                      </div>
                      <span>{v.battery}%</span>
                    </div>
                  </td>
                  <td>{v.speed} km/h</td>
                  <td style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{v.region}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 8px', borderRadius: 6, fontSize: 11 }}
                        onClick={() => setDetailVehicleId(v.id)}
                        title="View Details"
                      >
                        Details
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 6px', borderRadius: 6, color: 'var(--accent-blue-light)' }}
                        onClick={() => {
                          setEditForm({ ...v });
                          setEditVehicle(v);
                        }}
                        title="Edit"
                      >
                        <MdEdit size={14} />
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 6px', borderRadius: 6 }}
                        onClick={() => {
                          setAssignDriverVehicle(v);
                          setSelectedDriverId(v.driverId || '');
                        }}
                        title="Assign Driver"
                      >
                        <MdAssignmentInd size={14} />
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 6px', borderRadius: 6 }}
                        onClick={() => setServiceVehicle(v)}
                        title="Schedule Maintenance"
                      >
                        <MdBuild size={14} />
                      </button>
                      <button
                        className="btn-danger"
                        style={{ padding: '4px 6px', borderRadius: 6 }}
                        onClick={() => {
                          if (confirm(`Delete vehicle ${v.id}?`)) deleteVehicle(v.id);
                        }}
                        title="Delete"
                      >
                        <MdDelete size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredVehicles.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  No vehicles found matching current search/filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer: Vehicle Details */}
      <AnimatePresence>
        {selectedVehicleObj && (
          <VehicleDetailsDrawer
            vehicle={selectedVehicleObj}
            onClose={() => setDetailVehicleId(null)}
            trips={trips}
            maintenanceLogs={maintenanceLogs}
            drivers={drivers}
          />
        )}
      </AnimatePresence>

      {/* Modal: Add Vehicle */}
      <AnimatePresence>
        {isAddOpen && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card"
              style={{ width: '100%', maxWidth: 540, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Add New Vehicle</h3>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setIsAddOpen(false)}>
                  <MdClose size={20} />
                </button>
              </div>
              <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Vehicle ID *</label>
                    <input className="input-field" placeholder="e.g. EV-1101" required value={addForm.id} onChange={e => setAddForm({...addForm, id: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Vehicle Number *</label>
                    <input className="input-field" placeholder="e.g. DL3C AX 4512" required value={addForm.vehicleNumber} onChange={e => setAddForm({...addForm, vehicleNumber: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Model</label>
                    <select className="input-field" value={addForm.model} onChange={e => setAddForm({...addForm, model: e.target.value})}>
                      <option value="Tata Nexon EV">Tata Nexon EV</option>
                      <option value="MG ZS EV">MG ZS EV</option>
                      <option value="Hyundai Kona">Hyundai Kona</option>
                      <option value="Tata Tigor EV">Tata Tigor EV</option>
                      <option value="BYD Atto 3">BYD Atto 3</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Region</label>
                    <input className="input-field" value={addForm.region} onChange={e => setAddForm({...addForm, region: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Initial Battery %</label>
                    <input className="input-field" type="number" min="0" max="100" value={addForm.battery} onChange={e => setAddForm({...addForm, battery: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Odometer Reading (km)</label>
                    <input className="input-field" type="number" min="0" value={addForm.odometer} onChange={e => setAddForm({...addForm, odometer: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Manufacturing Year</label>
                    <input className="input-field" type="number" min="2018" max="2026" value={addForm.year} onChange={e => setAddForm({...addForm, year: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Color</label>
                    <input className="input-field" value={addForm.color} onChange={e => setAddForm({...addForm, color: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                  <button type="button" className="btn-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary"><MdCheckCircle size={16} /> Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Edit Vehicle */}
      <AnimatePresence>
        {editVehicle && editForm && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card"
              style={{ width: '100%', maxWidth: 540, padding: 24 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Edit Vehicle: {editVehicle.id}</h3>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setEditVehicle(null)}>
                  <MdClose size={20} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Vehicle Number</label>
                  <input className="input-field" required value={editForm.vehicleNumber} onChange={e => setEditForm({...editForm, vehicleNumber: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Model</label>
                  <select className="input-field" value={editForm.model} onChange={e => setEditForm({...editForm, model: e.target.value})}>
                    <option value="Tata Nexon EV">Tata Nexon EV</option>
                    <option value="MG ZS EV">MG ZS EV</option>
                    <option value="Hyundai Kona">Hyundai Kona</option>
                    <option value="Tata Tigor EV">Tata Tigor EV</option>
                    <option value="BYD Atto 3">BYD Atto 3</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Region</label>
                    <input className="input-field" value={editForm.region} onChange={e => setEditForm({...editForm, region: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Status</label>
                    <select className="input-field" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                      <option value="Running">Running</option>
                      <option value="Charging">Charging</option>
                      <option value="Idle">Idle</option>
                      <option value="Offline">Offline</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                  <button type="button" className="btn-secondary" onClick={() => setEditVehicle(null)}>Cancel</button>
                  <button type="submit" className="btn-primary"><MdSave size={16} /> Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Assign Driver */}
      <AnimatePresence>
        {assignDriverVehicle && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card"
              style={{ width: '100%', maxWidth: 400, padding: 24 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Assign Driver: {assignDriverVehicle.id}</h3>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setAssignDriverVehicle(null)}>
                  <MdClose size={20} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Select Driver</label>
                  <select
                    className="input-field"
                    value={selectedDriverId}
                    onChange={e => setSelectedDriverId(e.target.value)}
                  >
                    <option value="">-- Choose Driver --</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                  <button className="btn-secondary" onClick={() => setAssignDriverVehicle(null)}>Cancel</button>
                  <button className="btn-primary" onClick={handleAssignDriverSubmit}>Assign</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Maintenance Confirmation */}
      <AnimatePresence>
        {serviceVehicle && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card"
              style={{ width: '100%', maxWidth: 400, padding: 24 }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Schedule Service: {serviceVehicle.id}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                This will update the vehicle's status to <strong>Maintenance</strong>, reset its speed to 0, and record today's date as its last service event. Do you want to proceed?
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="btn-secondary" onClick={() => setServiceVehicle(null)}>Cancel</button>
                <button className="btn-primary" onClick={handleScheduleService}>Schedule Now</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Subcomponent: Vehicle Details Drawer
function VehicleDetailsDrawer({ vehicle, onClose, trips, maintenanceLogs, drivers }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Filter logs for this vehicle
  const vehicleTrips = useMemo(() => {
    return trips.filter(t => t.vehicleId === vehicle.id).slice(0, 10);
  }, [trips, vehicle.id]);

  const vehicleLogs = useMemo(() => {
    return maintenanceLogs.filter(m => m.vehicleId === vehicle.id);
  }, [maintenanceLogs, vehicle.id]);

  const assignedDriver = useMemo(() => {
    return drivers.find(d => d.id === vehicle.driverId);
  }, [drivers, vehicle.driverId]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.4)' }}
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: 460, zIndex: 1000,
          background: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.3)',
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border-color)',
          background: `linear-gradient(135deg, ${STATUS_COLORS[vehicle.status]?.color}12, transparent)`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{vehicle.id}</h3>
              <span
                style={{
                  fontSize: 10, padding: '1px 6px', borderRadius: 10, fontWeight: 700,
                  background: STATUS_COLORS[vehicle.status]?.bg, color: STATUS_COLORS[vehicle.status]?.color
                }}
              >
                {vehicle.status}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{vehicle.vehicleNumber}</div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--glass-bg)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* Top summary row */}
        <div style={{ padding: '18px 24px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Battery</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: vehicle.battery > 50 ? '#10b981' : vehicle.battery > 20 ? '#f59e0b' : '#ef4444', marginTop: 2 }}>
              {vehicle.battery}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Speed</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{vehicle.speed} <span style={{ fontSize: 10 }}>km/h</span></div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Range</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#60a5fa', marginTop: 2 }}>{vehicle.range} <span style={{ fontSize: 10 }}>km</span></div>
          </div>
        </div>

        {/* Tab Headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', overflowX: 'auto', background: 'var(--bg-card)' }}>
          {['overview', 'trips', 'maintenance', 'battery', 'driver', 'documents'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: '1 0 auto', padding: '12px 14px', border: 'none', background: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                color: activeTab === tab ? 'var(--accent-blue-light)' : 'var(--text-muted)',
                borderBottom: activeTab === tab ? '2px solid var(--accent-blue)' : '2px solid transparent',
                textTransform: 'capitalize', whiteSpace: 'nowrap'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Drawer Body Scroll */}
        <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* TAB: Overview */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
                  <MdDirectionsCar size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{vehicle.model}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>EV Powertrain</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
                {[
                  { label: 'Year', value: vehicle.year },
                  { label: 'Color', value: vehicle.color },
                  { label: 'Odometer', value: `${vehicle.odometer?.toLocaleString()} km` },
                  { label: 'Region', value: vehicle.region },
                  { label: 'Total Trips', value: vehicle.totalTrips },
                  { label: 'Total Distance', value: `${vehicle.totalDistance?.toLocaleString()} km` },
                  { label: 'CO₂ Saved', value: `${vehicle.co2Saved} kg` },
                  { label: 'Last Maintenance', value: vehicle.lastMaintenance },
                ].map(item => (
                  <div key={item.label} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Trips */}
          {activeTab === 'trips' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h4 style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Recent Trips</h4>
              {vehicleTrips.map(t => (
                <div key={t.id} style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{t.id}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: t.status === 'Completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: t.status === 'Completed' ? '#10b981' : '#f59e0b' }}>
                      {t.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {t.origin} &rarr; {t.destination}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginTop: 8 }}>
                    <span>{t.distance} km</span>
                    <span>{t.duration} mins</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.fare}</span>
                  </div>
                </div>
              ))}
              {vehicleTrips.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 12 }}>No recent trips recorded.</div>
              )}
            </div>
          )}

          {/* TAB: Maintenance */}
          {activeTab === 'maintenance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h4 style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Logs & Services</h4>
              {vehicleLogs.map(log => (
                <div key={log.id} style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 10, borderLeft: '3px solid var(--accent-blue)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
                    <span>{log.serviceType}</span>
                    <span style={{ color: 'var(--accent-blue-light)' }}>₹{log.cost?.toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Date: {log.date} · Tech: {log.technician}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>
                    "{log.notes}"
                  </div>
                </div>
              ))}
              {vehicleLogs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 12 }}>No maintenance logs found.</div>
              )}
            </div>
          )}

          {/* TAB: Battery */}
          {activeTab === 'battery' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <MdBatteryAlert size={48} color={vehicle.battery > 50 ? '#10b981' : '#f59e0b'} />
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>{vehicle.battery}%</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>State of Charge (SoC)</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Battery Temp', value: `${vehicle.temperature || 34}°C` },
                  { label: 'Health Rate (SoH)', value: '96.4% (Excellent)' },
                  { label: 'Voltage Output', value: '380 V' },
                  { label: 'Estimated Charge Time', value: vehicle.status === 'Charging' ? '45 mins remaining' : 'N/A' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: 12.5 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Driver */}
          {activeTab === 'driver' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {assignedDriver ? (
                <>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 700, color: 'white'
                    }}>
                      {assignedDriver.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{assignedDriver.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{assignedDriver.id}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                    {[
                      { label: 'Rating', value: `★ ${assignedDriver.rating}` },
                      { label: 'Experience', value: `${assignedDriver.experience} years` },
                      { label: 'Contact', value: assignedDriver.phone },
                      { label: 'License Number', value: assignedDriver.license },
                      { label: 'Safety Score', value: `${assignedDriver.safetyScore}%` },
                      { label: 'Efficiency Score', value: `${assignedDriver.efficiency} km/kWh` },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: 12.5 }}>
                        <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                        <span style={{ fontWeight: 600 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <MdPerson size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No driver currently assigned.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: Documents */}
          {activeTab === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h4 style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Vehicle Papers</h4>
              
              {[
                { name: 'Insurance Certificate', status: 'Valid', expiry: vehicle.insuranceExpiry },
                { name: 'PUC Certificate', status: 'Valid', expiry: '2026-11-20' },
                { name: 'Vehicle Registration (RC)', status: 'Valid', expiry: '2036-05-10' },
              ].map(doc => (
                <div key={doc.name} style={{ padding: 14, background: 'var(--bg-secondary)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700 }}>{doc.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Expires: {doc.expiry}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 600 }}>
                    {doc.status}
                  </span>
                </div>
              ))}

              <div style={{ border: '2px dashed var(--border-color)', borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', marginTop: 10 }} onClick={() => alert('Mock: Opening document uploader...')}>
                <MdCloudUpload size={24} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: 12, fontWeight: 600 }}>Upload New Document</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>PDF or JPG up to 10MB</div>
              </div>
            </div>
          )}

        </div>

      </motion.div>
    </>
  );
}
