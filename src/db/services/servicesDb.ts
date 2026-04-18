import * as SQLite from "expo-sqlite";

import {
  ListLocalServicesParams,
  LocalServicesMeta,
  ServiceItem,
  ServiceSyncItem,
} from "@/src/entities/service/model/types";

const DB_NAME = "toqen_services.db";

const META_VERSION_KEY = "services_version";
const META_LAST_CHECK_AT_KEY = "services_last_check_at";
const META_SCHEMA_VERSION_KEY = "schema_version";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initPromise: Promise<void> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME).catch((error) => {
      dbPromise = null;
      throw error;
    });
  }

  return dbPromise;
}

async function getSchemaVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM services_meta WHERE key = ?`,
    [META_SCHEMA_VERSION_KEY],
  );

  const version = Number(row?.value ?? 0);
  return Number.isFinite(version) ? version : 0;
}

async function setSchemaVersion(
  db: SQLite.SQLiteDatabase,
  version: number,
): Promise<void> {
  await db.runAsync(
    `
      INSERT INTO services_meta (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `,
    [META_SCHEMA_VERSION_KEY, String(version)],
  );
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const currentVersion = await getSchemaVersion(db);

  if (currentVersion < 1) {
    await setSchemaVersion(db, 1);
  }
}

export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export async function initServicesDb(): Promise<void> {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const db = await getDb();

      await db.execAsync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS services (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          slug TEXT NOT NULL,
          logo_url TEXT,
          description TEXT,
          brand_color TEXT,
          launch_url TEXT,
          login_url TEXT NOT NULL,
          client_id TEXT NOT NULL,
          redirect_uri TEXT NOT NULL,
          search_normalized TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS services_meta (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_services_name
        ON services(name COLLATE NOCASE);

        CREATE INDEX IF NOT EXISTS idx_services_slug
        ON services(slug COLLATE NOCASE);

        CREATE INDEX IF NOT EXISTS idx_services_search_normalized
        ON services(search_normalized);

        CREATE INDEX IF NOT EXISTS idx_services_updated_at
        ON services(updated_at);

        CREATE INDEX IF NOT EXISTS idx_services_client_id
        ON services(client_id);

        CREATE INDEX IF NOT EXISTS idx_services_redirect_uri
        ON services(redirect_uri);
      `);

      await runMigrations(db);
    } catch (error) {
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

export async function getServicesMeta(): Promise<LocalServicesMeta> {
  await initServicesDb();
  const db = await getDb();

  const versionRow = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM services_meta WHERE key = ?`,
    [META_VERSION_KEY],
  );

  const lastCheckRow = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM services_meta WHERE key = ?`,
    [META_LAST_CHECK_AT_KEY],
  );

  const countRow = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) as total FROM services`,
  );

  const version = Number(versionRow?.value ?? 0);
  const lastCheckAtRaw = lastCheckRow?.value ?? null;
  const lastCheckAt = lastCheckAtRaw ? Number(lastCheckAtRaw) : null;

  return {
    version: Number.isFinite(version) ? version : 0,
    lastCheckAt:
      lastCheckAt !== null && Number.isFinite(lastCheckAt) ? lastCheckAt : null,
    totalCount: Number(countRow?.total ?? 0),
  };
}

export async function setServicesVersion(version: number): Promise<void> {
  await initServicesDb();
  const db = await getDb();

  await db.runAsync(
    `
      INSERT INTO services_meta (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `,
    [META_VERSION_KEY, String(version)],
  );
}

export async function setLastVersionCheckAt(timestamp: number): Promise<void> {
  await initServicesDb();
  const db = await getDb();

  await db.runAsync(
    `
      INSERT INTO services_meta (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `,
    [META_LAST_CHECK_AT_KEY, String(timestamp)],
  );
}

export async function getServicesCount(): Promise<number> {
  await initServicesDb();
  const db = await getDb();

  const row = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) as total FROM services`,
  );

  return Number(row?.total ?? 0);
}

