document.addEventListener("DOMContentLoaded", () => {
    const reportButtons = document.querySelectorAll(".report-button");
    const output = document.getElementById("output");
    const chartContainer = document.getElementById("chart-container");

    let chartInstance = null;

    reportButtons.forEach((btn) => {
        btn.addEventListener("click", async () => {
            const reportId = btn.dataset.report;
            try {
                const res = await fetch(`http://localhost:3000/reportes/${reportId}`);
                const data = await res.json();

                output.innerHTML = generateTable(data);
                generateChart(data, reportId);
            } catch (error) {
                console.error("Error al cargar el reporte:", error);
                output.innerHTML = "<p>Error al cargar el reporte.</p>";
                if (chartInstance) {
                    chartInstance.destroy();
                    chartInstance = null;
                }
            }
        });
    });

    function generateTable(data) {
        if (!data || typeof data !== "object") return "<p>No hay datos.</p>";

        const isArray = Array.isArray(data);

        if (isArray && data.length === 0) return "<p>No hay datos.</p>";

        let rows = isArray ? data : [data];

        const keys = Object.keys(rows[0]);
        let table = "<table><thead><tr>";
        keys.forEach((k) => (table += `<th>${k}</th>`));
        table += "</tr></thead><tbody>";

        rows.forEach((row) => {
            table += "<tr>";
            keys.forEach((k) => {
                const val = typeof row[k] === "object" ? JSON.stringify(row[k]) : row[k];
                table += `<td>${val}</td>`;
            });
            table += "</tr>";
        });

        table += "</tbody></table>";
        return table;
    }

    function generateChart(data, reportId) {
        if (chartInstance) chartInstance.destroy();

        if (!data || typeof data !== "object") return;

        const dataset = Array.isArray(data) ? data : [data];

        // Determinar claves automáticamente
        const keys = Object.keys(dataset[0]);

        // Validar que haya al menos 2 columnas
        if (keys.length < 2) return;

        const labelKey = keys[0];
        const valueKey = keys[1];

        const labels = dataset.map((d) => d[labelKey]);
        const values = dataset.map((d) => typeof d[valueKey] === "number" ? d[valueKey] : 0);

        const ctx = document.getElementById("chart").getContext("2d");

        chartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: valueKey,
                    data: values,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Reporte ${reportId}`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
});
