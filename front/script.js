import { YIN } from "https://esm.sh/pitchfinder";

// Variables globales
let audioContext;
let analyser;
let detectPitch;
let isRunning = false;
let currentStringId = null; // Ej: "peg-E2"
let targetNoteName = null;  // Ej: "E2"

// Control de flujo de red
let isWaitingForResponse = false; // Evita saturar el servidor

// Elementos del DOM
const btnAction = document.getElementById('btn-action');
const noteDisplay = document.getElementById('note-display');
const hzDisplay = document.getElementById('hz-display');
const needle = document.getElementById('needle');
const pegs = document.querySelectorAll('.peg-btn');

// --- 1. SELECCIÓN DE CUERDA ---
// Ya no necesitamos las frecuencias aquí, solo el nombre de la nota para enviarla al Back
window.selectString = (id) => {
    // El ID viene como "peg-E2", extraemos "E2"
    const noteName = id.replace('peg-', '');
    
    targetNoteName = noteName;
    currentStringId = id;

    // Actualizar botones visualmente
    pegs.forEach(p => {
        p.classList.remove('selected');
        p.classList.remove('tuned');
    });
    
    const selectedPeg = document.getElementById(id);
    if(selectedPeg) selectedPeg.classList.add('selected');

    // UI Reset
    noteDisplay.textContent = noteName;
    hzDisplay.textContent = "Esperando señal...";
    updateNeedleVisuals(0, false); // Aguja al centro o caída
};

// --- 2. ACTIVAR MICRÓFONO ---
btnAction.addEventListener('click', startMic);

async function startMic() {
    if (isRunning) return;

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048; 
        source.connect(analyser);

        detectPitch = YIN({ sampleRate: audioContext.sampleRate });

        isRunning = true;
        btnAction.textContent = "ESCUCHANDO...";
        btnAction.disabled = true;

        detectLoop();
    } catch (err) {
        console.error(err);
        alert("Error de micrófono (necesitas HTTPS o localhost)");
    }
}

// --- 3. BUCLE DE DETECCIÓN ---
function detectLoop() {
    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    // Obtenemos Hz crudos
    const frequency = detectPitch(buffer);

    // Si hay sonido y el usuario seleccionó una nota
    if (frequency && targetNoteName) {
        hzDisplay.textContent = `${frequency.toFixed(1)} Hz`;

        // ENVIAR AL BACKEND (Solo si no estamos esperando una respuesta anterior)
        if (!isWaitingForResponse) {
            askBackendForTuning(frequency, targetNoteName);
        }
    }

    requestAnimationFrame(detectLoop);
}

// --- 4. COMUNICACIÓN CON EL BACKEND ---
async function askBackendForTuning(currentHz, targetNote) {
    isWaitingForResponse = true; // Bloqueamos nuevas peticiones

    // Estructura del Body que pides
    const payload = {
        hz: currentHz,
        nota: targetNote
    };

    try {
        // Reemplaza con la URL real de tu Quarkus
        const response = await fetch('http://localhost:8080/afinador', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            // El backend debe devolver algo como:
            // { "rotation": -15, "isTuned": false }
            
            updateNeedleVisuals(data.rotation, data.isTuned);
        }

    } catch (error) {
        console.error("Error conectando con backend:", error);
    } finally {
        // Liberamos el bloqueo para permitir la siguiente petición
        // Agregamos un pequeño delay (50ms) para no saturar si el back responde instantáneo
        setTimeout(() => {
            isWaitingForResponse = false;
        }, 50); 
    }
}

// --- 5. ACTUALIZAR INTERFAZ ---
// Esta función ya no calcula nada, solo obedece al backend
function updateNeedleVisuals(rotationDeg, isTuned) {
    // Mover aguja
    needle.style.transform = `rotate(${rotationDeg}deg)`;

    // Colores
    const pegElement = document.getElementById(currentStringId);
    
    if (isTuned) {
        needle.style.backgroundColor = 'var(--accent-green)';
        if(pegElement) pegElement.classList.add('tuned');
    } else {
        needle.style.backgroundColor = 'var(--accent-red)';
        if(pegElement) pegElement.classList.remove('tuned');
    }
}
// ===== TEST CORS =====
window.testCors = async () => {
    try {
        const res = await fetch("http://localhost:8080/afinador/prueba", {
            method: "GET"
        });

        console.log("CORS TEST STATUS:", res.status);
        const text = await res.text();
        console.log("CORS TEST BODY:", text);
    } catch (e) {
        console.error("CORS TEST ERROR:", e);
    }
};
