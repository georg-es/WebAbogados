// boton de ponerlo todo oscuro
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
    const body = document.body;

    // Cargar el tema guardado al cargar la página
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark-theme') {
        themeToggleCheckbox.checked = true;
        body.classList.add('dark-theme');
    }

    // Escuchar el cambio en el checkbox para alternar el tema
    themeToggleCheckbox.addEventListener('change', () => {
        if (themeToggleCheckbox.checked) {
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark-theme');
        } else {
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light-theme');
        }
    });
});

// Nueva función para aplicar la búsqueda
function applySearch() {
    const searchText = document.getElementById('search').value.toLowerCase();
  
    // Si el campo de búsqueda está vacío, restablece la tabla
    if (searchText.trim() === '') {
        loadCases();
        updatePagination(casesData.length);
        updateSummary(casesData);
        return;
    }

    // Filtramos los casos basándonos en el texto de búsqueda
    const filteredCases = casesData.filter(caseItem => {
        return (
            caseItem.id.toLowerCase().includes(searchText) ||
            caseItem.client.toLowerCase().includes(searchText) ||
            caseItem.type.toLowerCase().includes(searchText) ||
            caseItem.description.toLowerCase().includes(searchText)
        );
    });
    
     // Reiniciamos la paginación y la tabla con los resultados
    currentPage = 1;
    loadCases(filteredCases);
    updatePagination(filteredCases.length);
    updateSummary(filteredCases);
}

// Datos de ejemplo
const casesData = [
    {
        id: "2023-001",
        client: "María González",
        type: "Divorcio",
        date: "15/05/2023",
        status: "in-progress",
        interaction: "new" ,
        description: "La cliente solicita asesoramiento para proceso de divorcio de mutuo acuerdo. Existen bienes mancomunados que requieren distribución equitativa. Dos hijos menores de edad involucrados.",
        documents: [
            { name: "Solicitud_inicial.pdf", type: "pdf" },
            { name: "Acuerdo_preliminar.docx", type: "word" }
        ]
    },
    {
        id: "2023-001",
        client: "María González",
        type: "Divorcio",
        date: "15/05/2023",
        status: "in-progress",
        interaction: "new" ,
        description: "La cliente solicita asesoramiento para proceso de divorcio de mutuo acuerdo. Existen bienes mancomunados que requieren distribución equitativa. Dos hijos menores de edad involucrados.",
        documents: [
            { name: "Solicitud_inicial.pdf", type: "pdf" },
            { name: "Acuerdo_preliminar.docx", type: "word" }
        ]
    },
    {
        id: "2023-001",
        client: "María González",
        type: "Divorcio",
        date: "15/05/2023",
        status: "in-progress",
        interaction: "new" ,
        description: "La cliente solicita asesoramiento para proceso de divorcio de mutuo acuerdo. Existen bienes mancomunados que requieren distribución equitativa. Dos hijos menores de edad involucrados.",
        documents: [
            { name: "Solicitud_inicial.pdf", type: "pdf" },
            { name: "Acuerdo_preliminar.docx", type: "word" }
        ]
    },
    {
        id: "2023-001",
        client: "María González",
        type: "Divorcio",
        date: "15/05/2023",
        status: "in-progress",
        interaction: "new" ,
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
        interaction: "client-replied",
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
        interaction: "client-replied",
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
        interaction: "client-replied",
        description: "Reclamación por accidente de tráfico. Cliente sufrió lesiones leves pero requiere compensación por daños y perjuicios.",
        documents: []
    },
    {
        id: "2023-005",
        client: "Ana López",
        type: "Divorcio",
        date: "12/06/2023",
        status: "in-progress",
        interaction: "client-replied",
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
    updateSummary()
    
    // Configurar eventos
    setupEventListeners();
    
    // Actualizar resumen
    updateSummary();
});

