import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  LiveSession,
  Schedule,
  Streamer,
  Shift,
  KPITarget,
  NotificationItem,
  ProductCatalog
} from '../types';
import {
  INITIAL_SHIFTS,
  INITIAL_STREAMERS,
  INITIAL_SESSIONS,
  INITIAL_SCHEDULES,
  INITIAL_TARGETS,
  INITIAL_PRODUCTS
} from '../lib/mockData';

// Local storage keys for caching / offline resilience
const STORAGE_PREFIX = 'at_live_reports_';
const INITIALIZED_KEY = STORAGE_PREFIX + 'initialized';
const CLEAN_SLATE_KEY = STORAGE_PREFIX + 'clean_slate';

export function isCleanSlate(): boolean {
  try {
    return localStorage.getItem(CLEAN_SLATE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function isAppInitialized(): boolean {
  try {
    return localStorage.getItem(INITIALIZED_KEY) === 'true';
  } catch {
    return false;
  }
}

function getCache<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw !== null) {
      return JSON.parse(raw);
    }
    // If cache is empty and clean-slate is active, return empty array if defaultVal is array
    if (isCleanSlate() && Array.isArray(defaultVal)) {
      return [] as unknown as T;
    }
    return defaultVal;
  } catch {
    return defaultVal;
  }
}

function setCache<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch {
    // Ignore storage quota
  }
}

