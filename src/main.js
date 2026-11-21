import "./style.css";
import { localModel, cloudModel } from "./firebase.js";

const LONG_TEXT = 2000; // characters; longer text goes to the cloud
const $ = (id) => document.getElementById(id);
const runs = [];

// Decide where a request should run, and say why.
function route(text, privateMode) {
  if (privateMode) return { local: true, why: "You chose to keep this on your device." };
  if (!navigator.onLine) return { local: true, why: "You are offline." };
  if (text.length > LONG_TEXT) return { local: false, why: "Long text: the cloud model handles it better." };
  return { local: true, why: "Short text: runs on your device, free and private." };
}

function renderNet() {
  const el = $("net");
  el.textContent = navigator.onLine ? "Online" : "Offline: on-device only";
  el.className = "net" + (navigator.onLine ? "" : " off");
}
window.addEventListener("online", renderNet);
window.addEventListener("offline", renderNet);
renderNet();

function renderLog() {
  $("log").innerHTML = runs
    .slice(-6).reverse()
    .map((r) => `<li><span class="dot ${r.path}"></span>${r.path === "local" ? "On-device" : "Cloud"} · ${r.chars} chars · ${r.secs}s</li>`)
    .join("");
}

$("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("output").textContent);
    $("copy").textContent = "Copied";
    setTimeout(() => ($("copy").textContent = "Copy result"), 1500);
  } catch { /* clipboard may be blocked; ignore */ }
});

$("go").addEventListener("click", async () => {
  const text = $("input").value.trim();
  if (!text) { $("output").textContent = "Paste some text first."; return; }

  const plan = route(text, $("private").checked);
  const badge = $("route");
  badge.hidden = false;
  badge.className = "route " + (plan.local ? "local" : "cloud");
  badge.textContent = (plan.local ? "On-device preferred. " : "Cloud. ") + plan.why;

  $("go").disabled = true;
  $("copy").hidden = true;
  $("output").textContent = plan.local ? "Working on your device (the first run may download the model)..." : "Working in the cloud...";
  const t0 = performance.now();
  try {
    const model = plan.local ? localModel : cloudModel;
    const result = await model.generateContent(`${$("task").value}:\n\n${text}`);
    const secs = ((performance.now() - t0) / 1000).toFixed(1);
    // The SDK reports which path actually ran; fall back to our plan if it does not.
    const src = String(result.response.inferenceSource || "").toLowerCase();
    const path = src ? (src.includes("cloud") ? "cloud" : "local") : plan.local ? "local" : "cloud";
    badge.className = "route " + path;
    badge.textContent += ` Ran ${path === "local" ? "on-device" : "in the cloud"} in ${secs}s.`;
    runs.push({ path, chars: text.length, secs });
    renderLog();
    $("output").textContent = result.response.text();
    $("copy").hidden = false;
  } catch (err) {
    console.error(err);
    $("output").textContent = "Something went wrong: " + (err.message || err);
  } finally {
    $("go").disabled = false;
  }
});