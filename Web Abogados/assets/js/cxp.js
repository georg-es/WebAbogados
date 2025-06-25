// Estado global de la aplicación
let cuentasPorPagar = [];
let cuentaEditando = null;
let filtroActivo = 'all';

// Elementos del DOM
const modal = document.getElementById('accountModal');
const confirmModal = document.getElementById('confirmModal');
const form = document.getElementById('accountForm');
const tableBody = document.getElementById('accountsTableBody');
const searchInput = document.getElementById('searchInput');
const notifications = document.getElementById('notifications');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    cargarDatosPrueba();
    inicializarEventListeners();
    renderizarTabla();
    actualizarResumen();
});

// Datos de prueba
function cargarDatosPrueba() {
    const fechaHoy = new Date();
    const fechaVencida = new Date(fechaHoy.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 días atrás
    const fechaFutura = new Date(fechaHoy.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 días adelante

    cuentasPorPagar = [
        {
            id: 1,
            proveedor: 'Microsoft Corporation',
            concepto: 'Licencias Office 365',
            monto: 2500.00,
            vencimiento: fechaVencida.toISOString().split('T')[0],
            estado: 'pendiente',
            fechaProgramada: fechaHoy.toISOString().split('T')[0],
            notas: 'Renovación anual de licencias para todo el equipo'
        },
        {
            id: 2,
            proveedor: 'Suministros Legales S.A.',
            concepto: 'Papelería y suministros',
            monto: 750.50,
            vencimiento: fechaFutura.toISOString().split('T')[0],
            estado: 'pendiente',
            fechaProgramada: '',
            notas: 'Suministros mensuales'
        },
        {
            id: 3,
            proveedor: 'Thomson Reuters',
            concepto: 'Base de datos jurídica',
            monto: 5000.00,
            vencimiento: '2024-12-15',
            estado: 'pagado',
            fechaProgramada: '2024-12-10',
            notas: 'Suscripción anual Westlaw'
        },
        {
            id: 4,
            proveedor: 'Servicios Públicos',
            concepto: 'Factura de electricidad',
            monto: 1200.00,
            vencimiento: fechaFutura.toISOString().split('T')[0],
            estado: 'pendiente',
            fechaProgramada: fechaFutura.toISOString().split('T')[0],
            notas: ''
        }
    ];
}

// Event Listeners
function inicializarEventListeners() {
    // Botón nueva cuenta
    document.getElementById('btnNuevaCuenta').addEventListener('click', abrirModalNuevo);
    
    // Cerrar modales
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', cerrarModales);
    });
    
    // Cancelar formulario
    document.getElementById('btnCancelar').addEventListener('click', cerrarModales);
    document.getElementById('btnConfirmCancel').addEventListener('click', cerrarModales);
    
    // Envío del formulario
    form.addEventListener('submit', guardarCuenta);
    
    // Búsqueda
    searchInput.addEventListener('input', filtrarTabla);
    
    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filtroActivo = this.dataset.filter;
            filtrarTabla();
        });
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === modal || event.target === confirmModal) {
            cerrarModales();
        }
    });
}

// Funciones del modal
function abrirModalNuevo() {
    cuentaEditando = null;
    document.getElementById('modalTitle').textContent = 'Nueva Cuenta por Pagar';
    form.reset();
    modal.style.display = 'block';
}

function abrirModalEditar(id) {
    const cuenta = cuentasPorPagar.find(c => c.id === id);
    if (!cuenta) return;
    
    cuentaEditando = cuenta;
    document.getElementById('modalTitle').textContent = 'Editar Cuenta por Pagar';
    
    // Llenar el formulario
    document.getElementById('proveedor').value = cuenta.proveedor;
    document.getElementById('concepto').value = cuenta.concepto;
    document.getElementById('monto').value = cuenta.monto;
    document.getElementById('vencimiento').value = cuenta.vencimiento;
    document.getElementById('estado').value = cuenta.estado;
    document.getElementById('fechaProgramada').value = cuenta.fechaProgramada || '';
    document.getElementById('notas').value = cuenta.notas || '';
    
    modal.style.display = 'block';
}

