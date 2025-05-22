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
        if (!data.length) return "<p>No hay datos.</p>";

        const headers = Object.keys(data[0]);
        let table = "<table><thead><tr>";
        headers.forEach((h) => (table += `<th>${h}</th>`));
        table += "</tr></thead><tbody>";
        data.forEach((row) => {
            table += "<tr>";
            headers.forEach((h) => (table += `<td>${row[h]}</td>`));
            table += "</tr>";
        });
        table += "</tbody></table>";
        return table;
    }

    function generateChart(data, reportId) {
        if (chartInstance) chartInstance.destroy();

        if (!data.length) return;

        const ctx = document.getElementById("chart").getContext("2d");
        const keys = Object.keys(data[0]);
        const labels = data.map((d) => d[keys[0]]);
        const values = data.map((d) => typeof d[keys[1]] === 'number' ? d[keys[1]] : 0);

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
