// Variable para detener la escucha de datos si fuera necesario
let unsubscribeDocs = null;

// Iniciar la app directamente sin pedir login
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
});

// --- UTILIDAD: PONER HORA ACTUAL ---
function setHoraActual(inputId) {
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    document.getElementById(inputId).value = `${horas}:${minutos}`;
}

// --- GUARDAR FORMULARIO ---
document.getElementById('registroForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const tipo = document.getElementById('tipo').value;
    const entrada = document.getElementById('entrada').value;
    const salida = document.getElementById('salida').value;
    const colacion = parseInt(document.getElementById('colacion').value) || 0;
    const valor = parseFloat(document.getElementById('valor').value) || 0;

    const [hE, mE] = entrada.split(':').map(Number);
    const [hS, mS] = salida.split(':').map(Number);
    let dE = new Date(2026, 4, 6, hE, mE);
    let dS = new Date(2026, 4, 6, hS, mS);
    if (dS < dE) dS.setDate(dS.getDate() + 1);

    let horasBrutas = (dS - dE) / (1000 * 60 * 60);
    let horasNetas = horasBrutas - (colacion / 60);
    
    if (horasNetas <= 0) return alert("Error: Revisa las horas y la colación.");

    let bruto = horasNetas * valor;
    let retencion = (tipo === 'informatica') ? bruto * 0.1525 : 0;
    let liquido = bruto - retencion;

    const nuevoTurno = {
        uid: "local_dev", // <--- USUARIO DE PRUEBA LOCAL
        tipo, entrada, salida, colacion, horasNetas, bruto, liquido,
        fechaIso: new Date().toISOString(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('turnos').add(nuevoTurno);
        document.getElementById('registroForm').reset();
    } catch (error) {
        console.error("Error:", error);
    }
});

// --- LEER DATOS ---
function cargarDatos() {
    unsubscribeDocs = db.collection('turnos')
        .orderBy('fechaIso', 'desc') // Ordenamos por fecha directamente
        .onSnapshot(snapshot => {
            const tabla = document.getElementById('tablaRegistros');
            tabla.innerHTML = '';

            let totalBruto = 0, totalLiquido = 0, totalHoras = 0, sumMinsSalida = 0, count = 0;

            snapshot.forEach(doc => {
                const d = doc.data();
                
                // Calculos para estadisticas
                totalBruto += d.bruto;
                totalLiquido += d.liquido;
                totalHoras += d.horasNetas;
                
                const [h, m] = d.salida.split(':').map(Number);
                sumMinsSalida += (h * 60) + m;
                count++;

                const fecha = new Date(d.fechaIso).toLocaleDateString('es-CL', {day: '2-digit', month: 'short'});
                
                const esBoleta = d.tipo === 'informatica';
                const badge = esBoleta 
                    ? `<span class="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold"><i class="fa-solid fa-file-invoice mr-1"></i>Boleta</span>`
                    : `<span class="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold"><i class="fa-solid fa-car mr-1"></i>Efectivo</span>`;

                const horasEnteras = Math.floor(d.horasNetas);
                const minutosRestantes = Math.round((d.horasNetas - horasEnteras) * 60);
                const textoHoras = `${horasEnteras}h ${minutosRestantes}m`;

                tabla.innerHTML += `
                    <tr class="hover:bg-slate-50 transition group">
                        <td class="px-6 py-4">
                            <div class="font-bold text-slate-800">${fecha}</div>
                            <div class="mt-1">${badge}</div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm font-medium text-slate-600">${d.entrada} - ${d.salida}</div>
                            <div class="text-xs text-slate-400">(-${d.colacion}m colación)</div>
                        </td>
                        <td class="px-6 py-4 font-bold text-slate-700">${textoHoras}</td>
                        <td class="px-6 py-4 text-right">
                            <div class="font-black text-emerald-600">$${Math.round(d.liquido).toLocaleString('es-CL')}</div>
                            ${esBoleta ? `<div class="text-[10px] text-slate-400">Bruto: $${Math.round(d.bruto).toLocaleString('es-CL')}</div>` : ''}
                        </td>
                    </tr>
                `;
            });

            // Actualizar Cards
            document.getElementById('statBruto').innerText = `$${Math.round(totalBruto).toLocaleString('es-CL')}`;
            document.getElementById('statLiquido').innerText = `$${Math.round(totalLiquido).toLocaleString('es-CL')}`;
            
            const totalH = Math.floor(totalHoras);
            const totalM = Math.round((totalHoras - totalH) * 60);
            document.getElementById('statHoras').innerText = `${totalH}h ${totalM}m`;
            
            if(count > 0) {
                let promMin = sumMinsSalida / count;
                let hProm = Math.floor(promMin / 60);
                let mProm = Math.round(promMin % 60);
                document.getElementById('statPromSalida').innerText = `${hProm.toString().padStart(2,'0')}:${mProm.toString().padStart(2,'0')}`;
            } else {
                document.getElementById('statPromSalida').innerText = `--:--`;
            }
        });
}