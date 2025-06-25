document.addEventListener('DOMContentLoaded', function() {
    // Manejar el mostrar/ocultar contraseñas
    const showPasswordButtons = document.querySelectorAll('.show-password');
    showPasswordButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            
            if (input.type === 'password') {
                input.type = 'text';
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                input.type = 'password';
                this.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });

    // Manejar el botón de conectar con Google
    const connectGoogleBtn = document.getElementById('connect-google');
    if (connectGoogleBtn) {
        connectGoogleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Aquí iría la lógica para conectar con Google OAuth
            alert('Redirigiendo a Google para autenticación...');
            // En una implementación real, esto redirigiría al endpoint de OAuth de Google
        });
    }

    // Manejar el guardado de configuración
    const saveSettingsBtn = document.getElementById('save-settings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            // Recopilar todos los datos del formulario
            const settings = {
                emailService: {
                    enabled: document.getElementById('email-service-toggle').checked,
                    apiKey: document.getElementById('email-api-key').value,
                    sender: document.getElementById('email-sender').value
                },
                smsService: {
                    enabled: document.getElementById('sms-service-toggle').checked,
                    apiKey: document.getElementById('sms-api-key').value,
                    endpoint: document.getElementById('sms-endpoint').value
                },
                esignService: {
                    enabled: document.getElementById('esign-service-toggle').checked,
                    clientId: document.getElementById('esign-client-id').value,
                    clientSecret: document.getElementById('esign-secret').value,
                    redirectUri: document.getElementById('esign-redirect').value
                },
                calendarService: {
                    enabled: document.getElementById('calendar-service-toggle').checked,
                    clientId: document.getElementById('calendar-client-id').value
                }
            };

            // Aquí iría la llamada AJAX para guardar en el backend
            console.log('Configuración a guardar:', settings);
            
            // Simular envío al servidor
            setTimeout(() => {
                alert('Configuración guardada exitosamente');
            }, 500);
        });
    }

    // Manejar el testeo de conexiones
    const testConnectionsBtn = document.getElementById('test-connections');
    if (testConnectionsBtn) {
        testConnectionsBtn.addEventListener('click', function() {
            // Aquí iría la lógica para probar cada conexión activa
            alert('Probando conexiones con los servicios configurados...');
            
            // Simular prueba de conexiones
            setTimeout(() => {
                alert('Pruebas completadas:\n- Email: ✔️ Conectado\n- SMS: ❌ Error de conexión\n- Firmas: ✔️ Conectado');
            }, 1500);
        });
    }

    // Cargar configuración existente (simulado)
    function loadExistingSettings() {
        // En una implementación real, esto vendría de una llamada al backend
        const mockSettings = {
            emailService: {
                enabled: true,
                apiKey: 'sg.1234567890abcdef',
                sender: 'no-reply@bufete.com'
            },
            smsService: {
                enabled: false,
                apiKey: '',
                endpoint: ''
            },
            esignService: {
                enabled: true,
                clientId: 'a1b2c3d4e5',
                clientSecret: 'secret123456',
                redirectUri: 'https://bufete.com/api/esign/callback'
            },
            calendarService: {
                enabled: false,
                clientId: ''
            }
        };

        // Aplicar configuración a los campos del formulario
        document.getElementById('email-service-toggle').checked = mockSettings.emailService.enabled;
        document.getElementById('email-api-key').value = mockSettings.emailService.apiKey;
        document.getElementById('email-sender').value = mockSettings.emailService.sender;
        
        document.getElementById('sms-service-toggle').checked = mockSettings.smsService.enabled;
        document.getElementById('sms-api-key').value = mockSettings.smsService.apiKey;
        document.getElementById('sms-endpoint').value = mockSettings.smsService.endpoint;
        
        document.getElementById('esign-service-toggle').checked = mockSettings.esignService.enabled;
        document.getElementById('esign-client-id').value = mockSettings.esignService.clientId;
        document.getElementById('esign-secret').value = mockSettings.esignService.clientSecret;
        document.getElementById('esign-redirect').value = mockSettings.esignService.redirectUri;
        
        document.getElementById('calendar-service-toggle').checked = mockSettings.calendarService.enabled;
        document.getElementById('calendar-client-id').value = mockSettings.calendarService.clientId;
    }

    // Cargar configuración al iniciar
    loadExistingSettings();
});