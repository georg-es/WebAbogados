document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const contentSections = document.querySelectorAll('.content-section');
    const nodesContainer = document.getElementById('nodesContainer');
    const flowJsonOutput = document.getElementById('flowJsonOutput');
    const addNodeBtn = document.getElementById('addNodeBtn');
    const saveFlowBtn = document.getElementById('saveFlowBtn');
    const copyJsonBtn = document.getElementById('copyJsonBtn');

    let currentFlow = {
        "start": "saludo",
        "nodes": {
            "saludo": {
                "text": "Hola 👋 ¿En qué puedo ayudarte?",
                "options": [
                    { "label": "Quiero abrir un caso", "next": "abrir_caso" },
                    { "label": "Consultar estado", "next": "consultar_estado" }
                ]
            },
            "abrir_caso": {
                "text": "Perfecto. ¿Qué tipo de caso deseas abrir?",
                "options": [
                    { "label": "Divorcio", "next": "datos_cliente" },
                    { "label": "Laboral", "next": "datos_cliente" }
                ]
            },
            "consultar_estado": {
                "text": "Por favor, escribe tu número de caso para consultarlo.",
                "options": []
            },
            "datos_cliente": {
                "text": "Ingresa tus datos completos y pronto te contactaremos.",
                "options": []
            }
        }
    };

    // Función para mostrar la sección activa
    function showSection(sectionId) {
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        navLinks.forEach(link => {
            link.parentElement.classList.remove('active');
        });
        document.querySelector(`.nav-menu a[data-section="${sectionId}"]`).parentElement.classList.add('active');
    }

    // Navegación del sidebar
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = e.target.dataset.section;
            showSection(sectionId);
        });
    });

    // --- Funciones para la gestión de nodos ---

    // Renderizar un nodo individual
    function renderNode(nodeId, nodeData) {
        const nodeCard = document.createElement('div');
        nodeCard.className = 'node-card';
        nodeCard.dataset.nodeId = nodeId;

        nodeCard.innerHTML = `
            <h4>
                <span>Nodo: ${nodeId}</span>
                <div class="node-actions">
                    <button class="delete-node-btn" title="Eliminar Nodo">🗑️</button>
                </div>
            </h4>
            <label for="text-${nodeId}">Texto del Bot:</label>
            <textarea id="text-${nodeId}" data-field="text">${nodeData.text}</textarea>

            <p>Opciones:</p>
            <div class="options-container">
                ${nodeData.options.map((option, index) => `
                    <div class="option-item" data-option-index="${index}">
                        <label>Etiqueta:</label>
                        <input type="text" value="${option.label}" data-field="label">
                        <label>Siguiente Nodo (ID):</label>
                        <input type="text" value="${option.next}" data-field="next">
                        <button class="remove-option-btn">X</button>
                    </div>
                `).join('')}
            </div>
            <button class="add-option-btn">Agregar Opción</button>
        `;

        // Añadir listeners para cambios en el nodo
        nodeCard.querySelectorAll('textarea, input[type="text"]').forEach(input => {
            input.addEventListener('input', updateNodeData);
        });

        nodeCard.querySelector('.add-option-btn').addEventListener('click', (e) => addOptionToNode(e, nodeId));
        nodeCard.querySelectorAll('.remove-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => removeOptionFromNode(e, nodeId));
        });
        nodeCard.querySelector('.delete-node-btn').addEventListener('click', (e) => deleteNode(nodeId));

        return nodeCard;
    }

    // Renderizar todos los nodos
    function renderAllNodes() {
        nodesContainer.innerHTML = ''; // Limpiar el contenedor
        if (Object.keys(currentFlow.nodes).length === 0) {
            nodesContainer.innerHTML = '<p class="placeholder">No hay nodos en el flujo. Agrega uno para empezar.</p>';
            updateJsonOutput(); // Actualizar el JSON aunque esté vacío
            return;
        }

        // Asegurarse de que el nodo de inicio esté al principio
        if (currentFlow.nodes[currentFlow.start]) {
            nodesContainer.appendChild(renderNode(currentFlow.start, currentFlow.nodes[currentFlow.start]));
        }
        
        // Renderizar los demás nodos
        for (const nodeId in currentFlow.nodes) {
            if (nodeId !== currentFlow.start) {
                nodesContainer.appendChild(renderNode(nodeId, currentFlow.nodes[nodeId]));
            }
        }
        updateJsonOutput();
    }

    // Actualizar los datos de un nodo en el objeto `currentFlow`
    function updateNodeData(event) {
        const input = event.target;
        const nodeId = input.closest('.node-card').dataset.nodeId;
        const field = input.dataset.field;

        if (field === 'text') {
            currentFlow.nodes[nodeId].text = input.value;
        } else { // Es una opción
            const optionItem = input.closest('.option-item');
            const optionIndex = parseInt(optionItem.dataset.optionIndex);
            if (currentFlow.nodes[nodeId].options[optionIndex]) {
                currentFlow.nodes[nodeId].options[optionIndex][field] = input.value;
            }
        }
        updateJsonOutput();
    }

    // Visión de Usuario en Archivo Index

    // Agregar una opción a un nodo
    function addOptionToNode(event, nodeId) {
        const optionContainer = event.target.previousElementSibling; // El div de opciones
        const newOption = { label: "", next: "" };
        currentFlow.nodes[nodeId].options.push(newOption);
        const newIndex = currentFlow.nodes[nodeId].options.length - 1;

        const optionItem = document.createElement('div');
        optionItem.className = 'option-item';
        optionItem.dataset.optionIndex = newIndex;
        optionItem.innerHTML = `
            <label>Etiqueta:</label>
            <input type="text" value="" data-field="label" placeholder="Texto del botón">
            <label>Siguiente Nodo (ID):</label>
            <input type="text" value="" data-field="next" placeholder="ID del siguiente nodo">
            <button class="remove-option-btn">X</button>
        `;
        optionItem.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', updateNodeData);
        });
        optionItem.querySelector('.remove-option-btn').addEventListener('click', (e) => removeOptionFromNode(e, nodeId));
        optionContainer.appendChild(optionItem);
        updateJsonOutput();
    }

    // Eliminar una opción de un nodo
    function removeOptionFromNode(event, nodeId) {
        const optionItem = event.target.closest('.option-item');
        const optionIndex = parseInt(optionItem.dataset.optionIndex);
        
        currentFlow.nodes[nodeId].options.splice(optionIndex, 1);
        optionItem.remove();

        // Reindexar las opciones en el DOM para que coincidan con el array
        event.target.closest('.options-container').querySelectorAll('.option-item').forEach((item, idx) => {
            item.dataset.optionIndex = idx;
        });

        updateJsonOutput();
    }

    // Añadir un nuevo nodo
    addNodeBtn.addEventListener('click', () => {
        let newNodeId = prompt("Ingresa un ID único para el nuevo nodo (ej: 'pregunta_nueva'):");
        if (newNodeId && !currentFlow.nodes[newNodeId]) {
            currentFlow.nodes[newNodeId] = {
                text: "Nuevo texto de pregunta.",
                options: []
            };
            renderAllNodes(); // Volver a renderizar para incluir el nuevo nodo
        } else if (newNodeId) {
            alert("Ese ID de nodo ya existe. Por favor, elige uno diferente.");
        }
    });

    // Eliminar un nodo
    function deleteNode(nodeIdToDelete) {
        if (nodeIdToDelete === currentFlow.start) {
            alert("No puedes eliminar el nodo de inicio.");
            return;
        }
        if (confirm(`¿Estás seguro de que quieres eliminar el nodo "${nodeIdToDelete}"?`)) {
            delete currentFlow.nodes[nodeIdToDelete];
            // También deberías revisar las opciones de otros nodos que apunten a este nodo eliminado.
            // Por simplicidad, esto no se implementa aquí, pero es una mejora crucial.
            renderAllNodes();
        }
    }


    // Actualizar el área de texto del JSON
    function updateJsonOutput() {
        flowJsonOutput.value = JSON.stringify(currentFlow, null, 2);
    }

    // Botón para guardar (simulado)
    saveFlowBtn.addEventListener('click', () => {
        // En un entorno real, aquí enviarías el `currentFlow` a un servidor
        // para guardarlo en un archivo o base de datos.
        alert('Flujo guardado (simulado)! Revisa la consola para el JSON.');
        console.log(JSON.stringify(currentFlow, null, 2));
        // Podrías ofrecer descargar el JSON también:
        // const blob = new Blob([JSON.stringify(currentFlow, null, 2)], { type: 'application/json' });
        // const url = URL.createObjectURL(blob);
        // const a = document.createElement('a');
        // a.href = url;
        // a.download = 'flow.json';
        // document.body.appendChild(a);
        // a.click();
        // document.body.removeChild(a);
        // URL.revokeObjectURL(url);
    });

    // Botón para copiar el JSON
    copyJsonBtn.addEventListener('click', () => {
        flowJsonOutput.select();
        document.execCommand('copy');
        alert('JSON copiado al portapapeles.');
    });


    // Inicializar: mostrar la primera sección y cargar los nodos
    showSection('flow-manager');
    renderAllNodes();
});

