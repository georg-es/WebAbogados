// Clase principal para gestionar cuentas por cobrar
class CuentasPorCobrar {
    constructor() {
        this.facturas = [];
        this.facturasFiltradas = [];
        this.paginaActual = 1;
        this.facturasPorPagina = 10;
        this.init();
    }

    init() {
        this.cargarDatosEjemplo();
        this.setupEventListeners();
        this.actualizarUI();
    }

    // Cargar datos de ejemplo para demostración
    cargarDatosEjemplo() {
        const fechaHoy = new Date();
        fechaHoy.setHours(0, 0, 0, 0); // Normalizar a inicio del día para comparación

        const facturasPrueba = [
            {
                id: 1,
                numero: 'FAC-2024-001',
                cliente: 'Corporación ABC S.A.',
                fechaEmision: new Date(2024, 4, 1), // Meses son 0-indexados (Mayo es 4)
                fechaVencimiento: new Date(2024, 4, 31),
                monto: 15000.00,
                estado: 'vencida'
            },
            {
                id: 2,
                numero: 'FAC-2024-002',
                cliente: 'Distribuidora XYZ',
                fechaEmision: new Date(2024, 5, 15),
                fechaVencimiento: new Date(2024, 6, 15),
                monto: 8500.50,
                estado: 'pendiente'
            },
            {
                id: 3,
                numero: 'FAC-2024-003',
                cliente: 'Servicios Integrales',
                fechaEmision: new Date(2024, 5, 20),
                fechaVencimiento: fechaHoy, // Vencida hoy para simular "pagada hoy" si se marca
                monto: 12300.75,
                estado: 'pagada' // Asumimos que esta fue pagada hoy
            },
            {
                id: 4,
                numero: 'FAC-2024-004',
                cliente: 'Tecnología Avanzada',
                fechaEmision: new Date(2024, 5, 25),
                fechaVencimiento: new Date(2024, 6, 25),
                monto: 22100.00,
                estado: 'pendiente'
            },
            {
                id: 5,
                numero: 'FAC-2024-005',
                cliente: 'Constructora Delta',
                fechaEmision: new Date(2024, 3, 10),
                fechaVencimiento: new Date(2024, 4, 10),
                monto: 35000.00,
                estado: 'vencida'
            }
        ];

        this.facturas = facturasPrueba;
        this.facturasFiltradas = [...this.facturas];
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botones principales
        document.getElementById('addInvoiceBtn').addEventListener('click', () => this.mostrarModalFactura());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportarDatos());
        document.getElementById('sendRemindersBtn').addEventListener('click', () => this.enviarRecordatorios());

        // Filtros
        document.getElementById('statusFilter').addEventListener('change', () => this.aplicarFiltros());
        document.getElementById('clientFilter').addEventListener('input', () => this.aplicarFiltros());
        document.getElementById('dateFilter').addEventListener('change', () => this.aplicarFiltros());
        document.getElementById('clearFilters').addEventListener('click', () => this.limpiarFiltros());

        // Modal de factura
        document.getElementById('closeModal').addEventListener('click', () => this.cerrarModal('invoiceModal'));
        document.getElementById('cancelBtn').addEventListener('click', () => this.cerrarModal('invoiceModal'));
        document.getElementById('invoiceForm').addEventListener('submit', (e) => this.guardarFactura(e));

        // Modal de confirmación
        document.getElementById('confirmCancel').addEventListener('click', () => this.cerrarModal('confirmModal'));

        // Paginación
        document.getElementById('prevPage').addEventListener('click', () => this.cambiarPagina(-1));
        document.getElementById('nextPage').addEventListener('click', () => this.cambiarPagina(1));

        // Select all checkbox
        document.getElementById('selectAll').addEventListener('change', (e) => this.seleccionarTodas(e.target.checked));

