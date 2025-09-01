document.addEventListener('DOMContentLoaded', function() {
    // Constantes y configuraciones
    const ITEMS_PER_PAGE = 10;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const VALID_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
    const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    // Mapeo de categorías
    const CATEGORY_CONFIG = {
        rent: { name: 'Alquiler', color: '#3498db' },
        services: { name: 'Servicios', color: '#9b59b6' },
        salaries: { name: 'Sueldos', color: '#f1c40f' },
        marketing: { name: 'Marketing', color: '#e67e22' },
        technology: { name: 'Tecnología', color: '#e74c3c' },
        unexpected: { name: 'Imprevistos', color: '#1abc9c' },
        other: { name: 'Otros', color: '#95a5a6' }
    };

    // Elementos del DOM
    const DOM = {
        newExpenseBtn: document.getElementById('new-expense-btn'),
        expenseModal: document.getElementById('expense-modal'),
        confirmModal: document.getElementById('confirm-modal'),
        receiptModal: document.getElementById('receipt-modal'),
        expenseForm: document.getElementById('expense-form'),
        closeModalBtns: document.querySelectorAll('.close-modal, .close-modal-btn'),
        cancelActionBtn: document.querySelector('.cancel-action'),
        confirmActionBtn: document.querySelector('.confirm-action'),
        applyFiltersBtn: document.getElementById('apply-filters'),
        resetFiltersBtn: document.getElementById('reset-filters'),
        prevPageBtn: document.getElementById('prev-page'),
        nextPageBtn: document.getElementById('next-page'),
        exportExcelBtn: document.getElementById('export-excel'),
        exportPdfBtn: document.getElementById('export-pdf'),
        downloadReceiptBtn: document.getElementById('download-receipt'),
        receiptInput: document.getElementById('expense-receipt'),
        receiptPreview: document.getElementById('receipt-preview'),
        expensesList: document.getElementById('expenses-list'),
        pageInfo: document.getElementById('page-info'),
        categoryTotalsContainer: document.getElementById('category-totals'),
        summaryPeriod: document.getElementById('summary-period'),
        modalTitle: document.getElementById('modal-title'),
        expenseIdInput: document.getElementById('expense-id'),
        confirmMessage: document.getElementById('confirm-message'),
        receiptContent: document.getElementById('receipt-content'),
        chartCanvas: document.getElementById('category-chart').getContext('2d')
    };

    // Estado de la aplicación
    const state = {
        currentPage: 1,
        currentExpenseId: null,
        currentAction: null,
        currentReceipt: null,
        expenses: [],
        filteredExpenses: [],
        categoryChart: null
    };

    // Inicializar el módulo
    initExpensesModule();

    function initExpensesModule() {
        setupEventListeners();
        loadInitialData();
    }

    function setupEventListeners() {
        // Eventos de modales
        DOM.newExpenseBtn.addEventListener('click', () => openExpenseModal());
        
        DOM.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.classList.contains('close-modal')) {
                    closeModal(this.closest('.modal'));
                } else {
                    closeModal(DOM.expenseModal);
                    closeModal(DOM.receiptModal);
                }
            });
        });

        DOM.cancelActionBtn.addEventListener('click', () => closeModal(DOM.confirmModal));
        DOM.confirmActionBtn.addEventListener('click', handleConfirmAction);

        // Formulario y acciones
        DOM.expenseForm.addEventListener('submit', handleFormSubmit);
        DOM.applyFiltersBtn.addEventListener('click', applyFilters);
        DOM.resetFiltersBtn.addEventListener('click', resetFilters);

        // Paginación
        DOM.prevPageBtn.addEventListener('click', goToPrevPage);
        DOM.nextPageBtn.addEventListener('click', goToNextPage);

        // Exportación
        DOM.exportExcelBtn.addEventListener('click', exportToExcel);
        DOM.exportPdfBtn.addEventListener('click', exportToPdf);

        // Comprobantes
        DOM.receiptInput.addEventListener('change', handleReceiptUpload);
        DOM.downloadReceiptBtn.addEventListener('click', downloadReceipt);
    }

    function loadInitialData() {
        initializeYearFilter();
        loadExpenses();
    }

    function initializeYearFilter() {
        const yearSelect = document.getElementById('year-filter');
        const currentYear = new Date().getFullYear();
        
        yearSelect.innerHTML = '<option value="">Todos los años</option>';
        
        for (let i = currentYear - 5; i <= currentYear + 2; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === currentYear) option.selected = true;
            yearSelect.appendChild(option);
        }
    }

    async function loadExpenses() {
        try {
            const data = await simulateLoadExpenses();
            state.expenses = data;
            state.filteredExpenses = [...data];
            state.currentPage = 1;
            
            updateCategorySummary();
            renderExpensesList();
        } catch (error) {
            console.error('Error al cargar egresos:', error);
            showAlert('Error al cargar egresos. Por favor intente nuevamente.');
        }
    }

    function openExpenseModal(expense = null) {
        if (expense) {
            // Modo edición
            DOM.modalTitle.textContent = 'Editar Egreso';
            DOM.expenseIdInput.value = expense.id;
            
            // Llenar formulario
            document.getElementById('expense-date').value = expense.date;
            document.getElementById('expense-category').value = expense.category;
            document.getElementById('expense-description').value = expense.description;
            document.getElementById('expense-amount').value = expense.amount;
            document.getElementById('expense-notes').value = expense.notes || '';
            
            // Mostrar comprobante si existe
            if (expense.receipt) {
                state.currentReceipt = expense.receipt;
                showReceiptPreview(expense.receipt);
            } else {
                state.currentReceipt = null;
                DOM.receiptPreview.style.display = 'none';
            }
        } else {
            // Modo creación
            DOM.modalTitle.textContent = 'Nuevo Egreso';
            DOM.expenseIdInput.value = '';
            DOM.expenseForm.reset();
            document.getElementById('expense-date').valueAsDate = new Date();
            document.getElementById('expense-category').value = 'other';
            state.currentReceipt = null;
            DOM.receiptPreview.style.display = 'none';
        }
        
        openModal(DOM.expenseModal);
    }

    function handleReceiptUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!VALID_FILE_TYPES.includes(file.type)) {
            showAlert('Por favor seleccione un archivo PDF, JPG o PNG');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            showAlert('El archivo no debe exceder los 5MB');
            return;
        }

        const fileUrl = URL.createObjectURL(file);
        state.currentReceipt = {
            name: file.name,
            type: file.type,
            url: fileUrl,
            file: file
        };

        showReceiptPreview(state.currentReceipt);
    }

    function showReceiptPreview(receipt) {
        DOM.receiptPreview.innerHTML = '';
        DOM.receiptPreview.style.display = 'block';
        
        if (receipt.type.includes('image')) {
            const img = document.createElement('img');
            img.src = receipt.url;
            DOM.receiptPreview.appendChild(img);
        } else if (receipt.type === 'application/pdf') {
            const embed = document.createElement('embed');
            embed.src = receipt.url;
            embed.type = 'application/pdf';
            embed.style.width = '100%';
            embed.style.height = '200px';
            DOM.receiptPreview.appendChild(embed);
        }
        
        const link = document.createElement('a');
        link.href = receipt.url;
        link.target = '_blank';
        link.textContent = receipt.name;
        DOM.receiptPreview.appendChild(link);
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const expenseId = DOM.expenseIdInput.value;
        const date = document.getElementById('expense-date').value;
        const category = document.getElementById('expense-category').value;
        const description = document.getElementById('expense-description').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const notes = document.getElementById('expense-notes').value;
        
        if (!date || !category || !description || !amount || amount <= 0) {
            showAlert('Por favor complete todos los campos requeridos con valores válidos');
            return;
        }
        
        const expenseData = {
            id: expenseId || generateId(),
            date,
            category,
            description,
            amount,
            notes,
            receipt: state.currentReceipt,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        try {
            await simulateSaveExpense(expenseData);
            
            if (expenseId) {
                // Actualizar egreso existente
                const index = state.expenses.findIndex(e => e.id === expenseId);
                if (index !== -1) {
                    state.expenses[index] = expenseData;
                }
            } else {
                // Agregar nuevo egreso
                state.expenses.unshift(expenseData);
            }
            
            state.filteredExpenses = [...state.expenses];
            state.currentPage = 1;
            
            updateCategorySummary();
            renderExpensesList();
            closeModal(DOM.expenseModal);
        } catch (error) {
            console.error('Error al guardar egreso:', error);
            showAlert('Error al guardar egreso. Por favor intente nuevamente.');
        }
    }

    function handleConfirmAction() {
        if (state.currentAction === 'delete') {
            deleteExpense(state.currentExpenseId);
        }
        closeModal(DOM.confirmModal);
    }

    function confirmDelete(expenseId) {
        state.currentExpenseId = expenseId;
        state.currentAction = 'delete';
        
        const expense = state.expenses.find(e => e.id === expenseId);
        const message = `¿Estás seguro que deseas eliminar el egreso "${expense.description}" por ${formatCurrency(expense.amount)}?`;
        
        DOM.confirmMessage.textContent = message;
        openModal(DOM.confirmModal);
    }

    async function deleteExpense(expenseId) {
        try {
            await simulateDeleteExpense(expenseId);
            
            state.expenses = state.expenses.filter(e => e.id !== expenseId);
            state.filteredExpenses = state.filteredExpenses.filter(e => e.id !== expenseId);
            
            // Ajustar paginación
            const totalPages = Math.ceil(state.filteredExpenses.length / ITEMS_PER_PAGE);
            if (state.currentPage > totalPages && totalPages > 0) {
                state.currentPage = totalPages;
            } else if (totalPages === 0) {
                state.currentPage = 1;
            }
            
            updateCategorySummary();
            renderExpensesList();
        } catch (error) {
            console.error('Error al eliminar egreso:', error);
            showAlert('Error al eliminar egreso. Por favor intente nuevamente.');
        }
    }

    function applyFilters() {
        const monthFilter = document.getElementById('month-filter').value;
        const yearFilter = document.getElementById('year-filter').value;
        const categoryFilter = document.getElementById('category-filter').value;
        const amountRange = document.getElementById('amount-range').value;
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        
        state.filteredExpenses = state.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const expenseMonth = expenseDate.getMonth() + 1;
            const expenseYear = expenseDate.getFullYear();
            
            // Aplicar filtros
            if (monthFilter && expenseMonth.toString() !== monthFilter) return false;
            if (yearFilter && expenseYear.toString() !== yearFilter) return false;
            if (categoryFilter && expense.category !== categoryFilter) return false;
            
            // Filtro por rango de montos
            if (amountRange) {
                const [min, max] = amountRange.split('-').map(Number);
                if (max && (expense.amount < min || expense.amount > max)) return false;
                if (!max && expense.amount < min) return false;
            }
            
            // Filtro por rango de fechas
            if (dateFrom && expense.date < dateFrom) return false;
            if (dateTo && expense.date > dateTo) return false;
            
            return true;
        });
        
        state.currentPage = 1;
        updateCategorySummary();
        renderExpensesList();
        updateSummaryPeriodText(monthFilter, yearFilter, dateFrom, dateTo);
    }

    function updateSummaryPeriodText(monthFilter, yearFilter, dateFrom, dateTo) {
        let periodText = 'Mostrando ';
        
        if (dateFrom && dateTo) {
            periodText += `egresos desde ${formatDate(dateFrom)} hasta ${formatDate(dateTo)}`;
        } else if (monthFilter && yearFilter) {
            periodText += `egresos de ${MONTH_NAMES[parseInt(monthFilter) - 1]} ${yearFilter}`;
        } else if (yearFilter) {
            periodText += `egresos del año ${yearFilter}`;
        } else if (monthFilter) {
            periodText += `egresos de ${MONTH_NAMES[parseInt(monthFilter) - 1]} de todos los años`;
        } else {
            periodText += 'todos los egresos';
        }
        
        DOM.summaryPeriod.textContent = periodText;
    }

    function resetFilters() {
        document.getElementById('month-filter').value = '';
        document.getElementById('year-filter').value = new Date().getFullYear().toString();
        document.getElementById('category-filter').value = '';
        document.getElementById('amount-range').value = '';
        document.getElementById('date-from').value = '';
        document.getElementById('date-to').value = '';
        
        state.filteredExpenses = [...state.expenses];
        state.currentPage = 1;
        
        updateCategorySummary();
        renderExpensesList();
        DOM.summaryPeriod.textContent = 'Mostrando todos los egresos';
    }

    function updateCategorySummary() {
        // Calcular totales por categoría
        const categoryTotals = {};
        let totalExpenses = 0;
        
        state.filteredExpenses.forEach(expense => {
            if (!categoryTotals[expense.category]) {
                categoryTotals[expense.category] = 0;
            }
            categoryTotals[expense.category] += expense.amount;
            totalExpenses += expense.amount;
        });
        
        // Ordenar categorías por monto descendente
        const sortedCategories = Object.keys(categoryTotals).sort((a, b) => {
            return categoryTotals[b] - categoryTotals[a];
        });
        
        // Actualizar gráfico y lista
        updateCategoryChart(sortedCategories, categoryTotals, totalExpenses);
        renderCategoryTotals(sortedCategories, categoryTotals, totalExpenses);
    }

    function renderCategoryTotals(categories, totals, totalExpenses) {
        DOM.categoryTotalsContainer.innerHTML = '';
        
        categories.forEach(category => {
            const amount = totals[category];
            const percentage = totalExpenses > 0 ? (amount / totalExpenses * 100).toFixed(1) : 0;
            
            const item = document.createElement('div');
            item.className = 'category-total-item';
            item.innerHTML = `
                <div class="category-name">
                    <span class="category-color" style="background-color: ${CATEGORY_CONFIG[category].color}"></span>
                    <span>${CATEGORY_CONFIG[category].name}</span>
                </div>
                <div>
                    <div class="category-amount">${formatCurrency(amount)}</div>
                    <div class="category-percentage">${percentage}%</div>
                </div>
            `;
            DOM.categoryTotalsContainer.appendChild(item);
        });
        
        // Agregar total general
        const totalItem = document.createElement('div');
        totalItem.className = 'total-expenses';
        totalItem.innerHTML = `
            <div>Total</div>
            <div>${formatCurrency(totalExpenses)}</div>
        `;
        DOM.categoryTotalsContainer.appendChild(totalItem);
    }

    function updateCategoryChart(categories, totals, totalExpenses) {
        // Destruir gráfico anterior si existe
        if (state.categoryChart) {
            state.categoryChart.destroy();
        }
        
        // Preparar datos para el gráfico
        const labels = categories.map(c => CATEGORY_CONFIG[c].name);
        const data = categories.map(c => totals[c]);
        const backgroundColors = categories.map(c => CATEGORY_CONFIG[c].color);
        
        state.categoryChart = new Chart(DOM.chartCanvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const percentage = totalExpenses > 0 ? (value / totalExpenses * 100).toFixed(1) : 0;
                                return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    function renderExpensesList() {
        if (state.filteredExpenses.length === 0) {
            renderNoExpensesMessage();
            return;
        }
        
        // Calcular paginación
        const startIndex = (state.currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedExpenses = state.filteredExpenses.slice(startIndex, endIndex);
        const totalPages = Math.ceil(state.filteredExpenses.length / ITEMS_PER_PAGE);
        
        // Renderizar egresos
        DOM.expensesList.innerHTML = '';
        paginatedExpenses.forEach(expense => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${formatDate(expense.date)}</td>
                <td>${expense.description}</td>
                <td>
                    <span class="category-badge">
                        <span class="color-dot" style="background-color: ${CATEGORY_CONFIG[expense.category].color}"></span>
                        ${CATEGORY_CONFIG[expense.category].name}
                    </span>
                </td>
                <td>${formatCurrency(expense.amount)}</td>
                <td>
                    ${expense.receipt ? 
                        `<span class="receipt-link" data-id="${expense.id}">Ver comprobante</span>` : 
                        'Sin comprobante'}
                </td>
                <td>
                    <button class="btn-icon edit" data-id="${expense.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" data-id="${expense.id}" title="Eliminar">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            DOM.expensesList.appendChild(row);
        });
        
        // Actualizar controles de paginación
        updatePaginationControls(totalPages);
        
        // Configurar eventos de interacción
        setupExpenseListInteractions();
    }

    function renderNoExpensesMessage() {
        DOM.expensesList.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px; color: #7f8c8d;">
                    No se encontraron egresos con los filtros aplicados
                </td>
            </tr>
        `;
        DOM.pageInfo.textContent = 'Página 1 de 1';
        DOM.prevPageBtn.disabled = true;
        DOM.nextPageBtn.disabled = true;
    }

    function updatePaginationControls(totalPages) {
        DOM.pageInfo.textContent = `Página ${state.currentPage} de ${totalPages}`;
        DOM.prevPageBtn.disabled = state.currentPage === 1;
        DOM.nextPageBtn.disabled = state.currentPage === totalPages;
    }

    function setupExpenseListInteractions() {
        // Eventos para editar/eliminar
        document.querySelectorAll('.edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const expenseId = this.getAttribute('data-id');
                const expense = state.expenses.find(e => e.id === expenseId);
                if (expense) openExpenseModal(expense);
            });
        });
        
        document.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const expenseId = this.getAttribute('data-id');
                confirmDelete(expenseId);
            });
        });
        
        // Eventos para comprobantes
        document.querySelectorAll('.receipt-link').forEach(link => {
            link.addEventListener('click', function() {
                const expenseId = this.getAttribute('data-id');
                const expense = state.expenses.find(e => e.id === expenseId);
                if (expense && expense.receipt) {
                    showReceiptModal(expense.receipt);
                }
            });
        });
    }

    function showReceiptModal(receipt) {
        DOM.receiptContent.innerHTML = '';
        
        if (receipt.type.includes('image')) {
            const img = document.createElement('img');
            img.src = receipt.url;
            DOM.receiptContent.appendChild(img);
        } else if (receipt.type === 'application/pdf') {
            const embed = document.createElement('embed');
            embed.src = receipt.url;
            embed.type = 'application/pdf';
            DOM.receiptContent.appendChild(embed);
        }
        
        // Configurar botón de descarga
        state.currentReceipt = receipt;
        openModal(DOM.receiptModal);
    }

    function downloadReceipt() {
        if (!state.currentReceipt) return;
        
        const a = document.createElement('a');
        a.href = state.currentReceipt.url;
        a.download = state.currentReceipt.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function goToPrevPage() {
        if (state.currentPage > 1) {
            state.currentPage--;
            renderExpensesList();
        }
    }

    function goToNextPage() {
        const totalPages = Math.ceil(state.filteredExpenses.length / ITEMS_PER_PAGE);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            renderExpensesList();
        }
    }

    function exportToExcel() {
        showAlert('Exportando a Excel...');
        // Implementación real usaría SheetJS
    }

    function exportToPdf() {
        showAlert('Exportando a PDF...');
        // Implementación real usaría jsPDF
    }

    // Funciones de utilidad
    function formatCurrency(amount) {
        return '$' + amount.toLocaleString('es-MX', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    }

    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    function openModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    function showAlert(message) {
        alert(message);
    }

    // Funciones de simulación (en una implementación real serían llamadas AJAX)
    function simulateLoadExpenses() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockExpenses = [
                    {
                        id: '1',
                        date: '2023-06-01',
                        category: 'rent',
                        description: 'Alquiler oficina central',
                        amount: 25000,
                        notes: 'Pago mensual de alquiler',
                        receipt: {
                            name: 'recibo_alquiler_junio.pdf',
                            type: 'application/pdf',
                            url: 'data:application/pdf;base64,...'
                        }
                    },
                    {
                        id: '2',
                        date: '2023-06-05',
                        category: 'services',
                        description: 'Factura de electricidad',
                        amount: 3500,
                        notes: 'Consumo mensual'
                    },
                    {
                        id: '3',
                        date: '2023-06-10',
                        category: 'salaries',
                        description: 'Pago de nómina',
                        amount: 65000,
                        notes: 'Pago quincenal'
                    },
                    {
                        id: '4',
                        date: '2023-06-15',
                        category: 'technology',
                        description: 'Licencia de software',
                        amount: 12000,
                        notes: 'Renovación anual',
                        receipt: {
                            name: 'factura_software.jpg',
                            type: 'image/jpeg',
                            url: 'data:image/jpeg;base64,...'
                        }
                    },
                    {
                        id: '5',
                        date: '2023-06-20',
                        category: 'marketing',
                        description: 'Campaña publicitaria',
                        amount: 18000
                    },
                    {
                        id: '6',
                        date: '2023-06-25',
                        category: 'unexpected',
                        description: 'Reparación de equipos',
                        amount: 7500,
                        notes: 'Fallo en servidor'
                    }
                ];
                resolve(mockExpenses);
            }, 800);
        });
    }

    function simulateSaveExpense(expenseData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(expenseData);
            }, 500);
        });
    }

    function simulateDeleteExpense(expenseId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(expenseId);
            }, 500);
        });
    }
});