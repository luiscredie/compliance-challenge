
(() => {
    "use strict";

    const normalize = (value) =>
        String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();

    function commonParent(elements, boundary) {
        let node = elements[0].parentElement;

        while (node && node !== boundary) {
            if (
                elements.every((element) =>
                    node.contains(element)
                )
            ) {
                return node;
            }

            node = node.parentElement;
        }

        return null;
    }

    function fixRanking() {
        const heading = Array.from(
            document.querySelectorAll(
                "h1, h2, h3, h4, strong"
            )
        ).find((element) =>
            normalize(element.textContent) === "ranking"
        );

        if (!heading) {
            return false;
        }

        let panel = heading.parentElement;

        while (panel) {
            const texts = Array.from(
                panel.querySelectorAll("button, a")
            ).map((element) =>
                normalize(element.textContent)
            );

            if (
                texts.includes("meu site") &&
                texts.includes("global")
            ) {
                break;
            }

            panel = panel.parentElement;
        }

        if (!panel) {
            return false;
        }

        panel.dataset.rankFinalPanel = "true";

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

        let actions = commonParent(
            buttons,
            panel
        );

        if (!actions || actions === panel) {
            actions = document.createElement("div");

            buttons[0].parentElement.insertBefore(
                actions,
                buttons[0]
            );

            buttons.forEach((button) =>
                actions.appendChild(button)
            );
        }

        actions.dataset.rankFinalActions = "true";

        const subtitle = Array.from(
            panel.querySelectorAll("p, small, div")
        ).find((element) =>
            normalize(element.textContent).includes(
                "identidades anonimizadas"
            )
        );

        if (subtitle) {
            let copy = subtitle.parentElement;

            if (
                copy === panel ||
                copy === actions
            ) {
                copy = heading.parentElement;
            }

            if (copy && copy !== panel) {
                copy.dataset.rankFinalCopy = "true";
            }
        }

        const rows = Array.from(
            panel.querySelectorAll(
                "tr, [class*='rankRow'], " +
                "[class*='rankingRow'], " +
                "[class*='leaderRow']"
            )
        );

        if (rows.length) {
            let list = rows[0].parentElement;

            if (
                list &&
                list.tagName === "TBODY" &&
                list.parentElement
            ) {
                list = list.parentElement;
            }

            if (list) {
                list.dataset.rankFinalList = "true";
            }
        }
        else {
            const positionOne = Array.from(
                panel.querySelectorAll(
                    "span, div, td"
                )
            ).find((element) =>
                normalize(element.textContent) === "1"
            );

            if (positionOne) {
                let list = positionOne.parentElement;

                while (
                    list &&
                    list !== panel &&
                    list.previousElementSibling === null
                ) {
                    list = list.parentElement;
                }

                if (list && list !== panel) {
                    list.dataset.rankFinalList = "true";
                }
            }
        }

        return true;
    }

    function fixFogModal() {
        const modal =
            document.querySelector("#easterEggModal");

        if (!modal) {
            return false;
        }

        const image = modal.querySelector(
            ".easterVisual, img"
        );

        if (image) {
            image.src =
                "/assets/easter-neblina.webp?v=20260915e";

            image.removeAttribute("srcset");
        }

        return true;
    }

    function apply() {
        fixRanking();
        fixFogModal();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            apply,
            { once: true }
        );
    }
    else {
        apply();
    }

    window.addEventListener(
        "load",
        apply,
        { once: true }
    );

    window.addEventListener(
        "resize",
        fixRanking
    );

    window.setTimeout(apply, 250);
    window.setTimeout(apply, 800);
})();
