// ─── Mock Data Generators for KADAM mobility ───
// Generates 100 realistic vehicles with Indian EV fleet data

const INDIAN_NAMES = [
  'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sunita Singh', 'Vijay Mehta',
  'Deepa Nair', 'Arjun Gupta', 'Kavya Reddy', 'Suresh Yadav', 'Anita Joshi',
  'Ravi Verma', 'Pooja Iyer', 'Manoj Tiwari', 'Sneha Agarwal', 'Ashok Mishra',
  'Divya Chaudhary', 'Rajesh Pandey', 'Nisha Kapoor', 'Sanjay Bose', 'Rekha Pillai',
  'Vikram Sinha', 'Lata Malhotra', 'Mohit Saxena', 'Geeta Rao', 'Arun Kulkarni',
  'Meena Sharma', 'Sunil Jain', 'Poonam Gupta', 'Nitin Tyagi', 'Shweta Dubey',
  'Karan Bhat', 'Anjali Nanda', 'Rohit Chauhan', 'Preeti Srivastava', 'Gaurav Patil',
];

const VEHICLE_MODELS = [
  'Tata Nexon EV', 'MG ZS EV', 'Hyundai Kona', 'Tata Tigor EV', 'Ola S1 Pro',
  'Ather 450X', 'Mahindra XUV400', 'Kia EV6', 'BMW iX', 'Volvo XC40 Recharge',
  'Tata Punch EV', 'MG Comet', 'BYD Atto 3', 'Hyundai IONIQ 5', 'Audi e-tron',
];

const STATUSES = ['Running', 'Charging', 'Idle', 'Offline', 'Maintenance'];
const STATUS_WEIGHTS = [0.4, 0.2, 0.2, 0.1, 0.1];

// Delhi NCR coordinates cluster
const BASE_LAT = 28.6139;
const BASE_LNG = 77.2090;

const REGIONS = [
  'Connaught Place', 'Dwarka', 'Noida Sector 18', 'Gurgaon', 'Faridabad',
  'Rohini', 'Janakpuri', 'Lajpat Nagar', 'Saket', 'Vasant Kunj',
  'Greater Noida', 'Indirapuram', 'Pitampura', 'Karol Bagh', 'Nehru Place',
];

const CHARGING_STATION_NAMES = [
  'Connaught Place EV Hub', 'Cyber City FastCharge', 'Noida Sector 62 Station',
  'DLF Phase 2 Charger', 'IGI Airport Terminal', 'South Ex Mall Charger',
  'Dwarka Sec-10 Hub', 'Rohini EV Point', 'Saket Select City', 'Noida Film City',
  'Gurgaon Cyberhub', 'Faridabad NIT Market', 'Lajpat Nagar Metro', 'Pitampura Metro',
  'Greater Noida Alpha', 'Indirapuram Shipra', 'Karol Bagh Market', 'Nehru Place IT',
  'Janakpuri WestGate', 'Vasant Kunj Mall', 'Okhla Industrial', 'Mayur Vihar Hub',
  'Rajouri Garden Stn', 'Karkardooma Court', 'Sahibabad Industrial',
];

function weightedRandom(items, weights) {
  const r = Math.random();
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (r < sum) return items[i];
  }
  return items[items.length - 1];
}

function randBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randInt(min, max) {
  return Math.floor(randBetween(min, max + 1));
}

function randElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

// ─── Vehicles ───
export function generateVehicles() {
  return Array.from({ length: 100 }, (_, i) => {
    const id = i + 1;
    const status = weightedRandom(STATUSES, STATUS_WEIGHTS);
    const battery = status === 'Charging'
      ? randInt(10, 60)
      : status === 'Offline'
        ? randInt(5, 80)
        : randInt(20, 100);
    const speed = status === 'Running' ? randInt(15, 85) : 0;
    const driverIdx = Math.floor(Math.random() * DRIVERS_RAW.length);

    return {
      id: `EV-${1000 + id}`,
      vehicleNumber: `DL${randInt(1,9)}${String.fromCharCode(65+randInt(0,25))}${String.fromCharCode(65+randInt(0,25))} ${randInt(1000,9999)}`,
      model: randElement(VEHICLE_MODELS),
      driver: DRIVERS_RAW[driverIdx].name,
      driverId: DRIVERS_RAW[driverIdx].id,
      status,
      battery,
      speed,
      latitude: BASE_LAT + randBetween(-0.25, 0.25),
      longitude: BASE_LNG + randBetween(-0.3, 0.3),
      temperature: randInt(28, 42),
      tripDistance: status === 'Running' ? randInt(5, 180) : randInt(0, 50),
      range: Math.round(battery * 4.2),
      lastMaintenance: generateDateStr(randInt(1, 120)),
      insuranceExpiry: generateDateStr(-randInt(30, 365)),
      region: randElement(REGIONS),
      totalTrips: randInt(50, 800),
      totalDistance: randInt(5000, 80000),
      fuelSaved: randInt(200, 4000),
      co2Saved: randInt(500, 10000),
      year: randInt(2021, 2024),
      color: randElement(['White', 'Black', 'Silver', 'Blue', 'Grey', 'Red']),
      odometer: randInt(5000, 150000),
      currentTrip: status === 'Running' ? `TRIP-${randInt(10000, 99999)}` : null,
      destination: status === 'Running' ? randElement(REGIONS) : null,
      eta: status === 'Running' ? `${randInt(5, 60)} min` : null,
      waypoints: generateWaypoints(BASE_LAT + randBetween(-0.25, 0.25), BASE_LNG + randBetween(-0.3, 0.3)),
    };
  });
}

