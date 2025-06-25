document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const newExpenseBtn = document.getElementById('new-expense-btn');
    const expenseModal = document.getElementById('expense-modal');
    const confirmModal = document.getElementById('confirm-modal');
    const receiptModal = document.getElementById('receipt-modal');
    const expenseForm = document.getElementById('expense-form');
    const closeModalBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
    const cancelActionBtn = document.querySelector('.cancel-action');
    const confirmActionBtn = document.querySelector('.confirm-action');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const exportExcelBtn = document.getElementById('export-excel');
    const exportPdfBtn = document.getElementById('export-pdf');
    const downloadReceiptBtn = document.getElementById('download-receipt');
    const receiptInput = document.getElementById('expense-receipt');
    const receiptPreview = document.getElementById('receipt-preview');
    
    // Variables de estado
    let currentPage = 1;
    const itemsPerPage = 10;
    let currentExpenseId = null;
    let currentAction = null;
    let currentReceipt = null;
    let expenses = [];
    let filteredExpenses = [];
    let categoryChart = null;

    // Colores para categorías
    const categoryColors = {
        rent: '#3498db',
        services: '#9b59b6',
        salaries: '#f1c40f',
        marketing: '#e67e22',
        technology: '#e74c3c',
        unexpected: '#1abc9c',
        other: '#95a5a6'
    };

    // Nombres de categorías
    const categoryNames = {
        rent: 'Alquiler',
        services: 'Servicios',
        salaries: 'Sueldos',
        marketing: 'Marketing',
        technology: 'Tecnología',
        unexpected: 'Imprevistos',
        other: 'Otros'
    };

    // Inicializar el módulo
    initExpensesModule();

    // Función de inicialización
    function initExpensesModule() {
        setupEventListeners();
        loadInitialData();
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Abrir modal para nuevo egreso
        newExpenseBtn.addEventListener('click', () => {
            openExpenseModal();
        });

        // Cerrar modales
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.classList.contains('close-modal')) {
                    const modal = this.closest('.modal');
                    closeModal(modal);
                } else {
                    closeModal(expenseModal);
                    closeModal(receiptModal);
                }
            });
        });

        cancelActionBtn.addEventListener('click', () => {
            closeModal(confirmModal);
        });

        // Confirmar acciones
        confirmActionBtn.addEventListener('click', () => {
            if (currentAction === 'delete') {
                deleteExpense(currentExpenseId);
            }
            closeModal(confirmModal);
        });

        // Enviar formulario de egreso
        expenseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveExpense();
        });

        // Filtrar egresos
        applyFiltersBtn.addEventListener('click', applyFilters);
        resetFiltersBtn.addEventListener('click', resetFilters);

        // Paginación
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderExpensesList();
            }
        });

        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderExpensesList();
            }
        });

        // Exportar datos
        exportExcelBtn.addEventListener('click', exportToExcel);
        exportPdfBtn.addEventListener('click', exportToPdf);

        // Subida de comprobante
        receiptInput.addEventListener('change', handleReceiptUpload);

        // Descargar comprobante
        downloadReceiptBtn.addEventListener('click', downloadReceipt);
    }

    // Cargar datos iniciales
    function loadInitialData() {
        // Generar años para el filtro (últimos 5 años y próximos 2)
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

        // Cargar egresos
        loadExpenses();
    }

    // Cargar egresos
    function loadExpenses() {
        // Simular carga de egresos (en una implementación real sería una llamada AJAX)
        simulateLoadExpenses()
            .then(data => {
                expenses = data;
                filteredExpenses = [...expenses];
                currentPage = 1;
                
                updateCategorySummary();
                renderExpensesList();
            })
            .catch(error => {
                console.error('Error al cargar egresos:', error);
                alert('Error al cargar egresos. Por favor intente nuevamente.');
            });
    }

    // Abrir modal para nuevo/editar egreso
    function openExpenseModal(expense = null) {
        const modalTitle = document.getElementById('modal-title');
        const expenseIdInput = document.getElementById('expense-id');
        
        if (expense) {
            // Modo edición
            modalTitle.textContent = 'Editar Egreso';
            expenseIdInput.value = expense.id;
            
            // Llenar formulario con datos del egreso
            document.getElementById('expense-date').value = expense.date;
            document.getElementById('expense-category').value = expense.category;
            document.getElementById('expense-description').value = expense.description;
            document.getElementById('expense-amount').value = expense.amount;
            document.getElementById('expense-notes').value = expense.notes || '';
            
            // Mostrar comprobante si existe
            if (expense.receipt) {
                currentReceipt = expense.receipt;
                showReceiptPreview(expense.receipt);
            } else {
                currentReceipt = null;
                receiptPreview.style.display = 'none';
            }
        } else {
            // Modo creación
            modalTitle.textContent = 'Nuevo Egreso';
            expenseIdInput.value = '';
            expenseForm.reset();
            document.getElementById('expense-date').valueAsDate = new Date();
            document.getElementById('expense-category').value = 'other';
            currentReceipt = null;
            receiptPreview.style.display = 'none';
        }
        
        openModal(expenseModal);
    }

    // Manejar subida de comprobante
    function handleReceiptUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            alert('Por favor seleccione un archivo PDF, JPG o PNG');
            return;
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo no debe exceder los 5MB');
            return;
        }

        // Crear objeto URL para previsualización
        const fileUrl = URL.createObjectURL(file);
        currentReceipt = {
            name: file.name,
            type: file.type,
            url: fileUrl,
            file: file
        };

        showReceiptPreview(currentReceipt);
    }

    // Mostrar previsualización del comprobante
    function showReceiptPreview(receipt) {
        receiptPreview.innerHTML = '';
        receiptPreview.style.display = 'block';
        
        if (receipt.type.includes('image')) {
            const img = document.createElement('img');
            img.src = receipt.url;
            receiptPreview.appendChild(img);
        } else if (receipt.type === 'application/pdf') {
            const embed = document.createElement('embed');
            embed.src = receipt.url;
            embed.type = 'application/pdf';
            embed.style.width = '100%';
            embed.style.height = '200px';
            receiptPreview.appendChild(embed);
        }
        
        const link = document.createElement('a');
        link.href = receipt.url;
        link.target = '_blank';
        link.textContent = receipt.name;
        receiptPreview.appendChild(link);
    }

    // Guardar egreso
    function saveExpense() {
        const expenseId = document.getElementById('expense-id').value;
        const date = document.getElementById('expense-date').value;
        const category = document.getElementById('expense-category').value;
        const description = document.getElementById('expense-description').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const notes = document.getElementById('expense-notes').value;
        
        // Validaciones
        if (!date || !category || !description || !amount || amount <= 0) {
            alert('Por favor complete todos los campos requeridos con valores válidos');
            return;
        }
        
        const expenseData = {
            id: expenseId || generateId(),
            date,
            category,
            description,
            amount,
            notes,
            receipt: currentReceipt,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Simular guardado (en una implementación real sería una llamada AJAX)
        simulateSaveExpense(expenseData)
            .then(() => {
                if (expenseId) {
                    // Actualizar egreso existente
                    const index = expenses.findIndex(e => e.id === expenseId);
                    if (index !== -1) {
                        expenses[index] = expenseData;
                    }
                } else {
                    // Agregar nuevo egreso
                    expenses.unshift(expenseData);
                }
                
                filteredExpenses = [...expenses];
                currentPage = 1;
                
                updateCategorySummary();
                renderExpensesList();
                closeModal(expenseModal);
            })
            .catch(error => {
                console.error('Error al guardar egreso:', error);
                alert('Error al guardar egreso. Por favor intente nuevamente.');
            });
    }

    // Confirmar eliminación de egreso
    function confirmDelete(expenseId) {
        currentExpenseId = expenseId;
        currentAction = 'delete';
        
        const expense = expenses.find(e => e.id === expenseId);
        const message = `¿Estás seguro que deseas eliminar el egreso "${expense.description}" por $${expense.amount}?`;
        
        document.getElementById('confirm-message').textContent = message;
        openModal(confirmModal);
    }

    // Eliminar egreso
    function deleteExpense(expenseId) {
        // Simular eliminación (en una implementación real sería una llamada AJAX)
        simulateDeleteExpense(expenseId)
            .then(() => {
                expenses = expenses.filter(e => e.id !== expenseId);
                filteredExpenses = filteredExpenses.filter(e => e.id !== expenseId);
                
                // Ajustar paginación si es necesario
                const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
                if (currentPage > totalPages && totalPages > 0) {
                    currentPage = totalPages;
                } else if (totalPages === 0) {
                    currentPage = 1;
                }
                
                updateCategorySummary();
                renderExpensesList();
            })
            .catch(error => {
                console.error('Error al eliminar egreso:', error);
                alert('Error al eliminar egreso. Por favor intente nuevamente.');
            });
    }

    // Aplicar filtros
    function applyFilters() {
        const monthFilter = document.getElementById('month-filter').value;
        const yearFilter = document.getElementById('year-filter').value;
        const categoryFilter = document.getElementById('category-filter').value;
        const amountRange = document.getElementById('amount-range').value;
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        
        filteredExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const expenseMonth = expenseDate.getMonth() + 1;
            const expenseYear = expenseDate.getFullYear();
            
            // Filtro por mes
            if (monthFilter && expenseMonth.toString() !== monthFilter) return false;
            
            // Filtro por año
            if (yearFilter && expenseYear.toString() !== yearFilter) return false;
            
            // Filtro por categoría
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
        
        currentPage = 1;
        updateCategorySummary();
        renderExpensesList();
        
        // Actualizar texto del periodo mostrado
        updateSummaryPeriodText(monthFilter, yearFilter, dateFrom, dateTo);
    }

    // Actualizar texto del periodo mostrado
    function updateSummaryPeriodText(monthFilter, yearFilter, dateFrom, dateTo) {
        let periodText = 'Mostrando ';
        
        if (dateFrom && dateTo) {
            periodText += `egresos desde ${formatDate(dateFrom)} hasta ${formatDate(dateTo)}`;
        } else if (monthFilter && yearFilter) {
            const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            periodText += `egresos de ${monthNames[parseInt(monthFilter) - 1]} ${yearFilter}`;
        } else if (yearFilter) {
            periodText += `egresos del año ${yearFilter}`;
        } else if (monthFilter) {
            const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            periodText += `egresos de ${monthNames[parseInt(monthFilter) - 1]} de todos los años`;
        } else {
            periodText += 'todos los egresos';
        }
        
        document.getElementById('summary-period').textContent = periodText;
    }

    // Resetear filtros
    function resetFilters() {
        document.getElementById('month-filter').value = '';
        document.getElementById('year-filter').value = new Date().getFullYear().toString();
        document.getElementById('category-filter').value = '';
        document.getElementById('amount-range').value = '';
        document.getElementById('date-from').value = '';
        document.getElementById('date-to').value = '';
        
        filteredExpenses = [...expenses];
        currentPage = 1;
        
        updateCategorySummary();
        renderExpensesList();
        document.getElementById('summary-period').textContent = 'Mostrando todos los egresos';
    }

    // Actualizar resumen por categoría
    function updateCategorySummary() {
        // Calcular totales por categoría
        const categoryTotals = {};
        let totalExpenses = 0;
        
        filteredExpenses.forEach(expense => {
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
        
        // Actualizar gráfico
        updateCategoryChart(sortedCategories, categoryTotals, totalExpenses);
        
        // Actualizar lista de totales
        const categoryTotalsContainer = document.getElementById('category-totals');
        categoryTotalsContainer.innerHTML = '';
        
        sortedCategories.forEach(category => {
            const amount = categoryTotals[category];
            const percentage = totalExpenses > 0 ? (amount / totalExpenses * 100).toFixed(1) : 0;
            
            const item = document.createElement('div');
            item.className = 'category-total-item';
            item.innerHTML = `
                <div class="category-name">
                    <span class="category-color" style="background-color: ${categoryColors[category]}"></span>
                    <span>${categoryNames[category]}</span>
                </div>
                <div>
                    <div class="category-amount">${formatCurrency(amount)}</div>
                    <div class="category-percentage">${percentage}%</div>
                </div>
            `;
            categoryTotalsContainer.appendChild(item);
        });
        
        // Agregar total general
        const totalItem = document.createElement('div');
        totalItem.className = 'total-expenses';
        totalItem.innerHTML = `
            <div>Total</div>
            <div>${formatCurrency(totalExpenses)}</div>
        `;
        categoryTotalsContainer.appendChild(totalItem);
    }

    // Actualizar gráfico de categorías
    function updateCategoryChart(categories, totals, totalExpenses) {
        const ctx = document.getElementById('category-chart').getContext('2d');
        
        // Destruir gráfico anterior si existe
        if (categoryChart) {
            categoryChart.destroy();
        }
        
        // Preparar datos para el gráfico
        const labels = categories.map(c => categoryNames[c]);
        const data = categories.map(c => totals[c]);
        const backgroundColors = categories.map(c => categoryColors[c]);
        
        categoryChart = new Chart(ctx, {
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

    // Renderizar lista de egresos
    function renderExpensesList() {
        const expensesList = document.getElementById('expenses-list');
        const pageInfo = document.getElementById('page-info');
        
        if (filteredExpenses.length === 0) {
            expensesList.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 30px; color: #7f8c8d;">
                        No se encontraron egresos con los filtros aplicados
                    </td>
                </tr>
            `;
            pageInfo.textContent = 'Página 1 de 1';
            prevPageBtn.disabled = true;
            nextPageBtn.disabled = true;
            return;
        }
        
        // Calcular paginación
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);
        const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
        
        // Renderizar egresos
        expensesList.innerHTML = '';
        paginatedExpenses.forEach(expense => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${formatDate(expense.date)}</td>
                <td>${expense.description}</td>
                <td>
                    <span class="category-badge">
                        <span class="color-dot" style="background-color: ${categoryColors[expense.category]}"></span>
                        ${categoryNames[expense.category]}
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
            
            expensesList.appendChild(row);
        });
        
        // Actualizar controles de paginación
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
        
        // Agregar event listeners a los botones de editar/eliminar
        document.querySelectorAll('.edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const expenseId = this.getAttribute('data-id');
                const expense = expenses.find(e => e.id === expenseId);
                if (expense) openExpenseModal(expense);
            });
        });
        
        document.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const expenseId = this.getAttribute('data-id');
                confirmDelete(expenseId);
            });
        });
        
        // Agregar event listeners a los enlaces de comprobante
        document.querySelectorAll('.receipt-link').forEach(link => {
            link.addEventListener('click', function() {
                const expenseId = this.getAttribute('data-id');
                const expense = expenses.find(e => e.id === expenseId);
                if (expense && expense.receipt) {
                    showReceiptModal(expense.receipt);
                }
            });
        });
    }

    // Mostrar modal de comprobante
    function showReceiptModal(receipt) {
        const receiptContent = document.getElementById('receipt-content');
        receiptContent.innerHTML = '';
        
        if (receipt.type.includes('image')) {
            const img = document.createElement('img');
            img.src = receipt.url;
            receiptContent.appendChild(img);
        } else if (receipt.type === 'application/pdf') {
            const embed = document.createElement('embed');
            embed.src = receipt.url;
            embed.type = 'application/pdf';
            receiptContent.appendChild(embed);
        }
        
        // Configurar botón de descarga
        currentReceipt = receipt;
        
        openModal(receiptModal);
    }

    // Descargar comprobante
    function downloadReceipt() {
        if (!currentReceipt) return;
        
        const a = document.createElement('a');
        a.href = currentReceipt.url;
        a.download = currentReceipt.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Exportar a Excel
    function exportToExcel() {
        // Simular exportación (en una implementación real usaríamos una librería como SheetJS)
        alert('Exportando a Excel...');
        
        // En una implementación real:
        // 1. Crear un libro de trabajo con SheetJS
        // 2. Convertir los datos filtrados a formato de hoja de cálculo
        // 3. Generar archivo XLSX y descargarlo
    }

    // Exportar a PDF
    function exportToPdf() {
        // Simular exportación (en una implementación real usaríamos una librería como jsPDF)
        alert('Exportando a PDF...');
        
        // En una implementación real:
        // 1. Crear un documento PDF con jsPDF
        // 2. Agregar los datos filtrados en formato de tabla
        // 3. Generar archivo PDF y descargarlo
    }

    // Funciones de utilidad
    function formatCurrency(amount) {
        return '$' + amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

    // Funciones de simulación (en una implementación real serían llamadas AJAX)
    function simulateLoadExpenses() {
        return new Promise((resolve) => {
            // Simular retraso de red
            setTimeout(() => {
                // Datos de ejemplo
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
                            url: 'data:application/pdf;base64,...' // Datos base64 simulados
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
                            url: 'data:image/jpeg;base64,...' // Datos base64 simulados
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
            }, 800); // Simular 800ms de retraso
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