"use strict";


const CACHE_NAME =
    "saju-finance-v7";


const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json",

    "./css/style.css",

    "./js/db.js",
    "./js/dashboard.js",
    "./js/transactions.js",
    "./js/assets.js",
    "./js/assets-dashboard.js",
    "./js/allocations.js",
    "./js/targets.js",
    "./js/reports.js",
    "./js/backup.js",
    "./js/app.js",

    "./assets/icons/saju-app-icon.svg",
    "./assets/icons/saju-icon-192.png",
    "./assets/icons/saju-icon-512.png",
    "./assets/icons/saju-apple-touch-icon.png"
];


const CHART_JS_URL =
    "https://cdn.jsdelivr.net/npm/chart.js";


/*
========================================
INSTALL
========================================
*/

self.addEventListener(
    "install",
    (event) => {

        event.waitUntil(

            (async () => {

                const cache =
                    await caches.open(
                        CACHE_NAME
                    );


                /*
                Cache seluruh file utama aplikasi.
                */
                await cache.addAll(
                    APP_FILES
                );


                /*
                Chart.js masih berasal dari CDN.
                Kita coba cache agar grafik tetap
                tersedia ketika offline.
                */
                try {

                    await cache.add(
                        CHART_JS_URL
                    );

                } catch (error) {

                    console.warn(
                        "Chart.js belum berhasil dicache.",
                        error
                    );

                }


                await self.skipWaiting();

            })()

        );

    }
);


/*
========================================
ACTIVATE
========================================
*/

self.addEventListener(
    "activate",
    (event) => {

        event.waitUntil(

            (async () => {

                const cacheNames =
                    await caches.keys();


                await Promise.all(

                    cacheNames
                        .filter(
                            (cacheName) =>
                                cacheName !==
                                CACHE_NAME
                        )
                        .map(
                            (cacheName) =>
                                caches.delete(
                                    cacheName
                                )
                        )

                );


                await self.clients.claim();

            })()

        );

    }
);


/*
========================================
FETCH
========================================
*/

self.addEventListener(
    "fetch",
    (event) => {

        if (
            event.request.method !==
            "GET"
        ) {

            return;

        }


        event.respondWith(

            (async () => {

                const cachedResponse =
                    await caches.match(
                        event.request
                    );


                if (cachedResponse) {

                    return cachedResponse;

                }


                try {

                    const networkResponse =
                        await fetch(
                            event.request
                        );


                    const cache =
                        await caches.open(
                            CACHE_NAME
                        );


                    cache.put(
                        event.request,
                        networkResponse.clone()
                    );


                    return networkResponse;

                } catch (error) {

                    /*
                    Jika request halaman gagal,
                    gunakan halaman utama.
                    */
                    if (
                        event.request.mode ===
                        "navigate"
                    ) {

                        return caches.match(
                            "./index.html"
                        );

                    }


                    throw error;

                }

            })()

        );

    }
);