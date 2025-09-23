// Datos de ejemplo para el inventario legal
let inventoryData = [
    {
        id: "INV-001",
        name: "Contrato de Arrendamiento",
        category: "Documentos",
        description: "Contrato firmado el 10/08/2025, cliente: Pérez & Asociados",
        location: "Archivo físico",
        assigned: "Juan Pérez",
        status: "Archivado",
        entryDate: "2023-05-15",
        expiryDate: "2025-08-10",
        attachments: [],
        lastModified: "2023-05-15T10:30:00",
        modifiedBy: "Sistema"
    },
    {
        id: "INV-002",
        name: "Laptop HP EliteBook",
        category: "Equipos",
        description: "Laptop de uso administrativo, serie: HP123456789",
        location: "Oficina Principal",
        assigned: "María García",
        status: "En uso",
        entryDate: "2023-03-20",
        expiryDate: "",
        attachments: [],
        lastModified: "2023-06-10T14:22:00",
        modifiedBy: "Admin"
    },
    {
        id: "INV-003",
        name: "Licencia Office 365",
        category: "Software",
        description: "Licencia anual para 5 usuarios",
        location: "Nube",
        assigned: "Departamento Legal",
        status: "Disponible",
        entryDate: "2023-07-10",
        expiryDate: "2024-07-09",
        attachments: [],
        lastModified: "2023-07-10T09:15:00",
        modifiedBy: "Sistema"
    },
    {
        id: "INV-004",
        name: "Timbres Fiscales",
        category: "Suministro",
        description: "Paquete de 100 timbres fiscales",
        location: "Bóveda de seguridad",
        assigned: "Carlos López",
        status: "Disponible",
        entryDate: "2023-06-05",
        expiryDate: "2024-12-31",
        attachments: [],
        lastModified: "2023-06-05T16:45:00",
        modifiedBy: "Admin"
    },
    {
        id: "INV-005",
        name: "Expediente Juicio Laboral",
        category: "Documentos",
        description: "Caso: Martínez vs. Empresa XYZ",
        location: "Sala de Juicios",
        assigned: "Ana Martínez",
        status: "En uso",
        entryDate: "2023-08-12",
        expiryDate: "",
        attachments: [],
        lastModified: "2023-08-12T11:20:00",
        modifiedBy: "Sistema"
    }
];

// Variables globales
let currentEditingId = null;
let filteredData = [];
let originalData = [];

// Elementos del DOM
const tableBody = document.getElementById('table-body');
const modal = document.getElementById('modal');
const detailModal = document.getElementById('detail-modal');
const form = document.getElementById('inventory-form');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const statusFilter = document.getElementById('status-filter');
const addBtn = document.getElementById('add-btn');
const cancelBtn = document.getElementById('cancel-btn');
const closeModal = document.querySelector('.close');
const closeDetailModal = document.querySelector('.detail-close');
const modalTitle = document.getElementById('modal-title');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notification-text');
const closeNotification = document.getElementById('close-notification');
const exportPdfBtn = document.getElementById('export-pdf');
const exportExcelBtn = document.getElementById('export-excel');
const totalItemsSpan = document.getElementById('total-items');
const expiringAlertsSpan = document.getElementById('expiring-alerts');
const fileInput = document.getElementById('resource-attachments');
const fileNamesSpan = document.getElementById('file-names');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderTable();
    setupEventListeners();
    checkExpiringItems();
});

// Cargar datos desde localStorage o usar datos de ejemplo
function loadData() {
    const savedData = localStorage.getItem('legalInventoryData');
    if (savedData) {
        inventoryData = JSON.parse(savedData);
    } else {
        // Guardar datos de ejemplo en localStorage por primera vez
        saveData();
    }
    originalData = [...inventoryData];
    filteredData = [...inventoryData];
}

// Guardar datos en localStorage
function saveData() {
    localStorage.setItem('legalInventoryData', JSON.stringify(inventoryData));
}

// Configurar event listeners
function setupEventListeners() {
    // Modal de añadir/editar
    addBtn.addEventListener('click', openAddModal);
    closeModal.addEventListener('click', closeModalFunc);
    cancelBtn.addEventListener('click', closeModalFunc);
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModalFunc();
        if (e.target === detailModal) closeDetailModalFunc();
    });
    
    // Modal de detalles
    closeDetailModal.addEventListener('click', closeDetailModalFunc);
    
    // Formulario
    form.addEventListener('submit', handleFormSubmit);
    
    // Filtros y búsqueda
    searchInput.addEventListener('input', filterTable);
    categoryFilter.addEventListener('change', filterTable);
    statusFilter.addEventListener('change', filterTable);
    
    // Notificación
    closeNotification.addEventListener('click', () => {
        notification.style.display = 'none';
    });
    
    // Botones de exportación
    exportPdfBtn.addEventListener('click', exportToPdf);
    exportExcelBtn.addEventListener('click', exportToExcel);
    
    // Manejo de archivos
    fileInput.addEventListener('change', updateFileNames);
}

