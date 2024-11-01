const saveDataButton = document.getElementById('saveDataButton');
const calibrateButton = document.getElementById('calibrateButton');
let eyeTrackingData = []; // Array per memorizzare i dati di tracciamento
let calibrationActive = false;

// Funzione per inizializzare WebGazer e il tracciamento oculare
async function initializeEyeTracking() {
    await webgazer.setRegression('ridge')
        .setTracker('clmtrackr')
        .begin()
        .showPredictionPoints(false); // Disabilita i punti di debug per non distrarre l'utente

    // Listener per i dati di tracciamento
    webgazer.setGazeListener((data, elapsedTime) => {
        if (data == null || calibrationActive) return;
        
        // Cattura le coordinate degli occhi e il tempo
        const x = data.x;
        const y = data.y;
        
        // Salva le coordinate e il tempo
        eyeTrackingData.push({
            timestamp: elapsedTime,
            x: x,
            y: y
        });
    });
}

// Funzione per attivare la calibrazione
function startCalibration() {
    calibrationActive = true;
    alert("Inizia a guardare i punti sullo schermo per la calibrazione.");

    // Esempio di posizioni di calibrazione
    const points = [
        { x: 100, y: 100 }, { x: 540, y: 100 }, { x: 320, y: 240 },
        { x: 100, y: 380 }, { x: 540, y: 380 }
    ];

    let currentPoint = 0;
    const calibrationDot = document.createElement('div');
    calibrationDot.id = 'calibrationDot';
    document.body.appendChild(calibrationDot);

    // Funzione per spostare il punto di calibrazione
    function moveCalibrationDot() {
        if (currentPoint < points.length) {
            calibrationDot.style.left = `${points[currentPoint].x}px`;
            calibrationDot.style.top = `${points[currentPoint].y}px`;
            currentPoint++;
        } else {
            // Fine della calibrazione
            document.body.removeChild(calibrationDot);
            calibrationActive = false;
            alert("Calibrazione completata! Ora inizia il tracciamento del video.");
        }
    }

    calibrationDot.style.position = 'absolute';
    calibrationDot.style.width = '20px';
    calibrationDot.style.height = '20px';
    calibrationDot.style.backgroundColor = 'red';
    calibrationDot.style.borderRadius = '50%';
    calibrationDot.style.zIndex = '10';
    
    // Muovi il punto ogni secondo
    moveCalibrationDot();
    const calibrationInterval = setInterval(() => {
        if (!calibrationActive) {
            clearInterval(calibrationInterval);
        } else {
            moveCalibrationDot();
        }
    }, 1000);
}

// Assegna la funzione di calibrazione al pulsante
calibrateButton.addEventListener("click", startCalibration);

// Funzione per salvare i dati su un file CSV
function saveDataToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,Time,X,Y\n";
    eyeTrackingData.forEach(entry => {
        csvContent += `${entry.timestamp},${entry.x},${entry.y}\n`;
    });

    // Crea un link per scaricare il file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "eye_tracking_data.csv");
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
}

// Assegna la funzione al pulsante per salvare i dati
saveDataButton.addEventListener("click", saveDataToCSV);

// Avvia il tracciamento al caricamento della pagina
initializeEyeTracking();
