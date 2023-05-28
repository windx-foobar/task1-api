import { createRouter } from '@innoagency-arenda/server';

import { item, list, ok } from './controller';

const router = createRouter();

router.get('/info', item); // данные с токеном и краткий профиль
//
// Все что относится к профилю
//
// router.get('/me', item); // [*] полный профиль
// router.put('/me', item); // [*] обновить профиль
// router.post('/me/reset-password', ok); // [*] сменить пароль

// + router.get('/me/objects', list); // [арендодатель] размещенные объекты и их зоны
// + router.post('/me/objects', ok); // [арендодатель] добавить объект
// + router.get('/me/objects/:id', item); // [арендодатель] получить карточку
// + router.put('/me/objects/:id', item); // [арендодатель] обновить карточку
// router.delete('/me/objects/:id', ok); // [арендодатель] удалить карточку
// router.get('/me/objects/:id/calendar', item); // [арендодатель] получить календарь (список bookings всех этого объекта)
// router.post('/me/objects/:id/calendar', item); // [арендодатель] обновить календарь (создать bookings запись с флагом is_client = false)
// router.put('/me/objects/:id/calendar/:calendar_id', item); // [арендодатель] обновить интервал календаря (редактировать запись bookings)
// router.delete('/me/objects/:id/calendar/:calendar_id', ok); // [арендодатель] удалить интервал календаря (удалить запись в bookings)

// TODO:
// Добавить в таблицу bookings confirmed_at (дата подтверждения)
// Добавить в таблицу bookings is_client (бронирование произошло с клиенсткой части(арендатором) через сайт)
// При создании объекта арендодателем (другие и не могут) принимать часы работы в виде [['07:00', '22:00'], ...5] где
// 1. Индекс Элемента массива - день недели
// 2. Элемент массива кортеж с временем от и до

// TODO: возможно сервисы без привязки к объекту не нужны
// router.get('/me/services', list); // [арендодатель]
// router.post('/me/services', ok); // [арендодатель]
// router.put('/me/services/:id', item); // [арендодатель]
// router.delete('/me/services/:id', ok); // [арендодатель]

// router.get('/me/bookings', list); // [арендодатель, арендатор] бронирования список
// router.get('/me/bookings/:id', item); // [арендодатель, арендатор] бронирования карточка

// router.get('/me/notifications', list); // [*] уведомления
// router.post('/me/notifications/mark-as-readed', ok); // [*]

//
// Каталог объектов
//
// router.get('/objects', list); // [без авторизации]
// router.get('/objects/:id', item); // [без авторизации]
// router.get('/objects/:id/bookings', item); // [без авторизации]
// router.post('/objects/:id/bookings', item); // [арендатор] забронировать

//
// Справочники
// TODO:
// + router.get('/lst/object-categories')

//
// Админка
// TODO:

export default router;
