import { createRouter } from '@innoagency-arenda/server';

import * as authMiddleware from 'app/auth/middleware';
import * as profileController from './profile/controller';
import * as objectsController from './objects/controller';
import * as objectsCalendarController from './objects/calendar/controller';
import * as servicesController from './services/controller';
import * as bookingsController from './bookings/controller';
import * as notificationsController from './notifications/controller';

const router = createRouter();

// Профиль
router.get('/', profileController.index);
router.put('/', profileController.update);
router.post('/reset-password', profileController.resetPassword);

// Объекты
router.get('/objects', authMiddleware.hasRole('owner'), objectsController.index);
router.post('/objects', authMiddleware.hasRole('owner'), objectsController.create);
router.get('/objects/:id', authMiddleware.hasRole('owner'), objectsController.show);
router.put('/objects/:id', authMiddleware.hasRole('owner'), objectsController.update);
router.put('/objects/:id/publish', authMiddleware.hasRole('owner'), objectsController.publish);

router.delete('/objects/:id', authMiddleware.hasRole('owner'), objectsController.destroy);
router.get('/objects/:id/calendar', authMiddleware.hasRole('owner'), objectsCalendarController.index);
router.post('/objects/:id/calendar', authMiddleware.hasRole('owner'), objectsCalendarController.create);
router.put('/objects/:id/calendar/:calendar_id', authMiddleware.hasRole('owner'), objectsCalendarController.update);
router.delete('/objects/:id/calendar/:calendar_id', authMiddleware.hasRole('owner'), objectsCalendarController.destroy);

// Сервисы
router.get('/services', authMiddleware.hasRole('owner'), servicesController.index);
router.post('/services', authMiddleware.hasRole('owner'), servicesController.create);
router.get('/services/:id', authMiddleware.hasRole('owner'), servicesController.show);
router.put('/services/:id', authMiddleware.hasRole('owner'), servicesController.update);
router.delete('/services/:id', authMiddleware.hasRole('owner'), servicesController.destroy);

// Бронирования
router.get('/bookings', authMiddleware.hasPermission('bookings.read'), bookingsController.index);
router.get('/bookings/:id', authMiddleware.hasPermission('bookings.read'), bookingsController.show);

// Уведомления
router.get('/notifications', notificationsController.index);
router.post('/notifications/mark-as-readed', notificationsController.markAsReaded);

export default router;
