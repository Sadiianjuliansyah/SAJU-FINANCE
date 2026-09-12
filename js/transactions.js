"use strict";


const transactionForm =
    document.getElementById("transaction-form");

const transactionIdInput =
    document.getElementById("transaction-id");

const transactionDateInput =
    document.getElementById("transaction-date");

const transactionTypeInput =
    document.getElementById("transaction-type");

const transactionAccountInput =
    document.getElementById("transaction-account");

const transactionDescriptionInput =
    document.getElementById("transaction-description");

const transactionAmountInput =
    document.getElementById("transaction-amount");

const transactionNotesInput =
    document.getElementById("transaction-notes");

const transactionList =
    document.getElementById("transaction-list");

const transactionEmptyState =
    document.getElementById("transaction-empty");

const transactionFormTitle =
    document.getElementById("transaction-form-title");

const transactionSubmitButton =
    document.getElementById("transaction-submit");

const transactionCancelButton =
    document.getElementById("transaction-cancel");

const toast =
    document.getElementById("toast");


/*
========================================
FILTER ELEMENTS
========================================
*/

const transactionSearch =
    document.getElementById("transaction-search");

const transactionTypeFilter =
    document.getElementById("transaction-type-filter");

const transactionAccountFilter =
    document.getElementById("transaction-account-filter");

const transactionSort =
    document.getElementById("transaction-sort");

const transactionResultCount =
    document.getElementById("transaction-result-count");

const transactionResetFilter =
    document.getElementById("transaction-reset-filter");


function formatRupiah(value) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(value);

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


function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


function notifyFinanceDataChanged() {

    window.dispatchEvent(
        new CustomEvent(
            "finance-data-changed"
        )
    );

}


function escapeHTML(value) {

    const element =
        document.createElement("div");

    element.textContent =
        value || "";

    return element.innerHTML;

}


function setDefaultTransactionDate() {

    if (!transactionDateInput.value) {

        const today =
            new Date()
                .toLocaleDateString(
                    "en-CA"
                );

        transactionDateInput.value =
            today;

    }

}


function resetTransactionForm() {

    transactionForm.reset();

    transactionIdInput.value = "";

    transactionFormTitle.textContent =
        "Tambah Transaksi";

    transactionSubmitButton.textContent =
        "Simpan Transaksi";

    transactionCancelButton.hidden =
        true;

    setDefaultTransactionDate();

}


/*
========================================
ACCOUNT FILTER
========================================
*/

function populateAccountFilter(
    transactions
) {

    const oldValue =
        transactionAccountFilter.value;


    const accounts = [
        ...new Set(
            transactions
                .map(
                    (transaction) =>
                        transaction.account
                )
                .filter(Boolean)
        )
    ].sort(
        (a, b) =>
            a.localeCompare(
                b,
                "id"
            )
    );


    transactionAccountFilter.innerHTML =
        `
            <option value="all">
                Semua Akun
            </option>
        `;


    accounts.forEach((account) => {

        const option =
            document.createElement("option");

        option.value =
            account;

        option.textContent =
            account;


        transactionAccountFilter.appendChild(
            option
        );

    });


    if (
        accounts.includes(
            oldValue
        )
    ) {

        transactionAccountFilter.value =
            oldValue;

    } else {

        transactionAccountFilter.value =
            "all";

    }

}


/*
========================================
FILTER TRANSACTIONS
========================================
*/

function filterTransactions(
    transactions
) {

    const search =
        transactionSearch.value
            .trim()
            .toLowerCase();

    const type =
        transactionTypeFilter.value;

    const account =
        transactionAccountFilter.value;


    return transactions.filter(
        (transaction) => {

            const matchesSearch =
                !search ||
                transaction.description
                    .toLowerCase()
                    .includes(search) ||
                transaction.account
                    .toLowerCase()
                    .includes(search) ||
                (
                    transaction.notes || ""
                )
                    .toLowerCase()
                    .includes(search);


            const matchesType =
                type === "all" ||
                transaction.type ===
                    type;


            const matchesAccount =
                account === "all" ||
                transaction.account ===
                    account;


            return (
                matchesSearch &&
                matchesType &&
                matchesAccount
            );

        }
    );

}


/*
========================================
SORT TRANSACTIONS
========================================
*/

