// Datos iniciales del sistema
let systemParams = {
    currency: "USD",
    taxRate: 7,
    paymentDays: 30,
    categories: ["Civil", "Penal", "Migración", "Empresarial"],
    statuses: [
        { name: "En revisión", color: "#3498db" },
        { name: "En espera", color: "#f39c12" },
        { name: "Aprobado", color: "#27ae60" },
        { name: "Rechazado", color: "#e74c3c" }
    ]
};

// Elementos del DOM
const currencySelect = document.getElementById("default-currency");
const taxRateInput = document.getElementById("tax-rate");
const paymentDaysInput = document.getElementById("payment-days");
const saveFinancialBtn = document.getElementById("save-financial");
const categoriesList = document.getElementById("categories-list");
const newCategoryInput = document.getElementById("new-category");
const addCategoryBtn = document.getElementById("add-category");
const statusesList = document.getElementById("statuses-list");
const newStatusInput = document.getElementById("new-status");
const statusColorInput = document.getElementById("status-color");
const addStatusBtn = document.getElementById("add-status");
const confirmModal = document.getElementById("confirm-modal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const confirmCancelBtn = document.getElementById("confirm-cancel");
const confirmOkBtn = document.getElementById("confirm-ok");

// Variables para el modal de confirmación
let currentAction = null;
let currentItem = null;

// Inicialización cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", function() {
    // Cargar configuración actual
    loadCurrentConfig();
    
    // Cargar categorías
    loadCategories();
    
    // Cargar estados
    loadStatuses();
    
    // Configurar eventos
    setupEvents();
});

// Cargar configuración actual
function loadCurrentConfig() {
    currencySelect.value = systemParams.currency;
    taxRateInput.value = systemParams.taxRate;
    paymentDaysInput.value = systemParams.paymentDays;
}

// Cargar lista de categorías
function loadCategories() {
    categoriesList.innerHTML = "";
    
    systemParams.categories.forEach((category, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${category}</span>
            <div class="item-actions">
                <button class="btn btn-outline btn-sm edit-category" data-index="${index}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline btn-sm delete-category" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        categoriesList.appendChild(li);
    });
    
    // Agregar eventos a los botones de categorías
    document.querySelectorAll(".edit-category").forEach(btn => {
        btn.addEventListener("click", function() {
            editCategory(parseInt(this.getAttribute("data-index")));
        });
    });
    
    document.querySelectorAll(".delete-category").forEach(btn => {
        btn.addEventListener("click", function() {
            showConfirmModal(
                "Eliminar Categoría",
                `¿Está seguro que desea eliminar la categoría "${systemParams.categories[parseInt(this.getAttribute("data-index"))]}"?`,
                "deleteCategory",
                parseInt(this.getAttribute("data-index"))
            );
        });
    });
}

// Cargar lista de estados
function loadStatuses() {
    statusesList.innerHTML = "";
    
    systemParams.statuses.forEach((status, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>
                <span class="item-badge" style="background-color: ${status.color}">${status.name}</span>
            </span>
            <div class="item-actions">
                <button class="btn btn-outline btn-sm edit-status" data-index="${index}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline btn-sm delete-status" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        statusesList.appendChild(li);
    });
    
    // Agregar eventos a los botones de estados
    document.querySelectorAll(".edit-status").forEach(btn => {
        btn.addEventListener("click", function() {
            editStatus(parseInt(this.getAttribute("data-index")));
        });
    });
    
    document.querySelectorAll(".delete-status").forEach(btn => {
        btn.addEventListener("click", function() {
            showConfirmModal(
                "Eliminar Estado",
                `¿Está seguro que desea eliminar el estado "${systemParams.statuses[parseInt(this.getAttribute("data-index"))].name}"?`,
                "deleteStatus",
                parseInt(this.getAttribute("data-index"))
            );
        });
    });
}

// Configurar eventos
function setupEvents() {
    // Guardar configuración financiera
    saveFinancialBtn.addEventListener("click", saveFinancialConfig);
    
    // Agregar nueva categoría
    addCategoryBtn.addEventListener("click", addNewCategory);
    newCategoryInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") addNewCategory();
    });
    
    // Agregar nuevo estado
    addStatusBtn.addEventListener("click", addNewStatus);
    newStatusInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") addNewStatus();
    });
    
    // Modal de confirmación
    document.querySelector(".close-modal").addEventListener("click", closeModal);
    confirmCancelBtn.addEventListener("click", closeModal);
    confirmOkBtn.addEventListener("click", executeConfirmedAction);
    
    // Cerrar modal haciendo clic fuera del contenido
    window.addEventListener("click", function(event) {
        if (event.target === confirmModal) {
            closeModal();
        }
    });
}

