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
                output.innerHTML = "<p>Error al cargar el reporte</p>";
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

        const keys = Object.keys(dataset[0]);
        const labels = dataset.map((d) => d[keys[0]]);
        const values = dataset.map((d) => typeof d[keys[1]] === "number" ? d[keys[1]] : 0);

        const ctx = document.getElementById("chart").getContext("2d");

        chartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: keys[1],
                    data: values,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

});
