// Imports here
import { buildCrudRouter } from './crud.routes.js';
import authRoutes from './operations/auth.routes.js';
import clientRoutes from './operations/client.routes.js';
import documentRoutes from './operations/document.routes.js';
import reminderRoutes from './operations/reminder.routes.js';
import supplierRoutes from './operations/supplier.routes.js';
import productRoutes from './operations/product.routes.js';
import orderRoutes from './operations/order.routes.js';
import purchaseRoutes from './operations/purchase.routes.js';

export const mountRoutes = (app) => {
  // =========================< Operations Routes >=========================>

  app.use('/api/v1/auth', authRoutes);

  app.use('/api/v1/client', clientRoutes);

  app.use('/api/v1/supplier', supplierRoutes);

  app.use('/api/v1/product', productRoutes);

  app.use('/api/v1/order', orderRoutes);

  app.use('/api/v1/purchase', purchaseRoutes);

  app.use('/api/v1/document', documentRoutes);

  app.use('/api/v1/reminder', reminderRoutes);

  app.use(
    '/api/v1/recurrences',
    buildCrudRouter('recurrence', 'Recurrence', ['recurrenceType'])
  );

  app.use('/api/v1/units', buildCrudRouter('unit', 'Unit', ['unitType']));

  app.use(
    '/api/v1/order-types',
    buildCrudRouter('orderType', 'Order Type', ['orderType'])
  );

  app.use(
    '/api/v1/services',
    buildCrudRouter('service', 'Service', ['serviceType'])
  );

  app.use('/api/v1/pickups', buildCrudRouter('pickup', 'Pickup', ['pickup']));

  app.use('/api/v1/entities', buildCrudRouter('entity', 'Entity', ['name']));

  app.use('/api/v1/departments', buildCrudRouter('department', 'Department', ['name']));
};
