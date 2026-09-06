/* ==========================================================================
   API Service Layer - CNN Road Damage Classification
   ========================================================================== */

const API_CONFIG = {
    // TOGGLE THIS TO FALSE TO CONNECT TO FLASK / FASTAPI BACKEND
    USE_MOCK: false,

    // Backend endpoint URL
   API_URL: 'https://road-damage-classification-5.onrender.com/predict',

    // Inference latency simulation in ms (for realistic UI loader feedback)
    MOCK_DELAY_MS: 900
};

/**
 * Main prediction trigger function.
 * @param {File|string} fileOrSample - File object or sample identifier ('crack', 'manhole', 'pothole')
 * @returns {Promise<Object>} Prediction output object matching backend JSON contract
 */
async function classifyRoadImage(fileOrSample) {
    if (API_CONFIG.USE_MOCK) {
        return await simulateMockInference(fileOrSample);
    } else {
        return await sendToBackendAPI(fileOrSample);
    }
}

/**
 * Simulates AI model inference when running in standalone frontend mode
 */
async function simulateMockInference(inputData) {
    // Artificial latency for realistic neural network calculation experience
    await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_DELAY_MS));

    let sampleType = 'pothole'; // default fallback

    if (typeof inputData === 'string') {
        sampleType = inputData.toLowerCase();
    } else if (inputData && inputData.name) {
        const fname = inputData.name.toLowerCase();
        if (fname.includes('crack')) sampleType = 'crack';
        else if (fname.includes('manhole')) sampleType = 'manhole';
        else if (fname.includes('pothole')) sampleType = 'pothole';
        else {
            // Pick based on hash of filename
            const hash = fname.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const types = ['crack', 'manhole', 'pothole'];
            sampleType = types[hash % types.length];
        }
    }

    let result = {};

    if (sampleType === 'crack') {
        const crackProb = parseFloat((0.85 + Math.random() * 0.11).toFixed(3)); // 85% - 96%
        const manholeProb = parseFloat(((1 - crackProb) * 0.6).toFixed(3));
        const potholeProb = parseFloat((1 - crackProb - manholeProb).toFixed(3));

        result = {
            class: 'Crack',
            confidence: crackProb,
            status: 'Surface Degradation',
            adviceTitle: 'Sealing Maintenance Advised',
            adviceText: 'Fissure cracking detected. Schedule preventative bitumen sealing to block water ingress before freeze-thaw cycles worsen structural integrity.',
            probabilities: {
                Crack: crackProb,
                Manhole: manholeProb,
                Pothole: potholeProb
            }
        };
    } else if (sampleType === 'manhole') {
        const manholeProb = parseFloat((0.88 + Math.random() * 0.09).toFixed(3)); // 88% - 97%
        const crackProb = parseFloat(((1 - manholeProb) * 0.5).toFixed(3));
        const potholeProb = parseFloat((1 - manholeProb - crackProb).toFixed(3));

        result = {
            class: 'Manhole',
            confidence: manholeProb,
            status: 'Utility Infrastructure',
            adviceTitle: 'Standard Infrastructure Logged',
            adviceText: 'Utility manhole access cover identified. Rim elevation alignment is optimal. No emergency road surface repair required.',
            probabilities: {
                Crack: crackProb,
                Manhole: manholeProb,
                Pothole: potholeProb
            }
        };
    } else { // Pothole
        const potholeProb = parseFloat((0.91 + Math.random() * 0.07).toFixed(3)); // 91% - 98%
        const crackProb = parseFloat(((1 - potholeProb) * 0.65).toFixed(3));
        const manholeProb = parseFloat((1 - potholeProb - crackProb).toFixed(3));

        result = {
            class: 'Pothole',
            confidence: potholeProb,
            status: 'High Hazard Defect',
            adviceTitle: 'Immediate Patch Work Required',
            adviceText: 'Severe asphalt cavity detected. High risk of vehicle tire blowout or suspension damage. Dispatch emergency road crew for asphalt patching.',
            probabilities: {
                Crack: crackProb,
                Manhole: manholeProb,
                Pothole: potholeProb
            }
        };
    }

    return result;
}

/**
 * Sends actual multipart HTTP POST request to Python Flask/FastAPI backend
 */
async function sendToBackendAPI(fileObject) {
    if (!(fileObject instanceof File)) {
        throw new Error('In API Mode, a valid image file must be uploaded.');
    }

    const formData = new FormData();

    // Must match the FastAPI parameter name: file
    formData.append('file', fileObject);

    const response = await fetch(API_CONFIG.API_URL, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Server returned status code ${response.status}`);
    }

    const data = await response.json();

    const predictedClass = data.predicted_class;
    const confidence = data.probabilities[predictedClass];

    return {
        class: predictedClass,
        confidence: confidence,

        status:
            predictedClass === 'Pothole'
                ? 'High Hazard Defect'
                : predictedClass === 'Crack'
                ? 'Surface Degradation'
                : 'Utility Infrastructure',

        adviceTitle: `${predictedClass} Classification Logged`,

        adviceText: `CNN model identified ${predictedClass} with ${(confidence * 100).toFixed(1)}% confidence.`,

        probabilities: data.probabilities
    };
}