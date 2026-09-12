"use strict";


(() => {

    const targetForm =
        document.getElementById("target-form");

    const targetId =
        document.getElementById("target-id");

    const targetName =
        document.getElementById("target-name");

    const targetCategory =
        document.getElementById("target-category");

    const targetAmount =
        document.getElementById("target-amount");

    const targetCurrent =
        document.getElementById("target-current");

    const targetDeadline =
        document.getElementById("target-deadline");

    const targetProgressPreview =
        document.getElementById("target-progress-preview");

    const targetStatusPreview =
        document.getElementById("target-status-preview");

    const targetAutoInfo =
        document.getElementById("target-auto-info");

    const targetFormTitle =
        document.getElementById("target-form-title");

    const targetSubmit =
        document.getElementById("target-submit");

    const targetCancel =
        document.getElementById("target-cancel");

    const targetList =
        document.getElementById("target-list");

    const targetEmpty =
        document.getElementById("target-empty");

    const targetCount =
        document.getElementById("target-count");

    const toast =
        document.getElementById("toast");


    const AUTO_TARGET_CATEGORIES = [
        "Target Income Bulanan",
        "Maksimal Pengeluaran Bulanan",
        "Target Kekayaan"
    ];


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


    function formatDateIndonesia(
        dateString
    ) {

        if (!dateString) {

            return "Tanpa deadline";

        }


        const date =
            new Date(
                `${dateString}T00:00:00`
            );


        return new Intl.DateTimeFormat(
            "id-ID",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        ).format(date);

    }


    function escapeHTML(value) {

        const element =
            document.createElement("div");

        element.textContent =
            value || "";

        return element.innerHTML;

    }


    function showTargetToast(message) {

        toast.textContent =
            message;

        toast.classList.add(
            "show"
        );


        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2500);

    }


    function isAutomaticCategory(
        category
    ) {

        return AUTO_TARGET_CATEGORIES.includes(
            category
        );

    }


    function isExpenseLimitCategory(
        category
    ) {

        return (
            category ===
            "Maksimal Pengeluaran Bulanan"
        );

    }


    function calculateTarget(
        amount,
        current,
        category
    ) {

        const safeAmount =
            Number(amount) || 0;

        const safeCurrent =
            Number(current) || 0;


        const progress =
            safeAmount > 0
                ? (
                    safeCurrent /
                    safeAmount
                ) * 100
                : 0;


        let status;


        if (
            isExpenseLimitCategory(
                category
            )
        ) {

            if (progress >= 100) {

                status =
                    "Melebihi Batas";

            } else if (
                progress >= 80
            ) {

                status =
                    "Waspada";

            } else {

                status =
                    "Aman";

            }

        } else {

            if (
                safeAmount > 0 &&
                safeCurrent >=
                safeAmount
            ) {

                status =
                    "Tercapai";

            } else if (
                safeCurrent > 0
            ) {

                status =
                    "Dalam Proses";

            } else {

                status =
                    "Belum Dimulai";

            }

        }


        return {
            progress:
                Math.max(
                    0,
                    progress
                ),

            status
        };

    }


    async function getAutomaticCurrentAmount(
        category
    ) {

        if (
            category ===
            "Target Income Bulanan"
        ) {

            const transactions =
                await FinanceDB.getAllRecords(
                    "transactions"
                );


            const now =
                new Date();

            const currentYear =
                now.getFullYear();

            const currentMonth =
                now.getMonth() + 1;


            return transactions
                .filter(
                    (transaction) => {

                        return (
                            transaction.type ===
                                "PEMASUKAN" &&
                            Number(
                                transaction.year
                            ) ===
                                currentYear &&
                            Number(
                                transaction.month
                            ) ===
                                currentMonth
                        );

                    }
                )
                .reduce(
                    (total, transaction) => {

                        return (
                            total +
                            Number(
                                transaction.amount
                            )
                        );

                    },
                    0
                );

        }


        if (
            category ===
            "Maksimal Pengeluaran Bulanan"
        ) {

            const transactions =
                await FinanceDB.getAllRecords(
                    "transactions"
                );


            const now =
                new Date();

            const currentYear =
                now.getFullYear();

            const currentMonth =
                now.getMonth() + 1;


            return transactions
                .filter(
                    (transaction) => {

                        return (
                            transaction.type ===
                                "PENGELUARAN" &&
                            Number(
                                transaction.year
                            ) ===
                                currentYear &&
                            Number(
                                transaction.month
                            ) ===
                                currentMonth
                        );

                    }
                )
                .reduce(
                    (total, transaction) => {

                        return (
                            total +
                            Number(
                                transaction.amount
                            )
                        );

                    },
                    0
                );

        }


        if (
            category ===
            "Target Kekayaan"
        ) {

            const assets =
                await FinanceDB.getAllRecords(
                    "assets"
                );


            if (
                assets.length === 0
            ) {

                return 0;

            }


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


            if (
                periods.length === 0
            ) {

                return 0;

            }


            const latestPeriod =
                periods[
                    periods.length - 1
                ];


            return assets
                .filter(
                    (asset) =>
                        asset.period ===
                        latestPeriod
                )
                .reduce(
                    (total, asset) => {

                        return (
                            total +
                            Number(
                                asset.currentValue
                            )
                        );

                    },
                    0
                );

        }


        return null;

    }


    async function syncCurrentInput() {

        const category =
            targetCategory.value;


        if (
            !isAutomaticCategory(
                category
            )
        ) {

            targetCurrent.disabled =
                false;

            targetAutoInfo.hidden =
                true;

            return;

        }


        const automaticValue =
            await getAutomaticCurrentAmount(
                category
            );


        targetCurrent.value =
            automaticValue ?? 0;

        targetCurrent.disabled =
            true;

        targetAutoInfo.hidden =
            false;

    }


    async function updateTargetPreview() {

        await syncCurrentInput();


        const result =
            calculateTarget(
                targetAmount.value,
                targetCurrent.value,
                targetCategory.value
            );


        targetProgressPreview.textContent =
            `${result.progress.toFixed(2)}%`;


        targetStatusPreview.textContent =
            result.status;


        targetStatusPreview.className =
            "target-status-preview";


        if (
            result.status ===
                "Tercapai" ||
            result.status ===
                "Aman"
        ) {

            targetStatusPreview.classList.add(
                "success"
            );

        }


        if (
            result.status ===
            "Waspada"
        ) {

            targetStatusPreview.classList.add(
                "warning"
            );

        }


        if (
            result.status ===
            "Melebihi Batas"
        ) {

            targetStatusPreview.classList.add(
                "danger"
            );

        }

    }


    async function resetTargetForm() {

        targetForm.reset();

        targetId.value = "";

        targetCurrent.value = "0";

        targetCurrent.disabled =
            false;

        targetAutoInfo.hidden =
            true;

        targetFormTitle.textContent =
            "Tambah Target";

        targetSubmit.textContent =
            "Simpan Target";

        targetCancel.hidden =
            true;

        await updateTargetPreview();

    }


    async function syncTargetRecord(
        target
    ) {

        if (
            !isAutomaticCategory(
                target.category
            )
        ) {

            return target;

        }


        const automaticCurrent =
            await getAutomaticCurrentAmount(
                target.category
            );


        const result =
            calculateTarget(
                target.targetAmount,
                automaticCurrent,
                target.category
            );


        const changed =
            Number(
                target.currentAmount
            ) !==
                Number(
                    automaticCurrent
                ) ||
            Number(
                target.progress
            ).toFixed(6) !==
                Number(
                    result.progress
                ).toFixed(6) ||
            target.status !==
                result.status;


        const syncedTarget = {
            ...target,

            currentAmount:
                automaticCurrent,

            progress:
                result.progress,

            status:
                result.status
        };


        if (changed) {

            syncedTarget.updatedAt =
                new Date().toISOString();


            await FinanceDB.updateRecord(
                "targets",
                syncedTarget
            );

        }


        return syncedTarget;

    }


    async function renderTargets() {

        try {

            const rawTargets =
                await FinanceDB.getAllRecords(
                    "targets"
                );


            const targets = [];


            for (
                const target
                of rawTargets
            ) {

                targets.push(
                    await syncTargetRecord(
                        target
                    )
                );

            }


            targets.sort(
                (a, b) => {

                    return (
                        new Date(
                            b.createdAt || 0
                        ) -
                        new Date(
                            a.createdAt || 0
                        )
                    );

                }
            );


            targetList.innerHTML = "";


            targetCount.textContent =
                `${targets.length} target`;


            if (
                targets.length === 0
            ) {

                targetEmpty.hidden =
                    false;

                return;

            }


            targetEmpty.hidden =
                true;


            targets.forEach(
                (target) => {

                    const card =
                        document.createElement(
                            "article"
                        );


                    card.className =
                        "target-card";


                    const visualProgress =
                        Math.min(
                            Number(
                                target.progress
                            ) || 0,
                            100
                        );


                    let statusClass = "";


                    if (
                        target.status ===
                            "Tercapai" ||
                        target.status ===
                            "Aman"
                    ) {

                        statusClass =
                            "success";

                    }


                    if (
                        target.status ===
                        "Waspada"
                    ) {

                        statusClass =
                            "warning";

                    }


                    if (
                        target.status ===
                        "Melebihi Batas"
                    ) {

                        statusClass =
                            "danger";

                    }


                    const automaticBadge =
                        isAutomaticCategory(
                            target.category
                        )
                            ? `
                                <span class="target-auto-badge">
                                    Otomatis
                                </span>
                            `
                            : "";


                    card.innerHTML = `
                        <div class="target-card-header">

                            <div>

                                <div class="target-category-row">

                                    <span class="target-category">
                                        ${escapeHTML(
                                            target.category
                                        )}
                                    </span>

                                    ${automaticBadge}

                                </div>

                                <h4>
                                    ${escapeHTML(
                                        target.name
                                    )}
                                </h4>

                            </div>


                            <span class="target-status ${statusClass}">
                                ${escapeHTML(
                                    target.status
                                )}
                            </span>

                        </div>


                        <div class="target-values">

                            <div>

                                <span>
                                    Saat Ini
                                </span>

                                <strong>
                                    ${formatRupiah(
                                        target.currentAmount
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Target
                                </span>

                                <strong>
                                    ${formatRupiah(
                                        target.targetAmount
                                    )}
                                </strong>

                            </div>

                        </div>


                        <div class="target-progress-info">

                            <span>
                                Progress
                            </span>

                            <strong>
                                ${Number(
                                    target.progress
                                ).toFixed(2)}%
                            </strong>

                        </div>


                        <div class="target-progress-track">

                            <div
                                class="target-progress-fill ${statusClass}"
                                style="width: ${visualProgress}%"
                            ></div>

                        </div>


                        <div class="target-footer">

                            <span>
                                Deadline:
                                ${formatDateIndonesia(
                                    target.deadline
                                )}
                            </span>


                            <div class="target-actions">

                                <button
                                    class="btn-secondary"
                                    data-target-action="edit"
                                    data-id="${target.id}"
                                >
                                    Edit
                                </button>

                                <button
                                    class="btn-danger"
                                    data-target-action="delete"
                                    data-id="${target.id}"
                                >
                                    Hapus
                                </button>

                            </div>

                        </div>
                    `;


                    targetList.appendChild(
                        card
                    );

                }
            );

        } catch (error) {

            console.error(
                "Gagal menampilkan target:",
                error
            );

        }

    }


    async function saveTarget(
        event
    ) {

        event.preventDefault();


        const name =
            targetName.value.trim();

        const category =
            targetCategory.value;

        const targetAmountValue =
            Number(
                targetAmount.value
            );

        let currentAmountValue;


        if (
            isAutomaticCategory(
                category
            )
        ) {

            currentAmountValue =
                await getAutomaticCurrentAmount(
                    category
                );

        } else {

            currentAmountValue =
                Number(
                    targetCurrent.value
                ) || 0;

        }


        const deadline =
            targetDeadline.value ||
            "";


        if (
            !name ||
            !category ||
            !targetAmountValue ||
            targetAmountValue <= 0 ||
            currentAmountValue < 0
        ) {

            showTargetToast(
                "Lengkapi data target dengan benar."
            );

            return;

        }


        const result =
            calculateTarget(
                targetAmountValue,
                currentAmountValue,
                category
            );


        const existing =
            targetId.value
                ? await FinanceDB.getRecordById(
                    "targets",
                    targetId.value
                )
                : null;


        const data = {

            id:
                targetId.value ||
                FinanceDB.createId(),

            name,

            category,

            targetAmount:
                targetAmountValue,

            currentAmount:
                currentAmountValue,

            deadline,

            progress:
                result.progress,

            status:
                result.status,

            createdAt:
                existing?.createdAt ||
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };


        try {

            if (
                targetId.value
            ) {

                await FinanceDB.updateRecord(
                    "targets",
                    data
                );


                showTargetToast(
                    "Target berhasil diperbarui."
                );

            } else {

                await FinanceDB.addRecord(
                    "targets",
                    data
                );


                showTargetToast(
                    "Target berhasil ditambahkan."
                );

            }


            await resetTargetForm();

            await renderTargets();


            window.dispatchEvent(
                new CustomEvent(
                    "target-data-changed"
                )
            );

        } catch (error) {

            console.error(
                "Gagal menyimpan target:",
                error
            );


            showTargetToast(
                "Terjadi kesalahan saat menyimpan target."
            );

        }

    }


    async function editTarget(id) {

        try {

            let target =
                await FinanceDB.getRecordById(
                    "targets",
                    id
                );


            if (!target) {
                return;
            }


            target =
                await syncTargetRecord(
                    target
                );


            targetId.value =
                target.id;

            targetName.value =
                target.name;

            targetCategory.value =
                target.category;

            targetAmount.value =
                target.targetAmount;

            targetCurrent.value =
                target.currentAmount;

            targetDeadline.value =
                target.deadline || "";


            targetFormTitle.textContent =
                "Edit Target";

            targetSubmit.textContent =
                "Simpan Perubahan";

            targetCancel.hidden =
                false;


            await updateTargetPreview();


            targetForm.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        } catch (error) {

            console.error(
                "Gagal membuka target:",
                error
            );

        }

    }


    async function deleteTarget(id) {

        try {

            const target =
                await FinanceDB.getRecordById(
                    "targets",
                    id
                );


            if (!target) {
                return;
            }


            const confirmed =
                window.confirm(
                    `Hapus target "${target.name}"?`
                );


            if (!confirmed) {
                return;
            }


            await FinanceDB.deleteRecord(
                "targets",
                id
            );


            if (
                targetId.value === id
            ) {

                await resetTargetForm();

            }


            await renderTargets();


            window.dispatchEvent(
                new CustomEvent(
                    "target-data-changed"
                )
            );


            showTargetToast(
                "Target berhasil dihapus."
            );

        } catch (error) {

            console.error(
                "Gagal menghapus target:",
                error
            );

        }

    }


    targetAmount.addEventListener(
        "input",
        updateTargetPreview
    );


    targetCurrent.addEventListener(
        "input",
        updateTargetPreview
    );


    targetCategory.addEventListener(
        "change",
        updateTargetPreview
    );


    targetForm.addEventListener(
        "submit",
        saveTarget
    );


    targetCancel.addEventListener(
        "click",
        resetTargetForm
    );


    targetList.addEventListener(
        "click",
        (event) => {

            const button =
                event.target.closest(
                    "button[data-target-action]"
                );


            if (!button) {
                return;
            }


            const id =
                button.dataset.id;

            const action =
                button.dataset.targetAction;


            if (
                action === "edit"
            ) {

                editTarget(id);

            }


            if (
                action === "delete"
            ) {

                deleteTarget(id);

            }

        }
    );


    window.addEventListener(
        "finance-data-changed",
        renderTargets
    );


    window.addEventListener(
        "asset-data-changed",
        renderTargets
    );


    window.TargetManager = {
        refresh:
            renderTargets
    };


    resetTargetForm();

    renderTargets();

})();