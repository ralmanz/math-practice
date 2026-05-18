const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // GET /student/:id
    const studentMatch = path.match(/^\/student\/([^/]+)$/);
    if (studentMatch && request.method === 'GET') {
      const studentId = studentMatch[1];
      const raw = await env.STUDENTS.get(studentId);
      if (!raw) {
        return jsonResponse({ error: 'Student not found' }, 404);
      }
      return jsonResponse(JSON.parse(raw));
    }

    // POST /student/:id/complete/:problemId
    const completeMatch = path.match(/^\/student\/([^/]+)\/complete\/([^/]+)$/);
    if (completeMatch && request.method === 'POST') {
      const [, studentId, problemId] = completeMatch;
      const raw = await env.STUDENTS.get(studentId);
      if (!raw) {
        return jsonResponse({ error: 'Student not found' }, 404);
      }
      const student = JSON.parse(raw);
      const problem = student.problems.find(p => p.id === problemId);
      if (problem) {
        problem.completed = true;
      }
      await env.STUDENTS.put(studentId, JSON.stringify(student));
      return jsonResponse({ ok: true });
    }

    // PUT /student/:id/progress — student-facing, updates progress map
    const progressMatch = path.match(/^\/student\/([^/]+)\/progress$/);
    if (progressMatch && request.method === 'PUT') {
      const studentId = progressMatch[1];
      let body;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ error: 'Invalid JSON' }, 400);
      }
      const { unit, stage, status } = body;
      if (!unit || !stage || !status) {
        return jsonResponse({ error: 'Missing unit, stage, or status' }, 400);
      }
      const raw = await env.STUDENTS.get(studentId);
      if (!raw) return jsonResponse({ error: 'Student not found' }, 404);
      const student = JSON.parse(raw);
      if (!student.progress) student.progress = {};
      if (!student.progress[String(unit)]) student.progress[String(unit)] = {};
      student.progress[String(unit)][String(stage)] = status;
      await env.STUDENTS.put(studentId, JSON.stringify(student));
      return jsonResponse({ ok: true });
    }

    // PUT /student/:id/profile — teacher only, updates name/curriculum/grade/trialExpiry
    const profileMatch = path.match(/^\/student\/([^/]+)\/profile$/);
    if (profileMatch && request.method === 'PUT') {
      const auth = request.headers.get('Authorization') || '';
      const secret = auth.startsWith('Bearer ') ? auth.slice(7) : '';
      if (!env.TEACHER_SECRET || secret !== env.TEACHER_SECRET) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }
      const studentId = profileMatch[1];
      let body;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ error: 'Invalid JSON' }, 400);
      }
      const { name, trialExpiry, curriculum, grade } = body;
      if (!name) {
        return jsonResponse({ error: 'Missing name' }, 400);
      }
      const raw = await env.STUDENTS.get(studentId);
      const existing = raw ? JSON.parse(raw) : { problems: [] };
      const updated = { ...existing, name };
      if (trialExpiry  !== undefined) updated.trialExpiry  = trialExpiry  || null;
      if (curriculum   !== undefined) updated.curriculum   = curriculum   || '';
      if (grade        !== undefined) updated.grade        = grade        || '';
      await env.STUDENTS.put(studentId, JSON.stringify(updated));
      return jsonResponse({ ok: true });
    }

    // PUT /student/:id/problems — teacher only, updates problems, preserves name
    const problemsMatch = path.match(/^\/student\/([^/]+)\/problems$/);
    if (problemsMatch && request.method === 'PUT') {
      const auth = request.headers.get('Authorization') || '';
      const secret = auth.startsWith('Bearer ') ? auth.slice(7) : '';
      if (!env.TEACHER_SECRET || secret !== env.TEACHER_SECRET) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }
      const studentId = problemsMatch[1];
      let body;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ error: 'Invalid JSON' }, 400);
      }
      const { problems } = body;
      if (!Array.isArray(problems)) {
        return jsonResponse({ error: 'Missing problems' }, 400);
      }
      const raw = await env.STUDENTS.get(studentId);
      const existing = raw ? JSON.parse(raw) : {};
      const existingById = {};
      for (const p of (existing.problems || [])) {
        existingById[p.id] = p;
      }
      const mergedProblems = problems.map(p =>
        existingById[p.id]
          ? { ...p, completed: existingById[p.id].completed }
          : p
      );
      await env.STUDENTS.put(studentId, JSON.stringify({ ...existing, name: existing.name || studentId, problems: mergedProblems }));
      return jsonResponse({ ok: true });
    }

    // GET /students — teacher only, returns [{id, name}, ...]
    if (path === '/students' && request.method === 'GET') {
      const auth = request.headers.get('Authorization') || '';
      const secret = auth.startsWith('Bearer ') ? auth.slice(7) : '';
      if (!env.TEACHER_SECRET || secret !== env.TEACHER_SECRET) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }
      const listed = await env.STUDENTS.list();
      const filteredKeys = listed.keys.filter(k => {
        const n = k.name;
        return !n.startsWith('log:') && !n.startsWith('lesson:') && !n.startsWith('__');
      });
      const studentResults = await Promise.all(
        filteredKeys.map(async key => {
          const raw = await env.STUDENTS.get(key.name);
          let parsed;
          try { parsed = JSON.parse(raw); } catch { return null; }
          if (!parsed || !parsed.name) return null;
          return { id: key.name, name: parsed.name };
        })
      );
      const students = studentResults.filter(Boolean);
      return jsonResponse(students);
    }

    // POST /generate-variant
    if (path === '/generate-variant' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ error: 'generation_failed' }); }
      const { expression, type, modules } = body;
      if (!expression || !type) return jsonResponse({ error: 'generation_failed' });
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 256,
            system: `You are a math problem generator for students in grades 6–9 (Cambridge curriculum).
Given a math problem, generate ONE structurally identical variant with different numbers.
Rules:
- Keep the same operation type and structure
- Use integers only. Coefficients between 2–9, constants between 1–20.
- The problem must have a clean solution (integer or simple fraction like 1/2, 3/2)
- For Solve: the variable should appear on one side only, unless the original had it on both sides
- For Expand: keep the same bracket structure, just change the numbers
- Return ONLY valid JSON, no markdown, no explanation:
  {"expression": "...", "answer": "..."}
- "answer" must be the full correct answer string as a student would enter it (e.g. "x = 3", "2x^2 + 5x + 3")`,
            messages: [{ role: 'user', content: `Type: ${type}\nOriginal: ${expression}` }]
          })
        });
        const data = await response.json();
        const text = (data?.content?.[0]?.text || '').trim();
        let parsed;
        try { parsed = JSON.parse(text); } catch { return jsonResponse({ error: 'generation_failed' }); }
        if (!parsed.expression || !parsed.answer) return jsonResponse({ error: 'generation_failed' });
        return jsonResponse({ expression: parsed.expression, answer: parsed.answer, type, modules: modules || ['equivalence'] });
      } catch {
        return jsonResponse({ error: 'generation_failed' });
      }
    }

    // POST /save-variant
    if (path === '/save-variant' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ error: 'Invalid JSON' }, 400); }
      const { studentId: svStudentId, expression: svExpr, answer: svAnswer, type: svType, label, modules: svModules, url: svUrl } = body;
      if (!svStudentId || !svExpr || !svAnswer || !svType) return jsonResponse({ error: 'Missing fields' }, 400);
      const svRaw = await env.STUDENTS.get(svStudentId);
      if (!svRaw) return jsonResponse({ error: 'Student not found' }, 404);
      const svStudent = JSON.parse(svRaw);
      const newProblemId = `variant_${Date.now()}`;
      svStudent.problems = svStudent.problems || [];
      svStudent.problems.push({
        id: newProblemId,
        title: label || `Practice: ${svType}`,
        url: svUrl || 'index.html',
        type: svType,
        question: svExpr,
        answer: svAnswer,
        modules: svModules || ['equivalence'],
        completed: false,
        generated: true
      });
      await env.STUDENTS.put(svStudentId, JSON.stringify(svStudent));
      return jsonResponse({ success: true, problemId: newProblemId });
    }

    // POST /log-step
    if (path === '/log-step' && request.method === 'POST') {
      try {
        let body;
        try { body = await request.json(); } catch { return jsonResponse({ ok: false }); }
        const { studentId, problemId, step, correct } = body;
        if (!studentId || !problemId || step === undefined || correct === undefined) {
          return jsonResponse({ ok: false });
        }
        const key = `log:${studentId}:${problemId}`;
        const raw = await env.STUDENTS.get(key);
        const logs = raw ? JSON.parse(raw) : [];
        logs.push({ step, correct, timestamp: new Date().toISOString() });
        await env.STUDENTS.put(key, JSON.stringify(logs));
        return jsonResponse({ ok: true });
      } catch {
        return jsonResponse({ ok: false });
      }
    }

    // GET /get-logs?studentId=<id>&problemId=<id>
    if (path === '/get-logs' && request.method === 'GET') {
      const logStudentId = url.searchParams.get('studentId');
      const logProblemId = url.searchParams.get('problemId');
      if (!logStudentId || !logProblemId) return jsonResponse({ logs: [] });
      try {
        const key = `log:${logStudentId}:${logProblemId}`;
        const raw = await env.STUDENTS.get(key);
        return jsonResponse({ logs: raw ? JSON.parse(raw) : [] });
      } catch {
        return jsonResponse({ logs: [] });
      }
    }

    // GET /problems/curriculum/:curriculum/:unit/:stage/:problemType — filtered problem bank
    const problemsFilterMatch = path.match(/^\/problems\/curriculum\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)$/);
    if (problemsFilterMatch && request.method === 'GET') {
      const [, filterCurriculum, filterUnit, filterStage, filterProblemType] = problemsFilterMatch;
      const bankRaw = await env.STUDENTS.get('__problem_bank__');
      const bank = bankRaw ? JSON.parse(bankRaw) : [];
      const results = bank.filter(p =>
        p.curriculum === filterCurriculum &&
        String(p.unit) === filterUnit &&
        String(p.stage) === filterStage &&
        p.problemType === filterProblemType
      );
      return jsonResponse(results);
    }

    // GET /problems — return full problem bank
    if (path === '/problems' && request.method === 'GET') {
      const bankRaw = await env.STUDENTS.get('__problem_bank__');
      return jsonResponse(bankRaw ? JSON.parse(bankRaw) : []);
    }

    // POST /problems — teacher auth, add problem to global bank
    if (path === '/problems' && request.method === 'POST') {
      const auth = request.headers.get('Authorization') || '';
      const secret = auth.startsWith('Bearer ') ? auth.slice(7) : '';
      if (!env.TEACHER_SECRET || secret !== env.TEACHER_SECRET) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ error: 'Invalid JSON' }, 400); }
      const { curriculum, unit, stage, problemType, type, question, answer, modules, expression, hints, format } = body;
      if (!curriculum || !unit || !stage || !problemType || !type || !question || !answer) {
        return jsonResponse({ error: 'Missing required fields' }, 400);
      }
      const bankRaw = await env.STUDENTS.get('__problem_bank__');
      const bank = bankRaw ? JSON.parse(bankRaw) : [];
      const newProblem = {
        id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        curriculum, unit: String(unit), stage: String(stage), problemType,
        type, question, answer,
        modules: modules || ['equivalence'],
        createdAt: new Date().toISOString()
      };
      const exprTrim = expression != null && String(expression).trim() !== '' ? String(expression).trim() : '';
      if (exprTrim) newProblem.expression = exprTrim;
      if (format != null && String(format).trim() !== '') newProblem.format = String(format).trim();
      if (Array.isArray(hints) && hints.length) newProblem.hints = hints.filter((h) => h != null && String(h).trim() !== '');
      bank.push(newProblem);
      await env.STUDENTS.put('__problem_bank__', JSON.stringify(bank));
      return jsonResponse({ ok: true, id: newProblem.id });
    }

    // GET /lesson/:curriculum/:unit/:level — return lesson JSON from KV
    // POST /lesson/:curriculum/:unit/:level — teacher auth, save lesson JSON to KV
    const lessonMatch = path.match(/^\/lesson\/([^/]+)\/([^/]+)\/([^/]+)$/);
    if (lessonMatch && request.method === 'GET') {
      const [, lCurriculum, lUnit, lLevel] = lessonMatch;
      const key = `lesson:${lCurriculum}:${lUnit}:level${lLevel}`;
      const raw = await env.STUDENTS.get(key);
      if (!raw) return jsonResponse({ error: 'Lesson not found' }, 404);
      return jsonResponse(JSON.parse(raw));
    }
    if (lessonMatch && request.method === 'POST') {
      const auth = request.headers.get('Authorization') || '';
      const secret = auth.startsWith('Bearer ') ? auth.slice(7) : '';
      if (!env.TEACHER_SECRET || secret !== env.TEACHER_SECRET) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }
      const [, lCurriculum, lUnit, lLevel] = lessonMatch;
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ error: 'Invalid JSON' }, 400); }
      const key = `lesson:${lCurriculum}:${lUnit}:level${lLevel}`;
      await env.STUDENTS.put(key, JSON.stringify(body));
      return jsonResponse({ ok: true });
    }

    // Health check
    if (request.method === 'GET') {
      return jsonResponse({ status: 'ok', service: 'math-practice-proxy' });
    }

    // Anthropic proxy (existing behavior — handles POST /validate and any other POST)
    if (request.method === 'POST') {
      try {
        const { system, messages } = await request.json();
        if (!system || !messages) {
          return jsonResponse({ error: 'Missing system or messages' }, 400);
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            system,
            messages
          })
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return jsonResponse({ error: 'Proxy error' }, 500);
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  }
};