export async function applyServicesDelta(params: {
  upserts: ServiceSyncItem[];
  deletes: string[];
}): Promise<void> {
  await initServicesDb();
  const db = await getDb();

  await db.execAsync("BEGIN IMMEDIATE TRANSACTION");

  try {
    for (const id of params.deletes) {
      await db.runAsync(`DELETE FROM services WHERE id = ?`, [id]);
    }

    for (const service of params.upserts) {
      await db.runAsync(
        `
          INSERT INTO services (
            id,
            name,
            slug,
            logo_url,
            description,
            brand_color,
            launch_url,
            login_url,
            client_id,
            redirect_uri,
            search_normalized,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            slug = excluded.slug,
            logo_url = excluded.logo_url,
            description = excluded.description,
            brand_color = excluded.brand_color,
            launch_url = excluded.launch_url,
            login_url = excluded.login_url,
            client_id = excluded.client_id,
            redirect_uri = excluded.redirect_uri,
            search_normalized = excluded.search_normalized,
            updated_at = excluded.updated_at
        `,
        [
          service.id,
          service.name,
          service.slug,
          service.logoUrl ?? null,
          service.description ?? null,
          service.brandColor ?? null,
          service.launchUrl ?? null,
          service.loginUrl,
          service.clientId,
          service.redirectUri,
          normalizeForSearch(
            [service.name, service.slug, service.description ?? ""].join(" "),
          ),
          service.updatedAt,
        ],
      );
    }

    await db.execAsync("COMMIT");
  } catch (error) {
    await db.execAsync("ROLLBACK");
    throw error;
  }
}

export async function listLocalServices(
  params: ListLocalServicesParams = {},
): Promise<ServiceItem[]> {
  await initServicesDb();
  const db = await getDb();

  const limit = Math.max(1, Math.min(params.limit ?? 100, 500));
  const offset = Math.max(0, params.offset ?? 0);
  const query = normalizeForSearch(params.query ?? "");

  const rows = query
    ? await db.getAllAsync<{
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
        description: string | null;
        brand_color: string | null;
        launch_url: string | null;
        login_url: string;
        client_id: string;
        redirect_uri: string;
      }>(
        `
          SELECT
            id,
            name,
            slug,
            logo_url,
            description,
            brand_color,
            launch_url,
            login_url,
            client_id,
            redirect_uri
          FROM services
          WHERE search_normalized LIKE ?
          ORDER BY name COLLATE NOCASE ASC
          LIMIT ? OFFSET ?
        `,
        [`%${query}%`, limit, offset],
      )
    : await db.getAllAsync<{
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
        description: string | null;
        brand_color: string | null;
        launch_url: string | null;
        login_url: string;
        client_id: string;
        redirect_uri: string;
      }>(
        `
          SELECT
            id,
            name,
            slug,
            logo_url,
            description,
            brand_color,
            launch_url,
            login_url,
            client_id,
            redirect_uri
          FROM services
          ORDER BY name COLLATE NOCASE ASC
          LIMIT ? OFFSET ?
        `,
        [limit, offset],
      );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url,
    description: row.description ?? undefined,
    brandColor: row.brand_color ?? undefined,
    launchUrl: row.launch_url ?? undefined,
    loginUrl: row.login_url,
    clientId: row.client_id,
    redirectUri: row.redirect_uri,
  }));
}

export async function getLocalServiceByClientId(
  clientId: string,
): Promise<ServiceItem | null> {
  await initServicesDb();
  const db = await getDb();

  const row = await db.getFirstAsync<{
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    description: string | null;
    brand_color: string | null;
    launch_url: string | null;
    login_url: string;
    client_id: string;
    redirect_uri: string;
  }>(
    `
      SELECT
        id,
        name,
        slug,
        logo_url,
        description,
        brand_color,
        launch_url,
        login_url,
        client_id,
        redirect_uri
      FROM services
      WHERE client_id = ?
      LIMIT 1
    `,
    [clientId],
  );

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url,
    description: row.description ?? undefined,
    brandColor: row.brand_color ?? undefined,
    launchUrl: row.launch_url ?? undefined,
    loginUrl: row.login_url,
    clientId: row.client_id,
    redirectUri: row.redirect_uri,
  };
}

export async function clearServicesDb(): Promise<void> {
  await initServicesDb();
  const db = await getDb();

  await db.execAsync("BEGIN IMMEDIATE TRANSACTION");

  try {
    await db.runAsync(`DELETE FROM services`);
    await db.runAsync(`DELETE FROM services_meta WHERE key IN (?, ?)`, [
      META_VERSION_KEY,
      META_LAST_CHECK_AT_KEY,
    ]);
    await db.execAsync("COMMIT");
  } catch (error) {
    await db.execAsync("ROLLBACK");
    throw error;
  }
}

export async function resetServicesDb(): Promise<void> {
  const db = await getDb();

  await db.execAsync("BEGIN IMMEDIATE TRANSACTION");

  try {
    await db.runAsync(`DROP TABLE IF EXISTS services`);
    await db.runAsync(`DROP TABLE IF EXISTS services_meta`);
    await db.execAsync("COMMIT");

    dbPromise = null;
    initPromise = null;

    await initServicesDb();
  } catch (error) {
    await db.execAsync("ROLLBACK");
    throw error;
  }
}
