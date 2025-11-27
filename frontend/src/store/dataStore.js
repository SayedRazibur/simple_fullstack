import { create } from 'zustand';

// Mock data for demonstration purposes
const mockData = {
  products: [
    {
      id: 1,
      name: 'Product 1',
      productType: 'Type A',
      department: 'Dept 1',
      PLU: '12345',
      quantities: [10, 5],
      units: [1, 2],
      DLCs: ['2023-12-01'],
      suppliers: [1, 2],
      deliveryTemps: ['Cold'],
      criticalQuantity: 3,
      restock: true,
    },
    {
      id: 2,
      name: 'Product 2',
      productType: 'Type B',
      department: 'Dept 2',
      PLU: '67890',
      quantities: [20, 15],
      units: [1, 3],
      DLCs: ['2023-11-15'],
      suppliers: [2, 3],
      deliveryTemps: ['Room Temp'],
      criticalQuantity: 5,
      restock: false,
    },
  ],
  clients: [
    {
      id: 1,
      firstName: 'John',
      surname: 'Doe',
      address: '123 Main St',
      email: 'john@example.com',
      phone: '555-1234',
    },
    {
      id: 2,
      firstName: 'Jane',
      surname: 'Smith',
      address: '456 Oak Ave',
      email: 'jane@example.com',
      phone: '555-5678',
    },
  ],
  suppliers: [
    {
      id: 1,
      name: 'Supplier A',
      email: 'supplierA@example.com',
      phone: '555-2468',
      clientNumber: 'SA001',
      day: 'Monday',
      pickupId: 1,
      contactMethod: 'Email',
      purchaseIds: [1, 3],
      recurrenceId: 1,
    },
    {
      id: 2,
      name: 'Supplier B',
      email: 'supplierB@example.com',
      phone: '555-1357',
      clientNumber: 'SB002',
      day: 'Wednesday',
      pickupId: 2,
      contactMethod: 'Phone',
      purchaseIds: [2],
      recurrenceId: 2,
    },
  ],
  tasks: [
    {
      id: 1,
      title: 'Task 1',
      productId: 1,
      date: '2023-10-15',
      hour: '09:00',
      quantity: 5,
      unitId: 1,
      includingOrder: true,
      entityId: 1,
      recurrenceId: 1,
      recipeId: null,
      comment: 'Important task',
      color: '#A9A8E5',
    },
    {
      id: 2,
      title: 'Task 2',
      productId: 2,
      date: '2023-10-16',
      hour: '14:00',
      quantity: 10,
      unitId: 2,
      includingOrder: false,
      entityId: 2,
      recurrenceId: null,
      recipeId: null,
      comment: 'Regular task',
      color: '#A9A8E5',
    },
  ],
  orders: [
    {
      id: 1,
      orderNumber: 'ORD001',
      clientId: 1,
      date: '2023-10-20',
      hour: '10:00',
      products: [1, 2],
      quantities: [2, 3],
      units: [1, 2],
      orderTypeId: 1,
      serviceId: 1,
      pickupId: 1,
      comment: 'Urgent order',
      bill: 150.75,
      color: '#1967D2',
    },
    {
      id: 2,
      orderNumber: 'ORD002',
      clientId: 2,
      date: '2023-10-22',
      hour: '15:30',
      products: [2],
      quantities: [5],
      units: [2],
      orderTypeId: 2,
      serviceId: 2,
      pickupId: 2,
      comment: 'Standard delivery',
      bill: 75.5,
      color: '#1967D2',
    },
  ],
  reminders: [
    {
      id: 1,
      title: 'Reminder 1',
      comment: 'Call client',
      date: '2023-10-18',
      hour: '11:00',
      entityId: 1,
      color: '#FF685B',
    },
    {
      id: 2,
      title: 'Reminder 2',
      comment: 'Check inventory',
      date: '2023-10-19',
      hour: '13:00',
      entityId: 2,
      color: '#FF685B',
    },
  ],
  sites: [
    { id: 1, siteName: 'Site A', day: 'Tuesday', supervisor: 'Alex Johnson' },
    { id: 2, siteName: 'Site B', day: 'Thursday', supervisor: 'Maria Garcia' },
  ],
  refills: [
    {
      id: 1,
      siteId: 1,
      products: [1, 2],
      quantities: [3, 4],
      units: [1, 2],
      color: '#C79C26',
    },
    {
      id: 2,
      siteId: 2,
      products: [2],
      quantities: [5],
      units: [2],
      color: '#C79C26',
    },
  ],
  purchases: [
    {
      id: 1,
      date: '2023-10-10',
      productId: 1,
      quantity: 10,
      unit: 1,
      supplierId: 1,
      color: '#4AACFC',
    },
    {
      id: 2,
      date: '2023-10-12',
      productId: 2,
      quantity: 15,
      unit: 2,
      supplierId: 2,
      color: '#4AACFC',
    },
  ],
  documents: [
    {
      id: 1,
      title: 'Invoice #123',
      importedOn: '2023-09-15',
      sentToClient: true,
      color: '#3E03A3',
    },
    {
      id: 2,
      title: 'Contract #456',
      importedOn: '2023-09-20',
      sentToClient: false,
      color: '#3E03A3',
    },
  ],
  // Reference tables
  entities: [
    { id: 1, name: 'Entity A' },
    { id: 2, name: 'Entity B' },
  ],
  recurrences: [
    { id: 1, recurrenceType: 'Daily' },
    { id: 2, recurrenceType: 'Weekly' },
    { id: 3, recurrenceType: 'Monthly' },
  ],
  units: [
    { id: 1, unitType: 'kg' },
    { id: 2, unitType: 'liter' },
    { id: 3, unitType: 'piece' },
  ],
  orderTypes: [
    { id: 1, orderType: 'Standard' },
    { id: 2, orderType: 'Express' },
  ],
  services: [
    { id: 1, serviceType: 'Delivery' },
    { id: 2, serviceType: 'Pickup' },
  ],
  pickups: [
    { id: 1, pickUpType: 'In-store' },
    { id: 2, pickUpType: 'Curbside' },
  ],
};

