(() => {
    "use strict";

    const directSelectors = [
        "#progressCard",
        "#activityCard",
        "#stageCards",
        "#journeyComingSoon",
        "#expeditionGrid",
        "#rankingCard",
        "#rankingSection",
        "#leaderboardCard"
    ];

    function normalize(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }

    function findReference() {
        const directReference = document.querySelector(
            "#badgeCard, #badgesGrid, #badgeGrid"
        );

        if (directReference) {
            return directReference;
        }

        const headings = Array.from(
            document.querySelectorAll(
                "h1, h2, h3, h4, strong"
            )
        );

        const heading = headings.find((element) =>
            normalize(element.textContent) ===
            "conquistas da jornada"
        );

        if (!heading) {
            return null;
        }

        let node = heading;

        for (let index = 0; index < 7 && node; index += 1) {
            const className = String(node.className || "");

            if (
                node.matches("section, article") ||
                /card|panel|section/i.test(className)
            ) {
                return node;
            }

            node = node.parentElement;
        }

        return heading.parentElement;
    }

    function smallestSectionByTitle(title) {
        const expected = normalize(title);

        const headings = Array.from(
            document.querySelectorAll(
                "h1, h2, h3, h4, strong"
            )
        );

        const heading = headings.find((element) =>
            normalize(element.textContent) === expected
        );

        if (!heading) {
            return null;
        }

        let node = heading;

        for (let index = 0; index < 7 && node; index += 1) {
            const className = String(node.className || "");

            if (
                node.matches("section, article") ||
                /card|panel|section/i.test(className)
            ) {
                return node;
            }

            node = node.parentElement;
        }

        return heading.parentElement;
    }

    function collectTargets(reference) {
        const targets = new Set();

        directSelectors.forEach((selector) => {
            const element = document.querySelector(selector);

            if (element) {
                targets.add(element);
            }
        });

        [
            "Ranking",
            "Mapa da Expedição",
            "Progresso da Jornada"
        ].forEach((title) => {
            const element = smallestSectionByTitle(title);

            if (element) {
                targets.add(element);
            }
        });

        if (reference) {
            targets.delete(reference);
        }

        return Array.from(targets);
    }

    function alignPanels() {
        const reference = findReference();

        if (!reference) {
            console.warn(
                "Conquistas da Jornada não foi localizada."
            );

            return false;
        }

        reference.dataset.journeyWidthReference = "true";

        const referenceRect =
            reference.getBoundingClientRect();

        const referenceWidth =
            Math.round(referenceRect.width);

        if (!referenceWidth || referenceWidth < 300) {
            return false;
        }

        document.documentElement.style.setProperty(
            "--journey-panel-width",
            referenceWidth + "px"
        );

        const targets = collectTargets(reference);

        targets.forEach((element) => {
            element.dataset.journeyWidthAligned = "true";

            element.style.setProperty(
                "width",
                referenceWidth + "px",
                "important"
            );

            element.style.setProperty(
                "max-width",
                referenceWidth + "px",
                "important"
            );

            element.style.setProperty(
                "margin-left",
                "auto",
                "important"
            );

            element.style.setProperty(
                "margin-right",
                "auto",
                "important"
            );
        });

        const expeditionGrid =
            document.querySelector("#expeditionGrid");

        if (expeditionGrid) {
            expeditionGrid.dataset.expeditionLayout = "true";
        }

        return true;
    }

    function startAlignment() {
        alignPanels();

        window.setTimeout(
            alignPanels,
            150
        );

        window.setTimeout(
            alignPanels,
            500
        );

        window.setTimeout(
            alignPanels,
            1200
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            startAlignment,
            { once: true }
        );
    }
    else {
        startAlignment();
    }

    window.addEventListener(
        "load",
        alignPanels,
        { once: true }
    );

    window.addEventListener(
        "resize",
        alignPanels
    );
})();