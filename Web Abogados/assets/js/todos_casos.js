// Variables para paginación y filtrado
let currentPage = 1;
let pageSize = 10;
let totalCases = 0;
let sortField = 'date';
let sortDirection = 'desc';

// Función para cargar casos con filtros
async function loadCases() {
    const statusFilter = document.getElementById('status-filter').value;
    const typeFilter = document.getElementById('type-filter').value;
    const lawyerFilter = document.getElementById('lawyer-filter').value;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    const searchQuery = document.getElementById('search').value;
    
    // Simulamos una carga de datos
    console.log('Cargando casos con filtros:', {
        statusFilter, typeFilter, lawyerFilter, dateFrom, dateTo, searchQuery,
        page: currentPage, size: pageSize, sort: sortField, dir: sortDirection
    });
    
    // Simulamos una respuesta del servidor
    setTimeout(() => {
        totalCases = 35; // Este valor debería venir de la API real
        updatePagination();
        updateSummary();
        // Aquí iría el código para renderizar los casos en la tabla
        // Ejemplo: renderCases(data.cases);
    }, 500);
}

// Función para actualizar la paginación
function updatePagination() {
    const totalPages = Math.ceil(totalCases / pageSize);
    document.getElementById('page-info').textContent = `Página ${currentPage} de ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
}

// Función para actualizar el resumen
function updateSummary() {
    document.getElementById('total-cases').textContent = totalCases;
    document.getElementById('in-progress-cases').textContent = Math.floor(totalCases * 0.4);
    document.getElementById('pending-cases').textContent = Math.floor(totalCases * 0.3);
    document.getElementById('resolved-cases').textContent = Math.floor(totalCases * 0.2);
    document.getElementById('canceled-cases').textContent = Math.floor(totalCases * 0.1);
}

// Event listeners
document.getElementById('apply-filters').addEventListener('click', () => {
    currentPage = 1;
    loadCases();
});

document.getElementById('clear-filters').addEventListener('click', () => {
    document.getElementById('status-filter').value = 'all';
    document.getElementById('type-filter').value = 'all';
    document.getElementById('lawyer-filter').value = 'all';
    document.getElementById('date-from').value = '';
    document.getElementById('date-to').value = '';
    document.getElementById('search').value = '';
    currentPage = 1;
    loadCases();
});

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadCases();
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage < Math.ceil(totalCases / pageSize)) {
        currentPage++;
        loadCases();
    }
});

document.getElementById('page-size').addEventListener('change', (e) => {
    pageSize = parseInt(e.target.value);
    currentPage = 1;
    loadCases();
});

// Ordenamiento
document.querySelectorAll('.sortable').forEach(header => {
    header.addEventListener('click', () => {
        const field = header.dataset.sort;
        if (sortField === field) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortField = field;
            sortDirection = 'asc';
        }
        
        // Actualizar iconos de ordenamiento
        document.querySelectorAll('.sortable i').forEach(icon => {
            icon.className = 'fas fa-sort';
        });
        
        const icon = header.querySelector('i');
        icon.className = `fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`;
        
        loadCases();
    });
});

// Botón nuevo caso
document.getElementById('new-case-btn').addEventListener('click', () => {
    alert('Funcionalidad para crear nuevo caso se implementará aquí');
});

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Establecer fechas por defecto (últimos 30 días)
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    document.getElementById('date-from').valueAsDate = lastMonth;
    document.getElementById('date-to').valueAsDate = today;
    
    // Cargar casos iniciales
    loadCases();
});

// Función auxiliar para obtener clase de estado (se mantiene aquí por si se necesita para renderizar datos dinámicos)
function getStatusClass(status) {
    switch(status.toLowerCase()) {
        case 'en proceso': return 'status-in-progress';
        case 'pendiente': return 'status-pending';
        case 'resuelto': return 'status-resolved';
        case 'cancelado': return 'status-canceled';
        default: return '';
    }
}