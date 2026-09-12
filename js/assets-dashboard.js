"use strict";


(() => {

    const periodFilter =
        document.getElementById("asset-dashboard-period");

    const yearFilter =
        document.getElementById("asset-dashboard-year");

    const monthFilter =
        document.getElementById("asset-dashboard-month");

    const categoryFilter =
        document.getElementById("asset-dashboard-category");

    const nameFilter =
        document.getElementById("asset-dashboard-name");

    const platformFilter =
        document.getElementById("asset-dashboard-platform");


    const totalValueElement =
        document.getElementById("asset-total-value");

    const totalCapitalElement =
        document.getElementById("asset-total-capital-summary");

    const totalProfitElement =
        document.getElementById("asset-total-profit");

    const portfolioReturnElement =
        document.getElementById("asset-portfolio-return");

    const largestAssetElement =
        document.getElementById("asset-largest");

    const assetChangeElement =
        document.getElementById("asset-change");


    const categoryCards =
        document.getElementById("asset-category-cards");


    const wealthChartCanvas =
        document.getElementById("wealth-trend-chart");

    const categoryTrendCanvas =
        document.getElementById("category-trend-chart");

    const compositionCanvas =
        document.getElementById("asset-composition-chart");

    const assetValueCanvas =
        document.getElementById("asset-value-chart");

    const assetProfitCanvas =
        document.getElementById("asset-profit-chart");

    const assetReturnCanvas =
        document.getElementById("asset-return-chart");


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


    const chartColors = [
        "#0ea5e9",
        "#22d3ee",
        "#2563eb",
        "#6366f1",
        "#06b6d4",
        "#3b82f6",
        "#0891b2",
        "#8b5cf6"
    ];


    const charts = {
        wealth: null,
        category: null,
        composition: null,
        value: null,
        profit: null,
        return: null
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


    function formatPeriod(period) {

        const [year, month] =
            period.split("-").map(Number);


        return (
            `${monthNames[month - 1]} ${year}`
        );

    }


    function destroyChart(name) {

        if (charts[name]) {

            charts[name].destroy();

            charts[name] = null;

        }

    }


    function createOption(
        value,
        label
    ) {

        const option =
            document.createElement("option");

        option.value = value;

        option.textContent = label;

        return option;

    }


    function populateSimpleFilter(
        select,
        values,
        allLabel
    ) {

        const currentValue =
            select.value;


        select.innerHTML = "";

        select.appendChild(
            createOption(
                "all",
                allLabel
            )
        );


        values.forEach((value) => {

            select.appendChild(
                createOption(
                    value,
                    value
                )
            );

        });


        if (
            values.includes(currentValue)
        ) {

            select.value =
                currentValue;

        } else {

            select.value =
                "all";

        }

    }


    function getUniqueValues(
        assets,
        field
    ) {

        return [
            ...new Set(
                assets
                    .map(
                        (asset) =>
                            asset[field]
                    )
                    .filter(Boolean)
            )
        ].sort(
            (a, b) =>
                a.localeCompare(b)
        );

    }


    function ensurePeriodOption(period) {

        const exists =
            [...periodFilter.options]
                .some(
                    (option) =>
                        option.value === period
                );


        if (!exists) {

            periodFilter.appendChild(
                createOption(
                    period,
                    `${formatPeriod(period)} — kosong`
                )
            );

        }

    }


    function populateFilters(assets) {

        const previousPeriod =
            periodFilter.value;


        const availablePeriods = [
            ...new Set(
                assets
                    .map(
                        (asset) =>
                            asset.period
                    )
                    .filter(Boolean)
            )
        ].sort().reverse();


        if (
            availablePeriods.length === 0
        ) {

            const now =
                new Date();

            const currentPeriod =
                `${now.getFullYear()}-${String(
                    now.getMonth() + 1
                ).padStart(2, "0")}`;

            availablePeriods.push(
                currentPeriod
            );

        }


        periodFilter.innerHTML = "";


        availablePeriods.forEach(
            (period) => {

                periodFilter.appendChild(
                    createOption(
                        period,
                        formatPeriod(period)
                    )
                );

            }
        );


        if (
            previousPeriod &&
            availablePeriods.includes(
                previousPeriod
            )
        ) {

            periodFilter.value =
                previousPeriod;

        } else {

            periodFilter.value =
                availablePeriods[0];

        }


        const currentYear =
            new Date().getFullYear();


        const years = [
            ...new Set([
                currentYear,
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


        const oldYear =
            yearFilter.value;


        yearFilter.innerHTML = "";


        years.forEach((year) => {

            yearFilter.appendChild(
                createOption(
                    String(year),
                    String(year)
                )
            );

        });


        const selectedPeriodParts =
            periodFilter.value
                .split("-");


        const selectedYear =
            selectedPeriodParts[0];

        const selectedMonth =
            selectedPeriodParts[1];


        if (
            years.includes(
                Number(oldYear)
            )
        ) {

            yearFilter.value =
                oldYear;

        } else {

            yearFilter.value =
                selectedYear;

        }


        monthFilter.value =
            String(
                Number(selectedMonth)
            );


        populateSimpleFilter(
            categoryFilter,
            getUniqueValues(
                assets,
                "category"
            ),
            "Semua Kategori"
        );


        populateSimpleFilter(
            nameFilter,
            getUniqueValues(
                assets,
                "name"
            ),
            "Semua Aset"
        );


        populateSimpleFilter(
            platformFilter,
            getUniqueValues(
                assets,
                "platform"
            ),
            "Semua Platform"
        );

    }


    function getBaseFilteredAssets(
        assets
    ) {

        return assets.filter(
            (asset) => {

                const categoryMatch =
                    categoryFilter.value === "all" ||
                    asset.category ===
                    categoryFilter.value;


                const nameMatch =
                    nameFilter.value === "all" ||
                    asset.name ===
                    nameFilter.value;


                const platformMatch =
                    platformFilter.value === "all" ||
                    asset.platform ===
                    platformFilter.value;


                return (
                    categoryMatch &&
                    nameMatch &&
                    platformMatch
                );

            }
        );

    }


    function groupSum(
        assets,
        keyField,
        valueField
    ) {

        const result = {};


        assets.forEach((asset) => {

            const key =
                asset[keyField] ||
                "Tanpa Nama";


            result[key] =
                (result[key] || 0) +
                Number(
                    asset[valueField]
                );

        });


        return result;

    }


    function calculateSummary(
        currentAssets,
        baseAssets,
        selectedPeriod
    ) {

        const totalValue =
            currentAssets.reduce(
                (total, asset) =>
                    total +
                    Number(
                        asset.currentValue
                    ),
                0
            );


        const totalCapital =
            currentAssets.reduce(
                (total, asset) =>
                    total +
                    Number(
                        asset.totalCapital
                    ),
                0
            );


        const totalProfit =
            currentAssets.reduce(
                (total, asset) =>
                    total +
                    Number(
                        asset.profit
                    ),
                0
            );


        const portfolioReturn =
            totalCapital > 0
                ? (
                    totalProfit /
                    totalCapital
                ) * 100
                : 0;


        totalValueElement.textContent =
            formatRupiah(totalValue);


        totalCapitalElement.textContent =
            formatRupiah(totalCapital);


        totalProfitElement.textContent =
            formatRupiah(totalProfit);


        portfolioReturnElement.textContent =
            `${portfolioReturn.toFixed(2)}%`;


        totalProfitElement.classList.toggle(
            "negative",
            totalProfit < 0
        );


        portfolioReturnElement.classList.toggle(
            "negative",
            portfolioReturn < 0
        );


        const assetGroups =
            groupSum(
                currentAssets,
                "name",
                "currentValue"
            );


        const largestAsset =
            Object.entries(
                assetGroups
            )
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                )[0];


        if (largestAsset) {

            largestAssetElement.innerHTML =
                `
                    <span>
                        ${largestAsset[0]}
                    </span>

                    <strong>
                        ${formatRupiah(
                            largestAsset[1]
                        )}
                    </strong>
                `;

        } else {

            largestAssetElement.innerHTML =
                `
                    <span>Belum ada aset</span>
                    <strong>Rp0</strong>
                `;

        }


        calculatePreviousPeriodChange(
            baseAssets,
            selectedPeriod,
            totalValue
        );

    }


    function calculatePreviousPeriodChange(
        assets,
        selectedPeriod,
        currentValue
    ) {

        const periods = [
            ...new Set(
                assets
                    .map(
                        (asset) =>
                            asset.period
                    )
                    .filter(Boolean)
            )
        ].sort();


        const currentIndex =
            periods.indexOf(
                selectedPeriod
            );


        if (currentIndex <= 0) {

            assetChangeElement.innerHTML =
                `
                    <span>Belum ada pembanding</span>
                    <strong>0.00%</strong>
                `;

            assetChangeElement.classList.remove(
                "negative"
            );

            return;

        }


        const previousPeriod =
            periods[currentIndex - 1];


        const previousValue =
            assets
                .filter(
                    (asset) =>
                        asset.period ===
                        previousPeriod
                )
                .reduce(
                    (total, asset) =>
                        total +
                        Number(
                            asset.currentValue
                        ),
                    0
                );


        const difference =
            currentValue -
            previousValue;


        const percentage =
            previousValue > 0
                ? (
                    difference /
                    previousValue
                ) * 100
                : 0;


        assetChangeElement.innerHTML =
            `
                <span>
                    ${formatRupiah(difference)}
                </span>

                <strong>
                    ${
                        percentage > 0
                            ? "+"
                            : ""
                    }${percentage.toFixed(2)}%
                </strong>
            `;


        assetChangeElement.classList.toggle(
            "negative",
            difference < 0
        );

    }


    function renderCategoryCards(
        assets
    ) {

        categoryCards.innerHTML = "";


        const categories =
            groupSum(
                assets,
                "category",
                "currentValue"
            );


        const entries =
            Object.entries(
                categories
            )
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                );


        if (entries.length === 0) {

            categoryCards.innerHTML =
                `
                    <div class="asset-dashboard-empty">
                        Belum ada kategori aset pada periode ini.
                    </div>
                `;

            return;

        }


        entries.forEach(
            ([category, value]) => {

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "asset-category-card";


                card.innerHTML = `
                    <span>
                        ${category}
                    </span>

                    <strong>
                        ${formatRupiah(value)}
                    </strong>
                `;


                categoryCards.appendChild(
                    card
                );

            }
        );

    }


    function renderWealthTrend(
        assets
    ) {

        destroyChart("wealth");


        const periodValues = {};


        assets.forEach((asset) => {

            periodValues[asset.period] =
                (
                    periodValues[
                        asset.period
                    ] || 0
                ) +
                Number(
                    asset.currentValue
                );

        });


        const periods =
            Object.keys(
                periodValues
            ).sort();


        charts.wealth =
            new Chart(
                wealthChartCanvas,
                {
                    type: "line",

                    data: {

                        labels:
                            periods.map(
                                formatPeriod
                            ),

                        datasets: [
                            {
                                label:
                                    "Total Kekayaan",

                                data:
                                    periods.map(
                                        (period) =>
                                            periodValues[
                                                period
                                            ]
                                    ),

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
                        commonLineOptions()

                }
            );

    }


    function renderCategoryTrend(
        assets
    ) {

        destroyChart("category");


        const periods = [
            ...new Set(
                assets.map(
                    (asset) =>
                        asset.period
                )
            )
        ].sort();


        const categories = [
            ...new Set(
                assets.map(
                    (asset) =>
                        asset.category
                )
            )
        ];


        const datasets =
            categories.map(
                (category, index) => {

                    const values =
                        periods.map(
                            (period) => {

                                return assets
                                    .filter(
                                        (asset) =>
                                            asset.period ===
                                                period &&
                                            asset.category ===
                                                category
                                    )
                                    .reduce(
                                        (
                                            total,
                                            asset
                                        ) =>
                                            total +
                                            Number(
                                                asset.currentValue
                                            ),
                                        0
                                    );

                            }
                        );


                    return {
                        label:
                            category,

                        data:
                            values,

                        borderColor:
                            chartColors[
                                index %
                                chartColors.length
                            ],

                        tension: 0.3,

                        pointRadius: 3
                    };

                }
            );


        charts.category =
            new Chart(
                categoryTrendCanvas,
                {
                    type: "line",

                    data: {
                        labels:
                            periods.map(
                                formatPeriod
                            ),

                        datasets
                    },

                    options:
                        commonLineOptions()
                }
            );

    }


    function commonLineOptions() {

        return {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
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
                                        "compact"
                                }
                            ).format(value);

                        }

                    }

                }

            }

        };

    }


    function renderComposition(
        assets
    ) {

        destroyChart(
            "composition"
        );


        const groups =
            groupSum(
                assets,
                "category",
                "currentValue"
            );


        charts.composition =
            new Chart(
                compositionCanvas,
                {
                    type: "doughnut",

                    data: {

                        labels:
                            Object.keys(
                                groups
                            ),

                        datasets: [
                            {
                                data:
                                    Object.values(
                                        groups
                                    ),

                                backgroundColor:
                                    chartColors,

                                borderWidth: 0
                            }
                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio:
                            false,

                        cutout: "67%",

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


    function renderAssetBarChart(
        chartName,
        canvas,
        assets,
        valueType
    ) {

        destroyChart(
            chartName
        );


        const grouped = {};


        assets.forEach((asset) => {

            if (!grouped[asset.name]) {

                grouped[asset.name] = {
                    value: 0,
                    capital: 0,
                    profit: 0
                };

            }


            grouped[asset.name].value +=
                Number(
                    asset.currentValue
                );


            grouped[asset.name].capital +=
                Number(
                    asset.totalCapital
                );


            grouped[asset.name].profit +=
                Number(
                    asset.profit
                );

        });


        const labels =
            Object.keys(grouped);


        let values;


        if (
            valueType === "value"
        ) {

            values =
                labels.map(
                    (name) =>
                        grouped[name].value
                );

        }


        if (
            valueType === "profit"
        ) {

            values =
                labels.map(
                    (name) =>
                        grouped[name].profit
                );

        }


        if (
            valueType === "return"
        ) {

            values =
                labels.map(
                    (name) => {

                        const item =
                            grouped[name];


                        return (
                            item.capital > 0
                                ? (
                                    item.profit /
                                    item.capital
                                ) * 100
                                : 0
                        );

                    }
                );

        }


        charts[chartName] =
            new Chart(
                canvas,
                {
                    type: "bar",

                    data: {

                        labels,

                        datasets: [
                            {
                                data: values,

                                backgroundColor:
                                    "rgba(14, 165, 233, 0.75)",

                                borderRadius: 6
                            }
                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio:
                            false,

                        plugins: {

                            legend: {
                                display: false
                            },

                            tooltip: {

                                callbacks: {

                                    label(context) {

                                        if (
                                            valueType ===
                                            "return"
                                        ) {

                                            return (
                                                `${Number(
                                                    context.raw
                                                ).toFixed(2)}%`
                                            );

                                        }


                                        return formatRupiah(
                                            context.raw
                                        );

                                    }

                                }

                            }

                        },

                        scales: {

                            y: {

                                beginAtZero:
                                    true

                            }

                        }

                    }

                }
            );

    }


    function renderCharts(
        baseAssets,
        currentAssets
    ) {

        if (
            typeof Chart ===
            "undefined"
        ) {

            console.error(
                "Chart.js tidak tersedia."
            );

            return;

        }


        renderWealthTrend(
            baseAssets
        );


        renderCategoryTrend(
            baseAssets
        );


        renderComposition(
            currentAssets
        );


        renderAssetBarChart(
            "value",
            assetValueCanvas,
            currentAssets,
            "value"
        );


        renderAssetBarChart(
            "profit",
            assetProfitCanvas,
            currentAssets,
            "profit"
        );


        renderAssetBarChart(
            "return",
            assetReturnCanvas,
            currentAssets,
            "return"
        );

    }


    async function refreshAssetDashboard() {

        try {

            const assets =
                await FinanceDB.getAllRecords(
                    "assets"
                );


            populateFilters(
                assets
            );


            const baseAssets =
                getBaseFilteredAssets(
                    assets
                );


            const selectedPeriod =
                periodFilter.value;


            const currentAssets =
                baseAssets.filter(
                    (asset) =>
                        asset.period ===
                        selectedPeriod
                );


            calculateSummary(
                currentAssets,
                baseAssets,
                selectedPeriod
            );


            renderCategoryCards(
                currentAssets
            );


            renderCharts(
                baseAssets,
                currentAssets
            );

        } catch (error) {

            console.error(
                "Gagal memperbarui dashboard aset:",
                error
            );

        }

    }


    function syncPeriodFromYearMonth() {

        const year =
            yearFilter.value;

        const month =
            String(
                monthFilter.value
            ).padStart(
                2,
                "0"
            );


        const period =
            `${year}-${month}`;


        ensurePeriodOption(
            period
        );


        periodFilter.value =
            period;


        refreshAssetDashboard();

    }


    periodFilter.addEventListener(
        "change",
        () => {

            const [year, month] =
                periodFilter.value
                    .split("-");


            yearFilter.value =
                year;

            monthFilter.value =
                String(
                    Number(month)
                );


            refreshAssetDashboard();

        }
    );


    yearFilter.addEventListener(
        "change",
        syncPeriodFromYearMonth
    );


    monthFilter.addEventListener(
        "change",
        syncPeriodFromYearMonth
    );


    [
        categoryFilter,
        nameFilter,
        platformFilter
    ].forEach((filter) => {

        filter.addEventListener(
            "change",
            refreshAssetDashboard
        );

    });


    window.addEventListener(
        "asset-data-changed",
        refreshAssetDashboard
    );


    window.AssetDashboard = {
        refresh:
            refreshAssetDashboard
    };


    refreshAssetDashboard();

})();