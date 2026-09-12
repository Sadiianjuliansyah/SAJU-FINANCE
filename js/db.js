"use strict";


const DB_NAME = "SajuFinanceDB";
const DB_VERSION = 1;


/*
========================================
MEMBUKA DATABASE
========================================
*/

function openDatabase() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );


        request.onupgradeneeded = (event) => {

            const db = event.target.result;


            /*
            ========================================
            TRANSACTIONS
            ========================================
            */

            if (!db.objectStoreNames.contains("transactions")) {

                const store = db.createObjectStore(
                    "transactions",
                    {
                        keyPath: "id"
                    }
                );

                store.createIndex(
                    "date",
                    "date",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "month",
                    "month",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "year",
                    "year",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "type",
                    "type",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "account",
                    "account",
                    {
                        unique: false
                    }
                );

            }


            /*
            ========================================
            ASSETS
            ========================================
            */

            if (!db.objectStoreNames.contains("assets")) {

                const store = db.createObjectStore(
                    "assets",
                    {
                        keyPath: "id"
                    }
                );

                store.createIndex(
                    "period",
                    "period",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "month",
                    "month",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "year",
                    "year",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "category",
                    "category",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "name",
                    "name",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "platform",
                    "platform",
                    {
                        unique: false
                    }
                );

            }


            /*
            ========================================
            ALLOCATIONS
            ========================================
            */

            if (!db.objectStoreNames.contains("allocations")) {

                const store = db.createObjectStore(
                    "allocations",
                    {
                        keyPath: "id"
                    }
                );

                store.createIndex(
                    "date",
                    "date",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "month",
                    "month",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "year",
                    "year",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "category",
                    "category",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "type",
                    "type",
                    {
                        unique: false
                    }
                );

            }


            /*
            ========================================
            TARGETS
            ========================================
            */

            if (!db.objectStoreNames.contains("targets")) {

                const store = db.createObjectStore(
                    "targets",
                    {
                        keyPath: "id"
                    }
                );

                store.createIndex(
                    "category",
                    "category",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "status",
                    "status",
                    {
                        unique: false
                    }
                );

            }


            /*
            ========================================
            CATEGORIES
            ========================================
            */

            if (!db.objectStoreNames.contains("categories")) {

                const store = db.createObjectStore(
                    "categories",
                    {
                        keyPath: "id"
                    }
                );

                store.createIndex(
                    "group",
                    "group",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "name",
                    "name",
                    {
                        unique: false
                    }
                );

            }


            /*
            ========================================
            ACCOUNTS
            ========================================
            */

            if (!db.objectStoreNames.contains("accounts")) {

                const store = db.createObjectStore(
                    "accounts",
                    {
                        keyPath: "id"
                    }
                );

                store.createIndex(
                    "name",
                    "name",
                    {
                        unique: false
                    }
                );

            }


            /*
            ========================================
            SETTINGS
            ========================================
            */

            if (!db.objectStoreNames.contains("settings")) {

                db.createObjectStore(
                    "settings",
                    {
                        keyPath: "key"
                    }
                );

            }

        };


        request.onsuccess = () => {

            resolve(request.result);

        };


        request.onerror = () => {

            reject(request.error);

        };

    });

}


/*
========================================
MEMBUAT ID UNIK
========================================
*/

function createId() {

    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {

        return crypto.randomUUID();

    }


    return (
        Date.now().toString(36) +
        Math.random().toString(36).substring(2)
    );

}


/*
========================================
TAMBAH DATA
========================================
*/

async function addRecord(
    storeName,
    data
) {

    const db = await openDatabase();

    const record = {
        ...data,
        id: data.id || createId()
    };


    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            storeName,
            "readwrite"
        );

        const store =
            transaction.objectStore(storeName);

        const request =
            store.add(record);


        request.onsuccess = () => {

            resolve(record);

        };


        request.onerror = () => {

            reject(request.error);

        };

    });

}


/*
========================================
AMBIL SEMUA DATA
========================================
*/

async function getAllRecords(storeName) {

    const db = await openDatabase();


    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            storeName,
            "readonly"
        );

        const store =
            transaction.objectStore(storeName);

        const request =
            store.getAll();


        request.onsuccess = () => {

            resolve(request.result);

        };


        request.onerror = () => {

            reject(request.error);

        };

    });

}


/*
========================================
AMBIL DATA BERDASARKAN ID
========================================
*/

async function getRecordById(
    storeName,
    id
) {

    const db = await openDatabase();


    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            storeName,
            "readonly"
        );

        const store =
            transaction.objectStore(storeName);

        const request =
            store.get(id);


        request.onsuccess = () => {

            resolve(request.result);

        };


        request.onerror = () => {

            reject(request.error);

        };

    });

}


/*
========================================
UPDATE DATA
========================================
*/

async function updateRecord(
    storeName,
    data
) {

    const db = await openDatabase();


    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            storeName,
            "readwrite"
        );

        const store =
            transaction.objectStore(storeName);

        const request =
            store.put(data);


        request.onsuccess = () => {

            resolve(data);

        };


        request.onerror = () => {

            reject(request.error);

        };

    });

}


/*
========================================
HAPUS DATA
========================================
*/

async function deleteRecord(
    storeName,
    id
) {

    const db = await openDatabase();


    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            storeName,
            "readwrite"
        );

        const store =
            transaction.objectStore(storeName);

        const request =
            store.delete(id);


        request.onsuccess = () => {

            resolve(true);

        };


        request.onerror = () => {

            reject(request.error);

        };

    });

}


/*
========================================
AKSES DATABASE UNTUK FILE LAIN
========================================
*/

window.FinanceDB = {
    openDatabase,
    createId,
    addRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord
};