export async function up({ context: queryInterface }) {
  return queryInterface.sequelize.query(`
    START TRANSACTION;

    CREATE TABLE IF NOT EXISTS "lst_lessee_categories" (
      "id" SERIAL,
      "name" VARCHAR(255) NOT NULL,

      PRIMARY KEY ("id")
    );


    CREATE TABLE IF NOT EXISTS "lst_owner_categories" (
      "id" SERIAL,
      "name" VARCHAR(255) NOT NULL,

      PRIMARY KEY ("id")
    );


    CREATE TABLE IF NOT EXISTS "users" (
      "id" SERIAL,
      "name" VARCHAR(255) DEFAULT NULL,
      "email" VARCHAR(255) UNIQUE,
      "phone" VARCHAR(255) UNIQUE,
      "password" VARCHAR(255) DEFAULT NULL,
      "status" INTEGER NOT NULL DEFAULT 1,

      "profile" JSONB NOT NULL DEFAULT '{}',
      "payload" JSONB NOT NULL DEFAULT '{}',

      "lessee_category_id" INTEGER REFERENCES "lst_lessee_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
      "owner_category_id" INTEGER REFERENCES "lst_owner_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,

      "locked_at" TIMESTAMP WITH TIME ZONE,
      "confirmed_at" TIMESTAMP WITH TIME ZONE,

      "created_at" timestamp NOT NULL,
      "updated_at" timestamp NOT NULL,
      "deleted_at" TIMESTAMP WITH TIME ZONE,

      PRIMARY KEY ("id")
    );


    CREATE TABLE IF NOT EXISTS "files" (
      "id" SERIAL,
      "model" varchar(255) DEFAULT NULL,
      "parent_id" int DEFAULT NULL,
      "payload" JSONB DEFAULT '{}',
      "original_name" varchar(255) NOT NULL,
      "name" varchar(255) NOT NULL,
      "path" varchar(255) NOT NULL,
      "destination" varchar(255) NOT NULL,
      "mime_type" varchar(255) NOT NULL,
      "encoding" varchar(255) DEFAULT NULL,
      "size" int DEFAULT NULL,
      "user_id" INTEGER REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
      "account_id" int DEFAULT NULL,
      "width" int DEFAULT NULL,
      "height" int DEFAULT NULL,

      "created_at" timestamp NOT NULL,
      "updated_at" timestamp NOT NULL,
      "deleted_at" TIMESTAMP WITH TIME ZONE,

      PRIMARY KEY ("id")
    );


    CREATE TABLE IF NOT EXISTS "logs" (
      "id" SERIAL,
      "comment" varchar(255) DEFAULT NULL,
      "payload" JSONB DEFAULT '{}',

      "user_id" INTEGER REFERENCES users ("id") ON DELETE SET NULL ON UPDATE CASCADE,

      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,

      PRIMARY KEY ("id")
    );


    CREATE TABLE IF NOT EXISTS "one_time_tokens" (
      "id" varchar(36) NOT NULL,
      "action" varchar(255) NOT NULL,
      "phone" varchar(255) DEFAULT NULL,
      "email" varchar(255) DEFAULT NULL,
      "payload" JSONB DEFAULT '{}',

      "created_at" timestamp NOT NULL,
      "updated_at" timestamp NOT NULL,
      "deleted_at" TIMESTAMP WITH TIME ZONE,

      PRIMARY KEY ("id")
    );



    CREATE TABLE IF NOT EXISTS "permissions" (
      "id" SERIAL,
      "name" varchar(255) NOT NULL UNIQUE,
      "description" varchar(255) DEFAULT NULL,

      "created_at" timestamp NOT NULL,
      "updated_at" timestamp NOT NULL,
      "deleted_at" TIMESTAMP WITH TIME ZONE,

      PRIMARY KEY ("id")
    );


    CREATE TABLE IF NOT EXISTS "roles" (
      "id" SERIAL,
      "name" varchar(255) NOT NULL UNIQUE,
      "description" varchar(255) DEFAULT NULL,

      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
      "deleted_at" TIMESTAMP WITH TIME ZONE,

      PRIMARY KEY ("id")
    );


    CREATE TABLE IF NOT EXISTS "roles_permissions" (
      "id" SERIAL,
      "role_id" INTEGER REFERENCES "roles" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
      "permission_id" INTEGER REFERENCES "permissions" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,

      PRIMARY KEY ("id")
    );


    CREATE TABLE IF NOT EXISTS "sequelize_meta" (
      "name" varchar(255) NOT NULL,

      CONSTRAINT "sequelize_meta_pkey" PRIMARY KEY ("name")
    );


    CREATE TABLE IF NOT EXISTS "users_roles" (
      "id" SERIAL,
      "role_id" INTEGER REFERENCES "roles" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
      "user_id" INTEGER REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,

      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,

      PRIMARY KEY ("id")
    );

    CREATE TABLE IF NOT EXISTS "notifications" (
      "id" SERIAL,
      "payload" JSONB NOT NULL DEFAULT '{}',

      "user_id" INTEGER REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,

      "readed_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL,

      PRIMARY KEY ("id")
    );


    CREATE TABLE IF NOT EXISTS "auth_tokens" (
      "token" VARCHAR(36) UNIQUE NOT NULL,

      "user_id" INTEGER REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,

      "created_at" TIMESTAMP NOT NULL,

      PRIMARY KEY ("token")
    );

    CREATE TABLE IF NOT EXISTS "lst_object_categories" (
      "id" SERIAL,
      "name" VARCHAR(255) NOT NULL,

      PRIMARY KEY ("id")
    );

    CREATE TABLE IF NOT EXISTS "objects" (
      "id" SERIAL,
      "status" INTEGER NOT NULL DEFAULT 1,
      "payload" JSONB NOT NULL DEFAULT '{}',

      "object_category_id" INTEGER REFERENCES "lst_object_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
      "owner_id" INTEGER REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
      "parent_id" INTEGER REFERENCES "objects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,

      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
      "deleted_at" TIMESTAMP WITH TIME ZONE,

      PRIMARY KEY ("id")
    );

    CREATE TABLE IF NOT EXISTS "reviews" (
      "id" SERIAL,
      "status" INTEGER NOT NULL,
      "payload" JSONB NOT NULL DEFAULT '{}',

      "object_id" INTEGER REFERENCES "objects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
      "lessee_id" INTEGER REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,

      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
      "deleted_at" TIMESTAMP WITH TIME ZONE,

      PRIMARY KEY ("id")
    );

    CREATE TABLE IF NOT EXISTS "services" (
      "id" SERIAL,
      "status" INTEGER NOT NULL,
      "payload" JSONB NOT NULL DEFAULT '{}',

      "owner_id" INTEGER REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,

      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
      "deleted_at" TIMESTAMP WITH TIME ZONE,

      PRIMARY KEY ("id")
    );

    CREATE TABLE IF NOT EXISTS "objects_services" (
      "id" SERIAL,

      "object_id" INTEGER REFERENCES "objects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
      "service_id" INTEGER REFERENCES "services" ("id") ON DELETE SET NULL ON UPDATE CASCADE,

      PRIMARY KEY ("id")
    );

    CREATE TABLE IF NOT EXISTS "bookings" (
      "id" SERIAL,
      "payload" JSONB NOT NULL DEFAULT '{}',
      "start_date" DATE NOT NULL,
      "start_time" TIME WITH TIME ZONE NOT NULL,
      "end_date" DATE NOT NULL,
      "end_time" TIME WITH TIME ZONE NOT NULL,
      "is_client" BOOLEAN DEFAULT false,

      "object_id" INTEGER REFERENCES "objects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
      "lessee_id" INTEGER REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
      "owner_id" INTEGER REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,

      "start_at" TIMESTAMP WITH TIME ZONE NOT NULL,
      "end_at" TIMESTAMP WITH TIME ZONE NOT NULL,
      "confirmed_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL,

      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
      "deleted_at" TIMESTAMP WITH TIME ZONE,

      PRIMARY KEY ("id")
    );

    COMMIT;
  `);
}

export async function down({ context: queryInterface }) {
  return queryInterface.sequelize.query(`
  DO $$ DECLARE
    r RECORD;
  BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
  END $$;
  `);
}
