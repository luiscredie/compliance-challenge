(() => {
    "use strict";

    function normalize(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }

    function findRankingPanel() {
        const direct = document.querySelector(
            "#rankingCard, #rankingSection, #leaderboardCard"
        );

        if (direct) {
            return direct;
        }

        const heading = Array.from(
            document.querySelectorAll("h1, h2, h3, h4, strong")
        ).find((element) =>
            normalize(element.textContent) === "ranking"
        );

        if (!heading) {
            return null;
        }

        let node = heading;

        for (let index = 0; index < 8 && node; index += 1) {
            const className = String(node.className || "");

            const hasScopeButtons = Array.from(
                node.querySelectorAll("button, a")
            ).some((element) => {
                const text = normalize(element.textContent);

                return (
                    text === "meu site" ||
                    text === "global"
                );
            });

            if (
                hasScopeButtons &&
                (
                    node.matches("section, article") ||
                    /card|panel|ranking/i.test(className)
                )
            ) {
                return node;
            }

            node = node.parentElement;
        }

        return heading.parentElement;
    }

    function findControls(panel) {
        const scopeButtons = Array.from(
            panel.querySelectorAll("button, a")
        ).filter((element) => {
            const text = normalize(element.textContent);

            return (
                text === "meu site" ||
                text === "global"
            );
        });

        if (scopeButtons.length < 2) {
            return null;
        }

        let candidate = scopeButtons[0].parentElement;

        while (
            candidate &&
            candidate !== panel &&
            !scopeButtons.every((button) =>
                candidate.contains(button)
            )
        ) {
            candidate = candidate.parentElement;
        }

        return candidate && candidate !== panel
            ? candidate
            : null;
    }

    function findHeader(panel, controls) {
        const heading = Array.from(
            panel.querySelectorAll("h1, h2, h3, h4, strong")
        ).find((element) =>
            normalize(element.textContent) === "ranking"
        );

        if (!heading) {
            return null;
        }

        let node = heading.parentElement;

        while (node && node !== panel) {
            if (node.contains(controls)) {
                return node;
            }

            node = node.parentElement;
        }

        const header = document.createElement("div");

        panel.insertBefore(
            header,
            panel.firstChild
        );

        header.appendChild(heading.parentElement);
        header.appendChild(controls);

        return header;
    }

    function applyRankingAlignment() {
        const panel = findRankingPanel();

        if (!panel) {
            return false;
        }

        const controls = findControls(panel);

        if (!controls) {
            return false;
        }

        const header = findHeader(panel, controls);

        if (!header) {
            return false;
        }

        panel.dataset.rankingPanelFixed = "true";
        header.dataset.rankingHeaderFixed = "true";
        controls.dataset.rankingControlsFixed = "true";

        const heading = Array.from(
            header.querySelectorAll("h1, h2, h3, h4, strong")
        ).find((element) =>
            normalize(element.textContent) === "ranking"
        );

        if (heading) {
            let copy = heading.parentElement;

            if (
                copy &&
                copy !== controls &&
                header.contains(copy)
            ) {
                copy.dataset.rankingCopyFixed = "true";
            }
        }

        const table =
            panel.querySelector("table") ||
            panel.querySelector(
                "[class*='ranking-list'], [class*='leaderboard']"
            );

        if (table) {
            const wrapper =
                table.parentElement &&
                table.parentElement !== panel
                    ? table.parentElement
                    : table;

            wrapper.dataset.rankingTableFixed = "true";
        }

        return true;
    }

    function start() {
        applyRankingAlignment();

        window.setTimeout(
            applyRankingAlignment,
            250
        );

        window.setTimeout(
            applyRankingAlignment,
            750
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            start,
            { once: true }
        );
    }
    else {
        start();
    }

    window.addEventListener(
        "load",
        applyRankingAlignment,
        { once: true }
    );

    window.addEventListener(
        "resize",
        applyRankingAlignment
    );
})();