export const dataService = {
  // ==================== STREAMERS ====================
  async getStreamers(): Promise<Streamer[]> {
    const path = 'streamers';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        if (isCleanSlate() || isAppInitialized()) {
          setCache('streamers', []);
          return [];
        }
        // Seed default streamers on very first boot
        for (const s of INITIAL_STREAMERS) {
          await setDoc(doc(db, path, s.id), { ...s, createdAt: serverTimestamp() });
        }
        localStorage.setItem(INITIALIZED_KEY, 'true');
        setCache('streamers', INITIAL_STREAMERS);
        return INITIAL_STREAMERS;
      }
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Streamer));
      setCache('streamers', list);
      return list;
    } catch (err) {
      console.warn('Fallback to local streamers due to error:', err);
      if (isCleanSlate()) return [];
      return getCache('streamers', isAppInitialized() ? [] : INITIAL_STREAMERS);
    }
  },

  listenStreamers(cb: (streamers: Streamer[]) => void) {
    const path = 'streamers';
    try {
      return onSnapshot(collection(db, path), (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Streamer));
          setCache('streamers', list);
          cb(list);
        } else {
          if (isCleanSlate() || isAppInitialized()) {
            setCache('streamers', []);
            cb([]);
          } else {
            cb(getCache('streamers', INITIAL_STREAMERS));
          }
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
    } catch (err) {
      cb(isCleanSlate() ? [] : getCache('streamers', isAppInitialized() ? [] : INITIAL_STREAMERS));
      return () => {};
    }
  },

  async saveStreamer(streamer: Streamer): Promise<void> {
    const path = 'streamers';
    const id = streamer.id || `str-${Date.now()}`;
    const payload = { ...streamer, id, updatedAt: new Date().toISOString() };
    try {
      await setDoc(doc(db, path, id), payload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    // Update cache
    const current = getCache('streamers', isCleanSlate() ? [] : INITIAL_STREAMERS);
    const idx = current.findIndex(s => s.id === id);
    if (idx >= 0) current[idx] = payload;
    else current.push(payload);
    setCache('streamers', current);
  },

  async deleteStreamer(id: string): Promise<void> {
    const path = 'streamers';
    try {
      await deleteDoc(doc(db, path, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${path}/${id}`);
    }
    const current = getCache('streamers', isCleanSlate() ? [] : INITIAL_STREAMERS).filter(s => s.id !== id);
    setCache('streamers', current);
  },

  // ==================== SHIFTS ====================
  async getShifts(): Promise<Shift[]> {
    const path = 'shifts';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        for (const s of INITIAL_SHIFTS) {
          await setDoc(doc(db, path, s.id), s);
        }
        setCache('shifts', INITIAL_SHIFTS);
        return INITIAL_SHIFTS;
      }
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Shift));
      setCache('shifts', list);
      return list;
    } catch {
      return getCache('shifts', INITIAL_SHIFTS);
    }
  },

  // ==================== LIVE SESSIONS (REPORTS) ====================
  async getLiveSessions(): Promise<LiveSession[]> {
    const path = 'live_sessions';
    try {
      const q = query(collection(db, path), orderBy('businessDate', 'desc'));
      const snap = await getDocs(q);
      if (snap.empty) {
        if (isCleanSlate() || isAppInitialized()) {
          setCache('sessions', []);
          return [];
        }
        for (const s of INITIAL_SESSIONS) {
          await setDoc(doc(db, path, s.id), s);
        }
        localStorage.setItem(INITIALIZED_KEY, 'true');
        setCache('sessions', INITIAL_SESSIONS);
        return INITIAL_SESSIONS;
      }
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as LiveSession));
      setCache('sessions', list);
      return list;
    } catch (err) {
      console.warn('Fallback to local sessions due to error:', err);
      if (isCleanSlate()) return [];
      return getCache('sessions', isAppInitialized() ? [] : INITIAL_SESSIONS);
    }
  },

  listenLiveSessions(cb: (sessions: LiveSession[]) => void) {
    const path = 'live_sessions';
    try {
      const q = query(collection(db, path), orderBy('businessDate', 'desc'));
      return onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as LiveSession));
          setCache('sessions', list);
          cb(list);
        } else {
          if (isCleanSlate() || isAppInitialized()) {
            setCache('sessions', []);
            cb([]);
          } else {
            cb(getCache('sessions', INITIAL_SESSIONS));
          }
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
    } catch {
      cb(isCleanSlate() ? [] : getCache('sessions', isAppInitialized() ? [] : INITIAL_SESSIONS));
      return () => {};
    }
  },

  async saveLiveSession(session: LiveSession): Promise<string> {
    const path = 'live_sessions';
    const id = session.id || `sess-${Date.now()}`;
    const payload: LiveSession = {
      ...session,
      id,
      updatedAt: new Date().toISOString(),
      createdAt: session.createdAt || new Date().toISOString()
    };
    try {
      await setDoc(doc(db, path, id), payload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    // Update local cache
    const current = getCache('sessions', isCleanSlate() ? [] : INITIAL_SESSIONS);
    const idx = current.findIndex(s => s.id === id);
    if (idx >= 0) current[idx] = payload;
    else current.unshift(payload);
    setCache('sessions', current);

    // If session corresponds to a schedule, mark that schedule as completed and hasReport = true
    try {
      const schedules = getCache('schedules', isCleanSlate() ? [] : INITIAL_SCHEDULES);
      const matched = schedules.find(sc => 
        sc.date === session.businessDate && 
        (sc.shiftId === session.shiftId || sc.streamerId === session.streamerId)
      );
      if (matched) {
        matched.hasReport = true;
        matched.reportId = id;
        matched.status = 'Completed';
        await setDoc(doc(db, 'schedules', matched.id), matched, { merge: true });
        setCache('schedules', schedules);
      }
    } catch (e) {
      console.warn('Could not auto-link schedule:', e);
    }

    return id;
  },

  async deleteLiveSession(id: string): Promise<void> {
    const path = 'live_sessions';
    try {
      await deleteDoc(doc(db, path, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${path}/${id}`);
    }
    const current = getCache('sessions', isCleanSlate() ? [] : INITIAL_SESSIONS).filter(s => s.id !== id);
    setCache('sessions', current);
  },

  // ==================== SCHEDULES ====================
  async getSchedules(): Promise<Schedule[]> {
    const path = 'schedules';
    try {
      const q = query(collection(db, path), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      if (snap.empty) {
        if (isCleanSlate() || isAppInitialized()) {
          setCache('schedules', []);
          return [];
        }
        for (const s of INITIAL_SCHEDULES) {
          await setDoc(doc(db, path, s.id), s);
        }
        localStorage.setItem(INITIALIZED_KEY, 'true');
        setCache('schedules', INITIAL_SCHEDULES);
        return INITIAL_SCHEDULES;
      }
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Schedule));
      setCache('schedules', list);
      return list;
    } catch {
      if (isCleanSlate()) return [];
      return getCache('schedules', isAppInitialized() ? [] : INITIAL_SCHEDULES);
    }
  },

  listenSchedules(cb: (schedules: Schedule[]) => void) {
    const path = 'schedules';
    try {
      const q = query(collection(db, path), orderBy('date', 'desc'));
      return onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Schedule));
          setCache('schedules', list);
          cb(list);
        } else {
          if (isCleanSlate() || isAppInitialized()) {
            setCache('schedules', []);
            cb([]);
          } else {
            cb(getCache('schedules', INITIAL_SCHEDULES));
          }
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
    } catch {
      cb(isCleanSlate() ? [] : getCache('schedules', isAppInitialized() ? [] : INITIAL_SCHEDULES));
      return () => {};
    }
  },

  async saveSchedule(schedule: Schedule): Promise<void> {
    const path = 'schedules';
    const id = schedule.id || `sch-${Date.now()}`;
    const payload = { ...schedule, id };
    try {
      await setDoc(doc(db, path, id), payload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    const current = getCache('schedules', isCleanSlate() ? [] : INITIAL_SCHEDULES);
    const idx = current.findIndex(s => s.id === id);
    if (idx >= 0) current[idx] = payload;
    else current.unshift(payload);
    setCache('schedules', current);
  },

  async deleteSchedule(id: string): Promise<void> {
    const path = 'schedules';
    try {
      await deleteDoc(doc(db, path, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${path}/${id}`);
    }
    const current = getCache('schedules', isCleanSlate() ? [] : INITIAL_SCHEDULES).filter(s => s.id !== id);
    setCache('schedules', current);
  },

  // ==================== TARGETS ====================
  async getTargets(): Promise<KPITarget[]> {
    const path = 'targets';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        if (isCleanSlate() || isAppInitialized()) {
          setCache('targets', []);
          return [];
        }
        for (const t of INITIAL_TARGETS) {
          await setDoc(doc(db, path, t.id), t);
        }
        localStorage.setItem(INITIALIZED_KEY, 'true');
        setCache('targets', INITIAL_TARGETS);
        return INITIAL_TARGETS;
      }
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as KPITarget));
      setCache('targets', list);
      return list;
    } catch {
      if (isCleanSlate()) return [];
      return getCache('targets', isAppInitialized() ? [] : INITIAL_TARGETS);
    }
  },

  listenTargets(cb: (targets: KPITarget[]) => void) {
    const path = 'targets';
    try {
      return onSnapshot(collection(db, path), (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as KPITarget));
          setCache('targets', list);
          cb(list);
        } else {
          if (isCleanSlate() || isAppInitialized()) {
            setCache('targets', []);
            cb([]);
          } else {
            cb(getCache('targets', INITIAL_TARGETS));
          }
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
    } catch {
      cb(isCleanSlate() ? [] : getCache('targets', isAppInitialized() ? [] : INITIAL_TARGETS));
      return () => {};
    }
  },

  async saveTarget(target: KPITarget): Promise<void> {
    const path = 'targets';
    const id = target.id || `tar-${Date.now()}`;
    const payload = { ...target, id };
    try {
      await setDoc(doc(db, path, id), payload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    const current = getCache('targets', isCleanSlate() ? [] : INITIAL_TARGETS);
    const idx = current.findIndex(t => t.id === id);
    if (idx >= 0) current[idx] = payload;
    else current.push(payload);
    setCache('targets', current);
  },

  async deleteTarget(id: string): Promise<void> {
    const path = 'targets';
    try {
      await deleteDoc(doc(db, path, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${path}/${id}`);
    }
    const current = getCache('targets', isCleanSlate() ? [] : INITIAL_TARGETS).filter(t => t.id !== id);
    setCache('targets', current);
  },

  // ==================== PRODUCTS ====================
  async getProducts(): Promise<ProductCatalog[]> {
    const path = 'products';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        if (isCleanSlate() || isAppInitialized()) {
          setCache('products', []);
          return [];
        }
        for (const p of INITIAL_PRODUCTS) {
          await setDoc(doc(db, path, p.id), p);
        }
        localStorage.setItem(INITIALIZED_KEY, 'true');
        setCache('products', INITIAL_PRODUCTS);
        return INITIAL_PRODUCTS;
      }
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ProductCatalog));
      setCache('products', list);
      return list;
    } catch {
      if (isCleanSlate()) return [];
      return getCache('products', isAppInitialized() ? [] : INITIAL_PRODUCTS);
    }
  },

  // ==================== RESET & RESTORE ENGINE ====================
  async resetToEmptyData(options: {
    clearSessions?: boolean;
    clearSchedules?: boolean;
    clearTargets?: boolean;
    clearStreamers?: boolean;
    clearProducts?: boolean;
  } = { clearSessions: true, clearSchedules: true, clearTargets: false, clearStreamers: false, clearProducts: false }): Promise<void> {
    const {
      clearSessions = true,
      clearSchedules = true,
      clearTargets = false,
      clearStreamers = false,
      clearProducts = false
    } = options;

    try {
      localStorage.setItem(INITIALIZED_KEY, 'true');
      localStorage.setItem(CLEAN_SLATE_KEY, 'true');

      const clearCollection = async (collPath: string) => {
        try {
          const snap = await getDocs(collection(db, collPath));
          if (!snap.empty) {
            const batchSize = 400;
            const docs = snap.docs;
            for (let i = 0; i < docs.length; i += batchSize) {
              const batch = writeBatch(db);
              docs.slice(i, i + batchSize).forEach(d => batch.delete(d.ref));
              await batch.commit();
            }
          }
        } catch (e) {
          console.warn(`Error clearing collection ${collPath}:`, e);
        }
      };

      if (clearSessions) {
        await clearCollection('live_sessions');
        setCache('sessions', []);
      }
      if (clearSchedules) {
        await clearCollection('schedules');
        setCache('schedules', []);
      }
      if (clearTargets) {
        await clearCollection('targets');
        setCache('targets', []);
      }
      if (clearStreamers) {
        await clearCollection('streamers');
        setCache('streamers', []);
      }
      if (clearProducts) {
        await clearCollection('products');
        setCache('products', []);
      }

      try {
        await setDoc(doc(db, 'system_settings', 'database_state'), {
          isCleanSlate: true,
          initialized: true,
          clearedAt: new Date().toISOString(),
          clearedOptions: { clearSessions, clearSchedules, clearTargets, clearStreamers, clearProducts }
        }, { merge: true });
      } catch (err) {
        console.warn('Could not record clean slate state to firestore:', err);
      }
    } catch (err) {
      console.error('Failed to reset to empty data:', err);
      throw err;
    }
  },

  async restoreDemoData(): Promise<void> {
    try {
      localStorage.setItem(INITIALIZED_KEY, 'true');
      localStorage.removeItem(CLEAN_SLATE_KEY);

      // Seed streamers
      const streamerBatch = writeBatch(db);
      for (const s of INITIAL_STREAMERS) {
        streamerBatch.set(doc(db, 'streamers', s.id), s);
      }
      await streamerBatch.commit();
      setCache('streamers', INITIAL_STREAMERS);

      // Seed shifts
      const shiftBatch = writeBatch(db);
      for (const s of INITIAL_SHIFTS) {
        shiftBatch.set(doc(db, 'shifts', s.id), s);
      }
      await shiftBatch.commit();
      setCache('shifts', INITIAL_SHIFTS);

      // Seed sessions
      const sessionBatch = writeBatch(db);
      for (const s of INITIAL_SESSIONS) {
        sessionBatch.set(doc(db, 'live_sessions', s.id), s);
      }
      await sessionBatch.commit();
      setCache('sessions', INITIAL_SESSIONS);

      // Seed schedules
      const schBatch = writeBatch(db);
      for (const s of INITIAL_SCHEDULES) {
        schBatch.set(doc(db, 'schedules', s.id), s);
      }
      await schBatch.commit();
      setCache('schedules', INITIAL_SCHEDULES);

      // Seed targets
      const tarBatch = writeBatch(db);
      for (const t of INITIAL_TARGETS) {
        tarBatch.set(doc(db, 'targets', t.id), t);
      }
      await tarBatch.commit();
      setCache('targets', INITIAL_TARGETS);

      // Seed products
      const prodBatch = writeBatch(db);
      for (const p of INITIAL_PRODUCTS) {
        prodBatch.set(doc(db, 'products', p.id), p);
      }
      await prodBatch.commit();
      setCache('products', INITIAL_PRODUCTS);

      // Record state
      try {
        await setDoc(doc(db, 'system_settings', 'database_state'), {
          isCleanSlate: false,
          initialized: true,
          restoredAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('Could not record restored state to firestore:', err);
      }
    } catch (err) {
      console.error('Failed to restore demo data:', err);
      throw err;
    }
  },

  // ==================== SUBSCRIPTION ALIASES & LISTENERS ====================
  listenShifts(cb: (shifts: Shift[]) => void) {
    this.getShifts().then(cb);
    return () => {};
  },

  listenProducts(cb: (products: ProductCatalog[]) => void) {
    this.getProducts().then(cb);
    return () => {};
  },

  subscribeSessions(cb: (sessions: LiveSession[]) => void) {
    return this.listenLiveSessions(cb);
  },

  subscribeStreamers(cb: (streamers: Streamer[]) => void) {
    return this.listenStreamers(cb);
  },

  subscribeShifts(cb: (shifts: Shift[]) => void) {
    return this.listenShifts(cb);
  },

  subscribeSchedules(cb: (schedules: Schedule[]) => void) {
    return this.listenSchedules(cb);
  },

  subscribeTargets(cb: (targets: KPITarget[]) => void) {
    return this.listenTargets(cb);
  },

  subscribeProducts(cb: (products: ProductCatalog[]) => void) {
    return this.listenProducts(cb);
  },

  async saveSession(session: LiveSession): Promise<string> {
    return this.saveLiveSession(session);
  },

  async deleteSession(id: string): Promise<void> {
    return this.deleteLiveSession(id);
  },

  // ==================== NOTIFICATIONS ====================
  getInitialNotifications(schedules: Schedule[]): NotificationItem[] {
    const notifications: NotificationItem[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Find schedules that are completed or past but have no report submitted
    schedules.forEach(sc => {
      if ((sc.date <= today && !sc.hasReport) || sc.status === 'Completed' && !sc.hasReport) {
        notifications.push({
          id: `notif-missed-${sc.id}`,
          title: `Laporan Live Belum Disubmit!`,
          message: `${sc.streamerName} - ${sc.shiftName} (${sc.date}) belum ada laporan masuk. Harap segera lengkapi!`,
          type: 'report',
          read: false,
          createdAt: new Date().toISOString(),
          scheduleId: sc.id,
          streamerId: sc.streamerId,
          streamerName: sc.streamerName,
          priority: 'high',
          needsReport: true
        });
      }
    });

    // Add info reminders
    notifications.push({
      id: 'notif-welcome',
      title: 'Selamat Datang di AT - Live Reports',
      message: 'Sistem Monitoring, Analytics & Performance Shopee Live Streamer telah siap digunakan.',
      type: 'system',
      read: false,
      createdAt: new Date().toISOString(),
      priority: 'normal'
    });

    return notifications;
  }
};
