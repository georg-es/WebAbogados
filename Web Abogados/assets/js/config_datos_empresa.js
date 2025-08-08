// Datos de ejemplo del despacho
const despachoData = {
    nombreLegal: "Bufete Legal González & Asociados S.A.",
    ruc: "3-101-205678",
    direccion: "Avenida Central, Calle 45, Edificio Torre Jurídica, Piso 8, San José, Costa Rica",
    telefono: "+506 2205 6789",
    email: "contacto@bufetegonzalez.com",
    logoUrl: "https://via.placeholder.com/200x100?text=Logo+Actual",
    mensaje: "En Bufete Legal González & Asociados nos comprometemos a brindar soluciones jurídicas integrales con excelencia profesional y calidez humana. Su confianza es nuestro mayor compromiso."
};

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos del despacho
    loadDespachoData();
    
    // Configurar eventos
    setupEvents();
    
    // Configurar contador de caracteres para el mensaje
    setupCharCounter();
});

// Cargar datos del despacho en el formulario
function loadDespachoData() {
    document.getElementById('nombre-legal').value = despachoData.nombreLegal;
    document.getElementById('ruc').value = despachoData.ruc;
    document.getElementById('direccion').value = despachoData.direccion;
    document.getElementById('telefono').value = despachoData.telefono;
    document.getElementById('email').value = despachoData.email;
    document.getElementById('mensaje').value = despachoData.mensaje;
    document.getElementById('current-logo').src = despachoData.logoUrl;
    
    // Actualizar contador de caracteres
    updateCharCounter();
}

// Configurar eventos
function setupEvents() {
    // Evento para el formulario
    const form = document.getElementById('despacho-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveDespachoData();
        });
    }
    
    // Evento para subir logo
    const logoUpload = document.getElementById('logo-upload');
    if (logoUpload) {
        logoUpload.addEventListener('change', function(e) {
            handleLogoUpload(e.target.files);
        });
    }
    
    // Evento para previsualizar logo
    const previewBtn = document.getElementById('preview-logo-btn');
    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
            previewLogo();
        });
    }
    
    // Evento para eliminar logo
    const removeBtn = document.getElementById('remove-logo-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            removeLogo();
        });
    }
}

// Configurar contador de caracteres para el mensaje
function setupCharCounter() {
    const textarea = document.getElementById('mensaje');
    if (textarea) {
        textarea.addEventListener('input', updateCharCounter);
    }
}

function updateCharCounter() {
    const textarea = document.getElementById('mensaje');
    const counter = document.getElementById('char-count');
    if (textarea && counter) {
        const length = textarea.value.length;
        counter.textContent = length;
        
        if (length > 500) {
            counter.style.color = 'var(--danger-color)';
        } else {
            counter.style.color = 'var(--text-light)';
        }
    }
}

// Manejar subida de logo
function handleLogoUpload(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    const fileInfo = document.getElementById('file-info');
    const previewBtn = document.getElementById('preview-logo-btn');
    
    // Validar tipo de archivo
    if (!file.type.match('image.*')) {
        fileInfo.textContent = 'Error: El archivo debe ser una imagen';
        fileInfo.style.color = 'var(--danger-color)';
        previewBtn.disabled = true;
        return;
    }
    
    // Validar tamaño del archivo (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        fileInfo.textContent = 'Error: La imagen no debe superar los 2MB';
        fileInfo.style.color = 'var(--danger-color)';
        previewBtn.disabled = true;
        return;
    }
    
    // Mostrar información del archivo
    fileInfo.textContent = `Archivo seleccionado: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
    fileInfo.style.color = 'var(--text-color)';
    previewBtn.disabled = false;
    
    // Guardar el archivo para posible previsualización
    previewBtn.dataset.file = URL.createObjectURL(file);
}

// Previsualizar logo
function previewLogo() {
    const previewBtn = document.getElementById('preview-logo-btn');
    const fileUrl = previewBtn.dataset.file;
    
    if (!fileUrl) return;
    
    const modal = document.getElementById('logo-preview-modal');
    const previewImg = document.getElementById('logo-preview-img');
    
    previewImg.src = fileUrl;
    modal.style.display = 'flex';
}

// Confirmar subida de logo
function confirmLogoUpload() {
    const previewBtn = document.getElementById('preview-logo-btn');
    const fileUrl = previewBtn.dataset.file;
    const currentLogo = document.getElementById('current-logo');
    
    if (!fileUrl) return;
    
    // En una aplicación real, aquí se subiría el archivo al servidor
    // Por ahora solo actualizamos la previsualización
    currentLogo.src = fileUrl;
    
    // Limpiar y resetear
    const fileInput = document.getElementById('logo-upload');
    fileInput.value = '';
    document.getElementById('file-info').textContent = 'No se ha seleccionado archivo';
    previewBtn.disabled = true;
    delete previewBtn.dataset.file;
    
    // Mostrar mensaje de éxito
    alert('Logo actualizado correctamente');
    
    // Cerrar modal
    closeModal('logo-preview-modal');
}

// Eliminar logo
function removeLogo() {
    if (confirm('¿Está seguro que desea eliminar el logo actual?')) {
        // En una aplicación real, aquí se eliminaría el logo del servidor
        // Por ahora solo restablecemos a un placeholder
        const currentLogo = document.getElementById('current-logo');
        currentLogo.src = 'https://via.placeholder.com/200x100?text=Sin+Logo';
        
        // Limpiar input de subida si hay algo
        const fileInput = document.getElementById('logo-upload');
        fileInput.value = '';
        document.getElementById('file-info').textContent = 'No se ha seleccionado archivo';
        const previewBtn = document.getElementById('preview-logo-btn');
        previewBtn.disabled = true;
        delete previewBtn.dataset.file;
        
        alert('Logo eliminado correctamente');
    }
}

// Guardar datos del despacho
function saveDespachoData() {
    // Validar formulario
    const nombreLegal = document.getElementById('nombre-legal').value.trim();
    const ruc = document.getElementById('ruc').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();
    
    if (!nombreLegal || !ruc || !direccion || !telefono || !email) {
        alert('Por favor complete todos los campos obligatorios');
        return;
    }
    
    if (mensaje.length > 500) {
        alert('El mensaje institucional no debe exceder los 500 caracteres');
        return;
    }
    
    // Simular envío de datos al servidor
    console.log('Datos a guardar:', {
        nombreLegal,
        ruc,
        direccion,
        telefono,
        email,
        mensaje
    });
    
    // Mostrar mensaje de éxito
    alert('Datos del despacho guardados correctamente');
    
    // En una aplicación real, aquí se haría una petición AJAX para guardar los datos
    // y posiblemente actualizar la interfaz con la respuesta del servidor
}

// Cerrar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}