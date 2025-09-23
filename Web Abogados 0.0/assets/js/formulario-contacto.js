document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = document.getElementById('submitBtn');
    
    // Validación en tiempo real
    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');
    const asuntoSelect = document.getElementById('asunto');
    const mensajeTextarea = document.getElementById('mensaje');
    const privacidadCheckbox = document.getElementById('privacidad');
    
    nombreInput.addEventListener('blur', validateNombre);
    emailInput.addEventListener('blur', validateEmail);
    asuntoSelect.addEventListener('change', validateAsunto);
    mensajeTextarea.addEventListener('blur', validateMensaje);
    privacidadCheckbox.addEventListener('change', validatePrivacidad);
    
    function validateNombre() {
        const nombreError = document.getElementById('nombreError');
        if (nombreInput.value.trim() === '') {
            nombreError.textContent = 'Por favor, ingrese su nombre completo.';
            nombreInput.style.borderColor = '#d9534f';
            return false;
        } else if (nombreInput.value.trim().length < 2) {
            nombreError.textContent = 'El nombre debe tener al menos 2 caracteres.';
            nombreInput.style.borderColor = '#d9534f';
            return false;
        } else {
            nombreError.textContent = '';
            nombreInput.style.borderColor = '#ddd';
            return true;
        }
    }
    
    function validateEmail() {
        const emailError = document.getElementById('emailError');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (emailInput.value.trim() === '') {
            emailError.textContent = 'Por favor, ingrese su correo electrónico.';
            emailInput.style.borderColor = '#d9534f';
            return false;
        } else if (!emailRegex.test(emailInput.value)) {
            emailError.textContent = 'Por favor, ingrese un correo electrónico válido.';
            emailInput.style.borderColor = '#d9534f';
            return false;
        } else {
            emailError.textContent = '';
            emailInput.style.borderColor = '#ddd';
            return true;
        }
    }
    
    function validateAsunto() {
        const asuntoError = document.getElementById('asuntoError');
        if (asuntoSelect.value === '') {
            asuntoError.textContent = 'Por favor, seleccione un asunto.';
            asuntoSelect.style.borderColor = '#d9534f';
            return false;
        } else {
            asuntoError.textContent = '';
            asuntoSelect.style.borderColor = '#ddd';
            return true;
        }
    }
    
    function validateMensaje() {
        const mensajeError = document.getElementById('mensajeError');
        if (mensajeTextarea.value.trim() === '') {
            mensajeError.textContent = 'Por favor, ingrese su mensaje.';
            mensajeTextarea.style.borderColor = '#d9534f';
            return false;
        } else if (mensajeTextarea.value.trim().length < 10) {
            mensajeError.textContent = 'El mensaje debe tener al menos 10 caracteres.';
            mensajeTextarea.style.borderColor = '#d9534f';
            return false;
        } else {
            mensajeError.textContent = '';
            mensajeTextarea.style.borderColor = '#ddd';
            return true;
        }
    }
    
    function validatePrivacidad() {
        const privacidadError = document.getElementById('privacidadError');
        if (!privacidadCheckbox.checked) {
            privacidadError.textContent = 'Debe aceptar la política de privacidad para continuar.';
            return false;
        } else {
            privacidadError.textContent = '';
            return true;
        }
    }
    
    // Envío del formulario
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const isNombreValid = validateNombre();
        const isEmailValid = validateEmail();
        const isAsuntoValid = validateAsunto();
        const isMensajeValid = validateMensaje();
        const isPrivacidadValid = validatePrivacidad();
        
        if (isNombreValid && isEmailValid && isAsuntoValid && isMensajeValid && isPrivacidadValid) {
            // Simular envío (aquí iría la lógica real de envío)
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;
            
            // Simular retraso de red
            setTimeout(() => {
                contactForm.reset();
                contactForm.classList.add('hidden');
                successMessage.classList.remove('hidden');
            }, 1500);
        }
    });
});