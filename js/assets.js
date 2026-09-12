"use strict";


(() => {

    const assetForm =
        document.getElementById("asset-form");

    const assetId =
        document.getElementById("asset-id");

    const assetPeriod =
        document.getElementById("asset-period");

    const assetCategory =
        document.getElementById("asset-category");

    const assetName =
        document.getElementById("asset-name");

    const assetPlatform =
        document.getElementById("asset-platform");

    const assetType =
        document.getElementById("asset-type");

    const assetActivity =
        document.getElementById("asset-activity");

    const assetQuantity =
        document.getElementById("asset-quantity");

    const assetUnit =
        document.getElementById("asset-unit");

    const assetAveragePrice =
        document.getElementById("asset-average-price");

    const assetCurrentPrice =
        document.getElementById("asset-current-price");

    const assetTotalCapital =
        document.getElementById("asset-total-capital");

    const assetCurrentValue =
        document.getElementById("asset-current-value");

    const assetNotes =
        document.getElementById("asset-notes");

    const assetProfitPreview =
        document.getElementById("asset-profit-preview");

    const assetReturnPreview =
        document.getElementById("asset-return-preview");

    const assetList =
        document.getElementById("asset-list");

    const assetEmpty =
        document.getElementById("asset-empty");

    const assetFormTitle =
        document.getElementById("asset-form-title");

    const assetSubmit =
        document.getElementById("asset-submit");

    const assetCancel =
        document.getElementById("asset-cancel");

    const toast =
        document.getElementById("toast");


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


    function showAssetToast(message) {

        toast.textContent = message;

        toast.classList.add("show");


        setTimeout(() => {

            toast.classList.remove("show");

        }, 2500);

    }


    function escapeAssetHTML(value) {

        const element =
            document.createElement("div");

        element.textContent =
            value || "";

        return element.innerHTML;

    }


    function calculateAssetResult() {

        const capital =
            Number(assetTotalCapital.value) || 0;

        const currentValue =
            Number(assetCurrentValue.value) || 0;

        const profit =
            currentValue - capital;

        const returnPercentage =
            capital > 0
                ? (profit / capital) * 100
                : 0;


        assetProfitPreview.textContent =
            formatRupiah(profit);


        assetReturnPreview.textContent =
            `${returnPercentage.toFixed(2)}%`;


        assetProfitPreview.classList.toggle(
            "negative",
            profit < 0
        );


        assetReturnPreview.classList.toggle(
            "negative",
            returnPercentage < 0
        );


        return {
            profit,
            returnPercentage
        };

    }


    function calculateAssetTotalsFromUnit() {

        const quantity =
            Number(assetQuantity.value) || 0;

        const averagePrice =
            Number(assetAveragePrice.value) || 0;

        const currentPrice =
            Number(assetCurrentPrice.value) || 0;


        if (
            quantity > 0 &&
            averagePrice > 0
        ) {

            assetTotalCapital.value =
                Math.round(
                    quantity * averagePrice
                );

        }


        if (
            quantity > 0 &&
            currentPrice > 0
        ) {

            assetCurrentValue.value =
                Math.round(
                    quantity * currentPrice
                );

        }


        calculateAssetResult();

    }


    function resetAssetForm() {

        assetForm.reset();

        assetId.value = "";

        assetFormTitle.textContent =
            "Tambah Aset";

        assetSubmit.textContent =
            "Simpan Aset";

        assetCancel.hidden = true;

        assetProfitPreview.textContent =
            "Rp0";

        assetReturnPreview.textContent =
            "0.00%";

        assetProfitPreview.classList.remove(
            "negative"
        );

        assetReturnPreview.classList.remove(
            "negative"
        );

    }


    async function renderAssets() {

        try {

            const assets =
                await FinanceDB.getAllRecords(
                    "assets"
                );


            assets.sort(
                (a, b) =>
                    b.period.localeCompare(
                        a.period
                    )
            );


            assetList.innerHTML = "";


            if (assets.length === 0) {

                assetEmpty.hidden = false;

                return;

            }


            assetEmpty.hidden = true;


            assets.forEach((asset) => {

                const card =
                    document.createElement("article");


                card.className =
                    "asset-card";


                const profitClass =
                    Number(asset.profit) < 0
                        ? "negative"
                        : "positive";


                card.innerHTML = `
                    <div class="asset-card-main">

                        <div class="asset-card-icon">
                            ◆
                        </div>

                        <div class="asset-card-info">

                            <div class="asset-card-title">
                                <div>
                                    <h4>
                                        ${escapeAssetHTML(asset.name)}
                                    </h4>

                                    <span>
                                        ${escapeAssetHTML(asset.category)}
                                    </span>
                                </div>

                                <strong>
                                    ${formatRupiah(asset.currentValue)}
                                </strong>
                            </div>

                            <div class="asset-card-meta">

                                <span>
                                    ${escapeAssetHTML(asset.platform)}
                                </span>

                                <span>
                                    ${escapeAssetHTML(asset.activity)}
                                </span>

                                <span>
                                    ${escapeAssetHTML(asset.period)}
                                </span>

                            </div>

                            <div class="asset-card-performance">

                                <span>
                                    Modal:
                                    <strong>
                                        ${formatRupiah(asset.totalCapital)}
                                    </strong>
                                </span>

                                <span>
                                    Keuntungan:
                                    <strong class="${profitClass}">
                                        ${formatRupiah(asset.profit)}
                                    </strong>
                                </span>

                                <span>
                                    Return:
                                    <strong class="${profitClass}">
                                        ${Number(asset.returnPercentage).toFixed(2)}%
                                    </strong>
                                </span>

                            </div>

                        </div>

                    </div>


                    <div class="asset-card-actions">

                        <button
                            class="btn-secondary"
                            data-asset-action="edit"
                            data-id="${asset.id}"
                        >
                            Edit
                        </button>

                        <button
                            class="btn-danger"
                            data-asset-action="delete"
                            data-id="${asset.id}"
                        >
                            Hapus
                        </button>

                    </div>
                `;


                assetList.appendChild(
                    card
                );

            });

        } catch (error) {

            console.error(
                "Gagal menampilkan aset:",
                error
            );

        }

    }


    async function saveAsset(event) {

        event.preventDefault();


        const period =
            assetPeriod.value;

        const category =
            assetCategory.value.trim();

        const name =
            assetName.value.trim();

        const platform =
            assetPlatform.value.trim();

        const type =
            assetType.value.trim();

        const activity =
            assetActivity.value;

        const quantity =
            Number(assetQuantity.value) || 0;

        const unit =
            assetUnit.value.trim();

        const averagePrice =
            Number(assetAveragePrice.value) || 0;

        const currentPrice =
            Number(assetCurrentPrice.value) || 0;

        const totalCapital =
            Number(assetTotalCapital.value) || 0;

        const currentValue =
            Number(assetCurrentValue.value) || 0;

        const notes =
            assetNotes.value.trim();


        if (
            !period ||
            !category ||
            !name ||
            !platform ||
            !activity ||
            totalCapital < 0 ||
            currentValue < 0
        ) {

            showAssetToast(
                "Lengkapi data aset dengan benar."
            );

            return;

        }


        const [year, month] =
            period
                .split("-")
                .map(Number);


        const profit =
            currentValue -
            totalCapital;


        const returnPercentage =
            totalCapital > 0
                ? (
                    profit /
                    totalCapital
                ) * 100
                : 0;


        const existingAsset =
            assetId.value
                ? await FinanceDB.getRecordById(
                    "assets",
                    assetId.value
                )
                : null;


        const assetData = {

            id:
                assetId.value ||
                FinanceDB.createId(),

            period,

            month,

            year,

            category,

            name,

            platform,

            type,

            activity,

            quantity,

            unit,

            averagePrice,

            currentPrice,

            totalCapital,

            currentValue,

            profit,

            returnPercentage,

            notes,

            createdAt:
                existingAsset?.createdAt ||
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };


        try {

            if (assetId.value) {

                await FinanceDB.updateRecord(
                    "assets",
                    assetData
                );


                showAssetToast(
                    "Aset berhasil diperbarui."
                );

            } else {

                await FinanceDB.addRecord(
                    "assets",
                    assetData
                );


                showAssetToast(
                    "Aset berhasil ditambahkan."
                );

            }


            resetAssetForm();

            await renderAssets();


            window.dispatchEvent(
                new CustomEvent(
                    "asset-data-changed"
                )
            );

        } catch (error) {

            console.error(
                "Gagal menyimpan aset:",
                error
            );


            showAssetToast(
                "Terjadi kesalahan saat menyimpan aset."
            );

        }

    }


    async function editAsset(id) {

        try {

            const asset =
                await FinanceDB.getRecordById(
                    "assets",
                    id
                );


            if (!asset) {
                return;
            }


            assetId.value =
                asset.id;

            assetPeriod.value =
                asset.period;

            assetCategory.value =
                asset.category;

            assetName.value =
                asset.name;

            assetPlatform.value =
                asset.platform;

            assetType.value =
                asset.type || "";

            assetActivity.value =
                asset.activity;

            assetQuantity.value =
                asset.quantity || "";

            assetUnit.value =
                asset.unit || "";

            assetAveragePrice.value =
                asset.averagePrice || "";

            assetCurrentPrice.value =
                asset.currentPrice || "";

            assetTotalCapital.value =
                asset.totalCapital;

            assetCurrentValue.value =
                asset.currentValue;

            assetNotes.value =
                asset.notes || "";


            assetFormTitle.textContent =
                "Edit Aset";

            assetSubmit.textContent =
                "Simpan Perubahan";

            assetCancel.hidden = false;


            calculateAssetResult();


            assetForm.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        } catch (error) {

            console.error(
                "Gagal membuka data aset:",
                error
            );

        }

    }


    async function deleteAsset(id) {

        try {

            const asset =
                await FinanceDB.getRecordById(
                    "assets",
                    id
                );


            if (!asset) {
                return;
            }


            const confirmed =
                window.confirm(
                    `Hapus aset "${asset.name}"?`
                );


            if (!confirmed) {
                return;
            }


            await FinanceDB.deleteRecord(
                "assets",
                id
            );


            if (assetId.value === id) {

                resetAssetForm();

            }


            await renderAssets();


            window.dispatchEvent(
                new CustomEvent(
                    "asset-data-changed"
                )
            );


            showAssetToast(
                "Aset berhasil dihapus."
            );

        } catch (error) {

            console.error(
                "Gagal menghapus aset:",
                error
            );

        }

    }


    assetForm.addEventListener(
        "submit",
        saveAsset
    );


    assetCancel.addEventListener(
        "click",
        resetAssetForm
    );


    assetTotalCapital.addEventListener(
        "input",
        calculateAssetResult
    );


    assetCurrentValue.addEventListener(
        "input",
        calculateAssetResult
    );


    [
        assetQuantity,
        assetAveragePrice,
        assetCurrentPrice
    ].forEach((input) => {

        input.addEventListener(
            "input",
            calculateAssetTotalsFromUnit
        );

    });


    assetList.addEventListener(
        "click",
        (event) => {

            const button =
                event.target.closest(
                    "button[data-asset-action]"
                );


            if (!button) {
                return;
            }


            const id =
                button.dataset.id;

            const action =
                button.dataset.assetAction;


            if (action === "edit") {

                editAsset(id);

            }


            if (action === "delete") {

                deleteAsset(id);

            }

        }
    );


    renderAssets();

})();