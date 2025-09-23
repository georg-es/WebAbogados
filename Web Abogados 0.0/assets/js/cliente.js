// Datos de ejemplo
const userData = {
    name: "Jorge Guerra",
    lastAccess: "27 de junio, 2025",
    activeCases: 3,
    closedCases: 5,
    uploadedDocuments: 12,
    pendingPayments: 1
};

const casesData = [
    { id: "DIV-2025-001", type: "Divorcio", status: "En proceso", date: "15/03/2025" },
    { id: "MIG-2025-015", type: "Migración", status: "Pendiente info", date: "22/05/2025" },
    { id: "PEN-2024-112", type: "Penal", status: "En proceso", date: "10/11/2024" },
    { id: "CIV-2023-045", type: "Civil", status: "Cerrado", date: "30/08/2023", result: "Resuelto" },
    { id: "LAB-2023-018", type: "Laboral", status: "Cerrado", date: "12/04/2023", result: "Resuelto" }
];

const documentsData = [
    { id: "doc-001", name: "Contrato inicial", case: "DIV-2025-001", type: "PDF", size: "2.4 MB", date: "15/03/2025" },
    { id: "doc-002", name: "Acta de matrimonio", case: "DIV-2025-001", type: "PDF", size: "1.2 MB", date: "18/03/2025" },
    { id: "doc-003", name: "Declaración de ingresos", case: "DIV-2025-001", type: "Word", size: "450 KB", date: "20/03/2025" },
    { id: "doc-004", name: "Formulario de solicitud", case: "MIG-2025-015", type: "PDF", size: "3.1 MB", date: "22/05/2025" },
    { id: "doc-005", name: "Pasaporte escaneado", case: "MIG-2025-015", type: "JPG", size: "1.8 MB", date: "25/05/2025" }
];

const paymentsData = [
    { concept: "Honorarios iniciales", amount: "$1,200.00", dueDate: "15/04/2025", status: "Pagado", method: "Transferencia" },
    { concept: "Gastos administrativos", amount: "$350.00", dueDate: "30/04/2025", status: "Pagado", method: "Tarjeta" },
    { concept: "Honorarios fase 2", amount: "$1,500.00", dueDate: "15/06/2025", status: "Pagado", method: "Transferencia" },
    { concept: "Gastos judiciales", amount: "$1,700.00", dueDate: "30/06/2025", status: "Pendiente", method: "" }
];

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos del usuario
    loadUserData();
    
    // Cargar casos
    loadCases();
    
    // Cargar documentos
    loadDocuments();
    
    // Cargar pagos
    loadPayments();
    
    // Configurar eventos
    setupEvents();
    
    // Mostrar sección activa basada en hash de URL
    showActiveSection();
});

// Cargar datos del usuario en el dashboard
function loadUserData() {
    document.getElementById('username').textContent = `Bienvenido, ${userData.name}`;
    document.getElementById('casos-activos').textContent = `${userData.activeCases} casos en curso`;
    document.getElementById('casos-cerrados').textContent = `${userData.closedCases} resueltos con éxito`;
    document.getElementById('documentos-subidos').textContent = `${userData.uploadedDocuments} archivos disponibles`;
    document.getElementById('pagos-pendientes').textContent = `${userData.pendingPayments} pago pendiente`;
    document.getElementById('ultimo-acceso').textContent = userData.lastAccess;
}

