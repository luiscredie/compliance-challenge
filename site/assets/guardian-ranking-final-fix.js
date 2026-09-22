
(() => {
    "use strict";

    const normalize = (value) =>
        String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();

    function fixGuardian() {
        const progress =
            document.querySelector("#progressCard") ||
            Array.from(
                document.querySelectorAll(
                    "section, article, div"
                )
            ).find((element) =>
                normalize(element.textContent)
                    .includes("progresso da jornada")
            );

        if (!progress) {
            return false;
        }

        const badge = Array.from(
            progress.querySelectorAll("img")
        ).find((image) =>
            /32-nivel-guardiao|nivel-guardiao/i.test(
                String(image.getAttribute("src") || "")
            )
        );

        if (!badge) {
            return false;
        }

        badge.dataset.finalLevelBadge = "true";

        const frame = badge.parentElement;

        if (frame) {
            frame.dataset.finalLevelFrame = "true";

            frame.style.setProperty(
                "width",
                "96px",
                "important"
            );

            frame.style.setProperty(
                "height",
                "96px",
                "important"
            );

            frame.style.setProperty(
                "overflow",
                "hidden",
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
                "transform",
                "none",
                "important"
            );
        }

        badge.style.setProperty(
            "width",
            "78px",
            "important"
        );

        badge.style.setProperty(
            "height",
            "78px",
            "important"
        );

        badge.style.setProperty(
            "object-fit",
            "contain",
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

        return true;
    }

    function findRankingPanel() {
        const heading = Array.from(
            document.querySelectorAll(
                "h1, h2, h3, h4, strong"
            )
        ).find((element) =>
            normalize(element.textContent) === "ranking"
        );

        if (!heading) {
            return null;
        }

        let current = heading;

        for (
            let index = 0;
            index < 9 && current;
            index += 1
        ) {
            const buttons = Array.from(
                current.querySelectorAll("button, a")
            );

            const hasSite = buttons.some(
                (button) =>
                    normalize(button.textContent) ===
                    "meu site"
            );

            const hasGlobal = buttons.some(
                (button) =>
                    normalize(button.textContent) ===
                    "global"
            );

            if (hasSite && hasGlobal) {
                return {
                    panel: current,
                    heading
                };
            }

            current = current.parentElement;
        }

        return null;
    }

    function findCommonParent(elements, boundary) {
        let current = elements[0].parentElement;

        while (current && current !== boundary) {
            if (
                elements.every((element) =>
                    current.contains(element)
                )
            ) {
                return current;
            }

            current = current.parentElement;
        }

        return null;
    }

    function fixRanking() {
        const result = findRankingPanel();

        if (!result) {
            return false;
        }

        const panel = result.panel;
        const heading = result.heading;

        panel.dataset.finalRankingPanel = "true";

        const buttons = Array.from(
            panel.querySelectorAll("button, a")
        ).filter((element) => {
            const text = normalize(element.textContent);

            return (
                text === "meu site" ||
                text === "global"
            );
        });

        if (buttons.length < 2) {
            return false;
        }

        let controls = findCommonParent(
            buttons,
            panel
        );

        if (!controls || controls === panel) {
            controls = document.createElement("div");

            buttons[0].parentElement.insertBefore(
                controls,
                buttons[0]
            );

            buttons.forEach((button) =>
                controls.appendChild(button)
            );
        }

        controls.dataset.finalRankingActions = "true";

        /*
          Rebuild the header structurally. This prevents old
          absolute-position rules from placing controls outside.
        */

        let header = panel.querySelector(
            ":scope > [data-final-ranking-header='true']"
        );

        if (!header) {
            header = document.createElement("div");
            header.dataset.finalRankingHeader = "true";

            panel.insertBefore(
                header,
                panel.firstChild
            );
        }

        let copy = heading.parentElement;

        if (
            !copy ||
            copy === controls ||
            copy === panel ||
            copy === header
        ) {
            copy = document.createElement("div");

            heading.parentElement.insertBefore(
                copy,
                heading
            );

            copy.appendChild(heading);
        }

        copy.dataset.finalRankingCopy = "true";

        if (copy.parentElement !== header) {
            header.appendChild(copy);
        }

        if (controls.parentElement !== header) {
            header.appendChild(controls);
        }

        /*
          Remove positioning inherited from earlier patches.
        */

        [
            controls,
            ...buttons
        ].forEach((element) => {
            element.style.setProperty(
                "position",
                "static",
                "important"
            );

            element.style.setProperty(
                "left",
                "auto",
                "important"
            );

            element.style.setProperty(
                "right",
                "auto",
                "important"
            );

            element.style.setProperty(
                "top",
                "auto",
                "important"
            );

            element.style.setProperty(
                "bottom",
                "auto",
                "important"
            );

            element.style.setProperty(
                "transform",
                "none",
                "important"
            );

            element.style.setProperty(
                "margin",
                "0",
                "important"
            );
        });

        Array.from(panel.children)
            .filter((element) => element !== header)
            .forEach((element) => {
                element.dataset.finalRankingBody = "true";
            });

        return true;
    }

    function applyFinalCorrection() {
        fixGuardian();
        fixRanking();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            applyFinalCorrection,
            { once: true }
        );
    }
    else {
        applyFinalCorrection();
    }

    window.addEventListener(
        "load",
        applyFinalCorrection,
        { once: true }
    );

    window.addEventListener(
        "resize",
        applyFinalCorrection
    );

    window.setTimeout(
        applyFinalCorrection,
        250
    );

    window.setTimeout(
        applyFinalCorrection,
        750
    );

    window.setTimeout(
        applyFinalCorrection,
        1500
    );
})();
