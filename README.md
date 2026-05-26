# ⏱️ TaxTime - Dashboard Pro

> **"Tu tiempo, tus reglas, tus honorarios."** > Una plataforma SaaS empresarial diseñada para profesionales independientes y freelancers para el control estricto de jornadas laborales, auditoría de honorarios, cálculo automatizado de retenciones fiscales y análisis predictivo de ingresos líquidos.

---

## 📄 Descripción General

**TaxTime** es una aplicación web progresiva y robusta que permite a los trabajadores independientes gestionar de punta a punta su tiempo facturable. A diferencia de las soluciones tradicionales de reloj control, TaxTime integra de forma nativa la legislación fiscal chilena correspondiente al año **2026** (aplicando de forma exacta la retención del **15.25%** en boletas de honorarios), junto con un potente motor de filtrado horaria automatizado que optimiza y audita las horas reales que se deben cobrar según los contratos corporativos vigentes.

La aplicación cuenta con una interfaz adaptativa (Mobile-First) moderna, un sistema de autenticación por Google segura, un centro de analítica visual interactiva y un panel oculto de nivel **Super Admin** con cifrado remoto en Firebase que activa un ecosistema en **Modo Oscuro Global**.

---

## ✨ Características Principales

### ⚡ 1. Ecosistema de Acceso Rápido (1-Clic)
* **Marcación en Tiempo Real:** Botones optimizados de Entrada y Salida que capturan la marca temporal del sistema al instante sin necesidad de formularios manuales redundantes.
* **Ingreso Manual Inteligente:** Módulo integrado para añadir retrospectivamente jornadas mediante un selector animado de diseño móvil, ideal para regularizar jornadas en terreno.

### 💼 2. Motor de Reglas de Negocio e Inflexión Horaria
El núcleo de la aplicación implementa de forma matemática restricciones estrictas para evitar cobros fuera de los límites corporativos acordados:
* **Límite Matutino:** Bloqueo automatizado de horas registradas antes de las **08:00 AM** (no computan ni se cobran).
* **Límite Vespertino (Lunes a Jueves):** Corte automático a las **17:30 PM**. Toda actividad posterior queda excluida del cálculo facturable.
* **Límite Vespertino (Viernes):** Restricción adelantada automáticamente a las **17:00 PM** para alinear con los cierres institucionales de fin de semana.
* **Descuento de Colación:** Deducción parametrizable en minutos (por defecto 60 minutos) sobre la jornada neta trabajada.

### 🔏 3. Panel "Super Admin" Oculto & Modo Oscuro Global
* **Activación Criptográfica:** El módulo administrativo se encuentra oculto a simple vista. Se activa mediante un disparador dinámico al hacer **5 clics consecutivos** sobre el logotipo del cronómetro.
* **Autenticación Remota:** Validación de credenciales de seguridad contra un documento restringido en la base de datos de Firebase.
* **Modo Oscuro Global:** Al ingresar como administrador, toda la interfaz muta dinámicamente mediante Tailwind CSS a un esquema oscuro profundo, indicando visualmente que se cuenta con permisos de escritura, edición histórica y eliminación de registros (botón de borrado directo integrado en el historial).

### 📊 4. Analítica Avanzada e Informes Estadísticos
* **Métricas en Tiempo Real:** Tarjetas dinámicas con KPIs de Bruto Mensual, Líquido Mensual (post-retención), acumulado de Horas Netas e indicador de Turnos en Curso activos.
* **Gráficos Conmutables:** Motor visual potenciado por Chart.js que permite segmentar el rendimiento financiero e histórico en dos vistas dinámicas:
    * *Por Mes:* Vista anual de barras con esquinas redondeadas (border-radius).
    * *Últimos 7 Días:* Desglose preciso del comportamiento diario para un control micro-financiero.

### 📥 5. Exportación de Plantillas Corporativas Estilizadas (Excel Pro)
* Integrando la librería avanzada `xlsx-js-style`, el botón de exportación genera de forma nativa un archivo binario `.xlsx` con:
    * Cabeceras corporativas rellenas en color Indigo brillante (`#4F46E5`) y tipografía blanca en negrita.
    * Alineación y centrado milimétrico de marcas temporales.
    * Anchos de columna autoadaptables para evitar errores visuales de desbordamiento de celdas (`###`).
    * Cálculo explícito desglosado de Netos, Brutos, Retenciones del 15.25% y Saldos Líquidos listos para auditorías contables.

---

## 🛠️ Stack Tecnológico

* **Frontend Core:** HTML5 Semántico, CSS3 Personalizado (Scrollbars fluidas y variables adaptables).
* **Diseño Gráfico y Estilos:** Tailwind CSS con soporte avanzado de modo nocturno nativo (`class: dark`).
* **Efectos e Iconografía:** FontAwesome v6.4.0 Pro (eliminación completa de emojis para garantizar seriedad empresarial).
* **Base de Datos NoSQL en Tiempo Real:** Firebase Firestore (mecanismo de snapshots reactivos `onSnapshot` para sincronización instantánea entre dispositivos).
* **Seguridad de Identidad:** Firebase Authentication integrado con Google Sign-In Provider.
* **Motor de Gráficos:** Chart.js v4 (Renderizado optimizado en elementos `<canvas>`).
* **Motor de Hojas de Cálculo:** `xlsx-js-style` v1.2.0 (SheetJS con capacidades extendidas de diseño en línea).
* **Interfaz de Tiempo:** `MDTimePicker` v2.0.3 (Selector de reloj analógico circular animado basado en Material Design).

---

## 📂 Estructura del Proyecto

```text
Calculadora/
├── .firebase/                 # Caché local de Firebase CLI
├── .firebaserc                # Vinculación del ID del proyecto en la nube
├── firebase.json              # Configuración de Hosting y reglas de redirección (SPA Rewrite)
├── .gitignore                 # Filtros de exclusión de seguridad (Protección de credenciales)
└── public/                    # Directorio público del servidor de Hosting
    ├── index.html             # Estructura maestra del DOM, modales y layouts
    ├── css/
    │   └── style.css          # Estilos finos, scrollbars y capas de z-index
    └── js/
        ├── firebase-config.js # Credenciales e inicialización de SDK de Firebase (Oculto en Git)
        ├── db.js              # Lógica de persistencia, escucha reactiva y límites horarios
        ├── ui.js              # Control de modales, estados oscuros, auth y flujos UI
        ├── charts.js          # Inicialización y destrucción dinámica de gráficos
        └── export.js          # Compilación y estilización del reporte Excel empresarial
