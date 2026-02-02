import { EvalItem } from '@/types';

const DB_NAME = 'labelling-ui';
const DB_VERSION = 1;
const ITEMS_STORE = 'items';
const META_STORE = 'meta';

const ITEMS_KEY = 'items';
const FILENAME_KEY = 'filename';
const VIEW_MODE_KEY = 'viewMode';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this environment'));
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
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
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

async function deleteValue(storeName: string, key: string): Promise<void> {
  const db = await openDb();
  const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
  await requestToPromise(store.delete(key));
}

async function clearStore(storeName: string): Promise<void> {
  const db = await openDb();
  const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
  await requestToPromise(store.clear());
}

export async function loadItems(): Promise<EvalItem[] | null> {
  return await getValue<EvalItem[]>(ITEMS_STORE, ITEMS_KEY);
}

export async function saveItems(items: EvalItem[]): Promise<void> {
  await setValue(ITEMS_STORE, ITEMS_KEY, items);
}

export async function clearItems(): Promise<void> {
  await deleteValue(ITEMS_STORE, ITEMS_KEY);
}

export async function loadFilename(): Promise<string | null> {
  return await getValue<string>(META_STORE, FILENAME_KEY);
}

export async function saveFilename(name: string): Promise<void> {
  await setValue(META_STORE, FILENAME_KEY, name);
}

export async function clearFilename(): Promise<void> {
  await deleteValue(META_STORE, FILENAME_KEY);
}

export async function loadViewMode(): Promise<string | null> {
  return await getValue<string>(META_STORE, VIEW_MODE_KEY);
}

export async function saveViewMode(mode: string): Promise<void> {
  await setValue(META_STORE, VIEW_MODE_KEY, mode);
}

export async function clearAllPersistedData(): Promise<void> {
  await Promise.all([clearStore(ITEMS_STORE), clearStore(META_STORE)]);
}
