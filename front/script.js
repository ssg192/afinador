import { YIN } from "https://esm.sh/pitchfinder";

// Variables globales
let audioContext;
let analyser;
let detectPitch;
let isRunning = false;
let currentStringId = null; 
let targetNoteName = null; 

// Control de flujo de red
let isWaitingForResponse = false; 

// Elementos del DOM
const btnAction = document.getElementById('btn-action');
const noteDisplay = document.getElementById('note-display');
const hzDisplay = document.getElementById('hz-display');
const needle = document.getElementById('needle');
const pegs = document.querySelectorAll('.peg-btn');

// --- NUEVO: CONSTANTES DE RANGO DE GUITARRA ---
// La guitarra estandar va de ~82Hz (E2) a ~330Hz (E4). 
// Damos un margen (70Hz - 1000Hz) para armónicos, pero ignoramos 19000Hz.
const MIN_FREQ_GUITARRA = 70;
const MAX_FREQ_GUITARRA = 1200;

// --- 1. SELECCIÓN DE CUERDA ---
window.selectString = (id) => {
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
    needle.style.transform = `rotate(0deg)`;
    needle.style.backgroundColor = 'var(--accent-red)';
};

// --- 2. ACTIVAR MICRÓFONO CON FILTRO DE RUIDO ---
btnAction.addEventListener('click', startMic);

async function startMic() {
    if (isRunning) return;

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const source = audioContext.createMediaStreamSource(stream);
        
        // --- NUEVO: FILTRO PASA-BAJOS (LOW PASS FILTER) ---
        // Esto elimina físicamente el silbido agudo o ruido estático antes de analizarlo.
        const lowPassFilter = audioContext.createBiquadFilter();
        lowPassFilter.type = "lowpass"; 
        lowPassFilter.frequency.value = 1500; // Cortamos todo lo que sea mayor a 1500Hz
        
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 4096; // Aumenté a 4096 para mayor precisión en graves
        
        // Conexión: Micrófono -> Filtro -> Analizador
        source.connect(lowPassFilter);
        lowPassFilter.connect(analyser);

        detectPitch = YIN({ sampleRate: audioContext.sampleRate });

        isRunning = true;
        btnAction.textContent = "ESCUCHANDO...";
        btnAction.disabled = true;

        detectLoop();
    } catch (err) {
        console.error(err);
        alert("Error: No se pudo acceder al micrófono.");
    }
}

// --- 3. BUCLE DE DETECCIÓN INTELIGENTE ---
function detectLoop() {
    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    const frequency = detectPitch(buffer);

    // --- NUEVO: FILTRO LÓGICO ---
    // Solo procesamos si hay frecuencia Y si está dentro del rango real de una guitarra
    if (frequency && frequency > MIN_FREQ_GUITARRA && frequency < MAX_FREQ_GUITARRA) {
        
        if (targetNoteName) {
            // Solo enviamos al back si la señal es válida
            if (!isWaitingForResponse) {
                askBackendForTuning(frequency, targetNoteName);
            }
        } else {
            // Si no ha seleccionado nota, solo mostramos Hz
             hzDisplay.textContent = `${frequency.toFixed(1)} Hz`;
        }

    } else {
        // Si detecta silencio o ruido (19000Hz), no hacemos nada o limpiamos
        // Esto evita que la aguja salte locamente.
    }

    requestAnimationFrame(detectLoop);
}

// --- 4. COMUNICACIÓN CON EL BACKEND ---
async function askBackendForTuning(currentHz, targetNote) {
    isWaitingForResponse = true;

    const payload = {
        hz: currentHz,
        nota: targetNote
    };

    try {
        const response = await fetch('http://localhost:8080/afinador', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            updateNeedleVisuals(data);
        }

    } catch (error) {
        // Ignoramos errores de conexión en consola para no ensuciar
    } finally {
        setTimeout(() => {
            isWaitingForResponse = false;
        }, 50); 
    }
}

// --- 5. ACTUALIZAR INTERFAZ ---
function updateNeedleVisuals(data) {
    const { cents, afinado, subir, bajar, hz } = data;

    // Clamping visual (Límite de aguja)
    let rotation = cents;
    if (rotation > 45) rotation = 45;
    if (rotation < -45) rotation = -45;

    needle.style.transform = `rotate(${rotation}deg)`;

    const pegElement = document.getElementById(currentStringId);
    let displayText = `${hz.toFixed(1)} Hz`;

    if (afinado) {
        needle.style.backgroundColor = 'var(--accent-green)';
        if(pegElement) pegElement.classList.add('tuned');
        displayText += " ¡OK!";
        hzDisplay.style.color = "var(--accent-green)";
    } else {
        needle.style.backgroundColor = 'var(--accent-red)';
        if(pegElement) pegElement.classList.remove('tuned');
        hzDisplay.style.color = "#888"; 

        if (subir) displayText += " ▲";
        else if (bajar) displayText += " ▼";
    }

    hzDisplay.textContent = displayText;
}