// Guardar configuración financiera
function saveFinancialConfig() {
    // Validar ITBMS
    const taxRate = parseFloat(taxRateInput.value);
    if (isNaN(taxRate) || taxRate < 0 || taxRate > 15) {
        alert("El porcentaje de ITBMS debe estar entre 0% y 15%");
        return;
    }
    
    // Validar días de pago
    const paymentDays = parseInt(paymentDaysInput.value);
    if (isNaN(paymentDays) || paymentDays < 1 || paymentDays > 90) {
        alert("Los días de vencimiento deben estar entre 1 y 90");
        return;
    }
    
    // Actualizar configuración
    systemParams.currency = currencySelect.value;
    systemParams.taxRate = taxRate;
    systemParams.paymentDays = paymentDays;
    
    // Simular guardado en servidor
    setTimeout(() => {
        alert("Configuración monetaria guardada correctamente");
        // En una aplicación real, aquí se haría una llamada AJAX al servidor
    }, 500);
}

// Agregar nueva categoría
function addNewCategory() {
    const categoryName = newCategoryInput.value.trim();
    
    if (!categoryName) {
        alert("Por favor ingrese un nombre para la categoría");
        return;
    }
    
    if (systemParams.categories.includes(categoryName)) {
        alert("Esta categoría ya existe");
        return;
    }
    
    systemParams.categories.push(categoryName);
    loadCategories();
    newCategoryInput.value = "";
    
    // Simular guardado en servidor
    setTimeout(() => {
        console.log("Categoría agregada:", categoryName);
        // En una aplicación real, aquí se haría una llamada AJAX al servidor
    }, 500);
}

// Editar categoría
function editCategory(index) {
    const newName = prompt("Editar categoría:", systemParams.categories[index]);
    
    if (newName && newName.trim() && newName !== systemParams.categories[index]) {
        systemParams.categories[index] = newName.trim();
        loadCategories();
        
        // Simular guardado en servidor
        setTimeout(() => {
            console.log("Categoría actualizada:", newName);
            // En una aplicación real, aquí se haría una llamada AJAX al servidor
        }, 500);
    }
}

// Eliminar categoría
function deleteCategory(index) {
    systemParams.categories.splice(index, 1);
    loadCategories();
    
    // Simular guardado en servidor
    setTimeout(() => {
        console.log("Categoría eliminada");
        // En una aplicación real, aquí se haría una llamada AJAX al servidor
    }, 500);
}

// Agregar nuevo estado
function addNewStatus() {
    const statusName = newStatusInput.value.trim();
    const statusColor = statusColorInput.value;
    
    if (!statusName) {
        alert("Por favor ingrese un nombre para el estado");
        return;
    }
    
    if (systemParams.statuses.some(s => s.name.toLowerCase() === statusName.toLowerCase())) {
        alert("Este estado ya existe");
        return;
    }
    
    systemParams.statuses.push({
        name: statusName,
        color: statusColor
    });
    
    loadStatuses();
    newStatusInput.value = "";
    
    // Simular guardado en servidor
    setTimeout(() => {
        console.log("Estado agregado:", statusName);
        // En una aplicación real, aquí se haría una llamada AJAX al servidor
    }, 500);
}

// Editar estado
function editStatus(index) {
    const currentStatus = systemParams.statuses[index];
    const newName = prompt("Editar nombre del estado:", currentStatus.name);
    
    if (newName && newName.trim() && newName !== currentStatus.name) {
        systemParams.statuses[index].name = newName.trim();
        
        const newColor = prompt("Editar color (en hexadecimal):", currentStatus.color);
        if (newColor && /^#[0-9A-F]{6}$/i.test(newColor)) {
            systemParams.statuses[index].color = newColor;
        }
        
        loadStatuses();
        
        // Simular guardado en servidor
        setTimeout(() => {
            console.log("Estado actualizado:", newName);
            // En una aplicación real, aquí se haría una llamada AJAX al servidor
        }, 500);
    }
}

// Eliminar estado
function deleteStatus(index) {
    systemParams.statuses.splice(index, 1);
    loadStatuses();
    
    // Simular guardado en servidor
    setTimeout(() => {
        console.log("Estado eliminado");
        // En una aplicación real, aquí se haría una llamada AJAX al servidor
    }, 500);
}

// Mostrar modal de confirmación
function showConfirmModal(title, message, action, item) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    currentAction = action;
    currentItem = item;
    confirmModal.style.display = "flex";
}

// Cerrar modal
function closeModal() {
    confirmModal.style.display = "none";
    currentAction = null;
    currentItem = null;
}

// Ejecutar acción confirmada
function executeConfirmedAction() {
    if (currentAction && currentItem !== null) {
        switch(currentAction) {
            case "deleteCategory":
                deleteCategory(currentItem);
                break;
            case "deleteStatus":
                deleteStatus(currentItem);
                break;
        }
    }
    closeModal();
}