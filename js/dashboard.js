"use strict";


const dashboardIncome =
    document.getElementById("dashboard-income");

const dashboardExpense =
    document.getElementById("dashboard-expense");

const dashboardBalance =
    document.getElementById("dashboard-balance");

const dashboardYearFilter =
    document.getElementById("dashboard-year-filter");

const dashboardMonthFilter =
    document.getElementById("dashboard-month-filter");

const dashboardPeriodText =
    document.getElementById("dashboard-period-text");


const incomeTrendCanvas =
    document.getElementById("income-trend-chart");

const accountChartCanvas =
    document.getElementById("account-chart");

const incomeChartEmpty =
    document.getElementById("income-chart-empty");

const accountChartEmpty =
    document.getElementById("account-chart-empty");

const topIncomeList =
    document.getElementById("top-income-list");

const topExpenseList =
    document.getElementById("top-expense-list");


const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
];


let incomeTrendChart = null;
let accountChart = null;


function dashboardFormatRupiah(value) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(value);

}


function populateDashboardYears(transactions) {

    const currentYear =
        new Date().getFullYear();

    const selectedYear =
        Number(dashboardYearFilter.value);


    const transactionYears =
        transactions
            .map((transaction) =>
                Number(transaction.year)
            )
            .filter((year) =>
                Number.isFinite(year)
            );


    const years = [
        ...new Set([
            currentYear,
            ...transactionYears
        ])
    ].sort((a, b) => b - a);


    dashboardYearFilter.innerHTML = "";


    years.forEach((year) => {

        const option =
            document.createElement("option");

        option.value = year;
        option.textContent = year;

        dashboardYearFilter.appendChild(
            option
        );

    });


    if (years.includes(selectedYear)) {

        dashboardYearFilter.value =
            selectedYear;

    } else {

        dashboardYearFilter.value =
            currentYear;

    }

}


function updateDashboardPeriodText() {

    const year =
        dashboardYearFilter.value;

    const month =
        dashboardMonthFilter.value;


    if (month === "all") {

        dashboardPeriodText.textContent =
            `Ringkasan keuangan tahun ${year}`;

        return;

    }


    dashboardPeriodText.textContent =
        `Ringkasan ${monthNames[Number(month) - 1]} ${year}`;

}


function filterDashboardTransactions(
    transactions
) {

    const selectedYear =
        Number(
            dashboardYearFilter.value
        );

    const selectedMonth =
        dashboardMonthFilter.value;


    return transactions.filter(
        (transaction) => {

            const sameYear =
                Number(transaction.year) ===
                selectedYear;


            const sameMonth =
                selectedMonth === "all" ||
                Number(transaction.month) ===
                Number(selectedMonth);


            return (
                sameYear &&
                sameMonth
            );

        }
    );

}


function calculateSummary(
    transactions
) {

    const totalIncome =
        transactions
            .filter(
                (transaction) =>
                    transaction.type ===
                    "PEMASUKAN"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(transaction.amount),
                0
            );


    const totalExpense =
        transactions
            .filter(
                (transaction) =>
                    transaction.type ===
                    "PENGELUARAN"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(transaction.amount),
                0
            );


    const balance =
        totalIncome - totalExpense;


    dashboardIncome.textContent =
        dashboardFormatRupiah(
            totalIncome
        );


    dashboardExpense.textContent =
        dashboardFormatRupiah(
            totalExpense
        );


    dashboardBalance.textContent =
        dashboardFormatRupiah(
            balance
        );


    dashboardBalance.classList.toggle(
        "negative",
        balance < 0
    );

}


function renderIncomeTrend(
    transactions
) {

    const incomeTransactions =
        transactions.filter(
            (transaction) =>
                transaction.type ===
                "PEMASUKAN"
        );


    if (incomeTrendChart) {

        incomeTrendChart.destroy();

        incomeTrendChart = null;

    }


    if (incomeTransactions.length === 0) {

        incomeTrendCanvas.hidden = true;

        incomeChartEmpty.hidden = false;

        return;

    }


    incomeTrendCanvas.hidden = false;

    incomeChartEmpty.hidden = true;


    const selectedMonth =
        dashboardMonthFilter.value;


    const groupedData = {};


    incomeTransactions.forEach(
        (transaction) => {

            let key;


            if (selectedMonth === "all") {

                key =
                    Number(transaction.month);

            } else {

                key =
                    Number(
                        transaction.date.split("-")[2]
                    );

            }


            groupedData[key] =
                (groupedData[key] || 0) +
                Number(transaction.amount);

        }
    );


    const keys =
        Object.keys(groupedData)
            .map(Number)
            .sort((a, b) => a - b);


    const labels =
        keys.map((key) => {

            if (selectedMonth === "all") {

                return monthNames[key - 1];

            }


            return `${key}`;

        });


    const values =
        keys.map(
            (key) =>
                groupedData[key]
        );


    incomeTrendChart =
        new Chart(
            incomeTrendCanvas,
            {
                type: "bar",

                data: {
                    labels,

                    datasets: [
                        {
                            label: "Pemasukan",
                            data: values,
                            backgroundColor:
                                "rgba(14, 165, 233, 0.75)",
                            borderColor:
                                "#0284c7",
                            borderWidth: 1,
                            borderRadius: 6
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

                                    return dashboardFormatRupiah(
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
                                            notation: "compact",
                                            maximumFractionDigits: 1
                                        }
                                    ).format(value);

                                }

                            }

                        }

                    }

                }

            }
        );

}


