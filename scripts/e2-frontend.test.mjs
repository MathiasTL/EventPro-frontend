import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const loadDependency = createRequire(import.meta.url);
const testDirectory = path.dirname(fileURLToPath(import.meta.url));

// Compile the production modules in memory; mock only the HTTP/session boundaries.
function load(file, mocks = {}) {
  const filename = path.resolve(testDirectory, "..", file);
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const compiledModule = { exports: {} };
  new Function("require", "module", "exports", source)(name => {
    if (name in mocks) return mocks[name];
    return loadDependency(name);
  }, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}

test("URL pagination rejects fractions, negatives, overflow and nonnumeric values", () => {
  const { parsePage } = load("src/shared/lib/pagination.ts");
  for (const invalid of [null, undefined, "", "0", "-2", "1.5", "Infinity", "1e2", "9007199254740992"]) assert.equal(parsePage(invalid), 1);
  assert.equal(parsePage("12"), 12);
});

test("role guard never mounts protected content for unauthorized or missing sessions", () => {
  for (const user of [null, { role: "OPERADOR" }, { role: "ENCARGADO" }]) {
    const { RequireRole } = load("src/app/routes/RequireRole.tsx", { "@/app/providers/AuthProvider": { useAuth: () => ({ user, ready: true }) } });
    let mounted = false;
    function Protected() { mounted = true; return React.createElement("p", null, "Private"); }
    renderToStaticMarkup(React.createElement(RequireRole, { roles: ["SUPERADMIN"] }, React.createElement(Protected)));
    assert.equal(mounted, false);
  }
});

test("role guard renders protected content for an allowed role", () => {
  const { RequireRole } = load("src/app/routes/RequireRole.tsx", { "@/app/providers/AuthProvider": { useAuth: () => ({ user: { role: "SUPERADMIN" }, ready: true }) } });
  assert.match(renderToStaticMarkup(React.createElement(RequireRole, { roles: ["SUPERADMIN"] }, "Private")), /Private/);
});

test("user API preserves filters and uses the backend create/update contracts", async () => {
  const calls = [];
  const api = load("src/entities/user/api.ts", { "@/shared/api/client": { apiFetch: async (...args) => { calls.push(args); return { items: [], total: 0 }; } } });
  await api.listUsers("role=OPERADOR&is_active=false&page=2");
  await api.getUser("user-id");
  const created = { full_name: "Ana Perez", email: "ana@example.com", phone: "+51987654321", role: "OPERADOR", password: "test-only-password" };
  await api.createUser(created);
  await api.updateUser("user-id", { is_active: false });
  assert.deepEqual(calls, [
    ["/users?role=OPERADOR&is_active=false&page=2"], ["/users/user-id"],
    ["/users", { method: "POST", body: created }], ["/users/user-id", { method: "PATCH", body: { is_active: false } }],
  ]);
});

test("audit reader uses its own paginated endpoint without querying restricted users", async () => {
  const calls = [];
  const api = load("src/entities/audit-log/api.ts", { "@/shared/api/client": { apiFetch: async (...args) => { calls.push(args); return { items: [], total: 0 }; } } });
  await api.listAuditLogs("action=USER_UPDATED&from_date=2026-10-01&page=1&page_size=20");
  assert.deepEqual(calls, [["/audit-logs?action=USER_UPDATED&from_date=2026-10-01&page=1&page_size=20"]]);
});

