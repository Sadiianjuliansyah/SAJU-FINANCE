"use strict";


(() => {

    const yearFilter =
        document.getElementById("report-year-filter");


    const reportIncome =
        document.getElementById("report-total-income");

    const reportExpense =
        document.getElementById("report-total-expense");

    const reportBalance =
        document.getElementById("report-net-balance");

    const reportWealth =
        document.getElementById("report-latest-wealth");


    const topIncome =
        document.getElementById("report-top-income");

    const topExpense =
        document.getElementById("report-top-expense");


    const incomeChartCanvas =
        document.getElementById("report-income-chart");

    const expenseChartCanvas =
        document.getElementById("report-expense-chart");

    const balanceChartCanvas =
        document.getElementById("report-balance-chart");

    const comparisonChartCanvas =
        document.getElementById("report-comparison-chart");

    const wealthChartCanvas =
        document.getElementById("report-wealth-chart");

    const returnChartCanvas =
        document.getElementById("report-return-chart");

    const compositionChartCanvas =
        document.getElementById("report-composition-chart");


    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des"
    ];


    const charts = {
        income: null,
        expense: null,
        balance: null,
        comparison: null,
        wealth: null,
        return: null,
        composition: null
    };


    function formatRupiah(value) {

        return new Intl.NumberFormat(
            "id-ID",
            {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0
            }
        ).format(Number(value) || 0);

    }


    function destroyChart(name) {

        if (charts[name]) {

            charts[name].destroy();

            charts[name] = null;

        }

    }


    function populateYears(
        transactions,
        assets
    ) {

        const oldValue =
            Number(yearFilter.value);

        const currentYear =
            new Date().getFullYear();


        const years = [
            ...new Set([
                currentYear,

                ...transactions.map(
                    (transaction) =>
                        Number(transaction.year)
                ),

                ...assets.map(
                    (asset) =>
                        Number(asset.year)
                )
            ])
        ]
            .filter(Number.isFinite)
            .sort(
                (a, b) =>
                    b - a
            );


        yearFilter.innerHTML = "";


        years.forEach((year) => {

            const option =
                document.createElement("option");

            option.value =
                String(year);

            option.textContent =
                String(year);


            yearFilter.appendChild(
                option
            );

        });


        if (
            years.includes(oldValue)
        ) {

            yearFilter.value =
                String(oldValue);

        } else {

            yearFilter.value =
                String(currentYear);

        }

    }


    function getMonthlyTransactionData(
        transactions,
        year
    ) {

        const income =
            Array(12).fill(0);

        const expense =
            Array(12).fill(0);


        transactions
            .filter(
                (transaction) =>
                    Number(transaction.year) ===
                    year
            )
            .forEach(
                (transaction) => {

                    const monthIndex =
                        Number(
                            transaction.month
                        ) - 1;


                    if (
                        monthIndex < 0 ||
                        monthIndex > 11
                    ) {

                        return;

                    }


                    if (
                        transaction.type ===
                        "PEMASUKAN"
                    ) {

                        income[monthIndex] +=
                            Number(
                                transaction.amount
                            );

                    }


                    if (
                        transaction.type ===
                        "PENGELUARAN"
                    ) {

                        expense[monthIndex] +=
                            Number(
                                transaction.amount
                            );

                    }

                }
            );


        const balance =
            income.map(
                (value, index) =>
                    value -
                    expense[index]
            );


        return {
            income,
            expense,
            balance
        };

    }


    function updateTransactionSummary(
        monthlyData
    ) {

        const totalIncome =
            monthlyData.income.reduce(
                (total, value) =>
                    total + value,
                0
            );


        const totalExpense =
            monthlyData.expense.reduce(
                (total, value) =>
                    total + value,
                0
            );


        const balance =
            totalIncome -
            totalExpense;


        reportIncome.textContent =
            formatRupiah(
                totalIncome
            );


        reportExpense.textContent =
            formatRupiah(
                totalExpense
            );


        reportBalance.textContent =
            formatRupiah(
                balance
            );


        reportBalance.classList.toggle(
            "negative",
            balance < 0
        );

    }


    function commonMoneyChartOptions() {

        return {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {

                    callbacks: {

                        label(context) {

                            return formatRupiah(
                                context.raw
                            );

                        }

                    }

                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    ticks: {

                        callback(value) {

                            return new Intl.NumberFormat(
                                "id-ID",
                                {
                                    notation:
                                        "compact",

                                    maximumFractionDigits:
                                        1
                                }
                            ).format(value);

                        }

                    }

                }

            }

        };

    }


    function renderMonthlyCharts(
        data
    ) {

        destroyChart("income");
        destroyChart("expense");
        destroyChart("balance");
        destroyChart("comparison");


        charts.income =
            new Chart(
                incomeChartCanvas,
                {
                    type: "bar",

                    data: {

                        labels:
                            monthNames,

                        datasets: [
                            {
                                data:
                                    data.income,

                                backgroundColor:
                                    "rgba(34, 197, 94, 0.75)",

                                borderRadius: 5
                            }
                        ]

                    },

                    options:
                        commonMoneyChartOptions()
                }
            );


        charts.expense =
            new Chart(
                expenseChartCanvas,
                {
                    type: "bar",

                    data: {

                        labels:
                            monthNames,

                        datasets: [
                            {
                                data:
                                    data.expense,

                                backgroundColor:
                                    "rgba(225, 29, 72, 0.75)",

                                borderRadius: 5
                            }
                        ]

                    },

                    options:
                        commonMoneyChartOptions()
                }
            );


        charts.balance =
            new Chart(
                balanceChartCanvas,
                {
                    type: "line",

                    data: {

                        labels:
                            monthNames,

                        datasets: [
                            {
                                data:
                                    data.balance,

                                borderColor:
                                    "#0ea5e9",

                                backgroundColor:
                                    "rgba(14, 165, 233, 0.12)",

                                fill: true,

                                tension: 0.3,

                                pointRadius: 3
                            }
                        ]

                    },

                    options:
                        commonMoneyChartOptions()
                }
            );


        charts.comparison =
            new Chart(
                comparisonChartCanvas,
                {
                    type: "bar",

                    data: {

                        labels:
                            monthNames,

                        datasets: [
                            {
                                label:
                                    "Pemasukan",

                                data:
                                    data.income,

                                backgroundColor:
                                    "rgba(34, 197, 94, 0.75)",

                                borderRadius: 4
                            },

                            {
                                label:
                                    "Pengeluaran",

                                data:
                                    data.expense,

                                backgroundColor:
                                    "rgba(225, 29, 72, 0.75)",

                                borderRadius: 4
                            }
                        ]

                    },

                    options: {

                        ...commonMoneyChartOptions(),

                        plugins: {

                            legend: {
                                display: true,
                                position: "bottom"
                            },

                            tooltip: {

                                callbacks: {

                                    label(context) {

                                        return (
                                            `${context.dataset.label}: ` +
                                            formatRupiah(
                                                context.raw
                                            )
                                        );

                                    }

                                }

                            }

                        }

                    }

                }
            );

    }


    function groupTransactionsByDescription(
        transactions,
        year,
        type
    ) {

        const grouped = {};


        transactions
            .filter(
                (transaction) => {

                    return (
                        Number(
                            transaction.year
                        ) === year &&
                        transaction.type ===
                            type
                    );

                }
            )
            .forEach(
                (transaction) => {

                    const name =
                        transaction.description
                            .trim();


                    grouped[name] =
                        (
                            grouped[name] ||
                            0
                        ) +
                        Number(
                            transaction.amount
                        );

                }
            );


        return Object.entries(
            grouped
        )
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )
            .slice(
                0,
                5
            );

    }


    function renderRanking(
        container,
        items,
        type
    ) {

        container.innerHTML = "";


        if (
            items.length === 0
        ) {

            container.innerHTML =
                `
                    <div class="report-ranking-empty">
                        Belum ada data.
                    </div>
                `;

            return;

        }


        items.forEach(
            ([name, value], index) => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "report-ranking-item";


                item.innerHTML = `
                    <div class="report-rank">
                        ${index + 1}
                    </div>

                    <div class="report-ranking-info">

                        <span>
                            ${escapeHTML(name)}
                        </span>

                        <strong class="${type}">
                            ${formatRupiah(value)}
                        </strong>

                    </div>
                `;


                container.appendChild(
                    item
                );

            }
        );

    }


    function escapeHTML(value) {

        const element =
            document.createElement(
                "div"
            );

        element.textContent =
            value || "";

        return element.innerHTML;

    }


    function getAssetsForYear(
        assets,
        year
    ) {

        return assets.filter(
            (asset) =>
                Number(asset.year) ===
                year
        );

    }


    function groupAssetsByPeriod(
        assets
    ) {

        const periods = {};


        assets.forEach((asset) => {

            if (
                !periods[
                    asset.period
                ]
            ) {

                periods[
                    asset.period
                ] = {
                    value: 0,
                    capital: 0,
                    profit: 0
                };

            }


            periods[
                asset.period
            ].value +=
                Number(
                    asset.currentValue
                );


            periods[
                asset.period
            ].capital +=
                Number(
                    asset.totalCapital
                );


            periods[
                asset.period
            ].profit +=
                Number(
                    asset.profit
                );

        });


        return periods;

    }


    function formatAssetPeriod(
        period
    ) {

        const [, month] =
            period
                .split("-")
                .map(Number);


        return (
            monthNames[
                month - 1
            ] || period
        );

    }


    function renderAssetReports(
        assets
    ) {

        destroyChart("wealth");
        destroyChart("return");
        destroyChart("composition");


        const periods =
            groupAssetsByPeriod(
                assets
            );


        const periodKeys =
            Object.keys(
                periods
            ).sort();


        const wealthValues =
            periodKeys.map(
                (period) =>
                    periods[
                        period
                    ].value
            );


        const returnValues =
            periodKeys.map(
                (period) => {

                    const data =
                        periods[
                            period
                        ];


                    return (
                        data.capital > 0
                            ? (
                                data.profit /
                                data.capital
                            ) * 100
                            : 0
                    );

                }
            );


        charts.wealth =
            new Chart(
                wealthChartCanvas,
                {
                    type: "line",

                    data: {

                        labels:
                            periodKeys.map(
                                formatAssetPeriod
                            ),

                        datasets: [
                            {
                                data:
                                    wealthValues,

                                borderColor:
                                    "#2563eb",

                                backgroundColor:
                                    "rgba(37, 99, 235, 0.12)",

                                fill: true,

                                tension: 0.3,

                                pointRadius: 4
                            }
                        ]

                    },

                    options:
                        commonMoneyChartOptions()

                }
            );


        charts.return =
            new Chart(
                returnChartCanvas,
                {
                    type: "bar",

                    data: {

                        labels:
                            periodKeys.map(
                                formatAssetPeriod
                            ),

                        datasets: [
                            {
                                data:
                                    returnValues,

                                backgroundColor:
                                    "rgba(99, 102, 241, 0.75)",

                                borderRadius: 5
                            }
                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        plugins: {

                            legend: {
                                display: false
                            },

                            tooltip: {

                                callbacks: {

                                    label(context) {

                                        return (
                                            `${Number(
                                                context.raw
                                            ).toFixed(2)}%`
                                        );

                                    }

                                }

                            }

                        },

                        scales: {

                            y: {

                                ticks: {

                                    callback(value) {

                                        return (
                                            `${value}%`
                                        );

                                    }

                                }

                            }

                        }

                    }

                }
            );


        if (
            periodKeys.length === 0
        ) {

            reportWealth.textContent =
                "Rp0";


            charts.composition =
                new Chart(
                    compositionChartCanvas,
                    {
                        type: "doughnut",

                        data: {
                            labels: [],
                            datasets: [
                                {
                                    data: []
                                }
                            ]
                        }
                    }
                );

            return;

        }


        const latestPeriod =
            periodKeys[
                periodKeys.length - 1
            ];


        reportWealth.textContent =
            formatRupiah(
                periods[
                    latestPeriod
                ].value
            );


        const latestAssets =
            assets.filter(
                (asset) =>
                    asset.period ===
                    latestPeriod
            );


        const categoryValues = {};


        latestAssets.forEach(
            (asset) => {

                categoryValues[
                    asset.category
                ] =
                    (
                        categoryValues[
                            asset.category
                        ] || 0
                    ) +
                    Number(
                        asset.currentValue
                    );

            }
        );


        charts.composition =
            new Chart(
                compositionChartCanvas,
                {
                    type:
                        "doughnut",

                    data: {

                        labels:
                            Object.keys(
                                categoryValues
                            ),

                        datasets: [
                            {
                                data:
                                    Object.values(
                                        categoryValues
                                    ),

                                backgroundColor: [
                                    "#0ea5e9",
                                    "#22d3ee",
                                    "#2563eb",
                                    "#6366f1",
                                    "#06b6d4",
                                    "#8b5cf6",
                                    "#0891b2"
                                ],

                                borderWidth: 0
                            }
                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio:
                            false,

                        cutout:
                            "67%",

                        plugins: {

                            legend: {
                                position:
                                    "bottom"
                            },

                            tooltip: {

                                callbacks: {

                                    label(context) {

                                        return (
                                            `${context.label}: ` +
                                            formatRupiah(
                                                context.raw
                                            )
                                        );

                                    }

                                }

                            }

                        }

                    }

                }
            );

    }


    async function refreshReports() {

        try {

            const [
                transactions,
                assets
            ] =
                await Promise.all([
                    FinanceDB.getAllRecords(
                        "transactions"
                    ),

                    FinanceDB.getAllRecords(
                        "assets"
                    )
                ]);


            populateYears(
                transactions,
                assets
            );


            const year =
                Number(
                    yearFilter.value
                );


            const monthlyData =
                getMonthlyTransactionData(
                    transactions,
                    year
                );


            updateTransactionSummary(
                monthlyData
            );


            renderMonthlyCharts(
                monthlyData
            );


            const incomeRanking =
                groupTransactionsByDescription(
                    transactions,
                    year,
                    "PEMASUKAN"
                );


            const expenseRanking =
                groupTransactionsByDescription(
                    transactions,
                    year,
                    "PENGELUARAN"
                );


            renderRanking(
                topIncome,
                incomeRanking,
                "income"
            );


            renderRanking(
                topExpense,
                expenseRanking,
                "expense"
            );


            const assetsForYear =
                getAssetsForYear(
                    assets,
                    year
                );


            renderAssetReports(
                assetsForYear
            );

        } catch (error) {

            console.error(
                "Gagal memperbarui laporan:",
                error
            );

        }

    }


    yearFilter.addEventListener(
        "change",
        refreshReports
    );


    window.addEventListener(
        "finance-data-changed",
        refreshReports
    );


    window.addEventListener(
        "asset-data-changed",
        refreshReports
    );


    window.FinanceReports = {
        refresh:
            refreshReports
    };


    refreshReports();

})();