// Actualizar nombres de archivos seleccionados
function updateFileNames() {
    const files = fileInput.files;
    if (files.length > 0) {
        const names = Array.from(files).map(file => file.name).join(', ');
        fileNamesSpan.textContent = names;
    } else {
        fileNamesSpan.textContent = 'No se han seleccionado archivos';
    }
}

// Renderizar la tabla
function renderTable(data = filteredData) {
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 30px;">
                    <i class="fas fa-search" style="font-size: 24px; margin-bottom: 10px; display: block; color: #bdc3c7;"></i>
                    No se encontraron registros que coincidan con los criterios de búsqueda.
                </td>
            </tr>
        `;
        updateSummary(0);
        return;
    }
    
    data.forEach(item => {
        const row = document.createElement('tr');
        
        // Determinar clase de estado y si está vencido/próximo a vencer
        let statusClass = '';
        let rowClass = '';
        switch(item.status) {
            case 'Disponible': statusClass = 'status-available'; break;
            case 'En uso': statusClass = 'status-in-use'; break;
            case 'Archivado': statusClass = 'status-archived'; break;
            case 'Vencido': statusClass = 'status-expired'; break;
            case 'Extraviado': statusClass = 'status-lost'; break;
        }
        
        // Verificar si el elemento está vencido o próximo a vencer
        if (item.expiryDate) {
            const today = new Date();
            const expiryDate = new Date(item.expiryDate);
            const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry < 0) {
                rowClass = 'expired-item';
            } else if (daysUntilExpiry <= 30) {
                rowClass = 'expiring-soon';
            }
        }
        
        if (rowClass) {
            row.classList.add(rowClass);
        }
        
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td title="${item.description}">${truncateText(item.description, 50)}</td>
            <td>${item.location}</td>
            <td>${item.assigned}</td>
            <td><span class="status-badge ${statusClass}">${item.status}</span></td>
            <td>${formatDate(item.entryDate)}</td>
            <td>${item.expiryDate ? formatDate(item.expiryDate) : 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" data-id="${item.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn view" data-id="${item.id}" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn delete" data-id="${item.id}" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Agregar event listeners a los botones de acción
    document.querySelectorAll('.action-btn.edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            openEditModal(id);
        });
    });
    
    document.querySelectorAll('.action-btn.view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            openDetailModal(id);
        });
    });
    
    document.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            deleteItem(id);
        });
    });
    
    updateSummary(data.length);
}

// Actualizar resumen de la tabla
function updateSummary(count) {
    totalItemsSpan.textContent = `Total: ${count} registro${count !== 1 ? 's' : ''}`;
}

// Filtrar la tabla
function filterTable() {
    const searchTerm = searchInput.value.toLowerCase();
    const categoryValue = categoryFilter.value;
    const statusValue = statusFilter.value;
    
    filteredData = originalData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                             item.id.toLowerCase().includes(searchTerm) ||
                             item.description.toLowerCase().includes(searchTerm) ||
                             item.assigned.toLowerCase().includes(searchTerm);
        
        const matchesCategory = categoryValue ? item.category === categoryValue : true;
        const matchesStatus = statusValue ? item.status === statusValue : true;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    renderTable();
}

// Abrir modal para añadir
function openAddModal() {
    currentEditingId = null;
    modalTitle.textContent = 'Añadir Nuevo Registro';
    form.reset();
    fileNamesSpan.textContent = 'No se han seleccionado archivos';
    modal.style.display = 'block';
    
    // Establecer fecha actual como predeterminada para fecha de ingreso
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('resource-entry-date').value = today;
}

// Abrir modal para editar
function openEditModal(id) {
    const item = inventoryData.find(item => item.id === id);
    if (!item) return;
    
    currentEditingId = id;
    modalTitle.textContent = 'Editar Registro';
    
    // Llenar el formulario con los datos del item
    document.getElementById('resource-name').value = item.name;
    document.getElementById('resource-category').value = item.category;
    document.getElementById('resource-description').value = item.description;
    document.getElementById('resource-location').value = item.location;
    document.getElementById('resource-assigned').value = item.assigned;
    document.getElementById('resource-status').value = item.status;
    document.getElementById('resource-entry-date').value = item.entryDate;
    document.getElementById('resource-expiry-date').value = item.expiryDate || '';
    fileNamesSpan.textContent = item.attachments && item.attachments.length > 0 ? 
        item.attachments.join(', ') : 'No se han seleccionado archivos';
    
    modal.style.display = 'block';
}

// Abrir modal de detalles
function openDetailModal(id) {
    const item = inventoryData.find(item => item.id === id);
    if (!item) return;
    
    const detailContent = document.getElementById('detail-content');
    
    // Determinar clase de estado
    let statusClass = '';
    switch(item.status) {
        case 'Disponible': statusClass = 'status-available'; break;
        case 'En uso': statusClass = 'status-in-use'; break;
        case 'Archivado': statusClass = 'status-archived'; break;
        case 'Vencido': statusClass = 'status-expired'; break;
        case 'Extraviado': statusClass = 'status-lost'; break;
    }
    
    // Verificar si está próximo a vencer
    let expiryAlert = '';
    if (item.expiryDate) {
        const today = new Date();
        const expiryDate = new Date(item.expiryDate);
        const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
            expiryAlert = '<div class="detail-alert expired">⚠️ Este recurso ha vencido</div>';
        } else if (daysUntilExpiry <= 30) {
            expiryAlert = `<div class="detail-alert expiring">⚠️ Este recurso vence en ${daysUntilExpiry} días</div>`;
        }
    }
    
    detailContent.innerHTML = `
        ${expiryAlert}
        <div class="detail-item">
            <div class="detail-label">Código/ID</div>
            <div class="detail-value">${item.id}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Nombre del Recurso</div>
            <div class="detail-value">${item.name}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Categoría</div>
            <div class="detail-value">${item.category}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Descripción</div>
            <div class="detail-value">${item.description}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Ubicación</div>
            <div class="detail-value">${item.location}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Asignado a</div>
            <div class="detail-value">${item.assigned}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Estado</div>
            <div class="detail-value"><span class="status-badge ${statusClass}">${item.status}</span></div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Fecha de Ingreso</div>
            <div class="detail-value">${formatDate(item.entryDate)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Fecha de Vencimiento</div>
            <div class="detail-value">${item.expiryDate ? formatDate(item.expiryDate) : 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Archivos Adjuntos</div>
            <div class="detail-value">${item.attachments && item.attachments.length > 0 ? 
                item.attachments.map(file => `<div><i class="fas fa-file"></i> ${file}</div>`).join('') : 
                'No hay archivos adjuntos'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Última Modificación</div>
            <div class="detail-value">${formatDateTime(item.lastModified)} por ${item.modifiedBy}</div>
        </div>
    `;
    
    detailModal.style.display = 'block';
}

// Manejar envío del formulario
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Obtener valores del formulario
    const formData = {
        name: document.getElementById('resource-name').value.trim(),
        category: document.getElementById('resource-category').value,
        description: document.getElementById('resource-description').value.trim(),
        location: document.getElementById('resource-location').value,
        assigned: document.getElementById('resource-assigned').value,
        status: document.getElementById('resource-status').value,
        entryDate: document.getElementById('resource-entry-date').value,
        expiryDate: document.getElementById('resource-expiry-date').value || null,
        attachments: getFilenamesFromInput(),
        lastModified: new Date().toISOString(),
        modifiedBy: "Usuario Actual" // En una app real, esto vendría de la sesión
    };
    
    // Validar campos requeridos
    if (!formData.name || !formData.category || !formData.description || 
        !formData.location || !formData.assigned || !formData.status || !formData.entryDate) {
        showNotification('Por favor, complete todos los campos requeridos.', 'error');
        return;
    }
    
    // Validar fechas
    if (formData.expiryDate && formData.entryDate > formData.expiryDate) {
        showNotification('La fecha de vencimiento no puede ser anterior a la fecha de ingreso.', 'error');
        return;
    }
    
    if (currentEditingId) {
        // Editar elemento existente
        const index = inventoryData.findIndex(item => item.id === currentEditingId);
        if (index !== -1) {
            // Mantener el ID original y combinar con nuevos datos
            inventoryData[index] = {
                ...inventoryData[index],
                ...formData,
                id: currentEditingId // Asegurar que el ID no cambie
            };
            showNotification('Registro actualizado correctamente.');
            
            // Registrar en historial (simulación)
            addToHistory('EDIT', currentEditingId);
        }
    } else {
        // Añadir nuevo elemento
        const newId = generateId();
        const newItem = {
            id: newId,
            ...formData
        };
        
        inventoryData.push(newItem);
        showNotification('Registro añadido correctamente.');
        
        // Registrar en historial (simulación)
        addToHistory('ADD', newId);
    }
    
    // Actualizar datos y vista
    originalData = [...inventoryData];
    saveData();
    filterTable();
    checkExpiringItems();
    closeModalFunc();
}

// Obtener nombres de archivos del input
function getFilenamesFromInput() {
    const files = fileInput.files;
    if (files.length > 0) {
        return Array.from(files).map(file => file.name);
    }
    return [];
}

// Eliminar elemento
function deleteItem(id) {
    const item = inventoryData.find(item => item.id === id);
    if (!item) return;
    
    if (confirm(`¿Está seguro de que desea eliminar el registro "${item.name}"? Esta acción no se puede deshacer.`)) {
        const index = inventoryData.findIndex(item => item.id === id);
        inventoryData.splice(index, 1);
        originalData = [...inventoryData];
        filteredData = filteredData.filter(item => item.id !== id);
        
        saveData();
        renderTable();
        showNotification('Registro eliminado correctamente.');
        
        // Registrar en historial (simulación)
        addToHistory('DELETE', id);
    }
}

// Generar ID único
function generateId() {
    const lastId = inventoryData.length > 0 ? 
        parseInt(inventoryData[inventoryData.length - 1].id.split('-')[1]) : 0;
    return `INV-${String(lastId + 1).padStart(3, '0')}`;
}

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Formatear fecha y hora
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    
    const date = new Date(dateTimeString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
}

// Acortar texto para mostrar en tabla
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Cerrar modal de añadir/editar
function closeModalFunc() {
    modal.style.display = 'none';
    form.reset();
    fileNamesSpan.textContent = 'No se han seleccionado archivos';
    currentEditingId = null;
}

// Cerrar modal de detalles
function closeDetailModalFunc() {
    detailModal.style.display = 'none';
}

// Mostrar notificación
function showNotification(message, type = 'success') {
    notificationText.textContent = message;
    notification.className = 'notification';
    notification.classList.add(type);
    notification.style.display = 'flex';
    
    // Ocultar automáticamente después de 5 segundos
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Verificar elementos próximos a vencer
function checkExpiringItems() {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const expiringItems = inventoryData.filter(item => {
        if (!item.expiryDate) return false;
        
        const expiryDate = new Date(item.expiryDate);
        return expiryDate > today && expiryDate <= thirtyDaysFromNow;
    });
    
    const expiredItems = inventoryData.filter(item => {
        if (!item.expiryDate) return false;
        
        const expiryDate = new Date(item.expiryDate);
        return expiryDate <= today;
    });
    
    if (expiringItems.length > 0 || expiredItems.length > 0) {
        let alertText = '';
        if (expiredItems.length > 0) {
            alertText += `${expiredItems.length} vencido(s)`;
        }
        if (expiringItems.length > 0) {
            if (alertText) alertText += ', ';
            alertText += `${expiringItems.length} por vencer`;
        }
        
        expiringAlertsSpan.textContent = alertText;
        expiringAlertsSpan.style.display = 'inline-block';
        
        // Mostrar notificación solo si hay elementos vencidos
        if (expiredItems.length > 0) {
            showNotification(
                `Hay ${expiredItems.length} recurso(s) vencidos y ${expiringItems.length} próximo(s) a vencer.`,
                'warning'
            );
        }
    } else {
        expiringAlertsSpan.textContent = '';
        expiringAlertsSpan.style.display = 'none';
    }
}

// Añadir registro al historial (simulación)
function addToHistory(action, itemId) {
    // En una implementación real, esto se guardaría en una tabla de historial
    console.log(`Historial: ${action} realizado en el item ${itemId}`);
}

// Exportar a PDF (simulación)
function exportToPdf() {
    showNotification('Preparando exportación a PDF...', 'warning');
    // En una implementación real, aquí se usaría una biblioteca como jsPDF
    setTimeout(() => {
        showNotification('Exportación a PDF completada.');
    }, 1500);
}

// Exportar a Excel (simulación)
function exportToExcel() {
    showNotification('Preparando exportación a Excel...', 'warning');
    // En una implementación real, aquí se usaría una biblioteca como SheetJS
    setTimeout(() => {
        showNotification('Exportación a Excel completada.');
    }, 1500);
}