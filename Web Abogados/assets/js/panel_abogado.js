// Datos de ejemplo
const casesData = [
    {
        id: "2023-001",
        client: "María González",
        type: "Divorcio",
        date: "15/05/2023",
        status: "in-progress",
        description: "La cliente solicita asesoramiento para proceso de divorcio de mutuo acuerdo. Existen bienes mancomunados que requieren distribución equitativa. Dos hijos menores de edad involucrados.",
        documents: [
            { name: "Solicitud_inicial.pdf", type: "pdf" },
            { name: "Acuerdo_preliminar.docx", type: "word" }
        ]
    },
    {
        id: "2023-002",
        client: "Carlos Mendoza",
        type: "Contrato",
        date: "22/05/2023",
        status: "pending",
        description: "El cliente requiere revisión de contrato de arrendamiento comercial. El contrato es por 3 años con opción a renovación. Se necesita verificar cláusulas de terminación anticipada.",
        documents: [
            { name: "Contrato_original.pdf", type: "pdf" }
        ]
    },
    {
        id: "2023-003",
        client: "Laura Jiménez",
        type: "Herencia",
        date: "30/05/2023",
        status: "resolved",
        description: "Caso de sucesión intestada. Tres herederos involucrados. Se logró acuerdo amistoso entre las partes para distribución de bienes.",
        documents: [
            { name: "Testamento.pdf", type: "pdf" },
            { name: "Acta_acuerdo.docx", type: "word" },
            { name: "Lista_bienes.xlsx", type: "excel" }
        ]
    },
    {
        id: "2023-004",
        client: "Roberto Sánchez",
        type: "Accidente",
        date: "05/06/2023",
        status: "pending",
        description: "Reclamación por accidente de tráfico. Cliente sufrió lesiones leves pero requiere compensación por daños y perjuicios.",
        documents: []
    },
    {
        id: "2023-005",
        client: "Ana López",
        type: "Divorcio",
        date: "12/06/2023",
        status: "in-progress",
        description: "Proceso de divorcio contencioso. Existen discrepancias en la custodia de los hijos menores y reparto de bienes.",
        documents: [
            { name: "Demanda_divorcio.pdf", type: "pdf" }
        ]
    }
];

// Variables de paginación
let currentPage = 1;
let pageSize = 10;
let totalPages = Math.ceil(casesData.length / pageSize);
let currentSort = { column: 'id', direction: 'asc' };

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Cargar casos
    loadCases();
    updatePagination();
    
    // Configurar eventos
    setupEventListeners();
    
    // Actualizar resumen
    updateSummary();
});

// Cargar casos en la tabla
function loadCases(filteredCases = null) {
    const casesBody = document.getElementById('cases-body');
    casesBody.innerHTML = '';
    
    let casesToShow = filteredCases || casesData;
    
    // Ordenar casos
    casesToShow = sortCases(casesToShow, currentSort.column, currentSort.direction);
    
    // Paginar casos
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    casesToShow = casesToShow.slice(startIndex, endIndex);
    
    casesToShow.forEach(caseItem => {
        const row = document.createElement('tr');
        row.dataset.id = caseItem.id;
        
        // Determinar clase de estado
        const statusInfo = getStatusInfo(caseItem.status);
        
        row.innerHTML = `
            <td>${caseItem.id}</td>
            <td>${caseItem.client}</td>
            <td>${caseItem.type}</td>
            <td>${caseItem.date}</td>
            <td><span class="status-badge ${statusInfo.class}">${statusInfo.text}</span></td>
            <td>
                <button class="action-btn view-btn" data-id="${caseItem.id}"><i class="fas fa-eye"></i> Ver</button>
                <button class="action-btn upload-btn" data-id="${caseItem.id}"><i class="fas fa-upload"></i> Subir</button>
                <button class="action-btn change-status-btn" data-id="${caseItem.id}"><i class="fas fa-sync-alt"></i> Estado</button>
            </td>
        `;
        
        casesBody.appendChild(row);
    });
}

// Obtener información de estado
function getStatusInfo(status) {
    switch(status) {
        case 'pending': return { class: 'status-pending', text: 'Pendiente' };
        case 'in-progress': return { class: 'status-in-progress', text: 'En proceso' };
        case 'resolved': return { class: 'status-resolved', text: 'Resuelto' };
        case 'canceled': return { class: 'status-canceled', text: 'Cancelado' };
        default: return { class: '', text: status };
    }
}

