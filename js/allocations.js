"use strict";


(() => {

    const allocationForm =
        document.getElementById("allocation-form");

    const allocationId =
        document.getElementById("allocation-id");

    const allocationDate =
        document.getElementById("allocation-date");

    const allocationCategory =
        document.getElementById("allocation-category");

    const allocationType =
        document.getElementById("allocation-type");

    const allocationDescription =
        document.getElementById("allocation-description");

    const allocationAmount =
        document.getElementById("allocation-amount");

    const allocationFormTitle =
        document.getElementById("allocation-form-title");

    const allocationSubmit =
        document.getElementById("allocation-submit");

    const allocationCancel =
        document.getElementById("allocation-cancel");

    const allocationList =
        document.getElementById("allocation-list");

    const allocationEmpty =
        document.getElementById("allocation-empty");

    const allocationTotal =
        document.getElementById("allocation-total");

    const allocationCount =
        document.getElementById("allocation-count");

    const allocationPeriodLabel =
        document.getElementById("allocation-period-label");

    const allocationYearFilter =
        document.getElementById("allocation-year-filter");

    const allocationMonthFilter =
        document.getElementById("allocation-month-filter");

    const toast =
        document.getElementById("toast");


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


    function formatDateIndonesia(dateString) {

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


    function showAllocationToast(message) {

        toast.textContent = message;

        toast.classList.add("show");


        setTimeout(() => {

            toast.classList.remove("show");

        }, 2500);

    }


    function setDefaultDate() {

        if (allocationDate.value) {
            return;
        }


        allocationDate.value =
            new Date()
                .toLocaleDateString(
                    "en-CA"
                );

    }


    function resetAllocationForm() {

        allocationForm.reset();

        allocationId.value = "";

        allocationFormTitle.textContent =
            "Tambah Alokasi";

        allocationSubmit.textContent =
            "Simpan Alokasi";

        allocationCancel.hidden = true;

        setDefaultDate();

    }


    function populateYearFilter(
        allocations
    ) {

        const currentYear =
            new Date().getFullYear();

        const oldValue =
            Number(
                allocationYearFilter.value
            );


        const years = [
            ...new Set([
                currentYear,
                ...allocations.map(
                    (allocation) =>
                        Number(
                            allocation.year
                        )
                )
            ])
        ]
            .filter(Number.isFinite)
            .sort(
                (a, b) =>
                    b - a
            );


        allocationYearFilter.innerHTML = "";


        years.forEach((year) => {

            const option =
                document.createElement("option");

            option.value =
                String(year);

            option.textContent =
                String(year);

            allocationYearFilter.appendChild(
                option
            );

        });


        if (
            years.includes(oldValue)
        ) {

            allocationYearFilter.value =
                String(oldValue);

        } else {

            allocationYearFilter.value =
                String(currentYear);

        }

    }


    function getFilteredAllocations(
        allocations
    ) {

        const year =
            Number(
                allocationYearFilter.value
            );

        const month =
            Number(
                allocationMonthFilter.value
            );


        return allocations.filter(
            (allocation) => {

                return (
                    Number(allocation.year) ===
                        year &&
                    Number(allocation.month) ===
                        month
                );

            }
        );

    }


    function updateAllocationSummary(
        allocations
    ) {

        const total =
            allocations.reduce(
                (sum, allocation) =>
                    sum +
                    Number(
                        allocation.amount
                    ),
                0
            );


        allocationTotal.textContent =
            formatRupiah(total);


        allocationCount.textContent =
            `${allocations.length} alokasi`;


        const month =
            Number(
                allocationMonthFilter.value
            );

        const year =
            allocationYearFilter.value;


        allocationPeriodLabel.textContent =
            `${monthNames[month - 1]} ${year}`;

    }


    async function renderAllocations() {

        try {

            const allocations =
                await FinanceDB.getAllRecords(
                    "allocations"
                );


            populateYearFilter(
                allocations
            );


            const filtered =
                getFilteredAllocations(
                    allocations
                );


            filtered.sort(
                (a, b) => {

                    const dateDifference =
                        new Date(b.date) -
                        new Date(a.date);


                    if (dateDifference !== 0) {

                        return dateDifference;

                    }


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


            updateAllocationSummary(
                filtered
            );


            allocationList.innerHTML = "";


            if (
                filtered.length === 0
            ) {

                allocationEmpty.hidden =
                    false;

                return;

            }


            allocationEmpty.hidden =
                true;


            filtered.forEach(
                (allocation) => {

                    const card =
                        document.createElement(
                            "article"
                        );


                    card.className =
                        "allocation-card";


                    card.innerHTML = `
                        <div class="allocation-main">

                            <div class="allocation-icon">
                                ◫
                            </div>

                            <div class="allocation-info">

                                <div class="allocation-title">

                                    <div>
                                        <h4>
                                            ${escapeHTML(
                                                allocation.description
                                            )}
                                        </h4>

                                        <span>
                                            ${escapeHTML(
                                                allocation.category
                                            )}
                                        </span>
                                    </div>

                                    <strong>
                                        ${formatRupiah(
                                            allocation.amount
                                        )}
                                    </strong>

                                </div>

                                <div class="allocation-meta">

                                    <span>
                                        ${formatDateIndonesia(
                                            allocation.date
                                        )}
                                    </span>

                                    <span>
                                        ${escapeHTML(
                                            allocation.type
                                        )}
                                    </span>

                                </div>

                            </div>

                        </div>


                        <div class="allocation-actions">

                            <button
                                class="btn-secondary"
                                data-allocation-action="edit"
                                data-id="${allocation.id}"
                            >
                                Edit
                            </button>

                            <button
                                class="btn-danger"
                                data-allocation-action="delete"
                                data-id="${allocation.id}"
                            >
                                Hapus
                            </button>

                        </div>
                    `;


                    allocationList.appendChild(
                        card
                    );

                }
            );

        } catch (error) {

            console.error(
                "Gagal menampilkan alokasi:",
                error
            );

        }

    }


    async function saveAllocation(
        event
    ) {

        event.preventDefault();


        const date =
            allocationDate.value;

        const category =
            allocationCategory.value.trim();

        const type =
            allocationType.value.trim();

        const description =
            allocationDescription.value.trim();

        const amount =
            Number(
                allocationAmount.value
            );


        if (
            !date ||
            !category ||
            !type ||
            !description ||
            !amount ||
            amount <= 0
        ) {

            showAllocationToast(
                "Lengkapi data alokasi dengan benar."
            );

            return;

        }


        const parsedDate =
            new Date(
                `${date}T00:00:00`
            );


        const existing =
            allocationId.value
                ? await FinanceDB.getRecordById(
                    "allocations",
                    allocationId.value
                )
                : null;


        const data = {

            id:
                allocationId.value ||
                FinanceDB.createId(),

            date,

            month:
                parsedDate.getMonth() + 1,

            year:
                parsedDate.getFullYear(),

            category,

            type,

            description,

            amount,

            createdAt:
                existing?.createdAt ||
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };


        try {

            if (
                allocationId.value
            ) {

                await FinanceDB.updateRecord(
                    "allocations",
                    data
                );


                showAllocationToast(
                    "Alokasi berhasil diperbarui."
                );

            } else {

                await FinanceDB.addRecord(
                    "allocations",
                    data
                );


                showAllocationToast(
                    "Alokasi berhasil ditambahkan."
                );

            }


            allocationYearFilter.value =
                String(data.year);

            allocationMonthFilter.value =
                String(data.month);


            resetAllocationForm();

            await renderAllocations();


            window.dispatchEvent(
                new CustomEvent(
                    "allocation-data-changed"
                )
            );

        } catch (error) {

            console.error(
                "Gagal menyimpan alokasi:",
                error
            );


            showAllocationToast(
                "Terjadi kesalahan saat menyimpan alokasi."
            );

        }

    }


    async function editAllocation(
        id
    ) {

        try {

            const allocation =
                await FinanceDB.getRecordById(
                    "allocations",
                    id
                );


            if (!allocation) {
                return;
            }


            allocationId.value =
                allocation.id;

            allocationDate.value =
                allocation.date;

            allocationCategory.value =
                allocation.category;

            allocationType.value =
                allocation.type;

            allocationDescription.value =
                allocation.description;

            allocationAmount.value =
                allocation.amount;


            allocationFormTitle.textContent =
                "Edit Alokasi";

            allocationSubmit.textContent =
                "Simpan Perubahan";

            allocationCancel.hidden =
                false;


            allocationForm.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        } catch (error) {

            console.error(
                "Gagal membuka alokasi:",
                error
            );

        }

    }


    async function deleteAllocation(
        id
    ) {

        try {

            const allocation =
                await FinanceDB.getRecordById(
                    "allocations",
                    id
                );


            if (!allocation) {
                return;
            }


            const confirmed =
                window.confirm(
                    `Hapus alokasi "${allocation.description}"?`
                );


            if (!confirmed) {
                return;
            }


            await FinanceDB.deleteRecord(
                "allocations",
                id
            );


            if (
                allocationId.value === id
            ) {

                resetAllocationForm();

            }


            await renderAllocations();


            window.dispatchEvent(
                new CustomEvent(
                    "allocation-data-changed"
                )
            );


            showAllocationToast(
                "Alokasi berhasil dihapus."
            );

        } catch (error) {

            console.error(
                "Gagal menghapus alokasi:",
                error
            );

        }

    }


    allocationForm.addEventListener(
        "submit",
        saveAllocation
    );


    allocationCancel.addEventListener(
        "click",
        resetAllocationForm
    );


    allocationYearFilter.addEventListener(
        "change",
        renderAllocations
    );


    allocationMonthFilter.addEventListener(
        "change",
        renderAllocations
    );


    allocationList.addEventListener(
        "click",
        (event) => {

            const button =
                event.target.closest(
                    "button[data-allocation-action]"
                );


            if (!button) {
                return;
            }


            const id =
                button.dataset.id;

            const action =
                button.dataset.allocationAction;


            if (
                action === "edit"
            ) {

                editAllocation(id);

            }


            if (
                action === "delete"
            ) {

                deleteAllocation(id);

            }

        }
    );


    const now =
        new Date();


    allocationMonthFilter.value =
        String(
            now.getMonth() + 1
        );


    setDefaultDate();

    renderAllocations();

})();