function loadCases(filteredCases = null) {
    const casesContainer = document.getElementById('cases-container');
    casesContainer.innerHTML = '';
    
    let casesToShow = filteredCases || casesData;
    
    // Ordenar casos
    casesToShow = sortCases(casesToShow, currentSort.column, currentSort.direction);
    
    // Paginar casos
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    casesToShow = casesToShow.slice(startIndex, endIndex);
    
    casesToShow.forEach(caseItem => {
        const card = document.createElement('div'); // Cambiamos 'td' por 'div'
        card.classList.add('request-card'); // Agregamos la nueva clase
        card.dataset.id = caseItem.id;
        
        const statusInfo = getStatusInfo(caseItem.status);
        
        card.innerHTML = `
            <div>${caseItem.id}</div>
            <div>${caseItem.client}</div>
            <div>${caseItem.type}</div>
            <div>${caseItem.date}</div>
            <div><span class="status-badge ${statusInfo.class}">${statusInfo.text}</span></div>
            <div>
                ${
                    caseItem.interaction === "new"
                    ? "Nuevo"
                    : caseItem.interaction === "client-replied"
                    ? "Respondió el cliente"
                    : "-"
                }
            </div>
            <div>
                <button class="action-btn view-btn" data-id="${caseItem.id}">
                    <i class="fas fa-eye"></i> Ver
                </button>
                <div class="status-dropdown-container">
                    <button class="action-btn status-btn" data-id="${caseItem.id}">
                        <i class="fas fa-sync-alt"></i> Estado
                    </button>
                    <div class="status-dropdown">
                        <div class="dropdown-item" data-status="pending">Pendiente</div>
                        <div class="dropdown-item" data-status="in-progress">En proceso</div>
                        <div class="dropdown-item" data-status="resolved">Resuelto</div>
                        <div class="dropdown-item" data-status="canceled">Cancelado</div>
                    </div>
                </div>
            </div>
        `;
        
        casesContainer.appendChild(card); // Añadimos la tarjeta al nuevo contenedor
    });
}
// Obtener información de estado
function onClientMessageReceived(caseId, senderEmail) {
    const caseItem = casesData.find(c => c.id === caseId);
    if (!caseItem) return;

    // Solo actualizar si el remitente es el cliente
    if (senderEmail === caseItem.clientEmail) {
        caseItem.interaction = "client-replied";
        loadCases();       // recarga tabla
        updateSummary();   // actualiza resumen
    }
}

// Cuando el cliente responde, se marca la interacción
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
    document.addEventListener('click', function(e) {

        //

         // Lógica para el botón 'Ver'
        if (e.target.closest('.view-btn')) {
            const caseId = e.target.closest('.view-btn').dataset.id;
            openCaseModal(caseId);
        }
        
        // Lógica para el botón 'Estado'
        if (e.target.closest('.status-btn')) {
            const container = e.target.closest('.status-dropdown-container');
            document.querySelectorAll('.status-dropdown-container.active').forEach(item => {
                if (item !== container) {
                    item.classList.remove('active');
                }
            });
            container.classList.toggle('active');
            e.stopPropagation();
        }

        // Lógica para la barra de búsqueda del header
        if (e.target.closest('.search-button')) {
            applySearch();
        }

        // Lógica para cerrar el menú desplegable si se hace clic fuera
        if (!e.target.closest('.status-dropdown-container')) {
            document.querySelectorAll('.status-dropdown-container.active').forEach(item => {
                item.classList.remove('active');
            });
        }
        
        // Lógica para seleccionar una opción del menú de estado
        if (e.target.closest('.status-dropdown .dropdown-item')) {
            const item = e.target.closest('.dropdown-item');
            const newStatus = item.dataset.status;
            const caseId = item.closest('.status-dropdown-container').querySelector('.status-btn').dataset.id;
            updateCaseStatus(caseId, newStatus);
            // El menú se cierra automáticamente al actualizar la tabla
        }
        
        // Lógica para los botones de filtros y búsqueda
        if (e.target.closest('.search-button')) {
            applySearch();
        }

        if (e.target.closest('#apply-all-filters')) {
            applyFilters();
        }

        if (e.target.closest('#clear-all-filters')) {
            clearFilters();
        }
        
        // Lógica para la paginación
        if (e.target.closest('#prev-page')) {
            goToPrevPage();
        }
        if (e.target.closest('#next-page')) {
            goToNextPage();
        }
        
        // Lógica para el ordenamiento de la tabla
        if (e.target.closest('.sortable')) {
            const header = e.target.closest('.sortable');
            sortTable(header.dataset.sort);
        }

        // Lógica para el botón de refrescar
        if (e.target.closest('#refresh-btn')) {
            refreshData();
        }

    // Nueva función para refrescar los datos
        function refreshData() {
    // Estas son las funciones que recargan la tabla y el resumen
        loadCases();
        updateSummary();
        alert('Los datos han sido actualizados.');
}
    });

    // Eventos que no son de clic
    document.getElementById('search').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            applySearch();
        } else if (this.value.trim() === '') {
            loadCases();
            updatePagination(casesData.length);
            updateSummary(casesData);
        }
    });

    document.getElementById('page-size').addEventListener('change', changePageSize);
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    document.getElementById('upload-document-btn').addEventListener('click', uploadDocument);
    document.getElementById('save-status-btn').addEventListener('click', saveStatusFromModal);

    // Lógica para el submenú de Finanzas
        const finanzasMenuItem = document.getElementById('finanzas-menu-item');
        if (e.target.closest('#finanzas-menu-item')) {
            if (finanzasMenuItem) {
                const link = e.target.closest('a');
                if (link) {
                    e.preventDefault();
                    finanzasMenuItem.classList.toggle('active');
                }
            }
        }
}
// Actualizar resumen de casos
function updateSummary(filteredCases = null) {
    const cases = filteredCases || casesData;
    
    document.getElementById('total-cases').textContent = cases.length;
    document.getElementById('in-progress-cases').textContent = cases.filter(c => c.status === 'in-progress').length;
    document.getElementById('pending-cases').textContent = cases.filter(c => c.status === 'pending').length;
    document.getElementById('resolved-cases').textContent = cases.filter(c => c.status === 'resolved').length;
    document.getElementById('canceled-cases').textContent = cases.filter(c => c.status === 'canceled').length;
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
    document.getElementById('save-status-btn').addEventListener('click', saveStatusFromModal);

    
    // Mostrar modal
    const modal = document.getElementById('requestModal');
    modal.style.display = 'flex'; // Usamos display: flex para el modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Evita el scroll en el body
}

