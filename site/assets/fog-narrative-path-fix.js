(() => {
    "use strict";

    const oldPath =
        "/assets/badges/misterio-neblina-roraima.png";

    const newPath =
        "/assets/campaign/roraima-expedition-products-2026.png?v=20260911e";

    function fixFogImage() {
        const modal = document.querySelector("#easterEggModal");

        if (!modal) {
            return;
        }

        const image = modal.querySelector(
            ".easterVisual, img"
        );

        if (!image) {
            return;
        }

        const currentSource =
            image.getAttribute("src") || "";

        if (
            currentSource === oldPath ||
            currentSource.includes(
                "misterio-neblina-roraima.png"
            )
        ) {
            image.setAttribute("src", newPath);
            image.removeAttribute("srcset");
        }

        image.setAttribute(
            "data-fog-narrative",
            "true"
        );

        image.setAttribute(
            "alt",
            "Expedição no Monte Roraima com produtos LG integrados à paisagem"
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            fixFogImage,
            { once: true }
        );
    }
    else {
        fixFogImage();
    }

    document.addEventListener(
        "click",
        function () {
            window.setTimeout(
                fixFogImage,
                0
            );
        },
        true
    );
})();