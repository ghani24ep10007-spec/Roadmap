import { SemesterData, TaskItem, UMKMProduct, UMKMSale } from '../types';
import { INITIAL_CURRICULUM } from '../data/defaultCurriculum';
import { INITIAL_TASKS } from '../data/defaultTasks';
import { INITIAL_UMKM_PRODUCTS, INITIAL_UMKM_SALES } from '../data/umkmData';

const STORAGE_KEYS = {
  CURRICULUM: 'cyber_roadmap_curriculum_v1',
  TASKS: 'cyber_roadmap_tasks_v1',
  UMKM_PRODUCTS: 'cyber_roadmap_umkm_products_v1',
  UMKM_SALES: 'cyber_roadmap_umkm_sales_v1',
  TARGET_CAREER: 'cyber_roadmap_target_career_v1',
  TARGET_IPK: 'cyber_roadmap_target_ipk_v1',
  AUDIO_ENABLED: 'cyber_roadmap_audio_enabled_v1',
  SCANLINES_ENABLED: 'cyber_roadmap_scanlines_v1',
  SYNC_TIMESTAMP: 'cyber_roadmap_last_sync_v1',
};

export function getStoredCurriculum(): SemesterData[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRICULUM);
    return data ? JSON.parse(data) : INITIAL_CURRICULUM;
  } catch (e) {
    return INITIAL_CURRICULUM;
  }
}

export function saveStoredCurriculum(data: SemesterData[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(data));
  } catch (e) {}
}

export function getStoredTasks(): TaskItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : INITIAL_TASKS;
  } catch (e) {
    return INITIAL_TASKS;
  }
}

export function saveStoredTasks(data: TaskItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data));
  } catch (e) {}
}

export function getStoredUmkmProducts(): UMKMProduct[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.UMKM_PRODUCTS);
    return data ? JSON.parse(data) : INITIAL_UMKM_PRODUCTS;
  } catch (e) {
    return INITIAL_UMKM_PRODUCTS;
  }
}

export function saveStoredUmkmProducts(data: UMKMProduct[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.UMKM_PRODUCTS, JSON.stringify(data));
  } catch (e) {}
}

export function getStoredUmkmSales(): UMKMSale[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.UMKM_SALES);
    return data ? JSON.parse(data) : INITIAL_UMKM_SALES;
  } catch (e) {
    return INITIAL_UMKM_SALES;
  }
}

export function saveStoredUmkmSales(data: UMKMSale[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.UMKM_SALES, JSON.stringify(data));
  } catch (e) {}
}

export function getStoredTargetCareer(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.TARGET_CAREER) || 'cyber-security';
  } catch (e) {
    return 'cyber-security';
  }
}

export function saveStoredTargetCareer(careerId: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.TARGET_CAREER, careerId);
  } catch (e) {}
}

export function getStoredTargetIPK(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.TARGET_IPK);
    return val ? parseFloat(val) : 3.85;
  } catch (e) {
    return 3.85;
  }
}

export function saveStoredTargetIPK(ipk: number) {
  try {
    localStorage.setItem(STORAGE_KEYS.TARGET_IPK, ipk.toString());
  } catch (e) {}
}

export async function syncDataToServer(payload: any): Promise<{ success: boolean; timestamp: string }> {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload,
        clientTimestamp: new Date().toISOString(),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(STORAGE_KEYS.SYNC_TIMESTAMP, data.serverTimestamp);
      return { success: true, timestamp: data.serverTimestamp };
    }
  } catch (e) {
    // offline or server unreachable
  }
  const fallbackTime = new Date().toISOString();
  return { success: false, timestamp: fallbackTime };
}
