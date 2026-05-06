// ui.js - Interfaz, Super Admin y Sistema de Modales
let isSuperAdmin = false;
let clickLogoCount = 0;
let usuarioActual = null;

// --- SISTEMA DE AUTENTICACIÓN GOOGLE ---
auth.onAuthStateChanged(user => {
    if (user) {
        usuarioActual = user;
        document.getElementById('loginScreen').classList.add('hidden');
        
        // Colocar nombre y letra en el menú
        const nombre = user.displayName ? user.displayName.split(' ')[0] : 'Usuario';
        document.getElementById('userRoleText').innerText = nombre;
        document.getElementById('userAvatar').innerText = nombre.charAt(0).toUpperCase();
        
        // Iniciar base de datos
        inicializarEscuchaDB();
    } else {
        usuarioActual = null;
        document.getElementById('loginScreen').classList.remove('hidden');
        if(unsubscribeDocs) unsubscribeDocs(); // Dejar de escuchar si cierra sesión
        if(isSuperAdmin) triggerAdmin(); // Apagar admin si cierra sesión
    }
});

function loginConGoogle() {
    auth.signInWithPopup(provider).catch(error => {
        CustomModal.show({title: "Error", text: error.message, type: "alert", icon: "fa-triangle-exclamation", iconColor: "text-red-600 bg-red-50"});
    });
}

function cerrarSesion() {
    auth.signOut();
}

// --- MAGIA: RELOJ 100% A PRUEBA DE FALLOS ---
function abrirReloj(input) {
    // Si la caja de texto no tiene el reloj pegado aún, se lo instalamos
    if (!input.dataset.clockReady) {
        // Detecta si estamos en modo oscuro (Super Admin)
        const isDark = document.documentElement.classList.contains('dark');
        
        mdtimepicker(input, {
            is24hour: true,
            format: 'hh:mm',
            theme: isDark ? 'dark' : 'indigo',
            clearBtn: true
        });
        
        // Lo marcamos para no volver a instalarlo dos veces
        input.dataset.clockReady = "true";
        
        // Le damos 50 milisegundos al navegador para procesarlo y lo abrimos
        setTimeout(() => {
            mdtimepicker(input, 'show');
        }, 50);
    } else {
        // Si el reloj ya estaba instalado de antes, solo lo abre
        mdtimepicker(input, 'show');
    }
}

// Limpia los relojes al apagar o encender el Admin para que cambien de color
function resetearRelojes() {
    document.querySelectorAll('[data-clock-ready="true"]').forEach(input => {
        try { mdtimepicker(input, 'destroy'); } catch(e){}
        delete input.dataset.clockReady;
    });
}