function generateWaypoints(lat, lng) {
  return Array.from({ length: randInt(3, 8) }, (_, i) => ({
    lat: lat + (i * 0.005) + randBetween(-0.003, 0.003),
    lng: lng + (i * 0.005) + randBetween(-0.003, 0.003),
  }));
}

// ─── Drivers ───
const DRIVERS_RAW = INDIAN_NAMES.map((name, i) => ({
  id: `DRV-${100 + i + 1}`,
  name,
  phone: `+91 ${randInt(70000,99999)}${randInt(10000,99999)}`,
  email: `${name.toLowerCase().replace(' ', '.')}@fleet.in`,
  experience: randInt(1, 12),
  rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
  safetyScore: randInt(70, 100),
  trips: randInt(100, 1500),
  efficiency: parseFloat((3.5 + Math.random() * 4).toFixed(1)),
  license: `DL${randInt(10,99)}-${randInt(2010,2022)}-${randInt(1000000,9999999)}`,
  licenseExpiry: generateDateStr(-randInt(30, 730)),
  status: Math.random() > 0.2 ? 'Active' : 'Inactive',
  joinedDate: generateDateStr(randInt(180, 2000)),
  totalDistance: randInt(10000, 200000),
  avgSpeed: randInt(28, 52),
}));

export function generateDrivers() {
  return DRIVERS_RAW;
}

// ─── Trips ───
const TRIP_ORIGINS = REGIONS;
const TRIP_DESTINATIONS = [...REGIONS].reverse();

export function generateTrips(count = 800) {
  const vehicles = Array.from({ length: 100 }, (_, i) => `EV-${1001 + i}`);
  return Array.from({ length: count }, (_, i) => {
    const dist = randInt(5, 80);
    const duration = Math.round(dist * 1.8 + randInt(-10, 20));
    const fare = Math.round(dist * 12 + randInt(-20, 60));
    const daysAgo = randInt(0, 365);
    const hour = randInt(5, 23);
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - daysAgo);
    startTime.setHours(hour, randInt(0,59), 0);
    const endTime = new Date(startTime.getTime() + duration * 60000);
    const statusOptions = ['Completed', 'In Progress', 'Cancelled', 'Delayed'];
    const statusWeights = [0.65, 0.15, 0.1, 0.1];

    return {
      id: `TRIP-${10000 + i + 1}`,
      vehicleId: randElement(vehicles),
      driver: randElement(INDIAN_NAMES),
      origin: randElement(TRIP_ORIGINS),
      destination: randElement(TRIP_DESTINATIONS),
      distance: dist,
      duration,
      fare,
      status: weightedRandom(statusOptions, statusWeights),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      batteryUsed: randInt(5, 30),
      rating: parseFloat((3 + Math.random() * 2).toFixed(1)),
      passengers: randInt(1, 4),
      co2Saved: parseFloat((dist * 0.12).toFixed(2)),
    };
  });
}

// ─── Alerts ───
const ALERT_TYPES = [
  { type: 'Battery Low', severity: 'critical', icon: 'battery' },
  { type: 'Overspeed', severity: 'warning', icon: 'speed' },
  { type: 'Vehicle Offline', severity: 'critical', icon: 'offline' },
  { type: 'Maintenance Due', severity: 'warning', icon: 'maintenance' },
  { type: 'GPS Lost', severity: 'warning', icon: 'gps' },
  { type: 'Driver SOS', severity: 'critical', icon: 'sos' },
  { type: 'Geofence Breach', severity: 'warning', icon: 'geofence' },
  { type: 'Charging Complete', severity: 'info', icon: 'charging' },
  { type: 'Trip Started', severity: 'info', icon: 'trip' },
  { type: 'Harsh Braking', severity: 'warning', icon: 'braking' },
  { type: 'Temperature High', severity: 'warning', icon: 'temp' },
  { type: 'Insurance Expiry', severity: 'info', icon: 'insurance' },
];

