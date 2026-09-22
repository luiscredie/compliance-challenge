
(() => {
    "use strict";

    function closeFogModal() {
        if (
            typeof window.closeFogEasterEgg ===
            "function"
        ) {
            window.closeFogEasterEgg();
            return;
        }

        const modal =
            document.querySelector("#easterEggModal");

        if (modal) {
            modal.classList.add("hidden");
            modal.setAttribute(
                "aria-hidden",
                "true"
            );
        }
    }

    function configureFogModal() {
        const modal =
            document.querySelector("#easterEggModal");

        if (!modal) {
            return false;
        }

        const card =
            modal.querySelector(".easterCard");

        if (!card) {
            return false;
        }

        /*
          Mantém a imagem narrativa correta.
        */

        const image =
            card.querySelector(".easterVisual");

        if (image) {
            image.src =
                "/assets/easter-neblina.webp?v=20260915f";

            image.removeAttribute("srcset");
        }

        /*
          Remove fisicamente botões inferiores antigos.
        */

        card.querySelectorAll("button").forEach(
            (button) => {
                if (
                    button.dataset.fogCloseFinal ===
                    "true"
                ) {
                    return;
                }

                if (
                    button.dataset.fogImageContinue ===
                    "true"
                ) {
                    return;
                }

                button.remove();
            }
        );

        /*
          O texto inferior também não é necessário, porque
          a narrativa já está incorporada na arte.
        */

        const copy =
            card.querySelector(".easterCopy");

        if (copy) {
            copy.remove();
        }

        /*
          X único no topo direito.
        */

        let closeButton =
            card.querySelector(
                "[data-fog-close-final='true']"
            );

        if (!closeButton) {
            closeButton =
                document.createElement("button");

            closeButton.type = "button";
            closeButton.dataset.fogCloseFinal =
                "true";

            closeButton.setAttribute(
                "aria-label",
                "Fechar"
            );

            closeButton.textContent = "×";

            closeButton.addEventListener(
                "click",
                closeFogModal
            );

            card.appendChild(closeButton);
        }

        /*
          Área clicável sobre o botão CONTINUAR desenhado
          na própria imagem.
        */

        let imageContinue =
            card.querySelector(
                "[data-fog-image-continue='true']"
            );

        if (!imageContinue) {
            imageContinue =
                document.createElement("button");

            imageContinue.type = "button";

            imageContinue.dataset.fogImageContinue =
                "true";

            imageContinue.setAttribute(
                "aria-label",
                "Continuar a expedição"
            );

            imageContinue.title =
                "Continuar a expedição";

            imageContinue.addEventListener(
                "click",
                closeFogModal
            );

            card.appendChild(imageContinue);
        }

        /*
          Escape continua disponível como comportamento
          de acessibilidade, sem criar outro botão.
        */

        if (
            modal.dataset.fogEscapeConfigured !==
            "true"
        ) {
            modal.dataset.fogEscapeConfigured =
                "true";

            document.addEventListener(
                "keydown",
                (event) => {
                    if (
                        event.key === "Escape" &&
                        !modal.classList.contains(
                            "hidden"
                        )
                    ) {
                        closeFogModal();
                    }
                }
            );
        }

        return true;
    }

    function configureGuardian() {
        const progress =
            document.querySelector("#progressCard");

        if (!progress) {
            return false;
        }

        const badge = Array.from(
            progress.querySelectorAll("img")
        ).find((image) =>
            /32-nivel-guardiao|nivel-guardiao/i.test(
                String(
                    image.getAttribute("src") || ""
                )
            )
        );

        if (!badge) {
            return false;
        }

        badge.dataset.guardianBadgeFinal = "true";

        badge.style.setProperty(
            "width",
            "72px",
            "important"
        );

        badge.style.setProperty(
            "height",
            "72px",
            "important"
        );

        badge.style.setProperty(
            "min-width",
            "72px",
            "important"
        );

        badge.style.setProperty(
            "min-height",
            "72px",
            "important"
        );

        badge.style.setProperty(
            "max-width",
            "72px",
            "important"
        );

        badge.style.setProperty(
            "max-height",
            "72px",
            "important"
        );

        badge.style.setProperty(
            "object-fit",
            "contain",
            "important"
        );

        badge.style.setProperty(
            "object-position",
            "center",
            "important"
        );

        badge.style.setProperty(
            "transform",
            "none",
            "important"
        );

        badge.style.setProperty(
            "margin",
            "0 auto",
            "important"
        );

        const frame = badge.parentElement;

        if (frame) {
            frame.dataset.guardianFrameFinal =
                "true";

            frame.style.setProperty(
                "width",
                "94px",
                "important"
            );

            frame.style.setProperty(
                "height",
                "88px",
                "important"
            );

            frame.style.setProperty(
                "min-width",
                "94px",
                "important"
            );

            frame.style.setProperty(
                "min-height",
                "88px",
                "important"
            );

            frame.style.setProperty(
                "max-width",
                "94px",
                "important"
            );

            frame.style.setProperty(
                "max-height",
                "88px",
                "important"
            );

            frame.style.setProperty(
                "display",
                "grid",
                "important"
            );

            frame.style.setProperty(
                "place-items",
                "center",
                "important"
            );

            frame.style.setProperty(
                "overflow",
                "hidden",
                "important"
            );

            frame.style.setProperty(
                "transform",
                "none",
                "important"
            );
        }

        return true;
    }

    function applyFinalFix() {
        configureFogModal();
        configureGuardian();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            applyFinalFix,
            { once: true }
        );
    }
    else {
        applyFinalFix();
    }

    window.addEventListener(
        "load",
        applyFinalFix,
        { once: true }
    );

    window.setTimeout(
        applyFinalFix,
        200
    );

    window.setTimeout(
        applyFinalFix,
        700
    );

    window.setTimeout(
        applyFinalFix,
        1400
    );

    /*
      O modal pode ser aberto depois do carregamento.
      Captura o acionamento do floco e configura no frame
      seguinte, sem observação contínua da página.
    */

    document.addEventListener(
        "click",
        (event) => {
            const hotspot =
                event.target.closest(
                    ".easterHotspot"
                );

            if (!hotspot) {
                return;
            }

            window.setTimeout(
                configureFogModal,
                0
            );
        },
        true
    );
})();
