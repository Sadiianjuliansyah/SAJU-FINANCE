"use strict";


(() => {

    const exportBackupButton =
        document.getElementById("export-backup-button");

    const importBackupButton =
        document.getElementById("import-backup-button");

    const importBackupInput =
        document.getElementById("import-backup-input");

    const exportCsvButton =
        document.getElementById("export-csv-button");

    const deleteAllButton =
        document.getElementById("delete-all-data-button");

    const backupStatus =
        document.getElementById("backup-status");

    const toast =
        document.getElementById("toast");


    const BACKUP_FORMAT =
        "personal-finance-tracker";

    const BACKUP_VERSION =
        1;


    function showBackupToast(message) {

        toast.textContent =
            message;

        toast.classList.add(
            "show"
        );


        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3000);

    }


    function formatFileDate() {

        const now =
            new Date();


        const year =
            now.getFullYear();

        const month =
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        const day =
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            );

        const hour =
            String(
                now.getHours()
            ).padStart(
                2,
                "0"
            );

        const minute =
            String(
                now.getMinutes()
            ).padStart(
                2,
                "0"
            );


        return (
            `${year}-${month}-${day}_${hour}-${minute}`
        );

    }


    function downloadFile(
        content,
        fileName,
        mimeType
    ) {

        const blob =
            new Blob(
                [content],
                {
                    type: mimeType
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;

        link.download =
            fileName;


        document.body.appendChild(
            link
        );


        link.click();

        link.remove();


        setTimeout(() => {

            URL.revokeObjectURL(
                url
            );

        }, 1000);

    }


    async function getStoreNames() {

        const db =
            await FinanceDB.openDatabase();


        return Array.from(
            db.objectStoreNames
        );

    }


    async function buildBackup() {

        const storeNames =
            await getStoreNames();


        const stores = {};


        for (
            const storeName
            of storeNames
        ) {

            stores[storeName] =
                await FinanceDB.getAllRecords(
                    storeName
                );

        }


        return {

            backupFormat:
                BACKUP_FORMAT,

            backupVersion:
                BACKUP_VERSION,

            databaseName:
                "SajuFinanceDB",

            createdAt:
                new Date().toISOString(),

            stores

        };

    }


    async function exportBackup() {

        try {

            backupStatus.textContent =
                "Membuat backup...";


            const backup =
                await buildBackup();


            const json =
                JSON.stringify(
                    backup,
                    null,
                    2
                );


            const fileName =
                `personal-finance-backup_${formatFileDate()}.json`;


            downloadFile(
                json,
                fileName,
                "application/json;charset=utf-8"
            );


            backupStatus.textContent =
                "Backup berhasil dibuat.";


            showBackupToast(
                "Backup JSON berhasil dibuat."
            );

        } catch (error) {

            console.error(
                "Gagal membuat backup:",
                error
            );


            backupStatus.textContent =
                "Backup gagal dibuat.";


            showBackupToast(
                "Gagal membuat backup."
            );

        }

    }


    function validateBackup(data) {

        if (
            !data ||
            typeof data !== "object"
        ) {

            return false;

        }


        if (
            data.backupFormat !==
            BACKUP_FORMAT
        ) {

            return false;

        }


        if (
            typeof data.stores !==
            "object" ||
            data.stores === null
        ) {

            return false;

        }


        return true;

    }


    async function restoreDatabase(
        backup
    ) {

        const db =
            await FinanceDB.openDatabase();


        const storeNames =
            Array.from(
                db.objectStoreNames
            );


        return new Promise(
            (resolve, reject) => {

                const transaction =
                    db.transaction(
                        storeNames,
                        "readwrite"
                    );


                transaction.oncomplete =
                    () => {

                        resolve(true);

                    };


                transaction.onerror =
                    () => {

                        reject(
                            transaction.error
                        );

                    };


                transaction.onabort =
                    () => {

                        reject(
                            transaction.error ||
                            new Error(
                                "Restore dibatalkan."
                            )
                        );

                    };


                storeNames.forEach(
                    (storeName) => {

                        const store =
                            transaction.objectStore(
                                storeName
                            );


                        store.clear();


                        const records =
                            Array.isArray(
                                backup.stores[
                                    storeName
                                ]
                            )
                                ? backup.stores[
                                    storeName
                                ]
                                : [];


                        records.forEach(
                            (record) => {

                                store.put(
                                    record
                                );

                            }
                        );

                    }
                );

            }
        );

    }


    async function importBackup(
        file
    ) {

        try {

            backupStatus.textContent =
                "Membaca file backup...";


            const text =
                await file.text();


            const backup =
                JSON.parse(
                    text
                );


            if (
                !validateBackup(
                    backup
                )
            ) {

                throw new Error(
                    "Format backup tidak valid."
                );

            }


            const confirmed =
                window.confirm(
                    "Restore akan mengganti seluruh data lokal di perangkat ini dengan isi file backup.\n\nLanjutkan restore?"
                );


            if (!confirmed) {

                backupStatus.textContent =
                    "Restore dibatalkan.";

                return;

            }


            backupStatus.textContent =
                "Memulihkan database...";


            await restoreDatabase(
                backup
            );


            backupStatus.textContent =
                "Restore berhasil.";


            showBackupToast(
                "Database berhasil dipulihkan."
            );


            setTimeout(() => {

                window.location.reload();

            }, 1200);

        } catch (error) {

            console.error(
                "Gagal restore backup:",
                error
            );


            backupStatus.textContent =
                "Restore gagal. File tidak valid atau rusak.";


            showBackupToast(
                "Gagal mengimpor backup."
            );

        } finally {

            importBackupInput.value =
                "";

        }

    }


    function escapeCsv(value) {

        const text =
            String(
                value ?? ""
            );


        return (
            `"${text.replace(
                /"/g,
                '""'
            )}"`
        );

    }


    async function exportTransactionsCsv() {

        try {

            const transactions =
                await FinanceDB.getAllRecords(
                    "transactions"
                );


            if (
                transactions.length === 0
            ) {

                showBackupToast(
                    "Belum ada transaksi untuk diekspor."
                );

                return;

            }


            transactions.sort(
                (a, b) =>
                    new Date(a.date) -
                    new Date(b.date)
            );


            const header = [
                "ID",
                "Tanggal",
                "Bulan",
                "Tahun",
                "Jenis Transaksi",
                "Jenis Akun",
                "Deskripsi",
                "Nominal",
                "Catatan"
            ];


            const rows =
                transactions.map(
                    (transaction) => {

                        return [
                            transaction.id,
                            transaction.date,
                            transaction.month,
                            transaction.year,
                            transaction.type,
                            transaction.account,
                            transaction.description,
                            transaction.amount,
                            transaction.notes || ""
                        ];

                    }
                );


            const csv =
                [
                    header,
                    ...rows
                ]
                    .map(
                        (row) =>
                            row
                                .map(
                                    escapeCsv
                                )
                                .join(",")
                    )
                    .join("\r\n");


            /*
            UTF-8 BOM membantu Excel
            membaca karakter Indonesia dengan benar.
            */
            const csvWithBom =
                "\uFEFF" + csv;


            downloadFile(
                csvWithBom,
                `transaksi_${formatFileDate()}.csv`,
                "text/csv;charset=utf-8"
            );


            showBackupToast(
                "CSV transaksi berhasil dibuat."
            );

        } catch (error) {

            console.error(
                "Gagal export CSV:",
                error
            );


            showBackupToast(
                "Gagal mengekspor transaksi."
            );

        }

    }


    async function clearAllStores() {

        const db =
            await FinanceDB.openDatabase();


        const storeNames =
            Array.from(
                db.objectStoreNames
            );


        return new Promise(
            (resolve, reject) => {

                const transaction =
                    db.transaction(
                        storeNames,
                        "readwrite"
                    );


                transaction.oncomplete =
                    () => {

                        resolve(true);

                    };


                transaction.onerror =
                    () => {

                        reject(
                            transaction.error
                        );

                    };


                transaction.onabort =
                    () => {

                        reject(
                            transaction.error
                        );

                    };


                storeNames.forEach(
                    (storeName) => {

                        transaction
                            .objectStore(
                                storeName
                            )
                            .clear();

                    }
                );

            }
        );

    }


    async function deleteAllData() {

        const confirmed =
            window.confirm(
                "PERINGATAN\n\nSemua transaksi, aset, alokasi, target, kategori, akun, dan settings lokal akan dihapus.\n\nTindakan ini tidak dapat dibatalkan kecuali kamu memiliki file backup.\n\nHapus semua data?"
            );


        if (!confirmed) {
            return;
        }


        try {

            backupStatus.textContent =
                "Menghapus seluruh data...";


            await clearAllStores();


            backupStatus.textContent =
                "Semua data berhasil dihapus.";


            showBackupToast(
                "Seluruh data lokal berhasil dihapus."
            );


            setTimeout(() => {

                window.location.reload();

            }, 1200);

        } catch (error) {

            console.error(
                "Gagal menghapus database:",
                error
            );


            backupStatus.textContent =
                "Gagal menghapus data.";


            showBackupToast(
                "Terjadi kesalahan saat menghapus data."
            );

        }

    }


    exportBackupButton.addEventListener(
        "click",
        exportBackup
    );


    importBackupButton.addEventListener(
        "click",
        () => {

            importBackupInput.click();

        }
    );


    importBackupInput.addEventListener(
        "change",
        () => {

            const file =
                importBackupInput.files[0];


            if (!file) {
                return;
            }


            importBackup(
                file
            );

        }
    );


    exportCsvButton.addEventListener(
        "click",
        exportTransactionsCsv
    );


    deleteAllButton.addEventListener(
        "click",
        deleteAllData
    );

})();