// Responder en la clase modal como nota privada
 // Lógica para los botones de respuesta y nota
    document.addEventListener('click', (event) => {
        const replyContainer = event.target.closest('.reply-container');
        if (!replyContainer) return;

        const textarea = replyContainer.querySelector('.reply-textarea');
        const replyBtn = event.target.closest('.btn-primary');
        const addNoteBtn = event.target.closest('.btn-secondary');

        if (replyBtn) {
            // Lógica para "Responder"
            const message = textarea.value.trim();
            if (message) {
                // Aquí va la lógica para enviar el mensaje al cliente
                console.log("Enviando respuesta al cliente:", message);
                textarea.value = ''; // Limpiar el textarea
            }
        }

        if (addNoteBtn) {
            // Lógica para "Agregar nota"
            const note = textarea.value.trim();
            if (note) {
                // Aquí va la lógica para guardar la nota de forma privada
                console.log("Agregando nota privada:", note);
                textarea.value = ''; // Limpiar el textarea
            }
        }
    });

// Cerrar modal
function closeModal() {
    const modal = document.getElementById('requestModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto'; // Permite el scroll de nuevo
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // 300ms es la duración de la transición
}

// Cambiar estado del caso desde la tabla
function updateCaseStatus(caseId, newStatus) {
    const caseItem = casesData.find(c => c.id === caseId);
    if (!caseItem) return;

     // Si el estado es el mismo, no hacemos nada
    if (caseItem.status === newStatus) return;
    
    caseItem.status = newStatus;
    
    // Recargar tabla y actualizar resumen
    loadCases();
    updateSummary();
    
    alert(`Estado del caso ${caseId} actualizado a ${newStatus} correctamente`);
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
// Aplicar filtros
function applyFilters() {
    const statusVal = document.getElementById('status-filter')?.value || 'all';
    const typeVal = document.getElementById('type-filter')?.value || 'all';
    const dateFrom = document.getElementById('date-from')?.value || '';
    const dateTo = document.getElementById('date-to')?.value || '';
    const searchRaw = document.getElementById('search')?.value || '';

    const normalize = s => (s || '').toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
    const search = normalize(searchRaw);

    const parseCaseDate = str => {
        if (!str) return null;
        const parts = str.split('/');
        if (parts.length !== 3) return null;
        return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    };

    const filteredCases = casesData.filter(c => {
        let isMatch = true;

        // Filtro por estado
        if (statusVal && statusVal !== 'all' && c.status !== statusVal) {
            isMatch = false;
        }

        // Filtro por tipo
        if (isMatch && typeVal && typeVal !== 'all' && c.type !== typeVal) {
            isMatch = false;
        }

        // Filtro por búsqueda de texto
        if (isMatch && search) {
            const haystack = normalize(`${c.id} ${c.client} ${c.type} ${c.description || ''}`);
            if (!haystack.includes(search)) {
                isMatch = false;
            }
        }
        
        // Filtro por rango de fechas
        if (isMatch && (dateFrom || dateTo)) {
            const caseDate = parseCaseDate(c.date);
            const fromDate = dateFrom ? new Date(dateFrom) : null;
            const toDate = dateTo ? new Date(dateTo) : null;

            if (fromDate && caseDate < fromDate) {
                isMatch = false;
            }
            if (toDate && caseDate > toDate) {
                isMatch = false;
            }
        }

        return isMatch;
    });

    currentPage = 1;
    loadCases(filteredCases);
    updatePagination(filteredCases.length);
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
// sub.menu  de finanzas

document.addEventListener('DOMContentLoaded', function() {
    const finanzasMenu = document.getElementById('finanzas-menu');
    if (finanzasMenu) {
        finanzasMenu.addEventListener('click', function(event) {
            // Evita que la página navegue si se hace clic en el enlace principal
            if (event.target.closest('a')) {
                event.preventDefault();
            }
            
            // Alterna la clase 'active' para mostrar/ocultar el submenú
            this.classList.toggle('active');
        });
    }
});
//Funcionalidad para ver la descripciòn del ticket
