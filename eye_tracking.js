const saveDataButton = document.getElementById('saveDataButton');
const calibrateButton = document.getElementById('calibrateButton');
const videoElement = document.getElementById('local-video'); // Assicurati di avere l'elemento video
let eyeTrackingData = []; // Array per memorizzare i dati di tracciamento
let calibrationActive = false;

// Funzione per inizializzare WebGazer e il tracciamento oculare
async function initializeEyeTracking() {
    try {
        await webgazer.setRegression('ridge')
            .setTracker('clmtrackr')
            .begin();

        // Listener per i dati di tracciamento
        webgazer.setGazeListener((data, elapsedTime) => {
            if (data == null || calibrationActive) return;

            // Cattura le coordinate degli occhi e il tempo
            const viewportWidth = window.innerWidth; // Ottieni la larghezza del viewport
            const videoWidth = videoElement.clientWidth; // Ottieni la larghezza del video
            let x = data.x;
            let y = data.y;

            // Inverti la coordinata X per compensare la fotocamera specchiata
            x = viewportWidth - x;

            // Normalizza le coordinate in base alla larghezza del video
            x = (x / viewportWidth) * videoWidth;
            y = (y / window.innerHeight) * videoElement.clientHeight;

            // Salva le coordinate e il tempo
            eyeTrackingData.push({
                timestamp: elapsedTime,
                x: x,
                y: y
            });

            // Debug: Stampa i dati di tracciamento in console
            console.log(`Timestamp: ${elapsedTime}, X: ${x}, Y: ${y}`);
        });
    } catch (error) {
        console.error("Errore nell'inizializzazione di WebGazer:", error);
    }
}

// Funzione per attivare la calibrazione
function startCalibration() {
    calibrationActive = true;
    alert("Inizia a guardare i punti sullo schermo per la calibrazione.");

    // Calcola le dimensioni del video
    const videoWidth = videoElement.clientWidth;
    const videoHeight = videoElement.clientHeight;

    // Punti di calibrazione sugli spigoli del video
    const points = [
        { x: 0, y: 0 }, // In alto a sinistra
        { x: videoWidth, y: 0 }, // In alto a destra
        { x: videoWidth, y: videoHeight }, // In basso a destra
        { x: 0, y: videoHeight }, // In basso a sinistra
        { x: videoWidth / 2, y: videoHeight / 2 } // Centro
    ];

    let currentPoint = 0;
    const calibrationDot = document.createElement('div');
    calibrationDot.id = 'calibrationDot';
    document.body.appendChild(calibrationDot);

    // Funzione per spostare il punto di calibrazione
    function moveCalibrationDot() {
        if (currentPoint < points.length) {
            calibrationDot.style.left = `${points[currentPoint].x + videoElement.getBoundingClientRect().left}px`;
            calibrationDot.style.top = `${points[currentPoint].y + videoElement.getBoundingClientRect().top}px`;
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

    // Muovi il punto ogni 2000 millisecondi (2 secondi)
    moveCalibrationDot();
    const calibrationInterval = setInterval(() => {
        if (!calibrationActive) {
            clearInterval(calibrationInterval);
        } else {
            moveCalibrationDot();
        }
    }, 2000); // Cambiato a 2000 ms
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
