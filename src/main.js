import "./style.css";
import { localModel, cloudModel } from "./firebase.js";

const LONG_TEXT = 2000; // characters; longer text goes to the cloud
const $ = (id) => document.getElementById(id);

// Decide where a request should run, and say why.
function route(text, privateMode) {
  if (privateMode) return { local: true, why: "You chose to keep this on your device." };
  if (!navigator.onLine) return { local: true, why: "You are offline." };
  if (text.length > LONG_TEXT) return { local: false, why: "Long text: the cloud model handles it better." };
  return { local: true, why: "Short text: runs on your device, free and private." };
}

$("go").addEventListener("click", async () => {
  const text = $("input").value.trim();
  if (!text) { $("output").textContent = "Paste some text first."; return; }

  const plan = route(text, $("private").checked);
  const badge = $("route");
  badge.hidden = false;
  badge.className = "route " + (plan.local ? "local" : "cloud");
  badge.textContent = (plan.local ? "On-device preferred. " : "Cloud. ") + plan.why;

  $("go").disabled = true;
  $("output").textContent = plan.local ? "Working on your device (the first run may download the model)..." : "Working in the cloud...";
  try {
    const model = plan.local ? localModel : cloudModel;
    const result = await model.generateContent(`${$("task").value}:\n\n${text}`);
    // Newer SDK versions may report which path actually ran; use it if present.
    const src = result.response.inferenceSource;
    if (src) badge.textContent += ` (ran: ${src})`;
    $("output").textContent = result.response.text();
  } catch (err) {
    console.error(err);
    $("output").textContent = "Something went wrong: " + (err.message || err) + "\nCheck the README setup steps (Chrome flag, App Check, AI Logic enabled).";
  } finally {
    $("go").disabled = false;
  }
});
