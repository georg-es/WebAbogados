document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let clients = [
        { id: 1, name: "Juan Pérez", identification: "8-123-4567", email: "juan@example.com", address: "Calle 1, Ciudad de Panamá" },
        { id: 2, name: "María López", identification: "PE-123-456", email: "maria@example.com", address: "Calle 2, Panamá" },
        { id: 3, name: "Empresa XYZ", identification: "123456789", email: "contacto@xyz.com", address: "Avenida Central, Edificio 3, Piso 5" }
    ];

    let invoices = [];
    let currentInvoice = {
        id: generateInvoiceNumber(),
        date: new Date().toISOString().split('T')[0],
        client: null,
        services: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        status: 'pending'
    };

    // Elementos del DOM
    const clientSelect = document.getElementById('clientSelect');
    const clientName = document.getElementById('clientName');
    const clientId = document.getElementById('clientId');
    const clientEmail = document.getElementById('clientEmail');
    const clientAddress = document.getElementById('clientAddress');
    const servicesContainer = document.getElementById('servicesContainer');
    const addServiceBtn = document.getElementById('addService');
    const invoiceNumber = document.getElementById('invoiceNumber');
    const invoiceDate = document.getElementById('invoiceDate');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    const previewBtn = document.getElementById('previewBtn');
    const saveBtn = document.getElementById('saveBtn');
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    const generatePdfBtn = document.getElementById('generatePdfBtn');
    const previewModal = document.getElementById('previewModal');
    const closeModal = document.querySelector('.close-modal');
    const closePreviewBtn = document.getElementById('closePreview');
    const printPreviewBtn = document.getElementById('printPreview');
    const invoicePreview = document.getElementById('invoicePreview');

    // Inicialización
    init();

    // Funciones
    function init() {
        // Llenar select de clientes
        populateClientSelect();
        
        // Establecer número y fecha de factura
        invoiceNumber.value = currentInvoice.id;
        invoiceDate.value = currentInvoice.date;
        
        // Agregar un servicio por defecto
        addService();
        
        // Event listeners
        setupEventListeners();
    }

    function populateClientSelect() {
        clientSelect.innerHTML = '<option value="">-- Seleccione un cliente --</option>';
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = `${client.name} (${client.identification})`;
            clientSelect.appendChild(option);
        });
    }

    function setupEventListeners() {
        // Selección de cliente
        clientSelect.addEventListener('change', function() {
            const clientId = parseInt(this.value);
            const selectedClient = clients.find(c => c.id === clientId);
            
            if (selectedClient) {
                currentInvoice.client = selectedClient;
                clientName.value = selectedClient.name;
                clientId.value = selectedClient.identification;
                clientEmail.value = selectedClient.email;
                clientAddress.value = selectedClient.address;
            } else {
                currentInvoice.client = null;
                clientName.value = '';
                clientId.value = '';
                clientEmail.value = '';
                clientAddress.value = '';
            }
        });

        // Campos de cliente manuales
        [clientName, clientId, clientEmail, clientAddress].forEach(field => {
            field.addEventListener('change', function() {
                if (!currentInvoice.client) {
                    currentInvoice.client = {
                        id: 0,
                        name: '',
                        identification: '',
                        email: '',
                        address: ''
                    };
                }
                
                currentInvoice.client.name = clientName.value;
                currentInvoice.client.identification = clientId.value;
                currentInvoice.client.email = clientEmail.value;
                currentInvoice.client.address = clientAddress.value;
            });
        });

        // Agregar servicio
        addServiceBtn.addEventListener('click', addService);

        // Vista previa
        previewBtn.addEventListener('click', showPreview);
        
        // Guardar factura
        saveBtn.addEventListener('click', saveInvoice);
        
        // Enviar por correo
        sendEmailBtn.addEventListener('click', sendEmail);
        
        // Generar PDF
        generatePdfBtn.addEventListener('click', generatePDF);
        
        // Cerrar modal
        closeModal.addEventListener('click', () => previewModal.style.display = 'none');
        closePreviewBtn.addEventListener('click', () => previewModal.style.display = 'none');
        
        // Imprimir vista previa
        printPreviewBtn.addEventListener('click', printPreview);
    }

    function addService() {
        const serviceId = Date.now();
        const serviceItem = document.createElement('div');
        serviceItem.className = 'service-item';
        serviceItem.dataset.id = serviceId;
        
        serviceItem.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Descripción</label>
                    <input type="text" class="form-control service-description" required>
                </div>
                <div class="form-group">
                    <label>Cantidad</label>
                    <input type="number" class="form-control service-quantity" min="1" value="1" required>
                </div>
                <div class="form-group">
                    <label>Precio Unitario ($)</label>
                    <input type="number" class="form-control service-price" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Total ($)</label>
                    <input type="text" class="form-control service-total" readonly>
                </div>
                <button type="button" class="btn btn-remove-service"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        servicesContainer.appendChild(serviceItem);
        
        // Agregar servicio al objeto currentInvoice
        const newService = {
            id: serviceId,
            description: '',
            quantity: 1,
            price: 0,
            total: 0
        };
        
        currentInvoice.services.push(newService);
        
        // Event listeners para los campos del servicio
        const descriptionInput = serviceItem.querySelector('.service-description');
        const quantityInput = serviceItem.querySelector('.service-quantity');
        const priceInput = serviceItem.querySelector('.service-price');
        const totalInput = serviceItem.querySelector('.service-total');
        const removeBtn = serviceItem.querySelector('.btn-remove-service');
        
        descriptionInput.addEventListener('change', function() {
            const service = currentInvoice.services.find(s => s.id === serviceId);
            service.description = this.value;
        });
        
        quantityInput.addEventListener('change', function() {
            const service = currentInvoice.services.find(s => s.id === serviceId);
            service.quantity = parseInt(this.value);
            calculateServiceTotal(service);
            updateServiceTotalInput(service, totalInput);
            calculateInvoiceTotals();
        });
        
        priceInput.addEventListener('change', function() {
            const service = currentInvoice.services.find(s => s.id === serviceId);
            service.price = parseFloat(this.value);
            calculateServiceTotal(service);
            updateServiceTotalInput(service, totalInput);
            calculateInvoiceTotals();
        });
        
        removeBtn.addEventListener('click', function() {
            servicesContainer.removeChild(serviceItem);
            currentInvoice.services = currentInvoice.services.filter(s => s.id !== serviceId);
            calculateInvoiceTotals();
        });
    }

    function calculateServiceTotal(service) {
        service.total = service.quantity * service.price;
    }

    function updateServiceTotalInput(service, inputElement) {
        inputElement.value = formatCurrency(service.total);
    }

    function calculateInvoiceTotals() {
        currentInvoice.subtotal = currentInvoice.services.reduce((sum, service) => sum + service.total, 0);
        currentInvoice.tax = currentInvoice.subtotal * 0.07; // ITBMS 7% en Panamá
        currentInvoice.total = currentInvoice.subtotal + currentInvoice.tax;
        
        updateInvoiceSummary();
    }

    function updateInvoiceSummary() {
        subtotalElement.textContent = formatCurrency(currentInvoice.subtotal);
        taxElement.textContent = formatCurrency(currentInvoice.tax);
        totalElement.textContent = formatCurrency(currentInvoice.total);
    }

    function formatCurrency(amount) {
        return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }

    function generateInvoiceNumber() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000);
        
        return `FAC-${year}${month}${day}-${random}`;
    }

    function showPreview() {
        if (!validateInvoice()) return;
        
        const formattedDate = formatDate(currentInvoice.date);
        
        let itemsHTML = '';
        currentInvoice.services.forEach(service => {
            itemsHTML += `
                <tr>
                    <td>${service.description}</td>
                    <td>${service.quantity}</td>
                    <td>${formatCurrency(service.price)}</td>
                    <td>${formatCurrency(service.total)}</td>
                </tr>
            `;
        });
        
        invoicePreview.innerHTML = `
            <div class="invoice-header">
                <div>
                    <div class="invoice-title">FACTURA LEGAL</div>
                    <div>Bufete Legal</div>
                    <div>RUC: 123456789</div>
                    <div>Teléfono: +507 123-4567</div>
                    <div>Email: info@bufetelegal.com</div>
                </div>
                <div class="invoice-details">
                    <div class="invoice-number">Factura #${currentInvoice.id}</div>
                    <div class="invoice-date">Fecha: ${formattedDate}</div>
                    <div>Estado: ${currentInvoice.status === 'pending' ? 'Pendiente' : 'Pagada'}</div>
                </div>
            </div>
            
            <div class="invoice-client">
                <h3>Datos del Cliente</h3>
                <div><strong>Nombre:</strong> ${currentInvoice.client.name}</div>
                <div><strong>Identificación:</strong> ${currentInvoice.client.identification}</div>
                <div><strong>Correo:</strong> ${currentInvoice.client.email}</div>
                <div><strong>Dirección:</strong> ${currentInvoice.client.address}</div>
            </div>
            
            <table class="invoice-items">
                <thead>
                    <tr>
                        <th>Descripción</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            
            <div class="invoice-total">
                <table>
                    <tr>
                        <td>Subtotal:</td>
                        <td>${formatCurrency(currentInvoice.subtotal)}</td>
                    </tr>
                    <tr>
                        <td>ITBMS (7%):</td>
                        <td>${formatCurrency(currentInvoice.tax)}</td>
                    </tr>
                    <tr class="total-row">
                        <td>Total:</td>
                        <td>${formatCurrency(currentInvoice.total)}</td>
                    </tr>
                </table>
            </div>
            
            <div style="margin-top: 3rem; text-align: center; font-style: italic;">
                Gracias por su preferencia. Para cualquier consulta, no dude en contactarnos.
            </div>
        `;
        
        previewModal.style.display = 'block';
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-PA', options);
    }

    function printPreview() {
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Factura ${currentInvoice.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 2rem; }
                    .invoice-header { display: flex; justify-content: space-between; margin-bottom: 2rem; }
                    .invoice-title { font-size: 1.8rem; color: #2c3e50; font-weight: bold; }
                    .invoice-items { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
                    .invoice-items th { background-color: #f5f5f5; padding: 0.75rem; text-align: left; }
                    .invoice-items td { padding: 0.75rem; border-bottom: 1px solid #eee; }
                    .invoice-total table { margin-left: auto; border-collapse: collapse; }
                    .invoice-total td { padding: 0.5rem 1rem; }
                    .total-row { font-weight: bold; font-size: 1.1rem; border-top: 1px solid #ddd; }
                </style>
            </head>
            <body>
                ${invoicePreview.innerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 100);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    function validateInvoice() {
        if (!currentInvoice.client || !currentInvoice.client.name || !currentInvoice.client.identification) {
            alert('Por favor complete los datos del cliente');
            return false;
        }
        
        if (currentInvoice.services.length === 0) {
            alert('Por favor agregue al menos un servicio');
            return false;
        }
        
        for (const service of currentInvoice.services) {
            if (!service.description || service.price <= 0) {
                alert('Por favor complete todos los servicios correctamente');
                return false;
            }
        }
        
        return true;
    }

    function saveInvoice() {
        if (!validateInvoice()) return;
        
        // Actualizar fecha por si cambió
        currentInvoice.date = invoiceDate.value;
        
        // Verificar si es una factura nueva o existente
        const existingIndex = invoices.findIndex(i => i.id === currentInvoice.id);
        
        if (existingIndex >= 0) {
            invoices[existingIndex] = {...currentInvoice};
        } else {
            invoices.push({...currentInvoice});
        }
        
        alert('Factura guardada correctamente');
        
        // Opcional: reiniciar para una nueva factura
        // resetInvoiceForm();
    }

    function sendEmail() {
        if (!validateInvoice()) return;
        
        // Aquí iría la lógica para integrar con un servicio de correo
        alert(`Factura enviada por correo a ${currentInvoice.client.email}`);
    }

    function generatePDF() {
        if (!validateInvoice()) return;
        
        // Aquí iría la lógica para generar PDF usando una librería como jsPDF
        alert('PDF generado correctamente');
    }

    function resetInvoiceForm() {
        currentInvoice = {
            id: generateInvoiceNumber(),
            date: new Date().toISOString().split('T')[0],
            client: null,
            services: [],
            subtotal: 0,
            tax: 0,
            total: 0,
            status: 'pending'
        };
        
        invoiceNumber.value = currentInvoice.id;
        invoiceDate.value = currentInvoice.date;
        clientSelect.value = '';
        clientName.value = '';
        clientId.value = '';
        clientEmail.value = '';
        clientAddress.value = '';
        servicesContainer.innerHTML = '';
        addService();
        calculateInvoiceTotals();
    }
});