// Ordenar casos
function sortCases(cases, column, direction = 'asc') {
    return [...cases].sort((a, b) => {
        let valueA = a[column];
        let valueB = b[column];
        
        if (column === 'date') {
            // Convertir fechas a formato comparable
            const partsA = a.date.split('/');
            const partsB = b.date.split('/');
            valueA = new Date(partsA[2], partsA[1] - 1, partsA[0]);
            valueB = new Date(partsB[2], partsB[1] - 1, partsB[0]);
        }
        
        if (valueA < valueB) return direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Botones de acción en la tabla
    document.addEventListener('click', function(e) {
        if (e.target.closest('.view-btn')) {
            const caseId = e.target.closest('.view-btn').dataset.id;
            openCaseModal(caseId);
        }
        
        if (e.target.closest('.upload-btn')) {
            const caseId = e.target.closest('.upload-btn').dataset.id;
            openUploadModal(caseId);
        }
        
        if (e.target.closest('.change-status-btn')) {
            const caseId = e.target.closest('.change-status-btn').dataset.id;
            changeCaseStatus(caseId);
        }
    });
    
    // Cerrar modal
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    
    // Subir documento
    document.getElementById('upload-document-btn').addEventListener('click', uploadDocument);
    
    // Cambiar estado desde modal
    document.getElementById('save-status-btn').addEventListener('click', saveStatusFromModal);
    
    // Filtros
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
    
    // Paginación
    document.getElementById('prev-page').addEventListener('click', goToPrevPage);
    document.getElementById('next-page').addEventListener('click', goToNextPage);
    document.getElementById('page-size').addEventListener('change', changePageSize);
    
    // Ordenamiento
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => sortTable(header.dataset.sort));
    });
}

// Actualizar resumen de casos
function updateSummary(filteredCases = null) {
    const cases = filteredCases || casesData;
    
    document.getElementById('total-cases').textContent = cases.length;
    document.getElementById('in-progress-cases').textContent = cases.filter(c => c.status === 'in-progress').length;
    document.getElementById('pending-cases').textContent = cases.filter(c => c.status === 'pending').length;
    document.getElementById('resolved-cases').textContent = cases.filter(c => c.status === 'resolved').length;
}

