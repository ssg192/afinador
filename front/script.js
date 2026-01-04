import { YIN } from "https://esm.sh/pitchfinder";

// --- CONFIGURACIÓN ---
const MIN_FREQ_GUITARRA = 70;
const MAX_FREQ_GUITARRA = 1200;

// Referencia de frecuencias base (solo para la detección automática del frontend)
const guitarStrings = [
    { id: 'peg-E2', note: 'E2', freq: 82.41 },
    { id: 'peg-A2', note: 'A2', freq: 110.00 },
    { id: 'peg-D3', note: 'D3', freq: 146.83 },
    { id: 'peg-G3', note: 'G3', freq: 196.00 },
    { id: 'peg-B3', note: 'B3', freq: 246.94 },
    { id: 'peg-E4', note: 'E4', freq: 329.63 }
];

// Variables globales
let audioContext;
let analyser;
let detectPitch;
let isRunning = false;

// Estado del afinador
let isAutoMode = true; // Empieza en automático
let manualNoteName = null; 

// Control de flujo de red
let isWaitingForResponse = false; 

// Elementos del DOM
const btnAction = document.getElementById('btn-action');
const noteDisplay = document.getElementById('note-display');
const hzDisplay = document.getElementById('hz-display');
const needle = document.getElementById('needle');
const pegs = document.querySelectorAll('.peg-btn'); // Todos los botones circulares
const btnAuto = document.getElementById('btn-auto'); // El botón Auto

// --- 1. FUNCIONES EXPORTADAS (Para el HTML) ---

// Seleccionar cuerda manualmente
window.selectString = (noteName) => {
    isAutoMode = false;
    manualNoteName = noteName;
    
    // UI: Resaltar botón seleccionado
    updatePegVisuals(`peg-${noteName}`);
    
    // UI: Resetear aguja visualmente
    noteDisplay.textContent = noteName;
    hzDisplay.textContent = "Modo Manual";
    resetNeedle();
};

// Activar modo automático
window.enableAutoMode = () => {
    isAutoMode = true;
    manualNoteName = null;
    
    // UI: Resaltar botón Auto
    updatePegVisuals('btn-auto');
    
    noteDisplay.textContent = "--";
    hzDisplay.textContent = "Modo Auto";
    resetNeedle();
};

// Función auxiliar para iluminar botones
function updatePegVisuals(activeId) {
    // Apagar todos (notas y auto)
    pegs.forEach(p => {
        p.classList.remove('selected');
        p.classList.remove('tuned');
    });
    // El querySelectorAll no agarra el btn-auto si no tiene clase peg-btn,
    // pero como la tiene, debemos asegurarnos de limpiarlo.
    if(btnAuto) {
        btnAuto.classList.remove('selected');
        // btnAuto.classList.remove('tuned'); // El auto no se pone verde, solo azul
    }

    // Encender el activo
    const el = document.getElementById(activeId);
    if(el) el.classList.add('selected');
}

function resetNeedle() {
    needle.style.transform = `rotate(0deg)`;
    needle.style.backgroundColor = 'var(--accent-red)';
}

// --- 2. ACTIVAR MICRÓFONO ---
btnAction.addEventListener('click', startMic);

async function startMic() {
    if (isRunning) return;

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const source = audioContext.createMediaStreamSource(stream);
        
        // --- FILTRO PASA-BAJOS ---
        // Elimina ruido agudo (19000Hz) antes de procesar
        const lowPassFilter = audioContext.createBiquadFilter();
        lowPassFilter.type = "lowpass"; 
        lowPassFilter.frequency.value = 1500; 
        
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 4096; // Alta precisión para bajos
        
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

// --- 3. BUCLE DE DETECCIÓN ---
function detectLoop() {
    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    const frequency = detectPitch(buffer);

    // Filtro Lógico (Solo rango de Guitarra)
    if (frequency && frequency > MIN_FREQ_GUITARRA && frequency < MAX_FREQ_GUITARRA) {
        
        let noteToSend = null;

        if (isAutoMode) {
            // MODO AUTOMÁTICO: Calcular nota más cercana
            const closestString = getClosestString(frequency);
            noteToSend = closestString.note;

            // Iluminamos visualmente la cuerda detectada
            // NOTA: Mantenemos el btnAuto seleccionado también para indicar el modo
            highlightDetectedString(closestString.id);
            
            noteDisplay.textContent = noteToSend;
        } else {
            // MODO MANUAL: Usar la seleccionada
            noteToSend = manualNoteName;
        }

        // Enviar al Backend
        if (!isWaitingForResponse && noteToSend) {
            askBackendForTuning(frequency, noteToSend);
        }

    } 

    requestAnimationFrame(detectLoop);
}

// Encuentra la cuerda más cercana en Hz
function getClosestString(freq) {
    return guitarStrings.reduce((prev, curr) => {
        return (Math.abs(curr.freq - freq) < Math.abs(prev.freq - freq) ? curr : prev);
    });
}

// Ilumina la clavija detectada en Auto sin apagar el botón Auto
function highlightDetectedString(idToHighlight) {
    // Limpiamos solo las clavijas de letras
    pegs.forEach(p => {
        if (p.id !== 'btn-auto') {
            p.classList.remove('selected');
            p.classList.remove('tuned');
        }
    });

    const el = document.getElementById(idToHighlight);
    if(el) el.classList.add('selected');
}

// --- 4. COMUNICACIÓN BACKEND ---
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
            updateNeedleVisuals(data, targetNote);
        }

    } catch (error) {
        // Ignorar errores de red temporales
    } finally {
        setTimeout(() => {
            isWaitingForResponse = false;
        }, 50); 
    }
}

// --- 5. ACTUALIZAR UI ---
function updateNeedleVisuals(data, currentNote) {
    const { cents, afinado, subir, bajar, hz } = data;

    // Clamping visual (Max 45 grados)
    let rotation = cents;
    if (rotation > 45) rotation = 45;
    if (rotation < -45) rotation = -45;

    needle.style.transform = `rotate(${rotation}deg)`;

    const pegElement = document.getElementById(`peg-${currentNote}`);
    let displayText = `${hz.toFixed(1)} Hz`;

    if (afinado) {
        needle.style.backgroundColor = 'var(--accent-green)';
        
        // Iluminar verde la clavija correspondiente
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