function cerrarModales() {
    modal.style.display = 'none';
    confirmModal.style.display = 'none';
    cuentaEditando = null;
}

// Guardar cuenta
function guardarCuenta(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const cuenta = {
        proveedor: formData.get('proveedor'),
        concepto: formData.get('concepto'),
        monto: parseFloat(formData.get('monto')),
        vencimiento: formData.get('vencimiento'),
        estado: formData.get('estado'),
        fechaProgramada: formData.get('fechaProgramada'),
        notas: formData.get('notas')
    };
    
    if (cuentaEditando) {
        // Editar cuenta existente
        const index = cuentasPorPagar.findIndex(c => c.id === cuentaEditando.id);
        cuentasPorPagar[index] = { ...cuenta, id: cuentaEditando.id };
        mostrarNotificacion('Cuenta actualizada exitosamente', 'success');
    } else {
        // Nueva cuenta
        cuenta.id = Date.now();
        cuentasPorPagar.push(cuenta);
        mostrarNotificacion('Cuenta creada exitosamente', 'success');
    }
    
    cerrarModales();
    renderizarTabla();
    actualizarResumen();
}

// Eliminar cuenta
function eliminarCuenta(id) {
    const cuenta = cuentasPorPagar.find(c => c.id === id);
    if (!cuenta) return;
    
    document.getElementById('confirmMessage').textContent = 
        `¿Está seguro de eliminar la cuenta de ${cuenta.proveedor}?`;
    
    document.getElementById('btnConfirmAction').onclick = function() {
        cuentasPorPagar = cuentasPorPagar.filter(c => c.id !== id);
        mostrarNotificacion('Cuenta eliminada exitosamente', 'success');
        cerrarModales();
        renderizarTabla();
        actualizarResumen();
    };
    
    confirmModal.style.display = 'block';
}

// Marcar como pagado
function marcarComoPagado(id) {
    const cuenta = cuentasPorPagar.find(c => c.id === id);
    if (!cuenta) return;
    
    if (cuenta.estado === 'pagado') {
        mostrarNotificacion('Esta cuenta ya está marcada como pagada', 'warning');
        return;
    }
    
    document.getElementById('confirmMessage').textContent = 
        `¿Confirmar el pago de ${cuenta.proveedor} por $${cuenta.monto.toFixed(2)}?`;
    
    document.getElementById('btnConfirmAction').onclick = function() {
        cuenta.estado = 'pagado';
        mostrarNotificacion('Pago registrado exitosamente', 'success');
        cerrarModales();
        renderizarTabla();
        actualizarResumen();
    };
    
    confirmModal.style.display = 'block';
}

// Enviar recordatorio
function enviarRecordatorio(id) {
    const cuenta = cuentasPorPagar.find(c => c.id === id);
    if (!cuenta) return;
    
    // Simular envío de recordatorio
    mostrarNotificacion(`Recordatorio enviado para ${cuenta.proveedor}`, 'success');
}