        // Cerrar modales al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.cerrarModal(e.target.id);
            }
        });
    }

    // Actualizar toda la interfaz
    actualizarUI() {
        this.actualizarResumen();
        this.renderizarTabla();
        this.actualizarPaginacion();
    }

    // Actualizar tarjetas de resumen
    actualizarResumen() {
        const fechaHoy = new Date();
        fechaHoy.setHours(0, 0, 0, 0);

        const resumen = this.facturas.reduce((acc, factura) => {
            // Recalcular estado basado en la fecha actual
            const fechaVencimientoNormalizada = new Date(factura.fechaVencimiento);
            fechaVencimientoNormalizada.setHours(0, 0, 0, 0);

            let estadoActual = factura.estado;
            if (estadoActual !== 'pagada' && fechaVencimientoNormalizada < fechaHoy) {
                estadoActual = 'vencida';
            } else if (estadoActual !== 'pagada' && fechaVencimientoNormalizada >= fechaHoy) {
                estadoActual = 'pendiente';
            }

            switch (estadoActual) {
                case 'pendiente':
                    acc.pendientes.total += factura.monto;
                    acc.pendientes.count++;
                    break;
                case 'vencida':
                    acc.vencidas.total += factura.monto;
                    acc.vencidas.count++;
                    break;
                case 'pagada':
                    // Solo contar las pagadas hoy
                    const fechaEmisionNormalizada = new Date(factura.fechaEmision); // Asumimos fechaEmision como fecha de pago para simplificar
                    fechaEmisionNormalizada.setHours(0, 0, 0, 0);
                    if (fechaEmisionNormalizada.getTime() === fechaHoy.getTime()) {
                        acc.pagadasHoy.total += factura.monto;
                        acc.pagadasHoy.count++;
                    }
                    break;
            }
            return acc;
        }, {
            pendientes: { total: 0, count: 0 },
            vencidas: { total: 0, count: 0 },
            pagadasHoy: { total: 0, count: 0 }
        });

        document.getElementById('totalPending').textContent = this.formatearMoneda(resumen.pendientes.total);
        document.getElementById('countPending').textContent = `${resumen.pendientes.count} facturas`;

        document.getElementById('totalOverdue').textContent = this.formatearMoneda(resumen.vencidas.total);
        document.getElementById('countOverdue').textContent = `${resumen.vencidas.count} facturas`;

        document.getElementById('totalPaidToday').textContent = this.formatearMoneda(resumen.pagadasHoy.total);
        document.getElementById('countPaidToday').textContent = `${resumen.pagadasHoy.count} facturas`;
    }

    // Renderizar tabla de facturas
    renderizarTabla() {
        const tbody = document.getElementById('invoicesTableBody');
        const inicio = (this.paginaActual - 1) * this.facturasPorPagina;
        const fin = inicio + this.facturasPorPagina;
        const facturasPagina = this.facturasFiltradas.slice(inicio, fin);

        tbody.innerHTML = '';

        if (facturasPagina.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                        No se encontraron facturas
                    </td>
                </tr>
            `;
            return;
        }

        facturasPagina.forEach(factura => {
            const fila = document.createElement('tr');
            const diasVencido = this.calcularDiasVencido(factura);
            const estadoDisplay = this.obtenerEstadoActual(factura); // Obtener estado actualizado
            
            fila.innerHTML = `
                <td><input type="checkbox" class="invoice-checkbox" data-id="${factura.id}"></td>
                <td><strong>${factura.numero}</strong></td>
                <td>${factura.cliente}</td>
                <td>${this.formatearFecha(factura.fechaEmision)}</td>
                <td>${this.formatearFecha(factura.fechaVencimiento)}</td>
                <td><strong>${this.formatearMoneda(factura.monto)}</strong></td>
                <td><span class="status-badge status-${estadoDisplay}">${this.formatearEstado(estadoDisplay)}</span></td>
                <td>${diasVencido > 0 ? `<span style="color: var(--danger-color); font-weight: 600;">${diasVencido} días</span>` : '-'}</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        ${estadoDisplay !== 'pagada' ? `<button class="btn btn-success" style="padding: 4px 8px; font-size: 12px;" onclick="app.marcarComoPagada(${factura.id})">
                            <i class="fas fa-check"></i>
                        </button>` : ''}
                        ${estadoDisplay !== 'pagada' ? `<button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px;" onclick="app.enviarRecordatorio(${factura.id})">
                            <i class="fas fa-envelope"></i>
                        </button>` : ''}
                        <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="app.eliminarFactura(${factura.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            tbody.appendChild(fila);
        });
    }

    // Obtener estado actual de la factura (calculado en tiempo real)
    obtenerEstadoActual(factura) {
        if (factura.estado === 'pagada') {
            return 'pagada';
        }
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const vencimiento = new Date(factura.fechaVencimiento);
        vencimiento.setHours(0, 0, 0, 0);

        if (vencimiento < hoy) {
            return 'vencida';
        }
        return 'pendiente';
    }


    // Aplicar filtros
    aplicarFiltros() {
        const statusFilter = document.getElementById('statusFilter').value;
        const clientFilter = document.getElementById('clientFilter').value.toLowerCase();
        const dateFilter = document.getElementById('dateFilter').value;

        this.facturasFiltradas = this.facturas.filter(factura => {
            const estadoActual = this.obtenerEstadoActual(factura); // Usar el estado calculado
            let cumpleStatus = statusFilter === 'all' || estadoActual === statusFilter;
            let cumpleCliente = !clientFilter || factura.cliente.toLowerCase().includes(clientFilter) || factura.numero.toLowerCase().includes(clientFilter);
            
            let cumpleFecha = true;
            if (dateFilter) {
                const fechaFiltro = new Date(dateFilter);
                fechaFiltro.setHours(0, 0, 0, 0);
                const fechaVencimientoFactura = new Date(factura.fechaVencimiento);
                fechaVencimientoFactura.setHours(0, 0, 0, 0);
                cumpleFecha = fechaVencimientoFactura.getTime() === fechaFiltro.getTime();
            }

            return cumpleStatus && cumpleCliente && cumpleFecha;
        });

        this.paginaActual = 1;
        this.actualizarUI();
    }

    // Limpiar filtros
    limpiarFiltros() {
        document.getElementById('statusFilter').value = 'all';
        document.getElementById('clientFilter').value = '';
        document.getElementById('dateFilter').value = '';
        this.facturasFiltradas = [...this.facturas];
        this.paginaActual = 1;
        this.actualizarUI();
    }

    // Actualizar paginación
    actualizarPaginacion() {
        const totalPaginas = Math.ceil(this.facturasFiltradas.length / this.facturasPorPagina);

        document.getElementById('prevPage').disabled = this.paginaActual <= 1;
        document.getElementById('nextPage').disabled = this.paginaActual >= totalPaginas || totalPaginas === 0;
        document.getElementById('pageInfo').textContent = `Página ${this.paginaActual} de ${totalPaginas || 1}`;
    }

    // Cambiar página
    cambiarPagina(direccion) {
        const totalPaginas = Math.ceil(this.facturasFiltradas.length / this.facturasPorPagina);
        const nuevaPagina = this.paginaActual + direccion;

        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
            this.paginaActual = nuevaPagina;
            this.renderizarTabla();
            this.actualizarPaginacion();
        }
    }

    // Mostrar modal de nueva factura
    mostrarModalFactura() {
        // Limpiar el formulario para un nuevo ingreso
        document.getElementById('invoiceForm').reset();
        
        // Generar número de factura automático
        const ultimoNumero = this.facturas.length > 0 ?
            Math.max(...this.facturas.map(f => parseInt(f.numero.split('-')[2]) || 0)) : 0; // Manejar NaN si el formato es diferente
        const siguienteNumero = (ultimoNumero + 1).toString().padStart(3, '0');
        
        document.getElementById('invoiceNumber').value = `FAC-2024-${siguienteNumero}`;
        
        const hoy = new Date();
        document.getElementById('issueDate').value = this.formatearFechaInput(hoy);
        
        // Fecha de vencimiento por defecto: 30 días a partir de hoy
        const fechaVencimiento = new Date(hoy);
        fechaVencimiento.setDate(hoy.getDate() + 30);
        document.getElementById('dueDate').value = this.formatearFechaInput(fechaVencimiento);
        
        this.mostrarModal('invoiceModal');
    }

    // Guardar nueva factura
    guardarFactura(e) {
        e.preventDefault();

        const nuevaFactura = {
            id: Date.now(), // ID único basado en timestamp
            numero: document.getElementById('invoiceNumber').value.trim(),
            cliente: document.getElementById('clientName').value.trim(),
            fechaEmision: new Date(document.getElementById('issueDate').value),
            fechaVencimiento: new Date(document.getElementById('dueDate').value),
            monto: parseFloat(document.getElementById('amount').value),
            estado: 'pendiente' // Por defecto, una nueva factura es pendiente
        };

        if (nuevaFactura.numero === '' || nuevaFactura.cliente === '' || isNaN(nuevaFactura.monto) || nuevaFactura.monto <= 0) {
            this.mostrarToast('Por favor, complete todos los campos requeridos y asegúrese que el monto sea válido.', 'error');
            return;
        }

        this.facturas.unshift(nuevaFactura); // Añadir al principio para que aparezca primero
        this.facturasFiltradas = [...this.facturas]; // Recargar filtro para incluirla
        
        this.cerrarModal('invoiceModal');
        this.paginaActual = 1; // Volver a la primera página para ver la nueva factura
        this.actualizarUI();
        this.mostrarToast('Factura creada exitosamente', 'success');
        
        document.getElementById('invoiceForm').reset(); // Limpiar formulario después de guardar
    }

    // Marcar factura como pagada
    marcarComoPagada(id) {
        const factura = this.facturas.find(f => f.id === id);
        if (factura) {
            this.mostrarConfirmacion(
                'Confirmar Pago',
                `¿Confirmar que la factura ${factura.numero} ha sido pagada?`,
                () => {
                    factura.estado = 'pagada';
                    this.actualizarUI();
                    this.mostrarToast(`Factura ${factura.numero} marcada como pagada`, 'success');
                }
            );
        }
    }

    // Enviar recordatorio individual
    enviarRecordatorio(id) {
        const factura = this.facturas.find(f => f.id === id);
        if (factura && this.obtenerEstadoActual(factura) !== 'pagada') {
            this.mostrarToast(`Recordatorio enviado a ${factura.cliente} para factura ${factura.numero}`, 'info');
            // Aquí iría la lógica real para interactuar con un servicio de correo
        } else if (factura && this.obtenerEstadoActual(factura) === 'pagada') {
            this.mostrarToast(`La factura ${factura.numero} ya está pagada. No se necesita recordatorio.`, 'warning');
        }
    }

    // Enviar recordatorios masivos
    enviarRecordatorios() {
        const checkboxes = document.querySelectorAll('.invoice-checkbox:checked');
        if (checkboxes.length === 0) {
            this.mostrarToast('Seleccione al menos una factura para enviar recordatorios.', 'warning');
            return;
        }

        const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
        const facturasSeleccionadas = this.facturas.filter(f => ids.includes(f.id) && this.obtenerEstadoActual(f) !== 'pagada');

        if (facturasSeleccionadas.length === 0) {
            this.mostrarToast('No hay facturas pendientes/vencidas seleccionadas para enviar recordatorios.', 'info');
            return;
        }

        this.mostrarConfirmacion(
            'Enviar Recordatorios Masivos',
            `¿Está seguro de enviar recordatorios a ${facturasSeleccionadas.length} factura(s) seleccionada(s)?`,
            () => {
                // Simular envío masivo (en un sistema real se haría una llamada a la API)
                this.mostrarToast(`Recordatorios enviados a ${facturasSeleccionadas.length} factura(s)`, 'success');
                
                // Desmarcar checkboxes y resetear "seleccionar todo"
                checkboxes.forEach(cb => cb.checked = false);
                document.getElementById('selectAll').checked = false;
            }
        );
    }

    // Eliminar factura
    eliminarFactura(id) {
        const factura = this.facturas.find(f => f.id === id);
        if (factura) {
            this.mostrarConfirmacion(
                'Eliminar Factura',
                `¿Está seguro de eliminar la factura ${factura.numero}? Esta acción no se puede deshacer.`,
                () => {
                    this.facturas = this.facturas.filter(f => f.id !== id);
                    this.aplicarFiltros(); // Re-aplicar filtros para actualizar facturasFiltradas y paginación
                    this.paginaActual = 1; // Resetear paginación
                    this.actualizarUI();
                    this.mostrarToast('Factura eliminada exitosamente', 'success');
                }
            );
        }
    }

    // Exportar datos a CSV
    exportarDatos() {
        if (this.facturasFiltradas.length === 0) {
            this.mostrarToast('No hay datos para exportar.', 'warning');
            return;
        }
        const csv = this.convertirACSV(this.facturasFiltradas);
        this.descargarCSV(csv, 'cuentas-por-cobrar.csv');
        this.mostrarToast('Datos exportados exitosamente', 'success');
    }

    // Seleccionar todas las facturas visibles
    seleccionarTodas(seleccionar) {
        const checkboxes = document.querySelectorAll('.invoice-checkbox');
        checkboxes.forEach(cb => cb.checked = seleccionar);
    }

    // Utilidades de formato
    formatearMoneda(monto) {
        return new Intl.NumberFormat('es-PA', { // Usar 'es-PA' para formato de Panamá
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(monto);
    }

    formatearFecha(fecha) {
        if (!(fecha instanceof Date) || isNaN(fecha)) return ''; // Validar que sea un objeto Date válido
        return new Intl.DateTimeFormat('es-PA', { // Usar 'es-PA'
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(fecha);
    }

    formatearFechaInput(fecha) {
        if (!(fecha instanceof Date) || isNaN(fecha)) return '';
        return fecha.toISOString().split('T')[0];
    }

    formatearEstado(estado) {
        const estados = {
            'pendiente': 'Pendiente',
            'pagada': 'Pagada',
            'vencida': 'Vencida'
        };
        return estados[estado] || estado;
    }

    calcularDiasVencido(factura) {
        const estadoActual = this.obtenerEstadoActual(factura);
        if (estadoActual !== 'vencida') return 0; // Solo si está realmente vencida

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const vencimiento = new Date(factura.fechaVencimiento);
        vencimiento.setHours(0, 0, 0, 0);
        
        const diferencia = hoy.getTime() - vencimiento.getTime();
        const dias = Math.floor(diferencia / (1000 * 3600 * 24)); // Usar floor para días completos
        
        return dias > 0 ? dias : 0;
    }

    // Utilidades de modal
    mostrarModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Evita scroll del body
    }

    cerrarModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
        document.body.style.overflow = 'auto'; // Restaura scroll del body
    }

    mostrarConfirmacion(titulo, mensaje, callback) {
        document.getElementById('confirmTitle').textContent = titulo;
        document.getElementById('confirmMessage').textContent = mensaje;
        
        const confirmBtn = document.getElementById('confirmOk');
        // Clonar para remover listeners anteriores
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.addEventListener('click', () => {
            this.cerrarModal('confirmModal');
            callback();
        });
        
        this.mostrarModal('confirmModal');
    }

    // Sistema de notificaciones toast
    mostrarToast(mensaje, tipo = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.textContent = mensaje;
        
        container.appendChild(toast);
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            toast.classList.add('hide'); // Añadir clase para la animación de salida
            toast.addEventListener('transitionend', () => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, { once: true }); // Remover el listener después de ejecutarse una vez
        }, 3000);
    }

    // Utilidades de exportación CSV
    convertirACSV(datos) {
        const headers = ['Factura #', 'Cliente', 'Fecha Emision', 'Fecha Vencimiento', 'Monto', 'Estado', 'Dias Vencido'];
        const rows = datos.map(factura => [
            factura.numero,
            factura.cliente,
            this.formatearFecha(factura.fechaEmision),
            this.formatearFecha(factura.fechaVencimiento),
            factura.monto,
            this.formatearEstado(this.obtenerEstadoActual(factura)), // Exportar el estado actual calculado
            this.calcularDiasVencido(factura)
        ]);

        // Escape de comillas dobles y encerramiento de campos con comillas
        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        return csvContent;
    }

    descargarCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url); // Liberar el objeto URL
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.app = new CuentasPorCobrar();
});