// Datos iniciales de plantillas
const templates = {
    'case-opened': {
        subject: 'Nuevo caso abierto - {{nro_caso}}',
        body: 'Estimado/a {{nombre}},\n\nHemos abierto un nuevo caso para usted con el número de referencia {{nro_caso}} ({{tipo_caso}}).\n\nPuede acceder a los detalles del caso en cualquier momento a través de nuestro portal del cliente: {{enlace_portal}}\n\nCualquier documento requerido puede ser subido a través del portal.',
        signature: 'Atentamente,\nEl equipo de Despacho Legal\n\nEste es un mensaje automático, por favor no responda directamente a este correo.'
    },
    'document-uploaded': {
        subject: 'Nuevo documento subido - {{documento}}',
        body: 'Hola {{nombre}},\n\nHemos subido el documento "{{documento}}" relacionado con su caso {{nro_caso}}.\n\nPor favor revise el documento en su portal del cliente: {{enlace_portal}}\n\nSi tiene alguna pregunta sobre este documento, no dude en contactarnos.',
        signature: 'Atentamente,\nEl equipo de Despacho Legal\n\nEste es un mensaje automático, por favor no responda directamente a este correo.'
    },
    'payment-reminder': {
        subject: 'Recordatorio de pago - {{nro_caso}}',
        body: 'Estimado/a {{nombre}},\n\nLe recordamos que tiene un pago pendiente por el monto de {{monto}} para el caso {{nro_caso}}, con fecha de vencimiento el {{fecha_vencimiento}}.\n\nPuede realizar el pago directamente desde nuestro portal seguro: {{enlace_portal}}\n\nSi ya realizó el pago, por favor ignore este mensaje.',
        signature: 'Atentamente,\nEl equipo de Despacho Legal\n\nEste es un mensaje automático, por favor no responda directamente a este correo.'
    }
};

// Variables de ejemplo para vista previa
const previewVariables = {
    nombre: 'Jorge Guerra',
    nro_caso: 'DIV-2025-001',
    tipo_caso: 'Divorcio',
    fecha: '28 de junio, 2025',
    documento: 'Contrato de servicios legales.pdf',
    monto: '$1,200.00',
    fecha_vencimiento: '05 de julio, 2025',
    enlace_portal: 'https://portal.despacholegal.com/cliente'
};

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Configurar eventos de los botones de edición
    const editButtons = document.querySelectorAll('.edit-template-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const templateType = this.getAttribute('data-template');
            openTemplateEditor(templateType);
        });
    });
    
    // Configurar eventos del modal
    const modal = document.getElementById('template-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    
    closeModalBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Configurar eventos del formulario de plantilla
    const templateForm = document.getElementById('template-form');
    templateForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveTemplate();
    });
    
    // Configurar eventos de los botones de formato de texto
    const formatButtons = document.querySelectorAll('.btn-text-format');
    formatButtons.forEach(button => {
        button.addEventListener('click', function() {
            applyTextFormat(this.getAttribute('data-format'));
        });
    });
    
    // Configurar eventos de vista previa
    const previewBtn = document.getElementById('preview-btn');
    previewBtn.addEventListener('click', showPreview);
    
    const backToEditBtn = document.getElementById('back-to-edit');
    backToEditBtn.addEventListener('click', backToEdit);
});

// Abrir editor de plantilla
function openTemplateEditor(templateType) {
    const modal = document.getElementById('template-modal');
    const template = templates[templateType];
    
    // Configurar el modal
    document.getElementById('modal-title').textContent = `Editar plantilla: ${getTemplateName(templateType)}`;
    document.getElementById('template-type').value = templateType;
    document.getElementById('template-subject').value = template.subject;
    document.getElementById('template-body').value = template.body;
    document.getElementById('template-signature').value = template.signature;
    
    // Mostrar el modal
    modal.style.display = 'flex';
    
    // Ocultar vista previa si está visible
    document.getElementById('preview-section').style.display = 'none';
    document.getElementById('template-form').style.display = 'block';
}

