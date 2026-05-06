// charts.js - Lógica de Chart.js actualizada
let miGrafico = null;

function actualizarGrafico(turnos) {
    const filtro = document.getElementById('filtroGrafico').value;
    
    let etiquetas = [];
    let datos = [];

    if (filtro === 'mensual') {
        const ingresosPorMes = { 'Ene': 0, 'Feb': 0, 'Mar': 0, 'Abr': 0, 'May': 0, 'Jun': 0, 'Jul': 0, 'Ago': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dic': 0 };
        turnos.forEach(t => {
            if(!t.enCurso && t.liquido) {
                const mesStr = new Date(t.fechaIso).toLocaleString('es-CL', { month: 'short' });
                const mesCapitalizado = mesStr.charAt(0).toUpperCase() + mesStr.slice(1);
                if(ingresosPorMes[mesCapitalizado] !== undefined) ingresosPorMes[mesCapitalizado] += t.liquido;
            }
        });
        etiquetas = Object.keys(ingresosPorMes);
        datos = Object.values(ingresosPorMes);

    } else if (filtro === 'diario') {
        // Últimos 7 días
        const ingresosPorDia = {};
        const hoy = new Date();
        hoy.setHours(0,0,0,0);

        // Crear array con los últimos 7 días hacia atrás
        for (let i = 6; i >= 0; i--) {
            const d = new Date(hoy);
            d.setDate(d.getDate() - i);
            const clave = d.toLocaleDateString('es-CL', { weekday: 'short', day: '2-digit' }); // ej: "lun 04"
            ingresosPorDia[clave] = 0;
        }

        turnos.forEach(t => {
            if(!t.enCurso && t.liquido) {
                const fechaTurno = new Date(t.fechaIso);
                fechaTurno.setHours(0,0,0,0);
                
                // Si el turno está dentro de los últimos 7 días
                const diffTime = Math.abs(hoy - fechaTurno);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                if (diffDays <= 6 && diffDays >= 0) {
                    const clave = fechaTurno.toLocaleDateString('es-CL', { weekday: 'short', day: '2-digit' });
                    if(ingresosPorDia[clave] !== undefined) ingresosPorDia[clave] += t.liquido;
                }
            }
        });

        etiquetas = Object.keys(ingresosPorDia);
        datos = Object.values(ingresosPorDia);
    }

    const ctx = document.getElementById('graficoMeses').getContext('2d');
    if (miGrafico) miGrafico.destroy(); 

    miGrafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: etiquetas,
            datasets: [{
                label: 'Ingreso Líquido ($)',
                data: datos,
                backgroundColor: '#6366F1',
                borderRadius: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}