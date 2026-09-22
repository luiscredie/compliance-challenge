(() => {
    "use strict";

    const pageName = location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    if (pageName === "camp.html") {
        document.body.dataset.uiPage = "camp";
    }

    if (pageName === "onboarding-detective.html") {
        document.body.dataset.uiPage = "onboarding-detective";
    }

    if (
        pageName === "" ||
        pageName === "index.html"
    ) {
        const fogModal = document.querySelector("#easterEggModal");

        if (fogModal) {
            const fogImage = fogModal.querySelector(
                ".easterVisual, img"
            );

            if (fogImage) {
                fogImage.src =
                    "/assets/campaign/roraima-expedition-products-2026.png?v=20260911d";

                fogImage.removeAttribute("srcset");
                fogImage.dataset.fogNarrative = "true";

                fogImage.alt =
                    "Expedição no Monte Roraima com produtos LG integrados à paisagem";
            }
        }
    }
})();