// Obtener nombre descriptivo de la plantilla
function getTemplateName(templateType) {
    const names = {
        'case-opened': 'Apertura de caso',
        'document-uploaded': 'Documento subido',
        'payment-reminder': 'Recordatorio de pago'
    };
    return names[templateType] || templateType;
}

// Guardar plantilla
function saveTemplate() {
    const templateType = document.getElementById('template-type').value;
    const subject = document.getElementById('template-subject').value;
    const body = document.getElementById('template-body').value;
    const signature = document.getElementById('template-signature').value;
    
    // Validación básica
    if (!subject || !body) {
        alert('Por favor complete todos los campos obligatorios');
        return;
    }
    
    // Actualizar la plantilla
    templates[templateType] = {
        subject: subject,
        body: body,
        signature: signature
    };
    
    // Cerrar el modal
    document.getElementById('template-modal').style.display = 'none';
    
    // Mostrar confirmación
    alert(`Plantilla "${getTemplateName(templateType)}" guardada correctamente`);
}

// Aplicar formato de texto
function applyTextFormat(format) {
    const textarea = document.getElementById('template-body');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let newText = '';
    
    switch(format) {
        case 'bold':
            newText = `**${selectedText}**`;
            break;
        case 'italic':
            newText = `_${selectedText}_`;
            break;
        case 'ul':
            newText = selectedText.split('\n').map(line => line ? `- ${line}` : '').join('\n');
            break;
        case 'ol':
            newText = selectedText.split('\n').map((line, i) => line ? `${i+1}. ${line}` : '').join('\n');
            break;
        case 'link':
            newText = `[${selectedText}](URL)`;
            break;
    }
    
    // Reemplazar el texto seleccionado
    textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    
    // Restaurar el foco y selección
    textarea.focus();
    textarea.setSelectionRange(start, start + newText.length);
}

// Mostrar vista previa
function showPreview() {
    const subject = document.getElementById('template-subject').value;
    const body = document.getElementById('template-body').value;
    const signature = document.getElementById('template-signature').value;
    
    // Reemplazar variables en la vista previa
    let previewBody = body;
    let previewSubject = subject;
    
    for (const [key, value] of Object.entries(previewVariables)) {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        previewBody = previewBody.replace(placeholder, value);
        previewSubject = previewSubject.replace(placeholder, value);
    }
    
    // Convertir markdown simple a HTML para la vista previa
    previewBody = previewBody
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/- (.*?)(\n|$)/g, '<li>$1</li>')
        .replace(/\d+\. (.*?)(\n|$)/g, '<li>$1</li>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        .replace(/\n/g, '<br>');
    
    // Mostrar la vista previa
    document.getElementById('preview-subject').textContent = previewSubject;
    document.getElementById('preview-body').innerHTML = previewBody;
    document.getElementById('preview-signature').innerHTML = signature.replace(/\n/g, '<br>');
    
    // Cambiar vistas
    document.getElementById('template-form').style.display = 'none';
    document.getElementById('preview-section').style.display = 'block';
}

// Volver a editar desde la vista previa
function backToEdit() {
    document.getElementById('preview-section').style.display = 'none';
    document.getElementById('template-form').style.display = 'block';
}

// Función para enviar notificación (simulada)
function sendNotification(templateType, variables) {
    if (!document.getElementById(`${templateType}-notification`).checked) {
        console.log(`Notificación ${templateType} está desactivada`);
        return;
    }
    
    const template = templates[templateType];
    let subject = template.subject;
    let body = template.body;
    let signature = template.signature;
    
    // Reemplazar variables
    for (const [key, value] of Object.entries(variables)) {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        subject = subject.replace(placeholder, value);
        body = body.replace(placeholder, value);
        signature = signature.replace(placeholder, value);
    }
    
    // Enviar correo (simulado)
    console.log('Enviando notificación por correo:');
    console.log('Asunto:', subject);
    console.log('Cuerpo:', body);
    console.log('Firma:', signature);
    
    // En una aplicación real, aquí se haría una llamada al servidor para enviar el correo
    alert('Notificación enviada al cliente');
}