// Cargar tabla de casos
function loadCases() {
    const tableBody = document.getElementById('solicitudes-table');
    tableBody.innerHTML = '';
    
    casesData.forEach(caseItem => {
        const row = document.createElement('tr');
        
        // Determinar clase de estado
        let statusClass = '';
        if (caseItem.status === 'En proceso') statusClass = 'status-in-progress';
        else if (caseItem.status === 'Pendiente info') statusClass = 'status-pending';
        else if (caseItem.status === 'Cerrado') statusClass = 'status-closed';
        
        row.innerHTML = `
            <td>${caseItem.id}</td>
            <td>${caseItem.type}</td>
            <td><span class="status-badge ${statusClass}">${caseItem.status}</span></td>
            <td>${caseItem.date}</td>
            <td><button class="btn btn-outline btn-sm" onclick="viewCaseDetails('${caseItem.id}')">Ver detalle</button></td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Cargar lista de documentos
function loadDocuments() {
    const documentList = document.getElementById('document-list');
    documentList.innerHTML = '';
    
    documentsData.forEach(doc => {
        const docItem = document.createElement('div');
        docItem.className = 'document-item';
        
        // Icono según tipo de documento
        let docIcon = 'fa-file';
        if (doc.type === 'PDF') docIcon = 'fa-file-pdf';
        else if (doc.type === 'Word') docIcon = 'fa-file-word';
        else if (doc.type === 'JPG') docIcon = 'fa-file-image';
        
        docItem.innerHTML = `
            <div class="document-header">
                <span class="document-name"><i class="fas ${docIcon}"></i> ${doc.name}</span>
                <span class="document-type">${doc.type}</span>
            </div>
            <div class="document-meta">
                <div><strong>Caso:</strong> ${doc.case}</div>
                <div><strong>Tamaño:</strong> ${doc.size}</div>
                <div><strong>Subido:</strong> ${doc.date}</div>
            </div>
            <div class="document-actions">
                <button class="btn btn-outline btn-sm" onclick="downloadDocument('${doc.id}')">
                    <i class="fas fa-download"></i> Descargar
                </button>
                <button class="btn btn-outline btn-sm" onclick="previewDocument('${doc.id}')">
                    <i class="fas fa-eye"></i> Vista previa
                </button>
            </div>
        `;
        
        documentList.appendChild(docItem);
    });
}

// Cargar tabla de pagos
function loadPayments() {
    const tableBody = document.getElementById('pagos-table');
    tableBody.innerHTML = '';
    
    paymentsData.forEach(payment => {
        const row = document.createElement('tr');
        
        // Determinar clase de estado
        let statusClass = '';
        if (payment.status === 'Pagado') statusClass = 'status-paid';
        else if (payment.status === 'Pendiente') statusClass = 'status-pending';
        
        // Botón según estado
        let actionButton = '';
        if (payment.status === 'Pagado') {
            actionButton = `<button class="btn btn-outline btn-sm" onclick="viewInvoice('${payment.concept}')">Ver factura</button>`;
        } else {
            actionButton = `<button class="btn btn-primary btn-sm" onclick="makePayment('${payment.concept}')">Pagar ahora</button>`;
        }
        
        row.innerHTML = `
            <td>${payment.concept}</td>
            <td>${payment.amount}</td>
            <td>${payment.dueDate}</td>
            <td><span class="status-badge ${statusClass}">${payment.status}</span></td>
            <td>${actionButton}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Configurar eventos
function setupEvents() {
    // Evento para el formulario de contacto
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitContactForm();
        });
    }
    
    // Evento para el formulario de nueva solicitud
    const newRequestForm = document.getElementById('new-request-form');
    if (newRequestForm) {
        newRequestForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitNewRequest();
        });
    }
    
    // Evento para subir documentos
    const documentUpload = document.getElementById('document-upload');
    if (documentUpload) {
        documentUpload.addEventListener('change', function(e) {
            handleDocumentUpload(e.target.files);
        });
    }
    
    // Evento para cambios en el hash de la URL (navegación)
    window.addEventListener('hashchange', showActiveSection);
}

