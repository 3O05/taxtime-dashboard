// db.js - Operaciones y Lógica de Negocio
let turnosGlobales = [];
let unsubscribeDocs = null;

function aplicarLimitesHorarios(fechaIso, entrada, salida, colacionMin) {
    const fecha = new Date(fechaIso);
    const diaSemana = fecha.getDay();
    let [hE, mE] = entrada.split(':').map(Number);
    let [hS, mS] = salida.split(':').map(Number);
    let minEntrada = hE * 60 + mE;
    let minSalida = hS * 60 + mS;

    if (minEntrada < 8 * 60) minEntrada = 8 * 60;
    
    let limiteSalida = 24 * 60;
    if (diaSemana >= 1 && diaSemana <= 4) limiteSalida = 17 * 60 + 30;
    else if (diaSemana === 5) limiteSalida = 17 * 60;

    if (minSalida > limiteSalida) minSalida = limiteSalida;

    let minutosTrabajados = minSalida - minEntrada;
    if (minutosTrabajados < 0) minutosTrabajados = 0;

    let horasNetas = (minutosTrabajados / 60) - (colacionMin / 60);
    return Math.max(0, horasNetas);
}

async function guardarOActualizarTurno(datos) {
    if (!usuarioActual) return; // Protección extra
    const idEdicion = document.getElementById('editandoId').value;
    
    let horasNetas = 0, bruto = 0, liquido = 0, enCurso = true;
    let fechaTurnoIso = datos.fecha ? new Date(datos.fecha + "T12:00:00").toISOString() : new Date().toISOString();

    if (datos.salida) {
        enCurso = false;
        horasNetas = aplicarLimitesHorarios(fechaTurnoIso, datos.entrada, datos.salida, datos.colacion);
        bruto = horasNetas * datos.valor;
        let retencion = (datos.tipo === 'informatica') ? bruto * 0.1525 : 0;
        liquido = bruto - retencion;
    }

    const payload = {
        uid: usuarioActual.uid, // AHORA USA TU ID REAL DE GOOGLE
        tipo: datos.tipo,
        entrada: datos.entrada,
        salida: datos.salida || "",
        colacion: datos.colacion,
        valorHora: datos.valor,
        horasNetas, bruto, liquido, enCurso,
        fechaIso: fechaTurnoIso
    };

    try {
        if (idEdicion) {
            await db.collection('turnos').doc(idEdicion).update(payload);
            cancelarEdicion();
        } else {
            payload.timestamp = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('turnos').add(payload);
        }
    } catch (error) { console.error("Error en DB:", error); }
}

function inicializarEscuchaDB() {
    if (!usuarioActual) return;
    if (unsubscribeDocs) unsubscribeDocs();

    // Filtramos para que solo descargue TUS turnos
    unsubscribeDocs = db.collection('turnos')
        .where('uid', '==', usuarioActual.uid)
        .onSnapshot(snapshot => {
            let turnosLocales = [];
            snapshot.forEach(doc => turnosLocales.push({ id: doc.id, ...doc.data() }));
            
            // Ordenamos por fecha internamente para evitar errores de índices en Firebase
            turnosLocales.sort((a, b) => new Date(b.fechaIso) - new Date(a.fechaIso));
            turnosGlobales = turnosLocales;

            renderizarTabla(turnosGlobales);
            actualizarGrafico(turnosGlobales);
        });
}

async function eliminarTurnoDB(id) {
    try { await db.collection('turnos').doc(id).delete(); } 
    catch (error) { console.error("Error al eliminar:", error); }
}