"use strict";


const pageTitles = {
    dashboard: "Dashboard",
    transactions: "Transaksi",
    assets: "Aset",
    allocations: "Alokasi",
    targets: "Target",
    reports: "Laporan & Statistik",
    settings: "Backup & Settings"
};


const pages = document.querySelectorAll(".page");

const desktopNavItems =
    document.querySelectorAll(".nav-item");

const mobileNavItems =
    document.querySelectorAll(".mobile-nav-item");

const pageTitle =
    document.getElementById("page-title");

const currentDate =
    document.getElementById("current-date");


function openPage(pageName) {

    pages.forEach((page) => {
        page.classList.remove("active");
    });


    const selectedPage =
        document.getElementById(pageName);


    if (!selectedPage) {
        return;
    }


    selectedPage.classList.add("active");


    desktopNavItems.forEach((item) => {

        item.classList.toggle(
            "active",
            item.dataset.page === pageName
        );

    });


    mobileNavItems.forEach((item) => {

        item.classList.toggle(
            "active",
            item.dataset.page === pageName
        );

    });


    pageTitle.textContent =
        pageTitles[pageName] || "Saju Finance";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function setupNavigation() {

    const navigationItems = [
        ...desktopNavItems,
        ...mobileNavItems
    ];


    navigationItems.forEach((item) => {

        item.addEventListener("click", () => {

            const pageName =
                item.dataset.page;

            openPage(pageName);

        });

    });

}


function updateDate() {

    const now = new Date();


    currentDate.textContent =
        new Intl.DateTimeFormat(
            "id-ID",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        ).format(now);

}

async function registerServiceWorker() {

    if (!("serviceWorker" in navigator)) {

        console.warn(
            "Service Worker tidak didukung browser ini."
        );

        return;

    }


    try {

        const registration =
            await navigator.serviceWorker.register(
                "./service-worker.js"
            );


        console.log(
            "Service Worker berhasil didaftarkan:",
            registration.scope
        );

    } catch (error) {

        console.error(
            "Service Worker gagal didaftarkan:",
            error
        );

    }

}

const THEME_STORAGE_KEY =
    "personal-finance-theme";


function getSavedTheme() {

    return (
        localStorage.getItem(
            THEME_STORAGE_KEY
        ) || "system"
    );

}


function getSystemTheme() {

    return window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches
        ? "dark"
        : "light";

}


function applyTheme(theme) {

    const finalTheme =
        theme === "system"
            ? getSystemTheme()
            : theme;


    document.documentElement.setAttribute(
        "data-theme",
        finalTheme
    );


    document
        .querySelectorAll(
            ".theme-option"
        )
        .forEach((button) => {

            button.classList.toggle(
                "active",
                button.dataset.themeValue ===
                    theme
            );

        });


    const themeMeta =
        document.querySelector(
            'meta[name="theme-color"]'
        );


    if (themeMeta) {

        themeMeta.setAttribute(
            "content",
            finalTheme === "dark"
                ? "#0b1220"
                : "#f5f7fb"
        );

    }

}


function saveTheme(theme) {

    localStorage.setItem(
        THEME_STORAGE_KEY,
        theme
    );


    applyTheme(theme);

}


function setupTheme() {

    const savedTheme =
        getSavedTheme();


    applyTheme(
        savedTheme
    );


    document
        .querySelectorAll(
            ".theme-option"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    saveTheme(
                        button.dataset.themeValue
                    );

                }
            );

        });


    window
        .matchMedia(
            "(prefers-color-scheme: dark)"
        )
        .addEventListener(
            "change",
            () => {

                if (
                    getSavedTheme() ===
                    "system"
                ) {

                    applyTheme(
                        "system"
                    );

                }

            }
        );

}

async function initApp() {

    try {

        await FinanceDB.openDatabase();

        setupNavigation();

updateDate();

setupTheme();

registerServiceWorker();

        console.log(
            "Saju Finance berhasil dijalankan."
        );

        console.log(
            "IndexedDB berhasil dibuka."
        );

    } catch (error) {

        console.error(
            "Gagal membuka IndexedDB:",
            error
        );

    }

}


initApp();