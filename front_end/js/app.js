/* ==========================================================================
   Main Application Logic - UI Events & Chart Renderer
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const dropzonePrompt = document.getElementById('dropzonePrompt');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const removeImgBtn = document.getElementById('removeImgBtn');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const fileSizeDisplay = document.getElementById('fileSizeDisplay');
    const inputStatus = document.getElementById('inputStatus');

    const sampleBtns = document.querySelectorAll('.sample-btn');
    const classifyBtn = document.getElementById('classifyBtn');
    const classifyBtnText = document.getElementById('classifyBtnText');
    const btnSpinner = document.getElementById('btnSpinner');

    const resultPlaceholder = document.getElementById('resultPlaceholder');
    const resultContent = document.getElementById('resultContent');

    // Prediction Output Elements
    const predClassName = document.getElementById('predClassName');
    const predStatusTag = document.getElementById('predStatusTag');
    const predConfidenceVal = document.getElementById('predConfidenceVal');
    const predClassIcon = document.getElementById('predClassIcon');
    const predTimestamp = document.getElementById('predTimestamp');

    const crackPct = document.getElementById('crackPct');
    const crackBar = document.getElementById('crackBar');
    const manholePct = document.getElementById('manholePct');
    const manholeBar = document.getElementById('manholeBar');
    const potholePct = document.getElementById('potholePct');
    const potholeBar = document.getElementById('potholeBar');

    const adviceTitle = document.getElementById('adviceTitle');
    const adviceText = document.getElementById('adviceText');

    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');

    // --- State Variables ---
    let currentSelectedFile = null;
    let currentSampleType = null;
    let probChartInstance = null;

    // Preset Sample Image URLs mapping
    const sampleUrls = {
        crack: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
        manhole: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
        pothole: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
    };

    // --- Mobile Menu Navigation ---
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    // --- File Dropzone & Input Handling ---
    dropzone.addEventListener('click', (e) => {
        // Prevent trigger if clicking remove image button
        if (e.target.closest('#removeImgBtn')) return;
        fileInput.click();
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-active');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag-active');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-active');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelected(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelected(e.target.files[0]);
        }
    });

    removeImgBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetInputSelection();
    });

    // Handle File Selection
    function handleFileSelected(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
            return;
        }

        currentSelectedFile = file;
        currentSampleType = null;

        // Clear active sample buttons
        sampleBtns.forEach(btn => btn.classList.remove('active'));

        // Render preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            dropzonePrompt.classList.add('hidden');
            previewContainer.classList.remove('hidden');

            fileNameDisplay.textContent = file.name;
            fileSizeDisplay.textContent = formatBytes(file.size);
            inputStatus.textContent = 'Image Ready';

            classifyBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    // --- Sample Preset Selection ---
    sampleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const sample = btn.getAttribute('data-sample');

            sampleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentSampleType = sample;
            currentSelectedFile = null;

            // Load sample preview image
            imagePreview.src = sampleUrls[sample];
            dropzonePrompt.classList.add('hidden');
            previewContainer.classList.remove('hidden');

            fileNameDisplay.textContent = `sample_${sample}.jpg`;
            fileSizeDisplay.textContent = 'Preset Test Sample';
            inputStatus.textContent = 'Sample Loaded';

            classifyBtn.disabled = false;
        });
    });

    // Reset Dropzone & Input State
    function resetInputSelection() {
        currentSelectedFile = null;
        currentSampleType = null;
        fileInput.value = '';

        sampleBtns.forEach(btn => btn.classList.remove('active'));

        imagePreview.src = '';
        previewContainer.classList.add('hidden');
        dropzonePrompt.classList.remove('hidden');

        inputStatus.textContent = 'Waiting for image';
        classifyBtn.disabled = true;
    }

    // Utility: Format File Bytes
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // --- Classification Trigger Action ---
    classifyBtn.addEventListener('click', async () => {
        const inputData = currentSelectedFile || currentSampleType;
        if (!inputData) return;

        // UI Loading State
        setLoadingState(true);

        try {
            // Call API Service function from js/api.js
            const response = await classifyRoadImage(inputData);
            displayResults(response);
        } catch (error) {
            console.error('Classification Error:', error);
            alert(`Classification failed: ${error.message}`);
        } finally {
            setLoadingState(false);
        }
    });

    function setLoadingState(isLoading) {
        if (isLoading) {
            classifyBtn.disabled = true;
            classifyBtnText.textContent = 'Running CNN Model...';
            btnSpinner.classList.remove('hidden');
        } else {
            classifyBtn.disabled = false;
            classifyBtnText.textContent = 'Classify Image';
            btnSpinner.classList.add('hidden');
        }
    }

    // --- Display Results & Chart ---
    function displayResults(data) {
        resultPlaceholder.classList.add('hidden');
        resultContent.classList.remove('hidden');

        // Top Class Card
        predClassName.textContent = data.class;
        predStatusTag.textContent = data.status;
        predConfidenceVal.textContent = `${(data.confidence * 100).toFixed(1)}%`;
        predTimestamp.textContent = new Date().toLocaleTimeString();

        // Icon & Colors setup
        if (data.class === 'Crack') {
            predClassIcon.style.background = 'var(--color-crack)';
            predClassIcon.innerHTML = '<i class="fa-solid fa-bolt"></i>';
        } else if (data.class === 'Manhole') {
            predClassIcon.style.background = 'var(--color-manhole)';
            predClassIcon.innerHTML = '<i class="fa-solid fa-circle-dot"></i>';
        } else { // Pothole
            predClassIcon.style.background = 'var(--color-pothole)';
            predClassIcon.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i>';
        }

        // Probabilities Progress Bars
        const probs = data.probabilities;
        const crackVal = (probs.Crack * 100).toFixed(1);
        const manholeVal = (probs.Manhole * 100).toFixed(1);
        const potholeVal = (probs.Pothole * 100).toFixed(1);

        crackPct.textContent = `${crackVal}%`;
        crackBar.style.width = `${crackVal}%`;

        manholePct.textContent = `${manholeVal}%`;
        manholeBar.style.width = `${manholeVal}%`;

        potholePct.textContent = `${potholeVal}%`;
        potholeBar.style.width = `${potholeVal}%`;

        // Diagnostic Advice
        adviceTitle.textContent = data.adviceTitle;
        adviceText.textContent = data.adviceText;

        // Render Chart.js Probability Graph
        renderProbabilityChart(probs);
    }

    // --- Chart.js Probability Bar Visualizer ---
    function renderProbabilityChart(probs) {
        const ctx = document.getElementById('probabilityChart').getContext('2d');

        const labels = ['Crack', 'Manhole', 'Pothole'];
        const dataValues = [
            (probs.Crack * 100).toFixed(1),
            (probs.Manhole * 100).toFixed(1),
            (probs.Pothole * 100).toFixed(1)
        ];

        if (probChartInstance) {
            probChartInstance.destroy();
        }

        probChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Probability (%)',
                    data: dataValues,
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.75)',  // Crack - Blue
                        'rgba(16, 185, 129, 0.75)',  // Manhole - Green
                        'rgba(239, 68, 68, 0.75)'    // Pothole - Red
                    ],
                    borderColor: [
                        '#3B82F6',
                        '#10B981',
                        '#EF4444'
                    ],
                    borderWidth: 1.5,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Probability: ${context.raw}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#9CA3AF', font: { family: 'Plus Jakarta Sans' } }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#6B7280', font: { family: 'Plus Jakarta Sans' } }
                    }
                }
            }
        });
    }

    // Select Pothole preset by default for instant visual demonstration on load
    setTimeout(() => {
        const potholeSampleBtn = document.querySelector('.sample-btn[data-sample="pothole"]');
        if (potholeSampleBtn) {
            potholeSampleBtn.click();
        }
    }, 400);
});