//

document.addEventListener('DOMContentLoaded', () => {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const chatbotOptions = document.getElementById('chatbotOptions');
    const userInput = document.getElementById('userInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');

    let currentFlowData = {}; // Aquí se cargará el contenido de flow.json
    let currentNodeId = 'saludo'; // El ID del nodo actual en el que se encuentra el usuario

    // --- Funciones de Interfaz de Usuario del Chatbot ---

    // Abrir/Cerrar la ventana del chatbot
    chatbotToggle.addEventListener('click', () => {
        chatbotWindow.classList.toggle('hidden');
        if (!chatbotWindow.classList.contains('hidden')) {
            // Si se abre, y es la primera vez o se reinicia, mostrar el nodo de inicio
            if (chatbotMessages.children.length === 0 || currentNodeId === 'finalizar_agradecimiento') {
                resetChat();
                displayNode(currentFlowData.start);
            }
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight; // Scroll al final
        }
    });

    chatbotClose.addEventListener('click', () => {
        chatbotWindow.classList.add('hidden');
    });

    // Función para añadir un mensaje al chat
    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', `${sender}-message`);
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight; // Desplazar al final
    }

    // --- Lógica del Chatbot (Conexión con flow.json) ---

    // Cargar el archivo flow.json
    async function loadFlow() {
        try {
            const response = await fetch('flow.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            currentFlowData = await response.json();
            console.log('Flow cargado:', currentFlowData);
            displayNode(currentFlowData.start); // Iniciar la conversación
        } catch (error) {
            console.error('Error cargando el flujo del chatbot:', error);
            addMessage('bot', 'Lo siento, no pude cargar el flujo de conversación. Por favor, inténtalo más tarde.');
        }
    }

    // Mostrar un nodo (pregunta/opciones) en el chat
    function displayNode(nodeId) {
        currentNodeId = nodeId;
        const node = currentFlowData.nodes[nodeId];

        if (!node) {
            console.error(`Nodo no encontrado: ${nodeId}`);
            addMessage('bot', 'Ha ocurrido un error en la conversación. Por favor, reinicia o contacta con soporte.');
            // O podrías redirigir a un nodo de error predefinido
            return;
        }

        addMessage('bot', node.text);
        chatbotOptions.innerHTML = ''; // Limpiar opciones anteriores
        userInput.classList.add('hidden'); // Ocultar input por defecto
        sendMessageBtn.classList.add('hidden'); // Ocultar botón enviar por defecto

        if (node.options && node.options.length > 0) {
            // Mostrar botones de opción
            node.options.forEach(option => {
                const button = document.createElement('button');
                button.classList.add('option-button');
                button.textContent = option.label;
                button.addEventListener('click', () => handleOptionClick(option.next, option.label));
                chatbotOptions.appendChild(button);
            });
        } else if (node.inputType === 'text') {
            // Mostrar campo de texto para entrada libre
            userInput.classList.remove('hidden');
            sendMessageBtn.classList.remove('hidden');
            userInput.focus();
            userInput.value = ''; // Limpiar entrada anterior
        } else {
             // Si no hay opciones ni inputType, es un nodo final.
             // Aquí podrías añadir lógica para finalizar la conversación, guardar datos, etc.
             // Por ejemplo, esperar unos segundos y luego ocultar la ventana o mostrar un mensaje final.
             setTimeout(() => {
                 // Puedes enviar la info recolectada a un servidor aquí
                 addMessage('bot', '¡Gracias por interactuar! Si necesitas algo más, no dudes en abrir el chat de nuevo.');
                 // Puedes reiniciar el chat o simplemente dejarlo así.
                 // chatbotToggle.textContent = '👋'; // Cambiar icono a "Hola"
                 // resetChat(); // Descomenta para reiniciar completamente
             }, 1500);
        }
    }

    // Manejar clic en una opción
    function handleOptionClick(nextNodeId, label) {
        addMessage('user', label); // Muestra la opción que el usuario eligió
        // Aquí podrías guardar la elección del usuario si es necesario
        // Ejemplo: saveUserData('last_choice', label);
        displayNode(nextNodeId); // Avanzar al siguiente nodo
    }

    // Manejar el envío de texto del usuario
    sendMessageBtn.addEventListener('click', () => handleTextInput());
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleTextInput();
        }
    });

    function handleTextInput() {
        const message = userInput.value.trim();
        if (message) {
            addMessage('user', message);
            userInput.value = ''; // Limpiar campo de texto

            // Aquí es donde procesarías la entrada de texto libre.
            // Para este ejemplo simple, asumimos que cualquier texto lleva al nodo "finalizar_agradecimiento".
            // En un caso real, harías validaciones, guardarías los datos, o pasarías a un siguiente nodo basado en la lógica.
            
            // Ejemplo de guardar datos (simplificado):
            // saveUserData(currentNodeId, message); // Guarda el mensaje asociado al nodo actual

            // Después de procesar, avanzar al siguiente nodo.
            // Para un flujo complejo, aquí podrías tener lógica condicional
            // o llamar a una función que determine el 'next' nodo.
            // Por ahora, simplemente avanzamos al nodo de agradecimiento si no hay opciones.
            const node = currentFlowData.nodes[currentNodeId];
            if (node.inputType === 'text' && node.options.length === 0) {
                 // Esto es una simplificación. En un caso real, el next sería dinámico
                 // basado en el procesamiento de la entrada de texto.
                 // Por ejemplo: si es "numero_caso", validar y luego ir a "mostrar_info_caso"
                 displayNode("finalizar_agradecimiento"); // Ejemplo
            } else {
                 // Si el nodo tiene opciones DESPUÉS de un input de texto, las mostrará.
                 // Esto es para flujos donde el usuario escribe algo Y LUEGO elige una opción.
                 // Generalmente, si hay inputType, no hay options al mismo tiempo.
                 console.warn("Manejando un nodo de inputType 'text' sin opciones o next definido. Define el siguiente paso.");
                 displayNode("finalizar_agradecimiento"); // Fallback
            }
        }
    }

    // Reiniciar el chat a su estado inicial
    function resetChat() {
        chatbotMessages.innerHTML = '';
        chatbotOptions.innerHTML = '';
        userInput.classList.add('hidden');
        sendMessageBtn.classList.add('hidden');
        currentNodeId = 'saludo'; // Resetear al nodo de inicio
    }

    // Iniciar el chatbot cargando el flujo al cargar la página
    loadFlow();
});