// Renderizar tabla
function renderizarTabla() {
    const cuentasFiltradas = filtrarCuentas();
    
    if (cuentasFiltradas.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    No se encontraron cuentas por pagar
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = cuentasFiltradas.map(cuenta => {
        const esVencida = new Date(cuenta.vencimiento) < new Date() && cuenta.estado === 'pendiente';
        const estadoClass = esVencida ? 'vencida' : cuenta.estado;
        const estadoTexto = esVencida ? 'Vencida' : 
                           cuenta.estado === 'pendiente' ? 'Pendiente' : 'Pagado';
        
        return `
            <tr>
                <td><strong>${cuenta.proveedor}</strong></td>
                <td>${cuenta.concepto}</td>
                <td><strong>${cuenta.monto.toFixed(2)}</strong></td>
                <td>${formatearFecha(cuenta.vencimiento)}</td>
                <td>
                    <span class="status-badge status-${estadoClass}">
                        ${estadoTexto}
                    </span>
                </td>
                <td>${cuenta.fechaProgramada ? formatearFecha(cuenta.fechaProgramada) : '-'}</td>
                <td>
                    <div class="action-buttons">
                        ${cuenta.estado === 'pendiente' ? `
                            <button class="btn btn-success btn-small" onclick="marcarComoPagado(${cuenta.id})"
                                    title="Marcar como pagado">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-primary btn-small" onclick="enviarRecordatorio(${cuenta.id})"
                                    title="Enviar recordatorio">
                                <i class="fas fa-bell"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-secondary btn-small" onclick="abrirModalEditar(${cuenta.id})"
                                title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-small" onclick="eliminarCuenta(${cuenta.id})"
                                title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Filtrar cuentas
function filtrarCuentas() {
    let cuentasFiltradas = [...cuentasPorPagar];
    
    // Filtro por estado
    if (filtroActivo !== 'all') {
        if (filtroActivo === 'vencidas') {
            cuentasFiltradas = cuentasFiltradas.filter(cuenta => {
                return new Date(cuenta.vencimiento) < new Date() && cuenta.estado === 'pendiente';
            });
        } else {
            cuentasFiltradas = cuentasFiltradas.filter(cuenta => cuenta.estado === filtroActivo);
        }
    }
    
    // Filtro por búsqueda
    const textoBusqueda = searchInput.value.toLowerCase().trim();
    if (textoBusqueda) {
        cuentasFiltradas = cuentasFiltradas.filter(cuenta => 
            cuenta.proveedor.toLowerCase().includes(textoBusqueda) ||
            cuenta.concepto.toLowerCase().includes(textoBusqueda)
        );
    }
    
    return cuentasFiltradas;
}

// Filtrar tabla
function filtrarTabla() {
    renderizarTabla();
}

// Actualizar resumen
function actualizarResumen() {
    const pendientes = cuentasPorPagar.filter(c => c.estado === 'pendiente');
    const vencidas = pendientes.filter(c => new Date(c.vencimiento) < new Date());
    const pagadas = cuentasPorPagar.filter(c => c.estado === 'pagado');
    
    const totalPendientes = pendientes.reduce((sum, c) => sum + c.monto, 0);
    const totalVencidas = vencidas.reduce((sum, c) => sum + c.monto, 0);
    const totalPagadas = pagadas.reduce((sum, c) => sum + c.monto, 0);
    
    document.getElementById('totalPendientes').textContent = `${totalPendientes.toFixed(2)}`;
    document.getElementById('totalVencidas').textContent = `${totalVencidas.toFixed(2)}`;
    document.getElementById('totalPagadas').textContent = `${totalPagadas.toFixed(2)}`;
}

// Utilidades
function formatearFecha(fecha) {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function mostrarNotificacion(mensaje, tipo = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas ${tipo === 'success' ? 'fa-check-circle' : 
                          tipo === 'error' ? 'fa-exclamation-circle' : 
                          'fa-exclamation-triangle'}"></i>
            <span>${mensaje}</span>
        </div>
    `;
    
    notifications.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notifications.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Función para exportar datos (opcional)
function exportarDatos() {
    const dataStr = JSON.stringify(cuentasPorPagar, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cuentas-por-pagar.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Función para verificar vencimientos (se puede llamar periódicamente)
function verificarVencimientos() {
    const hoy = new Date();
    const vencimientosProximos = cuentasPorPagar.filter(cuenta => {
        if (cuenta.estado !== 'pendiente') return false;
        
        const vencimiento = new Date(cuenta.vencimiento);
        const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
        
        return diasRestantes <= 7 && diasRestantes >= 0; // Próximos 7 días
    });
    
    if (vencimientosProximos.length > 0) {
        const mensaje = `Tienes ${vencimientosProximos.length} cuenta(s) por vencer en los próximos 7 días`;
        mostrarNotificacion(mensaje, 'warning');
    }
}

// Verificar vencimientos al cargar la página
setTimeout(verificarVencimientos, 2000);

// Animación CSS adicional para slideOutRight
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);