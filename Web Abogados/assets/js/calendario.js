document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el calendario
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'es',
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        buttonText: {
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
        },
        events: [
            // Eventos de ejemplo - en una aplicación real estos vendrían de una base de datos
            {
                id: '1',
                title: 'Cita con Juan Pérez',
                start: new Date(),
                extendedProps: {
                    type: 'cita',
                    client: 'Juan Pérez',
                    location: 'Oficina Principal',
                    description: 'Revisión de contrato de arrendamiento'
                }
            },
            {
                id: '2',
                title: 'Audiencia: Caso Smith',
                start: new Date(new Date().setDate(new Date().getDate() + 2)),
                extendedProps: {
                    type: 'audiencia',
                    client: 'María Smith',
                    location: 'Juzgado Civil N° 5',
                    description: 'Audiencia preliminar para caso de divorcio'
                }
            },
            {
                id: '3',
                title: 'Vencimiento: Documentos García',
                start: new Date(new Date().setDate(new Date().getDate() + 5)),
                allDay: true,
                extendedProps: {
                    type: 'vencimiento',
                    client: 'Familia García',
                    description: 'Plazo para presentar documentos de inmigración'
                }
            },
            {
                id: '4',
                title: 'Pago pendiente: Rodríguez',
                start: new Date(new Date().setDate(new Date().getDate() + 7)),
                extendedProps: {
                    type: 'pago',
                    client: 'Carlos Rodríguez',
                    description: 'Recordatorio de pago por servicios legales'
                }
            }
        ],
        eventClick: function(info) {
            openEventModal(info.event);
        },
        eventClassNames: function(arg) {
            // Añadir clase CSS basada en el tipo de evento
            return ['fc-event-' + arg.event.extendedProps.type];
        },
        eventContent: function(arg) {
            // Personalizar el contenido del evento
            let icon = '';
            switch(arg.event.extendedProps.type) {
                case 'cita':
                    icon = '<i class="fas fa-handshake"></i>';
                    break;
                case 'audiencia':
                    icon = '<i class="fas fa-gavel"></i>';
                    break;
                case 'vencimiento':
                    icon = '<i class="fas fa-clock"></i>';
                    break;
                case 'pago':
                    icon = '<i class="fas fa-dollar-sign"></i>';
                    break;
                case 'tarea':
                    icon = '<i class="fas fa-tasks"></i>';
                    break;
                case 'envio':
                    icon = '<i class="fas fa-paper-plane"></i>';
                    break;
                default:
                    icon = '<i class="fas fa-calendar-check"></i>';
            }
            
            return {
                html: `${icon} ${arg.event.title}`
            };
        }
    });

    calendar.render();

    // Elementos del DOM
    const eventModal = document.getElementById('event-modal');
    const eventFormModal = document.getElementById('event-form-modal');
    const closeModal = document.querySelector('.close-modal');
    const closeFormModal = document.querySelector('.close-form-modal');
    const newEventBtn = document.getElementById('new-event-btn');
    const cancelFormBtn = document.getElementById('cancel-form');
    const eventForm = document.getElementById('event-form');
    const dayViewBtn = document.getElementById('day-view');
    const weekViewBtn = document.getElementById('week-view');
    const monthViewBtn = document.getElementById('month-view');

    // Cambiar vista del calendario
    dayViewBtn.addEventListener('click', function() {
        calendar.changeView('timeGridDay');
        updateActiveViewButton('day');
    });

    weekViewBtn.addEventListener('click', function() {
        calendar.changeView('timeGridWeek');
        updateActiveViewButton('week');
    });

    monthViewBtn.addEventListener('click', function() {
        calendar.changeView('dayGridMonth');
        updateActiveViewButton('month');
    });

    function updateActiveViewButton(activeView) {
        [dayViewBtn, weekViewBtn, monthViewBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (activeView === 'day') dayViewBtn.classList.add('active');
        if (activeView === 'week') weekViewBtn.classList.add('active');
        if (activeView === 'month') monthViewBtn.classList.add('active');
    }

    // Abrir modal para nuevo evento
    newEventBtn.addEventListener('click', function() {
        document.getElementById('form-modal-title').textContent = 'Nuevo Evento';
        document.getElementById('event-id').value = '';
        document.getElementById('event-form').reset();
        eventFormModal.style.display = 'block';
    });

    // Cerrar modales
    closeModal.addEventListener('click', function() {
        eventModal.style.display = 'none';
    });

    closeFormModal.addEventListener('click', function() {
        eventFormModal.style.display = 'none';
    });

    cancelFormBtn.addEventListener('click', function() {
        eventFormModal.style.display = 'none';
    });

    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener('click', function(event) {
        if (event.target === eventModal) {
            eventModal.style.display = 'none';
        }
        if (event.target === eventFormModal) {
            eventFormModal.style.display = 'none';
        }
    });

    // Abrir modal de evento con detalles
    function openEventModal(event) {
        const props = event.extendedProps;
        
        document.getElementById('modal-title').textContent = event.title;
        document.getElementById('modal-type').textContent = getEventTypeName(props.type);
        document.getElementById('modal-date').textContent = event.start.toLocaleDateString('es-ES');
        document.getElementById('modal-time').textContent = event.start.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
        document.getElementById('modal-client').textContent = props.client || 'N/A';
        document.getElementById('modal-location').textContent = props.location || 'N/A';
        document.getElementById('modal-description').textContent = props.description || 'Sin descripción adicional';
        
        // Guardar el ID del evento en los botones de acción
        document.getElementById('edit-event').dataset.eventId = event.id;
        document.getElementById('delete-event').dataset.eventId = event.id;
        
        eventModal.style.display = 'block';
    }

    // Obtener nombre legible del tipo de evento
    function getEventTypeName(type) {
        const types = {
            'cita': 'Cita con Cliente',
            'audiencia': 'Audiencia/Juicio',
            'vencimiento': 'Vencimiento de Caso',
            'pago': 'Vencimiento de Pago',
            'tarea': 'Tarea Asignada',
            'envio': 'Envío Automático'
        };
        return types[type] || 'Evento';
    }

    // Manejar edición de evento
    document.getElementById('edit-event').addEventListener('click', function() {
        const eventId = this.dataset.eventId;
        const event = calendar.getEventById(eventId);
        
        if (event) {
            document.getElementById('form-modal-title').textContent = 'Editar Evento';
            document.getElementById('event-id').value = event.id;
            document.getElementById('event-title').value = event.title;
            document.getElementById('event-type').value = event.extendedProps.type;
            
            // Formatear fechas para el input datetime-local
            const startDate = event.start;
            const endDate = event.end || startDate;
            
            document.getElementById('event-start').value = formatDateTimeForInput(startDate);
            document.getElementById('event-end').value = event.end ? formatDateTimeForInput(endDate) : '';
            
            document.getElementById('event-client').value = event.extendedProps.client || '';
            document.getElementById('event-location').value = event.extendedProps.location || '';
            document.getElementById('event-description').value = event.extendedProps.description || '';
            
            eventModal.style.display = 'none';
            eventFormModal.style.display = 'block';
        }
    });

    // Formatear fecha para input datetime-local
    function formatDateTimeForInput(date) {
        if (!date) return '';
        
        const pad = num => num.toString().padStart(2, '0');
        
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    // Manejar eliminación de evento
    document.getElementById('delete-event').addEventListener('click', function() {
        const eventId = this.dataset.eventId;
        const event = calendar.getEventById(eventId);
        
        if (event && confirm('¿Estás seguro de que deseas eliminar este evento?')) {
            event.remove();
            eventModal.style.display = 'none';
        }
    });

    // Manejar envío del formulario (nuevo/editar evento)
    eventForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const eventId = document.getElementById('event-id').value;
        const title = document.getElementById('event-title').value;
        const type = document.getElementById('event-type').value;
        const start = document.getElementById('event-start').value;
        const end = document.getElementById('event-end').value;
        const client = document.getElementById('event-client').value;
        const location = document.getElementById('event-location').value;
        const description = document.getElementById('event-description').value;
        
        const eventData = {
            title: title,
            start: start,
            end: end || undefined,
            allDay: !end,
            extendedProps: {
                type: type,
                client: client,
                location: location,
                description: description
            }
        };
        
        if (eventId) {
            // Editar evento existente
            const event = calendar.getEventById(eventId);
            if (event) {
                event.setProp('title', title);
                event.setStart(start);
                event.setEnd(end || undefined);
                event.setAllDay(!end);
                event.setExtendedProp('type', type);
                event.setExtendedProp('client', client);
                event.setExtendedProp('location', location);
                event.setExtendedProp('description', description);
            }
        } else {
            // Crear nuevo evento
            eventData.id = 'event-' + Date.now();
            calendar.addEvent(eventData);
        }
        
        eventFormModal.style.display = 'none';
    });

    // Actualizar el calendario cuando cambia el tamaño de la ventana
    window.addEventListener('resize', function() {
        calendar.updateSize();
    });
});