function sortTransactions(
    transactions
) {

    const sort =
        transactionSort.value;


    transactions.sort(
        (a, b) => {

            if (
                sort === "date-desc"
            ) {

                const difference =
                    new Date(b.date) -
                    new Date(a.date);


                if (
                    difference !== 0
                ) {

                    return difference;

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


            if (
                sort === "date-asc"
            ) {

                const difference =
                    new Date(a.date) -
                    new Date(b.date);


                if (
                    difference !== 0
                ) {

                    return difference;

                }


                return (
                    new Date(
                        a.createdAt || 0
                    ) -
                    new Date(
                        b.createdAt || 0
                    )
                );

            }


            if (
                sort === "amount-desc"
            ) {

                return (
                    Number(b.amount) -
                    Number(a.amount)
                );

            }


            if (
                sort === "amount-asc"
            ) {

                return (
                    Number(a.amount) -
                    Number(b.amount)
                );

            }


            return 0;

        }
    );


    return transactions;

}


/*
========================================
RENDER TRANSACTIONS
========================================
*/

async function renderTransactions() {

    try {

        const allTransactions =
            await FinanceDB.getAllRecords(
                "transactions"
            );


        populateAccountFilter(
            allTransactions
        );


        const filtered =
            filterTransactions(
                allTransactions
            );


        const transactions =
            sortTransactions(
                filtered
            );


        transactionList.innerHTML = "";


        transactionResultCount.textContent =
            `${transactions.length} transaksi`;


        if (
            transactions.length === 0
        ) {

            transactionEmptyState.hidden =
                false;


            const hasFilters =
                transactionSearch.value ||
                transactionTypeFilter.value !==
                    "all" ||
                transactionAccountFilter.value !==
                    "all";


            const emptyTitle =
                transactionEmptyState.querySelector(
                    "h4"
                );

            const emptyText =
                transactionEmptyState.querySelector(
                    "p"
                );


            if (hasFilters) {

                emptyTitle.textContent =
                    "Transaksi tidak ditemukan";

                emptyText.textContent =
                    "Coba ubah pencarian atau filter yang digunakan.";

            } else {

                emptyTitle.textContent =
                    "Belum ada transaksi";

                emptyText.textContent =
                    "Tambahkan transaksi pertama menggunakan formulir di atas.";

            }


            return;

        }


        transactionEmptyState.hidden =
            true;


        transactions.forEach(
            (transaction) => {

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "transaction-card";


                const typeClass =
                    transaction.type ===
                    "PEMASUKAN"
                        ? "income"
                        : "expense";


                const amountPrefix =
                    transaction.type ===
                    "PEMASUKAN"
                        ? "+"
                        : "-";


                card.innerHTML = `
                    <div class="transaction-main">

                        <div class="transaction-icon ${typeClass}">
                            ${
                                transaction.type ===
                                "PEMASUKAN"
                                    ? "↓"
                                    : "↑"
                            }
                        </div>


                        <div class="transaction-info">

                            <div class="transaction-topline">

                                <h4>
                                    ${escapeHTML(
                                        transaction.description
                                    )}
                                </h4>

                                <strong class="${typeClass}">
                                    ${amountPrefix}${formatRupiah(
                                        transaction.amount
                                    )}
                                </strong>

                            </div>


                            <div class="transaction-meta">

                                <span>
                                    ${formatDateIndonesia(
                                        transaction.date
                                    )}
                                </span>

                                <span>
                                    ${escapeHTML(
                                        transaction.account
                                    )}
                                </span>

                                <span>
                                    ${transaction.type}
                                </span>

                            </div>


                            ${
                                transaction.notes
                                    ? `
                                        <p class="transaction-notes">
                                            ${escapeHTML(
                                                transaction.notes
                                            )}
                                        </p>
                                    `
                                    : ""
                            }

                        </div>

                    </div>


                    <div class="transaction-actions">

                        <button
                            class="btn-secondary"
                            data-action="edit"
                            data-id="${transaction.id}"
                        >
                            Edit
                        </button>

                        <button
                            class="btn-danger"
                            data-action="delete"
                            data-id="${transaction.id}"
                        >
                            Hapus
                        </button>

                    </div>
                `;


                transactionList.appendChild(
                    card
                );

            });

    } catch (error) {

        console.error(
            "Gagal menampilkan transaksi:",
            error
        );

    }

}


/*
========================================
SAVE
========================================
*/

async function saveTransaction(
    event
) {

    event.preventDefault();


    const date =
        transactionDateInput.value;

    const type =
        transactionTypeInput.value;

    const account =
        transactionAccountInput.value.trim();

    const description =
        transactionDescriptionInput.value.trim();

    const amount =
        Number(
            transactionAmountInput.value
        );

    const notes =
        transactionNotesInput.value.trim();


    if (
        !date ||
        !type ||
        !account ||
        !description ||
        !amount ||
        amount <= 0
    ) {

        showToast(
            "Lengkapi data transaksi dengan benar."
        );

        return;

    }


    const parsedDate =
        new Date(
            `${date}T00:00:00`
        );


    const existing =
        transactionIdInput.value
            ? await FinanceDB.getRecordById(
                "transactions",
                transactionIdInput.value
            )
            : null;


    const transactionData = {

        id:
            transactionIdInput.value ||
            FinanceDB.createId(),

        date,

        month:
            parsedDate.getMonth() + 1,

        year:
            parsedDate.getFullYear(),

        type,

        account,

        description,

        amount,

        notes,

        createdAt:
            existing?.createdAt ||
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };


    try {

        if (
            transactionIdInput.value
        ) {

            await FinanceDB.updateRecord(
                "transactions",
                transactionData
            );


            showToast(
                "Transaksi berhasil diperbarui."
            );

        } else {

            await FinanceDB.addRecord(
                "transactions",
                transactionData
            );


            showToast(
                "Transaksi berhasil ditambahkan."
            );

        }


        resetTransactionForm();

        await renderTransactions();

        notifyFinanceDataChanged();

    } catch (error) {

        console.error(
            "Gagal menyimpan transaksi:",
            error
        );


        showToast(
            "Terjadi kesalahan saat menyimpan."
        );

    }

}


/*
========================================
EDIT
========================================
*/

async function editTransaction(id) {

    try {

        const transaction =
            await FinanceDB.getRecordById(
                "transactions",
                id
            );


        if (!transaction) {
            return;
        }


        transactionIdInput.value =
            transaction.id;

        transactionDateInput.value =
            transaction.date;

        transactionTypeInput.value =
            transaction.type;

        transactionAccountInput.value =
            transaction.account;

        transactionDescriptionInput.value =
            transaction.description;

        transactionAmountInput.value =
            transaction.amount;

        transactionNotesInput.value =
            transaction.notes || "";


        transactionFormTitle.textContent =
            "Edit Transaksi";

        transactionSubmitButton.textContent =
            "Simpan Perubahan";

        transactionCancelButton.hidden =
            false;


        transactionForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {

        console.error(
            "Gagal membuka transaksi:",
            error
        );

    }

}


/*
========================================
DELETE
========================================
*/

async function deleteTransaction(id) {

    try {

        const transaction =
            await FinanceDB.getRecordById(
                "transactions",
                id
            );


        if (!transaction) {
            return;
        }


        const confirmed =
            window.confirm(
                `Hapus transaksi "${transaction.description}"?`
            );


        if (!confirmed) {
            return;
        }


        await FinanceDB.deleteRecord(
            "transactions",
            id
        );


        if (
            transactionIdInput.value ===
            id
        ) {

            resetTransactionForm();

        }


        await renderTransactions();

        notifyFinanceDataChanged();


        showToast(
            "Transaksi berhasil dihapus."
        );

    } catch (error) {

        console.error(
            "Gagal menghapus transaksi:",
            error
        );

    }

}


/*
========================================
RESET FILTER
========================================
*/

function resetTransactionFilters() {

    transactionSearch.value = "";

    transactionTypeFilter.value =
        "all";

    transactionAccountFilter.value =
        "all";

    transactionSort.value =
        "date-desc";


    renderTransactions();

}


/*
========================================
EVENTS
========================================
*/

transactionForm.addEventListener(
    "submit",
    saveTransaction
);


transactionCancelButton.addEventListener(
    "click",
    resetTransactionForm
);


transactionList.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(
                "button[data-action]"
            );


        if (!button) {
            return;
        }


        const id =
            button.dataset.id;

        const action =
            button.dataset.action;


        if (
            action === "edit"
        ) {

            editTransaction(id);

        }


        if (
            action === "delete"
        ) {

            deleteTransaction(id);

        }

    }
);


transactionSearch.addEventListener(
    "input",
    renderTransactions
);


transactionTypeFilter.addEventListener(
    "change",
    renderTransactions
);


transactionAccountFilter.addEventListener(
    "change",
    renderTransactions
);


transactionSort.addEventListener(
    "change",
    renderTransactions
);


transactionResetFilter.addEventListener(
    "click",
    resetTransactionFilters
);


setDefaultTransactionDate();

renderTransactions();