// Mostrar sección activa basada en hash
function showActiveSection() {
    const hash = window.location.hash.substring(1) || 'dashboard';
    const sections = document.querySelectorAll('.content-section');
    
    // Ocultar todas las secciones primero
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar la sección correspondiente al hash
    const activeSection = document.getElementById(hash);
    if (activeSection) {
        activeSection.style.display = 'block';
        
        // Desplazarse a la sección
        setTimeout(() => {
            activeSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
    
    // Actualizar menú activo
    const menuItems = document.querySelectorAll('.sidebar li');
    menuItems.forEach(item => {
        item.classList.remove('active');
        
        const link = item.querySelector('a');
        if (link && link.getAttribute('href') === `#${hash}`) {
            item.classList.add('active');
        } else if (hash === 'dashboard' && link.getAttribute('href') === '#') {
            item.classList.add('active');
        }
    });
}

// Navegar a una sección
function navigateTo(section) {
    window.location.hash = section;
}

// Mostrar modal de nueva solicitud
function showNewRequestForm() {
    const modal = document.getElementById('new-request-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Cerrar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Enviar formulario de contacto
function submitContactForm() {
    const form = document.getElementById('contact-form');
    const successMessage = document.getElementById('contact-success');
    
    // Simular envío (en una aplicación real sería una llamada AJAX)
    setTimeout(() => {
        form.style.display = 'none';
        successMessage.style.display = 'flex';
        
        // Resetear el formulario después de 5 segundos
        setTimeout(() => {
            form.style.display = 'block';
            successMessage.style.display = 'none';
            form.reset();
        }, 5000);
    }, 1000);
}

// Enviar nueva solicitud
function submitNewRequest() {
    const form = document.getElementById('new-request-form');
    const type = document.getElementById('request-type').value;
    const description = document.getElementById('request-description').value;
    
    // Validación básica
    if (!type || !description) {
        alert('Por favor complete todos los campos');
        return;
    }
    
    // Simular envío (en una aplicación real sería una llamada AJAX)
    setTimeout(() => {
        alert('Solicitud enviada correctamente. Nos pondremos en contacto contigo pronto.');
        form.reset();
        closeModal('new-request-modal');
        
        // Actualizar la lista de casos (simulado)
        const newCase = {
            id: generateCaseId(type),
            type: getCaseTypeName(type),
            status: "En revisión",
            date: new Date().toLocaleDateString()
        };
        
        casesData.unshift(newCase);
        loadCases();
    }, 1500);
}

// Manejar subida de documentos
function handleDocumentUpload(files) {
    if (files.length === 0) return;
    
    // Simular subida de archivos
    const uploadMessage = `¿Desea subir ${files.length} archivo(s)?`;
    if (confirm(uploadMessage)) {
        // Simular progreso de subida
        setTimeout(() => {
            alert('Documentos subidos correctamente');
            // En una aplicación real, actualizaríamos la lista de documentos
            // loadDocuments();
        }, 2000);
    }
}

// Generar ID de caso (simulado)
function generateCaseId(type) {
    const prefix = type.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 900) + 100;
    const year = new Date().getFullYear();
    return `${prefix}-${year}-${randomNum}`;
}

// Obtener nombre completo del tipo de caso
function getCaseTypeName(type) {
    const types = {
        'divorcio': 'Divorcio',
        'migracion': 'Migración',
        'penal': 'Penal',
        'laboral': 'Laboral',
        'civil': 'Civil'
    };
    return types[type] || type;
}

// Funciones para acciones (simuladas)
function viewCaseDetails(caseId) {
    alert(`Mostrando detalles del caso: ${caseId}`);
    // En una aplicación real, redirigiría a una página de detalles o mostraría un modal
}

function downloadDocument(docId) {
    alert(`Iniciando descarga del documento: ${docId}`);
    // En una aplicación real, iniciaría la descarga del archivo
}

function previewDocument(docId) {
    alert(`Mostrando vista previa del documento: ${docId}`);
    // En una aplicación real, abriría un visor de documentos
}

function makePayment(concept) {
    alert(`Procesando pago para: ${concept}`);
    // En una aplicación real, redirigiría a un gateway de pago
}

function viewInvoice(concept) {
    alert(`Mostrando factura para: ${concept}`);
    // En una aplicación real, mostraría o descargaría la factura
}