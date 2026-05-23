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