// --- SISTEMA DE MODALES PROFESIONALES ---
const CustomModal = {
    _resolver: null,
    show: function({ title, text, icon = 'fa-circle-info', iconColor = 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/50', type = 'alert', inputType = 'text' }) {
        return new Promise((resolve) => {
            this._resolver = resolve;
            const modal = document.getElementById('customModal');
            const contentBox = document.getElementById('modalContentBox');
            
            document.getElementById('modalTitle').innerText = title;
            document.getElementById('modalMessage').innerText = text;
            document.getElementById('modalIcon').className = `w-12 h-12 rounded-full flex items-center justify-center text-xl mb-4 ${iconColor}`;
            document.getElementById('modalIcon').innerHTML = `<i class="fa-solid ${icon}"></i>`;
            
            const inputSingle = document.getElementById('modalInput');
            const doubleInput = document.getElementById('modalDoubleInput');
            inputSingle.classList.add('hidden');
            doubleInput.classList.add('hidden');
            inputSingle.value = '';
            document.getElementById('modalTimeIn').value = '';
            document.getElementById('modalTimeOut').value = '';

            const btnCancel = document.getElementById('modalBtnCancel');
            const btnConfirm = document.getElementById('modalBtnConfirm');

            if (type === 'alert') {
                btnCancel.classList.add('hidden');
                btnConfirm.className = "px-6 py-2 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-lg transition shadow-md";
            } else if (type === 'confirm') {
                btnCancel.classList.remove('hidden');
                btnConfirm.className = "px-6 py-2 bg-red-600 text-white font-bold hover:bg-red-700 rounded-lg transition shadow-md";
            } else if (type === 'prompt') {
                btnCancel.classList.remove('hidden');
                btnConfirm.className = "px-6 py-2 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-lg transition shadow-md";
                inputSingle.type = inputType;
                inputSingle.classList.remove('hidden');
                setTimeout(() => inputSingle.focus(), 100);
            } else if (type === 'manualTime') {
                btnCancel.classList.remove('hidden');
                btnConfirm.className = "px-6 py-2 bg-emerald-600 text-white font-bold hover:bg-emerald-700 rounded-lg transition shadow-md";
                doubleInput.classList.remove('hidden'); // Mostramos los inputs
            }

            modal.classList.remove('hidden');
            setTimeout(() => { modal.classList.remove('opacity-0'); contentBox.classList.remove('scale-95'); }, 10);

            btnConfirm.onclick = () => {
                this.close();
                if (type === 'prompt') resolve(inputSingle.value);
                else if (type === 'manualTime') resolve({ in: document.getElementById('modalTimeIn').value, out: document.getElementById('modalTimeOut').value });
                else resolve(true);
            };
            btnCancel.onclick = () => { this.close(); resolve(false); };
        });
    },
    close: function() {
        const modal = document.getElementById('customModal');
        const contentBox = document.getElementById('modalContentBox');
        modal.classList.add('opacity-0');
        contentBox.classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const valorGuardado = localStorage.getItem('valorHoraRecordado') || 10000;
    document.getElementById('headerValorHora').innerText = parseFloat(valorGuardado).toLocaleString('es-CL');
    document.getElementById('valor').value = valorGuardado;
    document.getElementById('fechaManual').valueAsDate = new Date();
    
    inicializarEscuchaDB();
});

// --- EDITAR VALOR GLOBAL ---
async function editarValorGlobal() {
    const actual = localStorage.getItem('valorHoraRecordado') || "10000";
    const nuevoValor = await CustomModal.show({
        title: "Editar Valor por Hora",
        text: "Ingresa el nuevo valor que se cobrará por cada hora neta:",
        type: "prompt", inputType: "number", icon: "fa-coins"
    });

    if(nuevoValor && !isNaN(nuevoValor)) {
        localStorage.setItem('valorHoraRecordado', nuevoValor);
        document.getElementById('headerValorHora').innerText = parseFloat(nuevoValor).toLocaleString('es-CL');
        document.getElementById('valor').value = nuevoValor;
        CustomModal.show({title: "Actualizado", text: "El valor por hora se ha guardado.", icon: "fa-check", iconColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/50"});
    }
}

// --- SUPER ADMIN (TOGGLE) ---
async function triggerAdmin() {
    clickLogoCount++;
    if(clickLogoCount === 5) {
        clickLogoCount = 0;
        
        if (isSuperAdmin) {
            isSuperAdmin = false;
            document.documentElement.classList.remove('dark'); 
            resetearRelojes(); 
            document.getElementById('panelAdmin').classList.add('hidden');
            document.getElementById('contenedorTabla').classList.replace('xl:col-span-2', 'xl:col-span-3');
            document.getElementById('userRoleText').innerText = "Modo Local";
            document.getElementById('userRoleText').classList.replace('text-indigo-400', 'text-slate-800');
            document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
            cancelarEdicion();
            return;
        }

        const adminRef = db.collection('config').doc('admin');
        const doc = await adminRef.get();
        
        if (!doc.exists) {
            const nuevaClave = await CustomModal.show({ title: "Configuración Inicial", text: "Crea una contraseña para el Super Admin:", type: "prompt", inputType: "password", icon: "fa-key", iconColor: "text-orange-600 bg-orange-50" });
            if(nuevaClave) { await adminRef.set({ clave: nuevaClave }); CustomModal.show({title: "Éxito", text: "Contraseña guardada. Inicia sesión de nuevo.", icon: "fa-check"}); }
            return;
        }

        const inputClave = await CustomModal.show({ title: "Acceso Restringido", text: "Ingrese contraseña de Super Admin:", type: "prompt", inputType: "password", icon: "fa-lock", iconColor: "text-slate-800 bg-slate-200" });

        if (inputClave === doc.data().clave) {
            isSuperAdmin = true;
            document.documentElement.classList.add('dark'); 
            resetearRelojes(); 
            
            document.getElementById('panelAdmin').classList.remove('hidden');
            document.getElementById('contenedorTabla').classList.replace('xl:col-span-3', 'xl:col-span-2');
            document.getElementById('userRoleText').innerText = "Super Admin";
            document.getElementById('userRoleText').classList.replace('text-slate-800', 'text-indigo-400');
            document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
            
            CustomModal.show({title: "Acceso Concedido", text: "Modo Super Admin Activado.", icon: "fa-shield-halved", iconColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/50"});
        } else if (inputClave) {
            CustomModal.show({title: "Error", text: "Contraseña incorrecta.", icon: "fa-circle-xmark", iconColor: "text-red-600 bg-red-50 dark:bg-red-900/50"});
        }
    }
}

// --- BOTONES RÁPIDOS 1-CLIC ---
async function marcarEntradaRapida() {
    const valorGuardado = localStorage.getItem('valorHoraRecordado');
    if(!valorGuardado || valorGuardado == 0) return editarValorGlobal();
    
    const ahora = new Date();
    const horaStr = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    await guardarOActualizarTurno({ tipo: 'informatica', entrada: horaStr, salida: "", colacion: 60, valor: parseFloat(valorGuardado) });
    CustomModal.show({title: "Turno Iniciado", text: `Entrada registrada a las ${horaStr}`, icon: "fa-play", iconColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/50"});
}

async function marcarSalidaRapida() {
    const turnoActivo = turnosGlobales.find(t => t.enCurso);
    if(!turnoActivo) return CustomModal.show({title: "Aviso", text: "No tienes ningún turno en curso.", icon: "fa-stop", iconColor: "text-red-600 bg-red-50 dark:bg-red-900/50"});

    const ahora = new Date();
    const horaStr = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    
    document.getElementById('editandoId').value = turnoActivo.id;
    await guardarOActualizarTurno({ fecha: turnoActivo.fechaIso.split('T')[0], tipo: turnoActivo.tipo, entrada: turnoActivo.entrada, salida: horaStr, colacion: turnoActivo.colacion, valor: turnoActivo.valorHora });
    CustomModal.show({title: "Turno Finalizado", text: `Salida registrada a las ${horaStr}.`, icon: "fa-flag-checkered", iconColor: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/50"});
}

async function abrirIngresoManualRapido() {
    const valorGuardado = localStorage.getItem('valorHoraRecordado');
    if(!valorGuardado || valorGuardado == 0) return editarValorGlobal();

    const tiempos = await CustomModal.show({ title: "Ingreso Manual (Hoy)", text: "Ingresa tu horario de trabajo:", type: "manualTime", icon: "fa-keyboard" });

    if(tiempos && tiempos.in && tiempos.out) {
        await guardarOActualizarTurno({ tipo: 'informatica', entrada: tiempos.in, salida: tiempos.out, colacion: 60, valor: parseFloat(valorGuardado) });
        CustomModal.show({title: "Guardado", text: "Turno manual registrado correctamente.", icon: "fa-check", iconColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/50"});
    }
}

// --- ELIMINAR TURNO ---
async function eliminarTurno(id) {
    const confirmar = await CustomModal.show({ title: "Eliminar Registro", text: "¿Estás seguro de que deseas eliminar este turno? Esta acción no se puede deshacer.", type: "confirm", icon: "fa-trash", iconColor: "text-red-600 bg-red-50 dark:bg-red-900/50" });
    if(confirmar) {
        await eliminarTurnoDB(id);
        cancelarEdicion();
    }
}

// --- NAVEGACIÓN Y RENDERIZADO ---
function cambiarVista(vista) {
    document.getElementById('vista-dashboard').classList.add('hidden');
    document.getElementById('vista-informes').classList.add('hidden');
    document.querySelectorAll('.menu-btn').forEach(btn => btn.className = "menu-btn w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl font-semibold transition text-left");
    document.getElementById(`vista-${vista}`).classList.remove('hidden');
    document.getElementById(`btn-${vista}`).className = "menu-btn w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold transition text-left";
    document.getElementById('titulo-vista').innerText = vista === 'dashboard' ? 'Resumen de Actividad' : 'Informes y Estadísticas';
}

document.getElementById('registroForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = {
        fecha: document.getElementById('fechaManual').value,
        tipo: document.getElementById('tipo').value,
        entrada: document.getElementById('entrada').value,
        salida: document.getElementById('salida').value,
        colacion: parseInt(document.getElementById('colacion').value) || 0,
        valor: parseFloat(document.getElementById('valor').value) || 0
    };
    localStorage.setItem('valorHoraRecordado', datos.valor);
    document.getElementById('headerValorHora').innerText = parseFloat(datos.valor).toLocaleString('es-CL');
    guardarOActualizarTurno(datos);
});

function renderizarTabla(turnos) {
    const tabla = document.getElementById('tablaRegistros');
    tabla.innerHTML = '';
    let totB = 0, totL = 0, totH = 0, activos = 0;

    turnos.forEach(d => {
        totB += d.bruto || 0; totL += d.liquido || 0; totH += d.horasNetas || 0;
        if(d.enCurso) activos++;

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-50 dark:border-slate-700 transition-colors duration-200";
        let icon = d.tipo === 'informatica' ? '<i class="fa-solid fa-laptop-code mr-1"></i> Boleta' : '<i class="fa-solid fa-car mr-1"></i> Efectivo';
        
        tr.innerHTML = `
            <td class="p-3"><div class="font-bold text-slate-800 dark:text-white">${new Date(d.fechaIso).toLocaleDateString('es-CL')}</div><div class="text-[10px] text-slate-400 dark:text-slate-500 mt-1">${icon}</div></td>
            <td class="p-3 text-sm text-slate-600 dark:text-slate-300">${d.enCurso ? `<span class="text-orange-500 font-bold">${d.entrada} - En Curso</span>` : `${d.entrada} a ${d.salida}`}</td>
            <td class="p-3 font-bold text-slate-700 dark:text-slate-200">${d.enCurso ? `-` : `${d.horasNetas.toFixed(1)}h`}</td>
            <td class="p-3 font-black text-emerald-600 dark:text-emerald-400">${d.enCurso ? `-` : `$${Math.round(d.liquido).toLocaleString('es-CL')}`}</td>
            <td class="p-3 text-center admin-only ${isSuperAdmin ? '' : 'hidden'} flex justify-center gap-2">
                <button onclick='editarTurno(${JSON.stringify(d)})' class="text-indigo-400 dark:text-indigo-300 hover:text-indigo-600 dark:hover:text-white p-2 rounded bg-indigo-50 dark:bg-indigo-900/50 transition" title="Editar"><i class="fa-solid fa-pen"></i></button>
                <button onclick="eliminarTurno('${d.id}')" class="text-red-400 dark:text-red-300 hover:text-red-600 dark:hover:text-white p-2 rounded bg-red-50 dark:bg-red-900/50 transition" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tabla.appendChild(tr);
    });

    document.getElementById('statBruto').innerText = `$${Math.round(totB).toLocaleString('es-CL')}`;
    document.getElementById('statLiquido').innerText = `$${Math.round(totL).toLocaleString('es-CL')}`;
    document.getElementById('statHoras').innerText = `${totH.toFixed(1)}h`;
    document.getElementById('statActivos').innerText = activos;
}

function editarTurno(d) {
    document.getElementById('editandoId').value = d.id;
    document.getElementById('fechaManual').value = d.fechaIso.split('T')[0];
    document.getElementById('tipo').value = d.tipo;
    document.getElementById('entrada').value = d.entrada;
    document.getElementById('salida').value = d.salida;
    document.getElementById('colacion').value = d.colacion;
    document.getElementById('valor').value = d.valorHora;

    document.getElementById('formTitulo').innerHTML = "<i class='fa-solid fa-pen'></i> Editando Turno";
    document.getElementById('btnGuardar').innerText = "Actualizar";
    document.getElementById('btnGuardar').classList.replace('bg-indigo-500', 'bg-orange-500');
    document.getElementById('btnCancelarEdit').classList.remove('hidden');
}

function cancelarEdicion() {
    document.getElementById('registroForm').reset();
    document.getElementById('editandoId').value = "";
    document.getElementById('formTitulo').innerHTML = "<i class='fa-solid fa-user-shield'></i> Super Admin";
    document.getElementById('btnGuardar').innerText = "Guardar Registro";
    document.getElementById('btnGuardar').classList.replace('bg-orange-500', 'bg-indigo-500');
    document.getElementById('btnCancelarEdit').classList.add('hidden');
    document.getElementById('fechaManual').valueAsDate = new Date();
    const valorGuardado = localStorage.getItem('valorHoraRecordado');
    if(valorGuardado) document.getElementById('valor').value = valorGuardado;
}