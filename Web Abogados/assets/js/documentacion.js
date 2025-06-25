// Funcionalidad de pestañas
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    });
});

// Funcionalidad de carga de documentos
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const ocrProgress = document.getElementById('ocrProgress');
const documentPreview = document.getElementById('documentPreview');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFiles(e.target.files);
    }
});

// Manejar arrastrar y soltar
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    dropZone.style.backgroundColor = '#f0f7ff';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#ccc';
    dropZone.style.backgroundColor = '';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#ccc';
    dropZone.style.backgroundColor = '';
    
    if (e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files);
    }
});

function handleFiles(files) {
    const file = files[0];
    if (!file) return;
    
    // Mostrar información del documento
    document.getElementById('documentName').textContent = file.name;
    
    // Simular proceso de OCR
    documentPreview.style.display = 'flex';
    ocrProgress.style.display = 'block';
    
    // Simular progreso
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        progressFill.style.width = `${progress}%`;
        
        if (progress < 30) {
            progressText.textContent = "Extrayendo texto...";
        } else if (progress < 70) {
            progressText.textContent = "Identificando campos...";
        } else {
            progressText.textContent = "Analizando estructura...";
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            ocrProgress.style.display = 'none';
            
            // Mostrar valores extraídos (simulados)
            setTimeout(() => {
                document.querySelectorAll('.extracted-value').forEach(el => {
                    el.style.display = 'inline-block';
                });
            }, 500);
        }
    }, 300);
    
    // Mostrar vista previa según tipo de archivo
    const viewer = document.getElementById('pdfViewer');
    const imageViewer = document.getElementById('imageViewer');
    
    if (file.type === 'application/pdf') {
        // En una implementación real usaríamos PDF.js para renderizar el PDF
        // Por ahora, solo muestra el ícono
        viewer.style.display = 'block';
        imageViewer.style.display = 'none';
    } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imageViewer.src = e.target.result;
            imageViewer.style.display = 'block';
            viewer.style.display = 'none';
        };
        reader.readAsDataURL(file);
    } else {
        // Para otros tipos de documentos (Word, etc.), oculta los visores y muestra el ícono genérico
        viewer.style.display = 'none';
        imageViewer.style.display = 'none';
    }
}
    
// Botones de acción
document.getElementById('cancelBtn').addEventListener('click', () => {
    documentPreview.style.display = 'none';
    fileInput.value = ''; // Limpia el input de archivo
});

document.getElementById('saveBtn').addEventListener('click', () => {
    alert('Documento guardado con éxito');
    documentPreview.style.display = 'none';
    fileInput.value = ''; // Limpia el input de archivo
});

// Selección de plantillas
document.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
    });
});