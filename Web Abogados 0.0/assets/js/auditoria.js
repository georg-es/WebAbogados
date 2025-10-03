// Datos de ejemplo para simular registros de auditoría
const sampleAuditData = [
    {
        id: '550e8400-e29b-41d4-a716-446655440000',
        timestamp_utc: '2023-06-15T14:30:00Z',
        user_id: 'user1',
        user_name: 'Juan Pérez',
        user_role: 'Administrador',
        action: 'actualizar',
        module: 'Clientes',
        object_type: 'Cliente',
        object_id: '12345',
        before_data: { nombre: 'Cliente A', email: 'clienteA@ejemplo.com', telefono: '123456789' },
        after_data: { nombre: 'Cliente A', email: 'clienteA@nuevo.com', telefono: '123456789' },
        result: 'success',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        session_id: 'session123',
        correlation_id: 'corr456',
        origin: 'web',
        comment: 'Actualización de correo electrónico del cliente',
        immutable_hash: 'abc123def456',
        prev_hash: 'prev123hash',
        tenant_id: 'tenant1',
        sensitive_masked: false
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440001',
        timestamp_utc: '2023-06-15T14:25:00Z',
        user_id: 'user2',
        user_name: 'María García',
        user_role: 'Auditor',
        action: 'leer',
        module: 'Casos',
        object_type: 'Caso',
        object_id: '67890',
        before_data: null,
        after_data: null,
        result: 'success',
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        session_id: 'session124',
        correlation_id: 'corr457',
        origin: 'web',
        comment: 'Consulta de caso para revisión',
        immutable_hash: 'def456abc789',
        prev_hash: 'abc123def456',
        tenant_id: 'tenant1',
        sensitive_masked: true
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440002',
        timestamp_utc: '2023-06-15T14:20:00Z',
        user_id: 'user3',
        user_name: 'Carlos López',
        user_role: 'Usuario',
        action: 'crear',
        module: 'Facturación',
        object_type: 'Factura',
        object_id: 'F-2023-001',
        before_data: null,
        after_data: { numero: 'F-2023-001', cliente: 'Cliente B', total: 1500.00 },
        result: 'success',
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36',
        session_id: 'session125',
        correlation_id: 'corr458',
        origin: 'mobile',
        comment: 'Creación de nueva factura',
        immutable_hash: 'ghi789def012',
        prev_hash: 'def456abc789',
        tenant_id: 'tenant1',
        sensitive_masked: false
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440003',
        timestamp_utc: '2023-06-15T14:15:00Z',
        user_id: 'user1',
        user_name: 'Juan Pérez',
        user_role: 'Administrador',
        action: 'eliminar',
        module: 'Usuarios',
        object_type: 'Usuario',
        object_id: 'user99',
        before_data: { nombre: 'Usuario Eliminado', rol: 'Usuario', activo: true },
        after_data: null,
        result: 'success',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        session_id: 'session123',
        correlation_id: 'corr459',
        origin: 'web',
        comment: 'Eliminación de usuario inactivo',
        immutable_hash: 'jkl012ghi345',
        prev_hash: 'ghi789def012',
        tenant_id: 'tenant1',
        sensitive_masked: false
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440004',
        timestamp_utc: '2023-06-15T14:10:00Z',
        user_id: 'user4',
        user_name: 'Ana Rodríguez',
        user_role: 'Usuario',
        action: 'login',
        module: 'Autenticación',
        object_type: null,
        object_id: null,
        before_data: null,
        after_data: null,
        result: 'failure',
        ip_address: '192.168.1.103',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        session_id: 'session126',
        correlation_id: 'corr460',
        origin: 'web',
        comment: 'Intento de login fallido - contraseña incorrecta',
        immutable_hash: 'mno345jkl678',
        prev_hash: 'jkl012ghi345',
        tenant_id: 'tenant1',
        sensitive_masked: false
    }
];

