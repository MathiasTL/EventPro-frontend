// Verificación del prototipo local. No crea reservas ni registra pagos.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath, pathToFileURL } from "node:url";
let playwright;
try { playwright = await import("playwright"); }
catch { playwright = await import(pathToFileURL(path.join(process.env.USERPROFILE, ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs")).href); }

async function main() {
  const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const env = Object.fromEntries(fs.readFileSync(path.resolve(frontend, "../../eventpro/.env"), "utf8").split(/\r?\n/).filter(line => line.includes("=") && !line.trim().startsWith("#")).map(line => { const index = line.indexOf("="); return [line.slice(0, index), line.slice(index + 1).trim()]; }));
  const candidates = [process.env.EVENTPRO_BROWSER_PATH, playwright.chromium.executablePath(), path.join(process.env.PROGRAMFILES || "C:/Program Files", "Google/Chrome/Application/chrome.exe"), path.join(process.env["PROGRAMFILES(X86)"] || "C:/Program Files (x86)", "Microsoft/Edge/Application/msedge.exe")];
  const executablePath = candidates.find(candidate => candidate && fs.existsSync(candidate));
  if (!executablePath) throw new Error("No hay navegador disponible para la comprobación visual.");
  const browser = await playwright.chromium.launch({ executablePath, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("http://localhost:3002/login");
    await page.getByLabel("Correo").fill(env.SUPERADMIN_EMAIL || "admin@eventpro.pe");
    await page.getByLabel("Contraseña").fill(env.SUPERADMIN_PASSWORD);
    await page.getByRole("button", { name: "Ingresar", exact: true }).click();
    await page.waitForURL("**/panel/catalog");
    await page.getByText("Solicitudes y contratos recientes", { exact: true }).waitFor();
    await page.getByLabel("Nombre del cliente", { exact: true }).fill("DEMO comprobación visual");
    await page.getByLabel("Teléfono del cliente", { exact: true }).fill("+51900000001");
    await page.getByLabel("Dirección del evento", { exact: true }).fill("Local de demostración San Borja");
    await page.getByLabel("Distrito", { exact: true }).fill("San Borja");
    const date = new Date(); date.setDate(date.getDate() + 40);
    await page.getByLabel("Fecha del evento", { exact: true }).fill(date.toISOString().slice(0, 10));
    await page.getByLabel("Hora de inicio (Lima)", { exact: true }).fill("18:00");
    await page.locator('input[name="transport"]').check();
    await page.getByRole("button", { name: "Generar presupuesto", exact: true }).click();
    await page.getByRole("heading", { name: "Presupuesto generado", exact: true }).waitFor({ timeout: 60000 });
    const pdfPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Descargar presupuesto PDF", exact: true }).click();
    const pdf = await pdfPromise;
    assert(pdf.suggestedFilename().endsWith(".pdf"));
    await page.getByRole("button", { name: "Descargar contrato", exact: true }).first().waitFor({ timeout: 60000 });
    const output = path.join(frontend, "demo-artifacts"); fs.mkdirSync(output, { recursive: true });
    await page.screenshot({ path: path.join(output, "panel-desktop.png"), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(output, "panel-mobile.png"), fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, "Hay desbordamiento horizontal en móvil");
    const storedContract = page.getByRole("button", { name: "Descargar contrato", exact: true }).first();
    const contractPromise = page.waitForEvent("download"); await storedContract.click();
    assert((await contractPromise).suggestedFilename().endsWith(".pdf"));
    await page.getByRole("button", { name: "Paquetes", exact: true }).click();
    await page.getByRole("button", { name: "+ Nuevo registro", exact: true }).waitFor();
    await page.getByRole("button", { name: "+ Nuevo registro", exact: true }).click();
    await page.getByRole("dialog").waitFor();
    await page.getByRole("button", { name: "Cancelar", exact: true }).click();
    await page.getByRole("button", { name: "Salir", exact: true }).click();
    await page.waitForURL("**/login");
    assert.deepEqual(errors, []);
    console.log("OK: login, formulario, presupuesto PDF, contrato guardado, modal, móvil y cierre de sesión.");
  } finally { await browser.close(); }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
