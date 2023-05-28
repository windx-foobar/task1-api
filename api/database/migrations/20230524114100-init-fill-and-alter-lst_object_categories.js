export async function up({ context: queryInterface }) {
  return queryInterface.sequelize.query(`
    START TRANSACTION;

    ALTER TABLE "lst_object_categories"
      ADD COLUMN "parent_id" INTEGER REFERENCES "lst_object_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

    TRUNCATE TABLE "lst_object_categories" RESTART IDENTITY CASCADE;

    INSERT INTO "lst_object_categories" ("name", "parent_id") VALUES
      ('Студии', null),
      ('Творческие площадки', null),
      ('Бизнес площадки', null),
      ('Концертные площадки', null),
      ('Игровые площадки', null),
      ('Спортивные площадки', null),
      ('Банкетные площадки', null),
      ('Летние площадки', null),
      ('Особые площадки', null),
      ('Онлайн площадки', null),

      ('Фотостудии', 1),
      ('Студии звукозаписи', 1),
      ('Студии видеосьемки', 1),
      ('Подкасты/интервью', 1),
      ('Киностудии', 1),

      ('Галереи/музеи', 2),
      ('Центры дизайна/арт-студии', 2),
      ('Библиотеки/книжные магазины', 2),
      ('Культурные центры', 2),
      ('Киноплощадки', 2),

      ('Конференц залы', 3),
      ('Отели/гостиницы', 3),
      ('Выстовочные залы/павильоны', 3),
      ('Киноплощадки', 3),

      ('Концертные залы', 4),
      ('Театральные залы', 4),
      ('Клубы', 4),
      ('Арены', 4),

      ('Развлекательные центры', 5),
      ('Детские центры/интерактивные площадки', 5),
      ('Кинотеатры', 5),
      ('Компьютерные клубы', 5),

      ('Дворцы спорта/арены', 6),
      ('Стадионы', 6),
      ('Автодромы', 6),
      ('Бильярд/боулинг клуб', 6),
      ('Крытые катки', 6),
      ('Полигоны', 6),
      ('Стрелковый центр/тир', 6),

      ('Банкетные залы', 7),
      ('Рестораны', 7),
      ('Лофты', 7),
      ('Кафе/бар', 7),
      ('Особняки/дворцы', 7),

      ('Шатры/поляны', 8),
      ('Летние веранды', 8),
      ('Пляжные клубы', 8),
      ('Яхт клубы', 8),
      ('Теплоходы/банкетоходы', 8),

      ('Городские парки', 9),
      ('Крыши зданий', 9),
      ('Аэродромы', 9),
      ('Небоскребы', 9),
      ('Открытые площадки', 9),

      ('AR/VR студии', 10),
      ('Онлайн трансляции/встречи', 10);

    COMMIT;
  `);
}

export async function down({ context: queryInterface }) {
  return queryInterface.sequelize.query(`
  START TRANSACTION;

  ALTER TABLE "lst_object_categories"
    DROP COLUMN "parent_id";

  COMMIT;
  `);
}
