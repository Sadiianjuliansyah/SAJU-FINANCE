const SAJU_SECURITY = (() => {

    const PIN_HASH_KEY =
        "saju-finance-pin-hash";

    const PIN_SALT_KEY =
        "saju-finance-pin-salt";

    const ITERATIONS = 150000;


    function isValidPin(pin) {

        return /^\d{6}$/.test(pin);

    }


    function bytesToBase64(bytes) {

        let binary = "";

        bytes.forEach((byte) => {

            binary +=
                String.fromCharCode(byte);

        });

        return btoa(binary);

    }


    function base64ToBytes(base64) {

        const binary =
            atob(base64);

        const bytes =
            new Uint8Array(
                binary.length
            );


        for (
            let i = 0;
            i < binary.length;
            i++
        ) {

            bytes[i] =
                binary.charCodeAt(i);

        }


        return bytes;

    }


    async function derivePinHash(
        pin,
        salt
    ) {

        const encoder =
            new TextEncoder();


        const keyMaterial =
            await crypto.subtle.importKey(
                "raw",
                encoder.encode(pin),
                "PBKDF2",
                false,
                ["deriveBits"]
            );


        const derivedBits =
            await crypto.subtle.deriveBits(
                {
                    name: "PBKDF2",
                    salt,
                    iterations:
                        ITERATIONS,
                    hash: "SHA-256"
                },
                keyMaterial,
                256
            );


        return new Uint8Array(
            derivedBits
        );

    }


    function hasPin() {

        return Boolean(

            localStorage.getItem(
                PIN_HASH_KEY
            ) &&

            localStorage.getItem(
                PIN_SALT_KEY
            )

        );

    }


    async function createPin(pin) {

        if (!isValidPin(pin)) {

            throw new Error(
                "PIN harus terdiri dari tepat 6 digit."
            );

        }


        const salt =
            crypto.getRandomValues(
                new Uint8Array(16)
            );


        const hash =
            await derivePinHash(
                pin,
                salt
            );


        localStorage.setItem(
            PIN_SALT_KEY,
            bytesToBase64(salt)
        );


        localStorage.setItem(
            PIN_HASH_KEY,
            bytesToBase64(hash)
        );


        return true;

    }


    async function verifyPin(pin) {

        if (!isValidPin(pin)) {

            return false;

        }


        const savedSalt =
            localStorage.getItem(
                PIN_SALT_KEY
            );


        const savedHash =
            localStorage.getItem(
                PIN_HASH_KEY
            );


        if (
            !savedSalt ||
            !savedHash
        ) {

            return false;

        }


        const salt =
            base64ToBytes(
                savedSalt
            );


        const enteredHash =
            await derivePinHash(
                pin,
                salt
            );


        const storedHash =
            base64ToBytes(
                savedHash
            );


        if (
            enteredHash.length !==
            storedHash.length
        ) {

            return false;

        }


        let difference = 0;


        for (
            let i = 0;
            i < enteredHash.length;
            i++
        ) {

            difference |=
                enteredHash[i] ^
                storedHash[i];

        }


        return difference === 0;

    }


    function removePin() {

        localStorage.removeItem(
            PIN_HASH_KEY
        );

        localStorage.removeItem(
            PIN_SALT_KEY
        );

    }


    return {

        isValidPin,
        hasPin,
        createPin,
        verifyPin,
        removePin

    };

})();


window.SajuSecurity =
    SAJU_SECURITY;


/* ========================================
   LOCK SCREEN CONTROLLER
======================================== */

function setupSecurityLock() {

    const lockScreen =
        document.getElementById(
            "security-lock-screen"
        );

    const title =
        document.getElementById(
            "security-lock-title"
        );

    const description =
        document.getElementById(
            "security-lock-description"
        );

    const form =
        document.getElementById(
            "security-pin-form"
        );

    const pinInput =
        document.getElementById(
            "security-pin-input"
        );

    const confirmInput =
        document.getElementById(
            "security-pin-confirm"
        );

    const errorText =
        document.getElementById(
            "security-lock-error"
        );

    const button =
        document.getElementById(
            "security-unlock-button"
        );


    if (
        !lockScreen ||
        !form ||
        !pinInput ||
        !confirmInput ||
        !button
    ) {

        return;

    }


    const setupMode =
        !SajuSecurity.hasPin();


    if (setupMode) {

        title.textContent =
            "Buat PIN Saju Finance";

        description.textContent =
            "Buat PIN 6 digit untuk mengunci aplikasi di perangkat ini.";

        pinInput.placeholder =
            "PIN 6 digit";

        confirmInput.hidden =
            false;

        button.textContent =
            "Buat PIN";

    } else {

        title.textContent =
            "Saju Finance Terkunci";

        description.textContent =
            "Masukkan PIN 6 digit untuk membuka aplikasi.";

        confirmInput.hidden =
            true;

        button.textContent =
            "Buka Saju Finance";

    }


    pinInput.focus();


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            errorText.textContent =
                "";


            const pin =
                pinInput.value.trim();


            if (
                !SajuSecurity.isValidPin(
                    pin
                )
            ) {

                errorText.textContent =
                    "PIN harus tepat 6 digit angka.";

                return;

            }


            button.disabled =
                true;


            try {

                if (setupMode) {

                    const confirmation =
                        confirmInput.value.trim();


                    if (
                        pin !==
                        confirmation
                    ) {

                        errorText.textContent =
                            "Konfirmasi PIN tidak sama.";

                        button.disabled =
                            false;

                        return;

                    }


                    await SajuSecurity.createPin(
                        pin
                    );


                    lockScreen.classList.add(
                        "hidden"
                    );


                    pinInput.value =
                        "";

                    confirmInput.value =
                        "";

                } else {

                    const valid =
                        await SajuSecurity.verifyPin(
                            pin
                        );


                    if (!valid) {

                        errorText.textContent =
                            "PIN salah.";

                        pinInput.value =
                            "";

                        pinInput.focus();

                        button.disabled =
                            false;

                        return;

                    }


                    lockScreen.classList.add(
                        "hidden"
                    );


                    pinInput.value =
                        "";

                }

            } catch (error) {

                console.error(
                    "Security error:",
                    error
                );


                errorText.textContent =
                    "Terjadi kesalahan. Coba lagi.";

            }


            button.disabled =
                false;

        }
    );

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        setupSecurityLock
    );

} else {

    setupSecurityLock();

}