/** Default assessment fields for student KV records (migration-on-read). */
const PLACEMENT_DEFAULT = { taken: false, results: {}, takenAt: null };
const FINAL_TEST_DEFAULT = { unlocked: false, attempts: [] };

/** Fill missing top-level assessment fields without overwriting existing data. */
export function migrateStudentRecord(student) {
  if (!student || typeof student !== 'object') return student;
  const out = { ...student };

  if (out.placement == null || typeof out.placement !== 'object') {
    out.placement = { ...PLACEMENT_DEFAULT };
  } else {
    if (out.placement.taken === undefined) out.placement.taken = false;
    if (out.placement.results === undefined) out.placement.results = {};
    if (out.placement.takenAt === undefined) out.placement.takenAt = null;
  }

  if (out.units == null || typeof out.units !== 'object' || Array.isArray(out.units)) {
    out.units = {};
  }

  if (out.finalTest == null || typeof out.finalTest !== 'object') {
    out.finalTest = { ...FINAL_TEST_DEFAULT };
  } else {
    if (out.finalTest.unlocked === undefined) out.finalTest.unlocked = false;
    if (out.finalTest.attempts === undefined) out.finalTest.attempts = [];
  }

  return out;
}

export function defaultUnitRecord() {
  return {
    placedAt: null,
    unlockedLevels: [],
    levelsCompleted: [],
    unitTest: { passed: false, attempts: [] },
  };
}

/** Ensure units.<unitId> exists with unitTest shape before persisting an attempt. */
export function ensureUnitRecord(student, unitId) {
  if (!student.units || typeof student.units !== 'object' || Array.isArray(student.units)) {
    student.units = {};
  }
  if (!student.units[unitId] || typeof student.units[unitId] !== 'object') {
    student.units[unitId] = defaultUnitRecord();
  } else {
    const u = student.units[unitId];
    if (u.placedAt === undefined) u.placedAt = null;
    if (!Array.isArray(u.unlockedLevels)) u.unlockedLevels = [];
    if (!Array.isArray(u.levelsCompleted)) u.levelsCompleted = [];
    if (!u.unitTest || typeof u.unitTest !== 'object') {
      u.unitTest = { passed: false, attempts: [] };
    } else {
      if (u.unitTest.passed === undefined) u.unitTest.passed = false;
      if (!Array.isArray(u.unitTest.attempts)) u.unitTest.attempts = [];
    }
  }
  return student.units[unitId];
}

export function levelStatusFromScore(score) {
  if (score >= 7) return 'pass';
  if (score >= 4) return 'borderline';
  return 'fail';
}
