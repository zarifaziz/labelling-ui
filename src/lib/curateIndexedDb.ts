import { CurateItem } from '@/types/curate';

const DB_NAME = 'labelling-ui-curate';
const DB_VERSION = 1;
const ITEMS_STORE = 'curate-items';
const META_STORE = 'curate-meta';

const ITEMS_KEY = 'items';
const FILENAME_KEY = 'filename';
const SCHEMA_KEY = 'schema';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ITEMS_STORE)) {
        db.createObjectStore(ITEMS_STORE);
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open curate IndexedDB'));
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

async function getValue<T>(storeName: string, key: string): Promise<T | null> {
  const db = await openDb();
  const store = db.transaction(storeName, 'readonly').objectStore(storeName);
  const result = await requestToPromise(store.get(key));
  return (result ?? null) as T | null;
}

async function setValue<T>(storeName: string, key: string, value: T): Promise<void> {
  const db = await openDb();
  const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
  await requestToPromise(store.put(value, key));
}

async function clearStore(storeName: string): Promise<void> {
  const db = await openDb();
  const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
  await requestToPromise(store.clear());
}

export async function loadCurateItems(): Promise<CurateItem[] | null> {
  return getValue<CurateItem[]>(ITEMS_STORE, ITEMS_KEY);
}

export async function saveCurateItems(items: CurateItem[]): Promise<void> {
  await setValue(ITEMS_STORE, ITEMS_KEY, items);
}

export async function loadCurateFilename(): Promise<string | null> {
  return getValue<string>(META_STORE, FILENAME_KEY);
}

export async function saveCurateFilename(name: string): Promise<void> {
  await setValue(META_STORE, FILENAME_KEY, name);
}

export async function loadCurateSchema(): Promise<string | null> {
  return getValue<string>(META_STORE, SCHEMA_KEY);
}

export async function saveCurateSchema(schema: string): Promise<void> {
  await setValue(META_STORE, SCHEMA_KEY, schema);
}

export async function clearAllCurateData(): Promise<void> {
  await Promise.all([clearStore(ITEMS_STORE), clearStore(META_STORE)]);
}
