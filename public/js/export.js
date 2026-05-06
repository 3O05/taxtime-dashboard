// export.js - Excel con Estilos
function exportarExcel() {
    if(turnosGlobales.length === 0) return alert("No hay datos para exportar.");

    const datosExcel = turnosGlobales.map(t => ({
        "Fecha": new Date(t.fechaIso).toLocaleDateString('es-CL'),
        "Actividad": t.tipo === 'informatica' ? 'Informática' : 'Uber',
        "Estado": t.enCurso ? 'En Curso' : 'Finalizado',
        "Entrada": t.entrada,
        "Salida": t.salida || 'N/A',
        "Colación (m)": t.colacion,
        "Valor Hora ($)": t.valorHora,
        "Hrs Trabajadas": t.horasNetas ? parseFloat(t.horasNetas.toFixed(2)) : 0,
        "Bruto ($)": Math.round(t.bruto || 0),
        "Retención ($)": t.tipo === 'informatica' ? Math.round((t.bruto || 0) * 0.1525) : 0,
        "Líquido ($)": Math.round(t.liquido || 0)
    }));

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const range = XLSX.utils.decode_range(ws['!ref']);

    // Estilos para la cabecera (Fila 1)
    for(let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_col(C) + "1";
        if(!ws[cellAddress]) continue;
        ws[cellAddress].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4F46E5" } }, // Color Indigo
            alignment: { horizontal: "center", vertical: "center" }
        };
    }

    // Ajustar el ancho de las columnas
    ws['!cols'] = [
        {wch: 12}, {wch: 15}, {wch: 12}, {wch: 10}, {wch: 10}, 
        {wch: 12}, {wch: 15}, {wch: 15}, {wch: 12}, {wch: 15}, {wch: 15}
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Honorarios");
    XLSX.writeFile(wb, `Reporte_TaxTime_${new Date().toLocaleDateString('es-CL')}.xlsx`);
}