// Abrir modal con detalles del caso
function openCaseModal(caseId) {
    const caseItem = casesData.find(c => c.id === caseId);
    if (!caseItem) return;
    
    // Llenar datos del modal
    document.getElementById('modal-case-id').textContent = caseItem.id;
    document.getElementById('modal-client').textContent = caseItem.client;
    document.getElementById('modal-case-type').textContent = caseItem.type;
    document.getElementById('modal-creation-date').textContent = caseItem.date;
    document.getElementById('modal-description').textContent = caseItem.description;
    
    // Estado
    const statusInfo = getStatusInfo(caseItem.status);
    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge ${statusInfo.class}`;
    statusBadge.textContent = statusInfo.text;
    
    document.getElementById('modal-status').innerHTML = '';
    document.getElementById('modal-status').appendChild(statusBadge);
    
    // Documentos
    const documentsList = document.getElementById('modal-documents');
    documentsList.innerHTML = '';
    
    caseItem.documents.forEach(doc => {
        const li = document.createElement('li');
        let iconClass = 'fa-file';
        
        switch(doc.type) {
            case 'pdf': iconClass = 'fa-file-pdf'; break;
            case 'word': iconClass = 'fa-file-word'; break;
            case 'excel': iconClass = 'fa-file-excel'; break;
        }
        
        li.innerHTML = `
            <span><i class="fas ${iconClass}"></i> ${doc.name}</span>
            <a href="#" class="download-link" data-file="${doc.name}"><i class="fas fa-download"></i> Descargar</a>
        `;
        documentsList.appendChild(li);
    });
    
    // Configurar select de estado
    document.getElementById('status-select').value = caseItem.status;
    
    // Mostrar modal
    document.getElementById('requestModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Cerrar modal
function closeModal() {
    document.getElementById('requestModal').classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Cambiar estado del caso desde la tabla
function changeCaseStatus(caseId) {
    const caseItem = casesData.find(c => c.id === caseId);
    if (!caseItem) return;
    
    // Rotar entre los estados disponibles
    switch(caseItem.status) {
        case 'pending':
            caseItem.status = 'in-progress';
            break;
        case 'in-progress':
            caseItem.status = 'resolved';
            break;
        case 'resolved':
            caseItem.status = 'pending';
            break;
        default:
            caseItem.status = 'pending';
    }
    
    // Recargar tabla y actualizar resumen
    loadCases();
    updateSummary();
}

// Subir documento
function uploadDocument() {
    const fileInput = document.getElementById('documentUpload');
    if (fileInput.files.length === 0) {
        alert('Por favor seleccione al menos un archivo');
        return;
    }
    
    // Simular subida con barra de progreso
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const uploadProgress = document.getElementById('upload-progress');
    
    uploadProgress.style.display = 'block';
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Simular éxito después de 0.5s
            setTimeout(() => {
                alert('Documento(s) subido(s) correctamente');
                uploadProgress.style.display = 'none';
                progressBar.style.width = '0%';
                progressText.textContent = '0%';
                fileInput.value = '';
                
                // Actualizar lista de documentos (simulado)
                const caseId = document.getElementById('modal-case-id').textContent;
                const caseItem = casesData.find(c => c.id === caseId);
                if (caseItem) {
                    Array.from(fileInput.files).forEach(file => {
                        const extension = file.name.split('.').pop().toLowerCase();
                        let type = 'file';
                        if (extension === 'pdf') type = 'pdf';
                        else if (['doc', 'docx'].includes(extension)) type = 'word';
                        else if (['xls', 'xlsx'].includes(extension)) type = 'excel';
                        
                        caseItem.documents.push({
                            name: file.name,
                            type: type
                        });
                    });
                    
                    // Actualizar vista
                    openCaseModal(caseId);
                }
            }, 500);
        }
        
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
    }, 200);
}

// Guardar estado desde el modal
function saveStatusFromModal() {
    const caseId = document.getElementById('modal-case-id').textContent;
    const newStatus = document.getElementById('status-select').value;
    
    const caseItem = casesData.find(c => c.id === caseId);
    if (!caseItem) return;
    
    caseItem.status = newStatus;
    
    // Cerrar modal y actualizar
    closeModal();
    loadCases();
    updateSummary();
    
    alert('Estado del caso actualizado correctamente');
}

// Aplicar filtros
function applyFilters() {
    const statusFilter = document.getElementById('status-filter').value;
    const typeFilter = document.getElementById('type-filter').value;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    const searchText = document.getElementById('search').value.toLowerCase();
    
    // Filtrar casos
    let filteredCases = casesData.filter(caseItem => {
        // Filtro por estado
        if (statusFilter !== 'all' && caseItem.status !== statusFilter) {
            return false;
        }
        
        // Filtro por tipo
        if (typeFilter !== 'all' && !caseItem.type.toLowerCase().includes(typeFilter.toLowerCase())) {
            return false;
        }
        
        // Filtro por texto de búsqueda
        if (searchText && 
            !caseItem.id.toLowerCase().includes(searchText) && 
            !caseItem.client.toLowerCase().includes(searchText) && 
            !caseItem.type.toLowerCase().includes(searchText) &&
            !caseItem.description.toLowerCase().includes(searchText)) {
            return false;
        }
        
        // Filtro por fecha (si se implementara)
        // Nota: En una implementación real, las fechas deberían ser objetos Date
        
        return true;
    });
    
    // Resetear paginación
    currentPage = 1;
    
    // Mostrar casos filtrados
    loadCases(filteredCases);
    updatePagination(filteredCases.length);
    
    // Actualizar resumen con casos filtrados
    updateSummary(filteredCases);
}

// Limpiar filtros
function clearFilters() {
    document.getElementById('status-filter').value = 'all';
    document.getElementById('type-filter').value = 'all';
    document.getElementById('date-from').value = '';
    document.getElementById('date-to').value = '';
    document.getElementById('search').value = '';
    
    // Resetear paginación
    currentPage = 1;
    
    // Mostrar todos los casos
    loadCases();
    updatePagination();
    updateSummary();
}

// Paginación
function updatePagination(totalItems = casesData.length) {
    totalPages = Math.ceil(totalItems / pageSize);
    document.getElementById('page-info').textContent = `Página ${currentPage} de ${totalPages}`;
    
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadCases();
        updatePagination();
    }
}

function goToNextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        loadCases();
        updatePagination();
    }
}

function changePageSize() {
    pageSize = parseInt(this.value);
    currentPage = 1;
    loadCases();
    updatePagination();
}

// Ordenamiento de tabla
function sortTable(column) {
    // Cambiar dirección si es la misma columna
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }
    
    // Actualizar iconos de ordenamiento
    document.querySelectorAll('.sortable i').forEach(icon => {
        icon.className = 'fas fa-sort';
    });
    
    const header = document.querySelector(`.sortable[data-sort="${column}"]`);
    if (header) {
        const icon = header.querySelector('i');
        icon.className = currentSort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }
    
    // Recargar casos
    loadCases();
}