// Estado de la aplicación
let appState = {
    currentPage: 1,
    itemsPerPage: 10,
    filteredData: [...sampleAuditData],
    currentFilters: {}
};

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    renderAuditTable();
});

// Inicializar la aplicación
function initializeApp() {
    // Establecer fechas por defecto (últimos 7 días)
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    document.getElementById('date-from').value = formatDateForInput(sevenDaysAgo);
    document.getElementById('date-to').value = formatDateForInput(now);
    
    // Cargar datos de ejemplo
    appState.filteredData = [...sampleAuditData];
}

// Configurar event listeners
function setupEventListeners() {
    // Filtros
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    document.getElementById('save-search').addEventListener('click', saveSearch);
    
    // Paginación
    document.getElementById('prev-page').addEventListener('click', goToPrevPage);
    document.getElementById('next-page').addEventListener('click', goToNextPage);
    
    // Exportación
    document.getElementById('export-btn').addEventListener('click', openExportModal);
    document.getElementById('confirm-export').addEventListener('click', confirmExport);
    document.getElementById('cancel-export').addEventListener('click', closeExportModal);
    
    // Paquete de evidencia
    document.getElementById('evidence-pack').addEventListener('click', createEvidencePack);
    
    // Modales
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    document.getElementById('close-modal').addEventListener('click', function() {
        document.getElementById('detail-modal').style.display = 'none';
    });
    
    // Tabs
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Aplicar filtros
function applyFilters() {
    const filters = {
        dateFrom: document.getElementById('date-from').value,
        dateTo: document.getElementById('date-to').value,
        module: document.getElementById('module').value,
        action: document.getElementById('action').value,
        user: document.getElementById('user').value,
        result: document.getElementById('result').value,
        search: document.getElementById('search').value.toLowerCase()
    };
    
    appState.currentFilters = filters;
    appState.currentPage = 1;
    
    // Filtrar datos
    let filtered = sampleAuditData.filter(record => {
        // Filtro por fecha
        if (filters.dateFrom) {
            const recordDate = new Date(record.timestamp_utc);
            const filterFrom = new Date(filters.dateFrom);
            if (recordDate < filterFrom) return false;
        }
        
        if (filters.dateTo) {
            const recordDate = new Date(record.timestamp_utc);
            const filterTo = new Date(filters.dateTo);
            if (recordDate > filterTo) return false;
        }
        
        // Filtro por módulo
        if (filters.module && record.module !== filters.module) return false;
        
        // Filtro por acción
        if (filters.action && record.action !== filters.action) return false;
        
        // Filtro por usuario
        if (filters.user && record.user_id !== filters.user) return false;
        
        // Filtro por resultado
        if (filters.result && record.result !== filters.result) return false;
        
        // Búsqueda de texto
        if (filters.search) {
            const searchText = filters.search;
            const searchableFields = [
                record.comment,
                record.object_id,
                record.correlation_id,
                record.user_name
            ].join(' ').toLowerCase();
            
            if (!searchableFields.includes(searchText)) return false;
        }
        
        return true;
    });
    
    appState.filteredData = filtered;
    renderAuditTable();
}

// Restablecer filtros
function resetFilters() {
    document.getElementById('date-from').value = '';
    document.getElementById('date-to').value = '';
    document.getElementById('module').value = '';
    document.getElementById('action').value = '';
    document.getElementById('user').value = '';
    document.getElementById('result').value = '';
    document.getElementById('search').value = '';
    
    appState.currentFilters = {};
    appState.currentPage = 1;
    appState.filteredData = [...sampleAuditData];
    renderAuditTable();
}

// Guardar búsqueda
function saveSearch() {
    alert('Función de guardar búsqueda será implementada en el backend');
}

// Renderizar tabla de auditoría
function renderAuditTable() {
    const tableBody = document.getElementById('audit-table-body');
    tableBody.innerHTML = '';
    
    const startIndex = (appState.currentPage - 1) * appState.itemsPerPage;
    const endIndex = startIndex + appState.itemsPerPage;
    const currentPageData = appState.filteredData.slice(startIndex, endIndex);
    
    if (currentPageData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px;">
                    No se encontraron registros que coincidan con los filtros aplicados
                </td>
            </tr>
        `;
        return;
    }
    
    currentPageData.forEach(record => {
        const row = document.createElement('tr');
        
        // Convertir UTC a hora local (America/Panama)
        const localTime = convertUTCToLocal(record.timestamp_utc, 'America/Panama');
        
        // Determinar clase para el resultado
        let resultClass = '';
        if (record.result === 'success') resultClass = 'result-success';
        else if (record.result === 'failure') resultClass = 'result-failure';
        else if (record.result === 'error') resultClass = 'result-error';
        
        row.innerHTML = `
            <td>${localTime}</td>
            <td>${record.user_name}</td>
            <td>${record.module}</td>
            <td>${capitalizeFirstLetter(record.action)}</td>
            <td>${record.object_type ? `${record.object_type}: ${record.object_id}` : 'N/A'}</td>
            <td><span class="result-badge ${resultClass}">${capitalizeFirstLetter(record.result)}</span></td>
            <td>${record.ip_address}</td>
            <td>
                <button class="btn btn-outline view-details" data-id="${record.id}">
                    <i class="fas fa-eye"></i> Ver
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Actualizar información de paginación
    updatePaginationInfo();
    
    // Agregar event listeners a los botones de detalles
    document.querySelectorAll('.view-details').forEach(btn => {
        btn.addEventListener('click', function() {
            const recordId = this.getAttribute('data-id');
            showRecordDetails(recordId);
        });
    });
}

// Actualizar información de paginación
function updatePaginationInfo() {
    const totalPages = Math.ceil(appState.filteredData.length / appState.itemsPerPage);
    document.getElementById('page-info').textContent = `Página ${appState.currentPage} de ${totalPages}`;
    
    // Habilitar/deshabilitar botones de paginación
    document.getElementById('prev-page').disabled = appState.currentPage === 1;
    document.getElementById('next-page').disabled = appState.currentPage === totalPages;
}

// Ir a página anterior
function goToPrevPage() {
    if (appState.currentPage > 1) {
        appState.currentPage--;
        renderAuditTable();
    }
}

// Ir a página siguiente
function goToNextPage() {
    const totalPages = Math.ceil(appState.filteredData.length / appState.itemsPerPage);
    if (appState.currentPage < totalPages) {
        appState.currentPage++;
        renderAuditTable();
    }
}

// Mostrar detalles del registro
function showRecordDetails(recordId) {
    const record = appState.filteredData.find(r => r.id === recordId);
    if (!record) return;
    
    // Pestaña de información general
    document.getElementById('detail-id').textContent = record.id;
    document.getElementById('detail-timestamp-utc').textContent = record.timestamp_utc;
    document.getElementById('detail-timestamp-local').textContent = convertUTCToLocal(record.timestamp_utc, 'America/Panama');
    document.getElementById('detail-user').textContent = `${record.user_name} (${record.user_id})`;
    document.getElementById('detail-role').textContent = record.user_role;
    document.getElementById('detail-module').textContent = record.module;
    document.getElementById('detail-action').textContent = capitalizeFirstLetter(record.action);
    document.getElementById('detail-object-type').textContent = record.object_type || 'N/A';
    document.getElementById('detail-object-id').textContent = record.object_id || 'N/A';
    document.getElementById('detail-result').textContent = capitalizeFirstLetter(record.result);
    document.getElementById('detail-ip').textContent = record.ip_address;
    document.getElementById('detail-origin').textContent = record.origin;
    document.getElementById('detail-session').textContent = record.session_id;
    document.getElementById('detail-correlation').textContent = record.correlation_id;
    document.getElementById('detail-comment').textContent = record.comment || 'Sin comentario';
    
    // Pestaña de cambios
    document.getElementById('before-data').textContent = record.before_data ? 
        JSON.stringify(record.before_data, null, 2) : 'No hay datos anteriores';
    
    document.getElementById('after-data').textContent = record.after_data ? 
        JSON.stringify(record.after_data, null, 2) : 'No hay datos posteriores';
    
    // Calcular y mostrar cambios
    if (record.before_data && record.after_data) {
        const changes = calculateChanges(record.before_data, record.after_data);
        displayChanges(changes);
    } else {
        document.getElementById('changes-list').innerHTML = '<p>No se detectaron cambios o no hay datos suficientes para comparar</p>';
    }
    
    // Pestaña JSON crudo
    document.getElementById('raw-json').textContent = JSON.stringify(record, null, 2);
    
    // Mostrar modal
    document.getElementById('detail-modal').style.display = 'block';
    
    // Activar pestaña por defecto
    switchTab('general');
}

// Calcular cambios entre before_data y after_data
function calculateChanges(before, after) {
    const changes = [];
    
    // Obtener todas las claves únicas
    const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
    
    allKeys.forEach(key => {
        const beforeValue = before ? before[key] : undefined;
        const afterValue = after ? after[key] : undefined;
        
        if (beforeValue !== afterValue) {
            changes.push({
                field: key,
                before: beforeValue,
                after: afterValue
            });
        }
    });
    
    return changes;
}

// Mostrar cambios en la interfaz
function displayChanges(changes) {
    const changesList = document.getElementById('changes-list');
    
    if (changes.length === 0) {
        changesList.innerHTML = '<p>No se detectaron cambios</p>';
        return;
    }
    
    let html = '';
    changes.forEach(change => {
        html += `
            <div class="change-item">
                <strong>${change.field}:</strong> 
                <span style="color: #e74c3c; text-decoration: line-through;">${change.before !== undefined ? change.before : 'N/A'}</span> 
                → 
                <span style="color: #27ae60;">${change.after !== undefined ? change.after : 'N/A'}</span>
            </div>
        `;
    });
    
    changesList.innerHTML = html;
}

// Cambiar pestaña en el modal de detalles
function switchTab(tabName) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Desactivar todos los botones de pestaña
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Activar pestaña seleccionada
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.querySelector(`.tab-button[data-tab="${tabName}"]`).classList.add('active');
}

// Abrir modal de exportación
function openExportModal() {
    document.getElementById('export-modal').style.display = 'block';
}

// Cerrar modal de exportación
function closeExportModal() {
    document.getElementById('export-modal').style.display = 'none';
}

// Confirmar exportación
function confirmExport() {
    const format = document.querySelector('input[name="format"]:checked').value;
    const range = document.querySelector('input[name="range"]:checked').value;
    
    // Obtener campos seleccionados
    const selectedFields = [];
    document.querySelectorAll('input[name="fields"]:checked').forEach(checkbox => {
        selectedFields.push(checkbox.value);
    });
    
    alert(`Exportando datos en formato ${format.toUpperCase()} con los campos: ${selectedFields.join(', ')}`);
    closeExportModal();
}

// Crear paquete de evidencia
function createEvidencePack() {
    alert('Creando paquete de evidencia firmado para los registros actuales...');
    // En una implementación real, esto generaría un archivo firmado con checksum
}

// Utilidades
function formatDateForInput(date) {
    return date.toISOString().slice(0, 16);
}

function convertUTCToLocal(utcString, timezone) {
    const date = new Date(utcString);
    
    // Para Panama (UTC-5), ajustar manualmente
    // En una implementación real, usaríamos una librería como moment-timezone
    const panamaOffset = -5 * 60; // UTC-5 en minutos
    const localDate = new Date(date.getTime() + panamaOffset * 60 * 1000);
    
    return localDate.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}