export const useDataStore = create((set, get) => ({
  // Data collections
  products: mockData.products,
  clients: mockData.clients,
  suppliers: mockData.suppliers,
  tasks: mockData.tasks,
  orders: mockData.orders,
  reminders: mockData.reminders,
  sites: mockData.sites,
  refills: mockData.refills,
  purchases: mockData.purchases,
  documents: mockData.documents,

  // Reference data
  entities: mockData.entities,
  recurrences: mockData.recurrences,
  units: mockData.units,
  orderTypes: mockData.orderTypes,
  services: mockData.services,
  pickups: mockData.pickups,

  // CRUD operations for products
  addProduct: (product) =>
    set((state) => ({
      products: [
        ...state.products,
        { ...product, id: Math.max(0, ...state.products.map((p) => p.id)) + 1 },
      ],
    })),
  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  // CRUD operations for tasks
  addTask: (task) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          ...task,
          id: Math.max(0, ...state.tasks.map((t) => t.id)) + 1,
          color: '#A9A8E5',
        },
      ],
    })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  // CRUD operations for orders
  addOrder: (order) =>
    set((state) => ({
      orders: [
        ...state.orders,
        {
          ...order,
          id: Math.max(0, ...state.orders.map((o) => o.id)) + 1,
          color: '#1967D2',
        },
      ],
    })),
  updateOrder: (id, updates) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    })),
  deleteOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    })),

  // CRUD operations for reminders
  addReminder: (reminder) =>
    set((state) => ({
      reminders: [
        ...state.reminders,
        {
          ...reminder,
          id: Math.max(0, ...state.reminders.map((r) => r.id)) + 1,
          color: '#FF685B',
        },
      ],
    })),
  updateReminder: (id, updates) =>
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),
  deleteReminder: (id) =>
    set((state) => ({
      reminders: state.reminders.filter((r) => r.id !== id),
    })),

  // CRUD operations for suppliers
  addSupplier: (supplier) =>
    set((state) => ({
      suppliers: [
        ...state.suppliers,
        {
          ...supplier,
          id: Math.max(0, ...state.suppliers.map((s) => s.id)) + 1,
        },
      ],
    })),
  updateSupplier: (id, updates) =>
    set((state) => ({
      suppliers: state.suppliers.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),
  deleteSupplier: (id) =>
    set((state) => ({
      suppliers: state.suppliers.filter((s) => s.id !== id),
    })),

  // CRUD operations for sites
  addSite: (site) =>
    set((state) => ({
      sites: [
        ...state.sites,
        { ...site, id: Math.max(0, ...state.sites.map((s) => s.id)) + 1 },
      ],
    })),
  updateSite: (id, updates) =>
    set((state) => ({
      sites: state.sites.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  deleteSite: (id) =>
    set((state) => ({
      sites: state.sites.filter((s) => s.id !== id),
    })),

  // CRUD operations for refills
  addRefill: (refill) =>
    set((state) => ({
      refills: [
        ...state.refills,
        {
          ...refill,
          id: Math.max(0, ...state.refills.map((r) => r.id)) + 1,
          color: '#C79C26',
        },
      ],
    })),
  updateRefill: (id, updates) =>
    set((state) => ({
      refills: state.refills.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),
  deleteRefill: (id) =>
    set((state) => ({
      refills: state.refills.filter((r) => r.id !== id),
    })),

  // CRUD operations for purchases
  addPurchase: (purchase) =>
    set((state) => ({
      purchases: [
        ...state.purchases,
        {
          ...purchase,
          id: Math.max(0, ...state.purchases.map((p) => p.id)) + 1,
          color: '#4AACFC',
        },
      ],
    })),
  updatePurchase: (id, updates) =>
    set((state) => ({
      purchases: state.purchases.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  deletePurchase: (id) =>
    set((state) => ({
      purchases: state.purchases.filter((p) => p.id !== id),
    })),

  // CRUD operations for documents
  addDocument: (document) =>
    set((state) => ({
      documents: [
        ...state.documents,
        {
          ...document,
          id: Math.max(0, ...state.documents.map((d) => d.id)) + 1,
          color: '#3E03A3',
        },
      ],
    })),
  updateDocument: (id, updates) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),
  deleteDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
    })),

  // Helper functions
  getProductById: (id) => get().products.find((p) => p.id === id),
  getClientById: (id) => get().clients.find((c) => c.id === id),
  getSupplierById: (id) => get().suppliers.find((s) => s.id === id),
  getUnitById: (id) => get().units.find((u) => u.id === id),
  // CRUD operations for clients
  addClient: (client) =>
    set((state) => ({
      clients: [
        ...state.clients,
        { ...client, id: Math.max(0, ...state.clients.map((c) => c.id)) + 1 },
      ],
    })),
  updateClient: (id, updates) =>
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
  deleteClient: (id) =>
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
    })),
}));
