const phrases = {
  "Saludos": ["Hola, ¿cómo estás?", "Buenos días.", "Gracias.", "Hasta luego."],
  "Ayuda": ["Necesito ayuda, por favor.", "Por favor, escribe lo que dices.", "No puedo escuchar bien.", "Tengo dificultad para hablar."],
  "Salud": ["Necesito ir al hospital.", "Me siento mal.", "Necesito mis medicamentos."],
  "Transporte": ["¿Dónde queda la parada?", "¿Cuánto cuesta el transporte?", "Necesito llegar a esta dirección."],
  "Emergencias": ["Llame a emergencias, por favor.", "Necesito ayuda inmediatamente."]
};

const $ = (selector) => document.querySelector(selector);
const screens = [...document.querySelectorAll(".screen")];
const tabs = [...document.querySelectorAll(".tab")];

function showScreen(name) {
  screens.forEach((screen) => screen.classList.toggle("active", screen.id === name));
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.screen === name));
}

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.go));
});
tabs.forEach((tab) => tab.addEventListener("click", () => showScreen(tab.dataset.screen)));

const recognition = "SpeechRecognition" in window
  ? new window.SpeechRecognition()
  : ("webkitSpeechRecognition" in window ? new window.webkitSpeechRecognition() : null);

if (recognition) {
  recognition.lang = "es-CO";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.onstart = () => {
    $("#listening-status").textContent = "Escuchando... habla ahora.";
    $("#start-listening").textContent = "⏹️ Escuchando";
  };
  recognition.onresult = (event) => {
    $("#transcription").value = event.results[0][0].transcript;
    $("#listening-status").textContent = "Transcripción completada.";
  };
  recognition.onerror = (event) => {
    const message = event.error === "not-allowed"
      ? "Permiso de micrófono denegado. Actívalo en la configuración del navegador."
      : "No se pudo reconocer el audio. Intenta hablar nuevamente.";
    $("#listening-status").textContent = message;
  };
  recognition.onend = () => { $("#start-listening").textContent = "🎙️ Iniciar grabación"; };
  $("#start-listening").addEventListener("click", () => recognition.start());
} else {
  $("#start-listening").disabled = true;
  $("#listening-status").textContent = "Este navegador no admite reconocimiento de voz.";
}

$("#clear-transcription").addEventListener("click", () => {
  $("#transcription").value = "";
  $("#listening-status").textContent = "El micrófono está listo.";
});

function speak(text) {
  if (!("speechSynthesis" in window)) {
    $("#speech-status").textContent = "Este navegador no admite síntesis de voz.";
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-CO";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
  $("#speech-status").textContent = "Reproduciendo mensaje.";
}

$("#speak-text").addEventListener("click", () => {
  const text = $("#speech-text").value.trim();
  $("#speech-status").textContent = text ? "" : "Escribe un mensaje antes de reproducirlo.";
  if (text) speak(text);
});
$("#stop-speech").addEventListener("click", () => {
  window.speechSynthesis.cancel();
  $("#speech-status").textContent = "Voz detenida.";
});

const categorySelect = $("#phrase-category");
Object.keys(phrases).forEach((category) => categorySelect.add(new Option(category, category)));
let selectedPhrase = "";

function renderPhrases() {
  const list = $("#phrase-list");
  list.replaceChildren();
  phrases[categorySelect.value].forEach((phrase) => {
    const button = document.createElement("button");
    button.className = "phrase-button";
    button.classList.add("secondary-button");
    button.textContent = phrase;
    button.addEventListener("click", () => {
      selectedPhrase = phrase;
      $("#selected-phrase").textContent = phrase;
      $("#selected-phrase").hidden = false;
      $("#speak-phrase").hidden = false;
    });
    list.appendChild(button);
  });
}
categorySelect.addEventListener("change", renderPhrases);
renderPhrases();
$("#speak-phrase").addEventListener("click", () => speak(selectedPhrase));

const savedFont = localStorage.getItem("fontSize") || "large";
const savedContrast = localStorage.getItem("highContrast") !== "false";
$("#font-size").value = savedFont;
$("#high-contrast").checked = savedContrast;

function applyAccessibility() {
  document.body.classList.remove("font-large", "font-x-large");
  if ($("#font-size").value !== "normal") document.body.classList.add(`font-${$("#font-size").value}`);
  document.body.classList.toggle("high-contrast", $("#high-contrast").checked);
}
$("#font-size").addEventListener("change", () => {
  localStorage.setItem("fontSize", $("#font-size").value);
  applyAccessibility();
});
$("#high-contrast").addEventListener("change", () => {
  localStorage.setItem("highContrast", $("#high-contrast").checked);
  applyAccessibility();
});
applyAccessibility();

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