function renderAccountComposition(
    transactions
) {

    if (accountChart) {

        accountChart.destroy();

        accountChart = null;

    }


    const accountBalances = {};


    transactions.forEach(
        (transaction) => {

            const account =
                transaction.account.trim();


            if (!accountBalances[account]) {

                accountBalances[account] = 0;

            }


            if (
                transaction.type ===
                "PEMASUKAN"
            ) {

                accountBalances[account] +=
                    Number(transaction.amount);

            }


            if (
                transaction.type ===
                "PENGELUARAN"
            ) {

                accountBalances[account] -=
                    Number(transaction.amount);

            }

        }
    );


    const positiveAccounts =
        Object.entries(accountBalances)
            .filter(
                ([, value]) =>
                    value > 0
            )
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    if (positiveAccounts.length === 0) {

        accountChartCanvas.hidden = true;

        accountChartEmpty.hidden = false;

        return;

    }


    accountChartCanvas.hidden = false;

    accountChartEmpty.hidden = true;


    const labels =
        positiveAccounts.map(
            ([account]) => account
        );


    const values =
        positiveAccounts.map(
            ([, value]) => value
        );


    accountChart =
        new Chart(
            accountChartCanvas,
            {
                type: "doughnut",

                data: {

                    labels,

                    datasets: [
                        {
                            data: values,

                            backgroundColor: [
                                "#0ea5e9",
                                "#22d3ee",
                                "#2563eb",
                                "#06b6d4",
                                "#38bdf8",
                                "#6366f1",
                                "#0891b2"
                            ],

                            borderWidth: 0,

                            hoverOffset: 5
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "68%",

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {

                                usePointStyle: true,

                                boxWidth: 8,

                                padding: 16,

                                font: {
                                    size: 11
                                }

                            }

                        },

                        tooltip: {

                            callbacks: {

                                label(context) {

                                    const label =
                                        context.label || "";

                                    const value =
                                        context.raw || 0;


                                    return (
                                        `${label}: ` +
                                        dashboardFormatRupiah(
                                            value
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


function groupByDescription(
    transactions,
    type
) {

    const groups = {};


    transactions
        .filter(
            (transaction) =>
                transaction.type === type
        )
        .forEach(
            (transaction) => {

                const description =
                    transaction.description.trim();


                if (!groups[description]) {

                    groups[description] = 0;

                }


                groups[description] +=
                    Number(transaction.amount);

            }
        );


    return Object.entries(groups)
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .slice(0, 3);

}


function renderRanking(
    container,
    items,
    type
) {

    container.innerHTML = "";


    if (items.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "ranking-empty";

        empty.textContent =
            type === "income"
                ? "Belum ada pemasukan."
                : "Belum ada pengeluaran.";

        container.appendChild(
            empty
        );

        return;

    }


    items.forEach(
        ([description, value], index) => {

            const item =
                document.createElement("div");

            item.className =
                "ranking-item";


            const rank =
                document.createElement("div");

            rank.className =
                `ranking-number rank-${index + 1}`;

            rank.textContent =
                index + 1;


            const info =
                document.createElement("div");

            info.className =
                "ranking-info";


            const name =
                document.createElement("span");

            name.textContent =
                description;


            const amount =
                document.createElement("strong");

            amount.textContent =
                dashboardFormatRupiah(
                    value
                );


            if (type === "expense") {

                amount.classList.add(
                    "expense"
                );

            }


            info.append(
                name,
                amount
            );


            item.append(
                rank,
                info
            );


            container.appendChild(
                item
            );

        }
    );

}


function renderTopTransactions(
    transactions
) {

    const topIncome =
        groupByDescription(
            transactions,
            "PEMASUKAN"
        );


    const topExpense =
        groupByDescription(
            transactions,
            "PENGELUARAN"
        );


    renderRanking(
        topIncomeList,
        topIncome,
        "income"
    );


    renderRanking(
        topExpenseList,
        topExpense,
        "expense"
    );

}


async function refreshDashboard() {

    try {

        const transactions =
            await FinanceDB.getAllRecords(
                "transactions"
            );


        populateDashboardYears(
            transactions
        );


        const filteredTransactions =
            filterDashboardTransactions(
                transactions
            );


        calculateSummary(
            filteredTransactions
        );


        renderIncomeTrend(
            filteredTransactions
        );


        renderAccountComposition(
            filteredTransactions
        );


        renderTopTransactions(
            filteredTransactions
        );


        updateDashboardPeriodText();

    } catch (error) {

        console.error(
            "Gagal memperbarui dashboard:",
            error
        );

    }

}


function setupDashboardFilters() {

    const now =
        new Date();


    dashboardMonthFilter.value =
        String(now.getMonth() + 1);


    dashboardYearFilter.value =
        String(now.getFullYear());


    dashboardYearFilter.addEventListener(
        "change",
        refreshDashboard
    );


    dashboardMonthFilter.addEventListener(
        "change",
        refreshDashboard
    );

}


window.addEventListener(
    "finance-data-changed",
    refreshDashboard
);


window.FinanceDashboard = {
    refresh: refreshDashboard
};


setupDashboardFilters();

refreshDashboard();