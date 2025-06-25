document.addEventListener('DOMContentLoaded', function() {
    // --- Elementos del DOM ---
    const newIncomeBtn = document.getElementById('new-income-btn');
    const incomeModal = document.getElementById('income-modal');
    const confirmModal = document.getElementById('confirm-modal');
    const incomeForm = document.getElementById('income-form');
    const closeModalBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
    const cancelActionBtn = document.querySelector('.cancel-action');
    const confirmActionBtn = document.querySelector('.confirm-action');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const exportExcelBtn = document.getElementById('export-excel');
    const exportPdfBtn = document.getElementById('export-pdf');
    const incomeListBody = document.getElementById('income-list'); // Renombrado para mayor claridad
    const pageInfoSpan = document.getElementById('page-info'); // Renombrado para mayor claridad

    // --- Variables de Estado ---
    let currentPage = 1;
    const itemsPerPage = 10;
    let currentIncomeId = null; // ID del ingreso actualmente siendo editado o eliminado
    let currentAction = null; // 'delete' o 'edit'
    let incomes = []; // Todos los ingresos cargados
    let filteredIncomes = []; // Ingresos después de aplicar filtros
    let clients = []; // Lista de clientes
    let cases = []; // Lista de casos

    // --- Inicialización ---
    initIncomeModule();

    function initIncomeModule() {
        setupEventListeners();
        loadInitialData();
    }

    // --- Configuración de Event Listeners ---
    function setupEventListeners() {
        newIncomeBtn.addEventListener('click', () => openIncomeModal());

        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => closeModal(incomeModal));
        });

        // Asegúrate de que los botones de cerrar modal del confirmModal también cierren confirmModal
        confirmModal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => closeModal(confirmModal));
        });

        cancelActionBtn.addEventListener('click', () => closeModal(confirmModal));

        confirmActionBtn.addEventListener('click', () => {
            if (currentAction === 'delete') {
                deleteIncome(currentIncomeId);
            }
            closeModal(confirmModal);
        });

        incomeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveIncome();
        });

        applyFiltersBtn.addEventListener('click', applyFilters);
        resetFiltersBtn.addEventListener('click', resetFilters);

        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderIncomeList();
            }
        });

        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredIncomes.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderIncomeList();
            }
        });

        exportExcelBtn.addEventListener('click', exportToExcel);
        exportPdfBtn.addEventListener('click', exportToPdf);

        document.getElementById('income-client').addEventListener('change', function() {
            updateCaseDropdown(this.value);
        });

        // Event listener para el filtro de cliente que debe actualizar el filtro de casos
        document.getElementById('client-filter').addEventListener('change', function() {
            updateFilterCaseDropdown(this.value);
        });
    }

    // --- Carga de Datos Iniciales ---
    async function loadInitialData() {
        try {
            const data = await simulateLoadClientsAndCases();
            clients = data.clients;
            cases = data.cases;

            updateClientDropdowns();
            updateFilterCaseDropdown(''); // Inicializa el filtro de casos
            await loadIncomes();
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
            alert('Error al cargar datos. Por favor intente nuevamente.');
        }
    }

    async function loadIncomes() {
        try {
            incomes = await simulateLoadIncomes();
            filteredIncomes = [...incomes];
            currentPage = 1;

            updateSummary();
            renderIncomeList();
        } catch (error) {
            console.error('Error al cargar ingresos:', error);
            alert('Error al cargar ingresos. Por favor intente nuevamente.');
        }
    }

    // --- Funciones de Actualización de Dropdowns ---
    function updateClientDropdowns() {
        const clientFilter = document.getElementById('client-filter');
        const incomeClient = document.getElementById('income-client');

        clientFilter.innerHTML = '<option value="">Todos los clientes</option>';
        incomeClient.innerHTML = '<option value="">Seleccionar cliente...</option>';

        clients.forEach(client => {
            const option1 = document.createElement('option');
            option1.value = client.id;
            option1.textContent = client.name;
            clientFilter.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = client.id;
            option2.textContent = client.name;
            incomeClient.appendChild(option2);
        });
    }

    function updateCaseDropdown(clientId) {
        const incomeCase = document.getElementById('income-case');
        incomeCase.innerHTML = '<option value="">Seleccionar caso...</option>';

        if (!clientId) return;

        const clientCases = cases.filter(c => c.clientId === clientId);
        clientCases.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = `Caso ${c.id}: ${c.title}`;
            incomeCase.appendChild(option);
        });
    }

    function updateFilterCaseDropdown(clientId) {
        const caseFilter = document.getElementById('case-filter');
        caseFilter.innerHTML = '<option value="">Todos los casos</option>';

        let casesToFilter = cases;
        if (clientId) {
            casesToFilter = cases.filter(c => c.clientId === clientId);
        }

        casesToFilter.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = `Caso ${c.id}: ${c.title}`;
            caseFilter.appendChild(option);
        });
    }

    // --- Funciones de Modal ---
    function openModal(modalElement) {
        modalElement.style.display = 'flex'; // Usar flex para centrado
    }

    function closeModal(modalElement) {
        modalElement.style.display = 'none';
    }

    function openIncomeModal(income = null) {
        const modalTitle = document.getElementById('modal-title');
        const incomeIdInput = document.getElementById('income-id');

        incomeForm.reset(); // Limpiar siempre el formulario al abrir

        if (income) {
            modalTitle.textContent = 'Editar Ingreso';
            incomeIdInput.value = income.id;
            document.getElementById('income-client').value = income.clientId;
            updateCaseDropdown(income.clientId);
            // Pequeño retardo para asegurar que el dropdown de casos se ha llenado antes de intentar seleccionar
            setTimeout(() => {
                document.getElementById('income-case').value = income.caseId || '';
            }, 50);
            document.getElementById('income-concept').value = income.concept;
            document.getElementById('income-amount').value = income.amount;
            document.getElementById('income-date').value = income.date;
            document.getElementById('income-payment-method').value = income.paymentMethod;
            document.getElementById('income-reference').value = income.reference || '';
            document.getElementById('income-status').value = income.status;
            document.getElementById('income-notes').value = income.notes || '';
        } else {
            modalTitle.textContent = 'Nuevo Ingreso';
            incomeIdInput.value = '';
            document.getElementById('income-date').valueAsDate = new Date();
            document.getElementById('income-status').value = 'confirmed'; // Default para nuevo
            updateCaseDropdown(''); // Limpiar casos al crear nuevo
        }

        openModal(incomeModal);
    }

    // --- Funciones de CRUD (Simuladas) ---
    async function saveIncome() {
        const incomeId = document.getElementById('income-id').value;
        const clientId = document.getElementById('income-client').value;
        const caseId = document.getElementById('income-case').value;
        const concept = document.getElementById('income-concept').value.trim();
        const amount = parseFloat(document.getElementById('income-amount').value);
        const date = document.getElementById('income-date').value;
        const paymentMethod = document.getElementById('income-payment-method').value;
        const reference = document.getElementById('income-reference').value.trim();
        const status = document.getElementById('income-status').value;
        const notes = document.getElementById('income-notes').value.trim();

        if (!clientId || !concept || isNaN(amount) || amount <= 0 || !date || !paymentMethod) {
            alert('Por favor complete todos los campos requeridos y asegúrese que el monto sea válido.');
            return;
        }

        const client = clients.find(c => c.id === clientId);
        const caseData = cases.find(c => c.id === caseId);

        const incomeData = {
            id: incomeId || generateId(),
            clientId,
            clientName: client ? client.name : 'Desconocido', // Asegurar nombre del cliente
            caseId: caseId || null, // Guardar null si no hay caso seleccionado
            caseTitle: caseData ? caseData.title : 'N/A',
            concept,
            amount,
            date,
            paymentMethod,
            reference,
            status,
            notes,
            createdAt: incomeId ? incomes.find(i => i.id === incomeId).createdAt : new Date().toISOString(), // Mantener fecha de creación si edita
            updatedAt: new Date().toISOString()
        };

        try {
            await simulateSaveIncome(incomeData);
            if (incomeId) {
                const index = incomes.findIndex(i => i.id === incomeId);
                if (index !== -1) {
                    incomes[index] = incomeData;
                }
            } else {
                incomes.unshift(incomeData); // Añadir nuevo al principio
            }

            filteredIncomes = [...incomes]; // Resetear filtros después de guardar
            currentPage = 1;

            updateSummary();
            renderIncomeList();
            closeModal(incomeModal);
            alert('Ingreso guardado exitosamente.'); // Notificación de éxito
        } catch (error) {
            console.error('Error al guardar ingreso:', error);
            alert('Error al guardar ingreso. Por favor intente nuevamente.');
        }
    }

    function confirmDelete(incomeId) {
        currentIncomeId = incomeId;
        currentAction = 'delete';

        const income = incomes.find(i => i.id === incomeId);
        if (income) {
            const message = `¿Estás seguro que deseas eliminar el ingreso de ${income.clientName} por $${formatCurrency(income.amount)} (${income.concept})?`;
            document.getElementById('confirm-message').textContent = message;
            openModal(confirmModal);
        } else {
            alert('Ingreso no encontrado para eliminar.');
        }
    }

    async function deleteIncome(incomeId) {
        try {
            await simulateDeleteIncome(incomeId);
            incomes = incomes.filter(i => i.id !== incomeId);
            filteredIncomes = filteredIncomes.filter(i => i.id !== incomeId);

            // Ajustar paginación si la página actual queda vacía
            const totalPages = Math.ceil(filteredIncomes.length / itemsPerPage);
            if (currentPage > totalPages && totalPages > 0) {
                currentPage = totalPages;
            } else if (totalPages === 0) {
                currentPage = 1;
            }

            updateSummary();
            renderIncomeList();
            alert('Ingreso eliminado exitosamente.'); // Notificación de éxito
        } catch (error) {
            console.error('Error al eliminar ingreso:', error);
            alert('Error al eliminar ingreso. Por favor intente nuevamente.');
        }
    }

    // --- Funciones de Filtrado y Renderizado ---
    function applyFilters() {
        const clientFilter = document.getElementById('client-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        const paymentMethodFilter = document.getElementById('payment-method-filter').value;
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        const caseFilter = document.getElementById('case-filter').value;

        filteredIncomes = incomes.filter(income => {
            if (clientFilter && income.clientId !== clientFilter) return false;
            if (statusFilter && income.status !== statusFilter) return false;
            if (paymentMethodFilter && income.paymentMethod !== paymentMethodFilter) return false;
            if (dateFrom && income.date < dateFrom) return false;
            if (dateTo && income.date > dateTo) return false;
            if (caseFilter && income.caseId !== caseFilter) return false;
            return true;
        });

        currentPage = 1;
        updateSummary();
        renderIncomeList();
    }

    function resetFilters() {
        document.getElementById('client-filter').value = '';
        document.getElementById('status-filter').value = '';
        document.getElementById('payment-method-filter').value = '';
        document.getElementById('date-from').value = '';
        document.getElementById('date-to').value = '';
        document.getElementById('case-filter').value = ''; // Resetear también este filtro
        updateFilterCaseDropdown(''); // Restablecer el dropdown de casos para el filtro

        filteredIncomes = [...incomes];
        currentPage = 1;

        updateSummary();
        renderIncomeList();
    }

    function renderIncomeList() {
        incomeListBody.innerHTML = ''; // Limpiar la tabla

        if (filteredIncomes.length === 0) {
            incomeListBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 30px; color: #7f8c8d;">
                        No se encontraron ingresos con los filtros aplicados
                    </td>
                </tr>
            `;
            pageInfoSpan.textContent = 'Página 0 de 0'; // Ajustar para caso sin resultados
            prevPageBtn.disabled = true;
            nextPageBtn.disabled = true;
            return;
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedIncomes = filteredIncomes.slice(startIndex, endIndex);
        const totalPages = Math.ceil(filteredIncomes.length / itemsPerPage);

        paginatedIncomes.forEach(income => {
            const row = document.createElement('tr');
            const statusInfo = getStatusDisplay(income.status);

            row.innerHTML = `
                <td>${formatDate(income.date)}</td>
                <td>${escapeHTML(income.clientName)}</td>
                <td>${escapeHTML(income.concept)}</td>
                <td>${escapeHTML(income.caseTitle || 'N/A')}</td>
                <td>${formatCurrency(income.amount)}</td>
                <td>${getPaymentMethodName(income.paymentMethod)}</td>
                <td><span class="status-badge ${statusInfo.class}">${statusInfo.text}</span></td>
                <td>
                    <button class="btn-icon edit" data-id="${income.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" data-id="${income.id}" title="Eliminar">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            incomeListBody.appendChild(row);
        });

        // Actualizar controles de paginación
        pageInfoSpan.textContent = `Página ${currentPage} de ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;

        // Re-adjuntar event listeners a los botones de editar/eliminar después de renderizar
        document.querySelectorAll('.edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const incomeId = this.getAttribute('data-id');
                const income = incomes.find(i => i.id === incomeId);
                if (income) openIncomeModal(income);
            });
        });

        document.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const incomeId = this.getAttribute('data-id');
                confirmDelete(incomeId);
            });
        });
    }

    // --- Resumen de Ingresos ---
    function updateSummary() {
        const totalIncomeElement = document.getElementById('total-income'); // Asegúrate de tener estos IDs en tu HTML
        const confirmedIncomeElement = document.getElementById('confirmed-income');
        const pendingIncomeElement = document.getElementById('pending-income');

        const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
        const confirmedIncome = filteredIncomes
            .filter(income => income.status === 'confirmed')
            .reduce((sum, income) => sum + income.amount, 0);
        const pendingIncome = filteredIncomes
            .filter(income => income.status === 'pending')
            .reduce((sum, income) => sum + income.amount, 0);

        if (totalIncomeElement) totalIncomeElement.textContent = formatCurrency(totalIncome);
        if (confirmedIncomeElement) confirmedIncomeElement.textContent = formatCurrency(confirmedIncome);
        if (pendingIncomeElement) pendingIncomeElement.textContent = formatCurrency(pendingIncome);
    }

    // --- Funciones de Utilidad ---

    // Formatear fecha a 'DD/MM/YYYY'
    function formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00'); // Asegura que se interprete como local
        return date.toLocaleDateString('es-ES');
    }

    // Formatear moneda a 'USD x,xxx.xx' (ajusta según tu moneda local)
    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-PA', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function getPaymentMethodName(methodKey) {
        const methods = {
            cash: 'Efectivo',
            bank_transfer: 'Transferencia Bancaria',
            credit_card: 'Tarjeta de Crédito',
            check: 'Cheque',
            other: 'Otro'
        };
        return methods[methodKey] || 'Desconocido';
    }

    function getStatusDisplay(statusCode) {
        switch (statusCode) {
            case 'confirmed': return { text: 'Confirmado', class: 'status-confirmed' };
            case 'pending': return { text: 'Pendiente', class: 'status-pending' };
            case 'cancelled': return { text: 'Cancelado', class: 'status-cancelled' }; // Añadir si existe
            default: return { text: 'Desconocido', class: 'status-unknown' };
        }
    }

    // Función para generar un ID simple (para simulación)
    function generateId() {
        return 'INC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    // Prevenir ataques XSS al renderizar texto del usuario
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // --- Funciones de Exportación (Simuladas) ---
    function exportToExcel() {
        alert('Exportando a Excel (funcionalidad simulada)');
        console.log('Datos para exportar a Excel:', filteredIncomes);
        // Implementación real usaría librerías como SheetJS o enviar a backend
    }

    function exportToPdf() {
        alert('Exportando a PDF (funcionalidad simulada)');
        console.log('Datos para exportar a PDF:', filteredIncomes);
        // Implementación real usaría librerías como jsPDF o enviar a backend
    }

    // --- Funciones de Simulación de API (para pruebas sin backend) ---
    async function simulateLoadClientsAndCases() {
        return new Promise(resolve => {
            setTimeout(() => {
                const dummyClients = [
                    { id: 'cli001', name: 'Cliente A S.A.' },
                    { id: 'cli002', name: 'Persona Natural B' },
                    { id: 'cli003', name: 'Corporación C' }
                ];
                const dummyCases = [
                    { id: 'case001', clientId: 'cli001', title: 'Demanda Laboral' },
                    { id: 'case002', clientId: 'cli001', title: 'Asesoría Fiscal' },
                    { id: 'case003', clientId: 'cli002', title: 'Divorcio' },
                    { id: 'case004', clientId: 'cli003', title: 'Fusión de Empresas' }
                ];
                resolve({ clients: dummyClients, cases: dummyCases });
            }, 300);
        });
    }

    async function simulateLoadIncomes() {
        return new Promise(resolve => {
            setTimeout(() => {
                const dummyIncomes = [
                    { id: 'INC-001', clientId: 'cli001', clientName: 'Cliente A S.A.', caseId: 'case001', caseTitle: 'Demanda Laboral', concept: 'Honorarios primera fase', amount: 1500.00, date: '2025-06-01', paymentMethod: 'bank_transfer', reference: 'TRF-12345', status: 'confirmed', notes: '', createdAt: '2025-06-01T10:00:00Z', updatedAt: '2025-06-01T10:00:00Z' },
                    { id: 'INC-002', clientId: 'cli002', clientName: 'Persona Natural B', caseId: 'case003', caseTitle: 'Divorcio', concept: 'Anticipo inicial', amount: 500.00, date: '2025-06-05', paymentMethod: 'cash', reference: '', status: 'pending', notes: 'Pendiente de confirmación', createdAt: '2025-06-05T11:00:00Z', updatedAt: '2025-06-05T11:00:00Z' },
                    { id: 'INC-003', clientId: 'cli001', clientName: 'Cliente A S.A.', caseId: 'case002', caseTitle: 'Asesoría Fiscal', concept: 'Consulta contable', amount: 250.00, date: '2025-06-10', paymentMethod: 'credit_card', reference: 'CC-9876', status: 'confirmed', notes: '', createdAt: '2025-06-10T12:00:00Z', updatedAt: '2025-06-10T12:00:00Z' },
                    { id: 'INC-004', clientId: 'cli003', clientName: 'Corporación C', caseId: 'case004', caseTitle: 'Fusión de Empresas', concept: 'Abono por estudios de viabilidad', amount: 3000.00, date: '2025-06-15', paymentMethod: 'bank_transfer', reference: 'TRF-ABCDE', status: 'confirmed', notes: 'Gran ingreso', createdAt: '2025-06-15T13:00:00Z', updatedAt: '2025-06-15T13:00:00Z' },
                    { id: 'INC-005', clientId: 'cli002', clientName: 'Persona Natural B', caseId: null, caseTitle: null, concept: 'Asesoría general', amount: 100.00, date: '2025-06-20', paymentMethod: 'cash', reference: '', status: 'confirmed', notes: 'Sin caso asociado', createdAt: '2025-06-20T14:00:00Z', updatedAt: '2025-06-20T14:00:00Z' },
                    { id: 'INC-006', clientId: 'cli001', clientName: 'Cliente A S.A.', caseId: 'case001', caseTitle: 'Demanda Laboral', concept: 'Reembolso gastos judiciales', amount: 75.00, date: '2025-06-22', paymentMethod: 'other', reference: 'REIMB-001', status: 'pending', notes: 'Esperando cheque', createdAt: '2025-06-22T15:00:00Z', updatedAt: '2025-06-22T15:00:00Z' }
                ];
                resolve(dummyIncomes);
            }, 500);
        });
    }

    async function simulateSaveIncome(incomeData) {
        return new Promise(resolve => {
            setTimeout(() => {
                // En un backend real, aquí se enviarían los datos a la API
                console.log('Simulando guardar/actualizar ingreso:', incomeData);
                resolve();
            }, 300);
        });
    }

    async function simulateDeleteIncome(incomeId) {
        return new Promise(resolve => {
            setTimeout(() => {
                // En un backend real, aquí se enviaría la solicitud DELETE a la API
                console.log('Simulando eliminar ingreso con ID:', incomeId);
                resolve();
            }, 300);
        });
    }

});