export function generateAlerts(count = 1000) {
  const vehicles = Array.from({ length: 100 }, (_, i) => `EV-${1001 + i}`);
  return Array.from({ length: count }, (_, i) => {
    const alertType = randElement(ALERT_TYPES);
    const minsAgo = randInt(0, 43200);
    const ts = new Date(Date.now() - minsAgo * 60000);
    return {
      id: `ALT-${i + 1}`,
      ...alertType,
      vehicleId: randElement(vehicles),
      driver: randElement(INDIAN_NAMES),
      timestamp: ts.toISOString(),
      read: Math.random() > 0.4,
      location: randElement(REGIONS),
      details: generateAlertDetails(alertType.type),
    };
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function generateAlertDetails(type) {
  const map = {
    'Battery Low': `Battery dropped to ${randInt(5,20)}%`,
    'Overspeed': `Speed recorded at ${randInt(85,130)} km/h`,
    'Vehicle Offline': 'Vehicle lost connectivity',
    'Maintenance Due': `Service overdue by ${randInt(1,45)} days`,
    'GPS Lost': 'GPS signal not found',
    'Driver SOS': 'Emergency alert triggered by driver',
    'Geofence Breach': `Exited ${randElement(REGIONS)} zone`,
    'Charging Complete': `Charged to ${randInt(85,100)}%`,
    'Trip Started': `Heading to ${randElement(REGIONS)}`,
    'Harsh Braking': `Deceleration: ${randInt(8,15)} m/s²`,
    'Temperature High': `Battery temp: ${randInt(45,65)}°C`,
    'Insurance Expiry': `Expires in ${randInt(1,30)} days`,
  };
  return map[type] || 'Alert triggered';
}

// ─── Charging Stations ───
export function generateChargingStations() {
  return CHARGING_STATION_NAMES.map((name, i) => ({
    id: `CS-${100 + i + 1}`,
    name,
    latitude: BASE_LAT + randBetween(-0.28, 0.28),
    longitude: BASE_LNG + randBetween(-0.32, 0.32),
    totalSlots: randInt(4, 16),
    occupiedSlots: randInt(0, 8),
    fastChargers: randInt(2, 6),
    normalChargers: randInt(2, 10),
    avgWaitTime: randInt(5, 45),
    powerOutput: randElement([22, 50, 150, 350]),
    status: Math.random() > 0.1 ? 'Operational' : 'Maintenance',
    region: randElement(REGIONS),
    price: parseFloat((randBetween(8, 18)).toFixed(1)),
    operator: randElement(['Tata Power EV', 'Charge Zone', 'Ather Grid', 'BSES Rajdhani', 'PVVNL']),
    rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
  }));
}

// ─── Maintenance Logs ───
export function generateMaintenanceLogs(count = 500) {
  const vehicles = Array.from({ length: 100 }, (_, i) => `EV-${1001 + i}`);
  const serviceTypes = ['Oil Change', 'Tire Rotation', 'Battery Check', 'Brake Service', 'Software Update', 'Annual Service', 'AC Service', 'Suspension Check'];
  return Array.from({ length: count }, (_, i) => ({
    id: `MNT-${i + 1}`,
    vehicleId: randElement(vehicles),
    serviceType: randElement(serviceTypes),
    date: generateDateStr(randInt(0, 365)),
    cost: randInt(500, 15000),
    technician: randElement(INDIAN_NAMES),
    notes: 'Routine maintenance completed without issues.',
    nextServiceDate: generateDateStr(-randInt(30, 180)),
    status: randElement(['Completed', 'Pending', 'In Progress']),
    odometer: randInt(5000, 150000),
  }));
}

// ─── Analytics Data ───
export function generateDailyStats(days = 30) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - i - 1));
    return {
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      trips: randInt(120, 380),
      distance: randInt(3000, 9000),
      revenue: randInt(80000, 250000),
      avgSpeed: randInt(28, 52),
      energy: randInt(800, 2500),
      activeVehicles: randInt(60, 95),
    };
  });
}

export function generateSparkline(points = 7) {
  const base = randInt(40, 80);
  return Array.from({ length: points }, () => randInt(base - 15, base + 15));
}
