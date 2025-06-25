document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const dateRangeSelect = document.getElementById('date-range');
    const customRangeDiv = document.getElementById('custom-range');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const refreshBtn = document.getElementById('refresh-btn');
    
    // Inicializar el dashboard
    initDashboard();

    // Función de inicialización
    function initDashboard() {
        setupEventListeners();
        loadDashboardData();
        
        // Establecer fechas por defecto para el rango personalizado
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        startDateInput.valueAsDate = firstDayOfMonth;
        endDateInput.valueAsDate = today;
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Cambiar rango de fechas
        dateRangeSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                customRangeDiv.style.display = 'flex';
            } else {
                customRangeDiv.style.display = 'none';
                loadDashboardData();
            }
        });
        
        // Cambiar fechas personalizadas
        startDateInput.addEventListener('change', function() {
            if (dateRangeSelect.value === 'custom') {
                loadDashboardData();
            }
        });
        
        endDateInput.addEventListener('change', function() {
            if (dateRangeSelect.value === 'custom') {
                loadDashboardData();
            }
        });
        
        // Botón de actualizar
        refreshBtn.addEventListener('click', loadDashboardData);
    }

    // Cargar datos del dashboard
    function loadDashboardData() {
        const dateRange = getDateRange();
        
        // Simular carga de datos (en una implementación real sería una llamada AJAX)
        simulateDataLoad(dateRange)
            .then(data => {
                updateSummary(data.summary);
                updateCharts(data.chartData);
                updateAlerts(data.alerts);
                updatePayments(data.upcomingPayments);
            })
            .catch(error => {
                console.error('Error al cargar datos del dashboard:', error);
                alert('Error al cargar datos. Por favor intente nuevamente.');
            });
    }

    // Obtener rango de fechas seleccionado
    function getDateRange() {
        const range = dateRangeSelect.value;
        const today = new Date();
        
        switch(range) {
            case 'today':
                return {
                    start: today,
                    end: today
                };
            case 'week':
                const firstDayOfWeek = new Date(today);
                firstDayOfWeek.setDate(today.getDate() - today.getDay());
                return {
                    start: firstDayOfWeek,
                    end: today
                };
            case 'month':
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                return {
                    start: firstDayOfMonth,
                    end: today
                };
            case 'quarter':
                const quarter = Math.floor(today.getMonth() / 3);
                const firstDayOfQuarter = new Date(today.getFullYear(), quarter * 3, 1);
                return {
                    start: firstDayOfQuarter,
                    end: today
                };
            case 'year':
                const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
                return {
                    start: firstDayOfYear,
                    end: today
                };
            case 'custom':
                return {
                    start: new Date(startDateInput.value),
                    end: new Date(endDateInput.value)
                };
            default:
                return {
                    start: new Date(today.getFullYear(), today.getMonth(), 1),
                    end: today
                };
        }
    }

    // Actualizar resumen financiero
    function updateSummary(summary) {
        document.getElementById('current-account').textContent = formatCurrency(summary.currentAccount);
        document.getElementById('savings-account').textContent = formatCurrency(summary.savingsAccount);
        document.getElementById('total-balance').textContent = formatCurrency(summary.totalBalance);
        
        document.getElementById('total-income').textContent = formatCurrency(summary.totalIncome);
        document.getElementById('total-expense').textContent = formatCurrency(summary.totalExpense);
        document.getElementById('net-cashflow').textContent = formatCurrency(summary.netCashflow);
        
        document.getElementById('profit-margin').textContent = summary.profitMargin + '%';
        document.getElementById('invoices-count').textContent = summary.invoicesCount;
        document.getElementById('collection-rate').textContent = summary.collectionRate + '%';
    }

    // Actualizar gráficos
    function updateCharts(chartData) {
        // Destruir gráficos existentes si los hay
        if (window.incomeExpenseChart) {
            window.incomeExpenseChart.destroy();
        }
        if (window.expenseDistributionChart) {
            window.expenseDistributionChart.destroy();
        }
        
        // Gráfico de ingresos vs egresos
        const incomeExpenseCtx = document.getElementById('income-expense-chart').getContext('2d');
        window.incomeExpenseChart = new Chart(incomeExpenseCtx, {
            type: 'bar',
            data: {
                labels: chartData.incomeExpense.labels,
                datasets: [
                    {
                        label: 'Ingresos',
                        data: chartData.incomeExpense.income,
                        backgroundColor: '#2ecc71',
                        borderColor: '#27ae60',
                        borderWidth: 1
                    },
                    {
                        label: 'Egresos',
                        data: chartData.incomeExpense.expense,
                        backgroundColor: '#e74c3c',
                        borderColor: '#c0392b',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += '$' + context.raw.toLocaleString();
                                return label;
                            }
                        }
                    }
                }
            }
        });
        
        // Gráfico de distribución de egresos
        const expenseDistributionCtx = document.getElementById('expense-distribution-chart').getContext('2d');
        window.expenseDistributionChart = new Chart(expenseDistributionCtx, {
            type: 'doughnut',
            data: {
                labels: chartData.expenseDistribution.labels,
                datasets: [{
                    data: chartData.expenseDistribution.data,
                    backgroundColor: [
                        '#3498db',
                        '#9b59b6',
                        '#f1c40f',
                        '#e67e22',
                        '#e74c3c',
                        '#1abc9c'
                    ],
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
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Actualizar alertas
    function updateAlerts(alerts) {
        const alertsContainer = document.getElementById('alerts-container');
        const alertsCount = document.getElementById('alerts-count');
        
        alertsCount.textContent = alerts.length;
        
        if (alerts.length === 0) {
            alertsContainer.innerHTML = '<div class="no-alerts">No hay alertas en este momento</div>';
            return;
        }
        
        alertsContainer.innerHTML = '';
        
        alerts.forEach(alert => {
            const alertItem = document.createElement('div');
            alertItem.className = `alert-item ${alert.type}`;
            
            let iconClass;
            switch(alert.type) {
                case 'critical':
                    iconClass = 'fas fa-exclamation-circle';
                    break;
                case 'info':
                    iconClass = 'fas fa-info-circle';
                    break;
                default:
                    iconClass = 'fas fa-exclamation-triangle';
            }
            
            alertItem.innerHTML = `
                <div class="alert-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                    <div class="alert-date">${formatDate(alert.date)}</div>
                </div>
            `;
            
            alertsContainer.appendChild(alertItem);
        });
    }

    // Actualizar próximos pagos
    function updatePayments(payments) {
        const paymentsList = document.getElementById('payments-list');
        
        if (payments.length === 0) {
            paymentsList.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 20px; color: #7f8c8d;">
                        No hay pagos próximos en este periodo
                    </td>
                </tr>
            `;
            return;
        }
        
        paymentsList.innerHTML = '';
        
        payments.forEach(payment => {
            const row = document.createElement('tr');
            
            let statusClass = '';
            let statusText = '';
            
            if (payment.status === 'pending') {
                statusClass = 'status-pending';
                statusText = 'Pendiente';
            } else if (payment.status === 'due') {
                statusClass = 'status-due';
                statusText = 'Vencido';
            } else {
                statusClass = 'status-paid';
                statusText = 'Pagado';
            }
            
            row.innerHTML = `
                <td>${formatDate(payment.date)}</td>
                <td>${payment.concept}</td>
                <td>${formatCurrency(payment.amount)}</td>
                <td><span class="payment-status ${statusClass}">${statusText}</span></td>
            `;
            
            paymentsList.appendChild(row);
        });
    }

    // Simular carga de datos (en una implementación real sería una llamada AJAX)
    function simulateDataLoad(dateRange) {
        return new Promise((resolve) => {
            // Simular retraso de red
            setTimeout(() => {
                // Datos de ejemplo
                const data = {
                    summary: {
                        currentAccount: 125000,
                        savingsAccount: 350000,
                        totalBalance: 475000,
                        totalIncome: 280000,
                        totalExpense: 175000,
                        netCashflow: 105000,
                        profitMargin: 37.5,
                        invoicesCount: 24,
                        collectionRate: 85
                    },
                    chartData: {
                        incomeExpense: {
                            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                            income: [120000, 150000, 180000, 160000, 210000, 280000],
                            expense: [80000, 90000, 110000, 95000, 120000, 175000]
                        },
                        expenseDistribution: {
                            labels: ['Nómina', 'Alquiler', 'Servicios', 'Suministros', 'Impuestos', 'Otros'],
                            data: [65000, 35000, 25000, 15000, 20000, 15000]
                        }
                    },
                    alerts: [
                        {
                            type: 'critical',
                            title: 'Factura vencida',
                            description: 'La factura #1234 con fecha 15/05/2023 está vencida',
                            date: '2023-06-01'
                        },
                        {
                            type: 'warning',
                            title: 'Pago próximo',
                            description: 'El pago del alquiler vence en 3 días',
                            date: '2023-06-10'
                        },
                        {
                            type: 'info',
                            title: 'Actualización disponible',
                            description: 'Nueva versión del sistema contable disponible',
                            date: '2023-06-05'
                        }
                    ],
                    upcomingPayments: [
                        {
                            date: '2023-06-15',
                            concept: 'Pago de nómina',
                            amount: 65000,
                            status: 'pending'
                        },
                        {
                            date: '2023-06-05',
                            concept: 'Alquiler oficina',
                            amount: 35000,
                            status: 'due'
                        },
                        {
                            date: '2023-05-28',
                            concept: 'Servicios profesionales',
                            amount: 12000,
                            status: 'paid'
                        },
                        {
                            date: '2023-06-20',
                            concept: 'Suministros de oficina',
                            amount: 8000,
                            status: 'pending'
                        }
                    ]
                };
                
                resolve(data);
            }, 800); // Simular 800ms de retraso
        });
    }

    // Funciones de utilidad
    function formatCurrency(amount) {
        return '$' + amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
});