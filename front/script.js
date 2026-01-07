import { YIN } from "https://esm.sh/pitchfinder";

// --- CONFIGURACIÓN ---
const MIN_FREQ_GUITARRA = 70;
const MAX_FREQ_GUITARRA = 1200;

// ¡ADIÓS ARRAY DE FRECUENCIAS! Ya no es necesario en el front.

// Variables globales
let audioContext;
let analyser;
let detectPitch;
let isRunning = false;

// Estado del afinador
let isAutoMode = true; 
let manualNoteName = null; 

// Control de flujo de red
let isWaitingForResponse = false; 

// Elementos del DOM
const btnAction = document.getElementById('btn-action');
const noteDisplay = document.getElementById('note-display');
const hzDisplay = document.getElementById('hz-display');
const needle = document.getElementById('needle');
const pegs = document.querySelectorAll('.peg-btn'); 
const btnAuto = document.getElementById('btn-auto'); 

// --- 1. MODO MANUAL ---
window.selectString = (noteName) => {
    isAutoMode = false;
    manualNoteName = noteName;
    
    // UI: Resaltar botón seleccionado
    highlightPeg(`peg-${noteName}`);
    
    noteDisplay.textContent = noteName;
    hzDisplay.textContent = "Modo Manual";
    resetNeedle();
};

// --- 2. MODO AUTOMÁTICO ---
window.enableAutoMode = () => {
    isAutoMode = true;
    manualNoteName = null;
    
    // UI: Resaltar botón Auto
    highlightPeg('btn-auto');
    
    noteDisplay.textContent = "--";
    hzDisplay.textContent = "Modo Auto";
    resetNeedle();
};

// Función auxiliar visual para iluminar botones
function highlightPeg(elementId) {
    // Apagar todos
    pegs.forEach(p => {
        p.classList.remove('selected');
        p.classList.remove('tuned');
    });
    if(btnAuto) {
        btnAuto.classList.remove('selected');
    }

    // Encender el objetivo
    const el = document.getElementById(elementId);
    if(el) el.classList.add('selected');
}

function resetNeedle() {
    needle.style.transform = `rotate(0deg)`;
    needle.style.backgroundColor = 'var(--accent-red)';
}

// --- 3. ACTIVAR MICRÓFONO ---
btnAction.addEventListener('click', startMic);

async function startMic() {
    if (isRunning) return;

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const source = audioContext.createMediaStreamSource(stream);
        
        const lowPassFilter = audioContext.createBiquadFilter();
        lowPassFilter.type = "lowpass"; 
        lowPassFilter.frequency.value = 1500; 
        
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 4096; 
        
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

// --- 4. BUCLE DE DETECCIÓN ---
function detectLoop() {
    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    const frequency = detectPitch(buffer);

    // Filtro para ignorar ruidos extremos
    if (frequency && frequency > MIN_FREQ_GUITARRA && frequency < MAX_FREQ_GUITARRA) {
        
        // --- AQUÍ ESTÁ EL CAMBIO CLAVE ---
        if (!isWaitingForResponse) {
            
            if (isAutoMode) {
                // MODO AUTO: Mandamos Hz y nota NULL. El back decidirá.
                askBackendForTuning(frequency, null);
            } else {
                // MODO MANUAL: Mandamos Hz y la nota forzada.
                askBackendForTuning(frequency, manualNoteName);
            }
        }
    } 

    requestAnimationFrame(detectLoop);
}

// --- 5. COMUNICACIÓN BACKEND ---
async function askBackendForTuning(currentHz, targetNote) {
    isWaitingForResponse = true;

    // Si targetNote es null, el JSON enviará "nota": null
    const payload = {
        hz: currentHz,
        nota: targetNote 
    };

    try {
        const response = await fetch('afinador-api-production.up.railway.app/afinador', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            // data contiene ahora la nota que el backend calculó (ej: "nota": "E2")
            updateNeedleVisuals(data);
        }

    } catch (error) {
        // Ignorar
    } finally {
        setTimeout(() => {
            isWaitingForResponse = false;
        }, 50); 
    }
}

// --- 6. ACTUALIZAR UI CON DATOS DEL BACKEND ---
function updateNeedleVisuals(data) {
    // Desestructuramos lo que manda el backend
    // IMPORTANTE: 'nota' es la cuerda que el backend detectó (ej: "A2")
    const { cents, afinado, subir, bajar, hz, nota } = data;

    // 1. Si estamos en modo Auto, actualizamos la interfaz para mostrar
    // qué nota decidió el backend que estamos tocando.
    if (isAutoMode && nota) {
        // Construimos el ID (ej: "peg-" + "A2" = "peg-A2")
        const detectedPegId = `peg-${nota}`;
        
        // Iluminamos ese botón. 
        // Nota: Mantenemos el btnAuto encendido para saber el modo.
        highlightPeg(detectedPegId);
        if(btnAuto) btnAuto.classList.add('selected');

        // Actualizamos la letra gigante
        noteDisplay.textContent = nota;
    }

    // 2. Lógica de la Aguja (Clamping)
    let rotation = cents;
    if (rotation > 45) rotation = 45;
    if (rotation < -45) rotation = -45;

    needle.style.transform = `rotate(${rotation}deg)`;

    // 3. Colores y Textos
    // Buscamos el botón de la nota actual para pintarlo verde si está afinado
    const currentPegId = isAutoMode ? `peg-${nota}` : `peg-${manualNoteName}`;
    const pegElement = document.getElementById(currentPegId);
    
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