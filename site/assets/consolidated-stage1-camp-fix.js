
(() => {
    "use strict";

    const normalize = (value) =>
        String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();

    const fallbackMap = {
        "pack-policy.webp": [
            "📘",
            "Regra ou procedimento aplicável"
        ],
        "pack-channel.webp": [
            "🏢",
            "Canal corporativo autorizado"
        ],
        "pack-facts.webp": [
            "📊",
            "Fatos e dados necessários"
        ],
        "pack-record.webp": [
            "📝",
            "Registro da decisão e do racional"
        ],
        "pack-personalmail.webp": [
            "✉️",
            "E-mail pessoal"
        ],
        "pack-usb.webp": [
            "🔌",
            "Pendrive particular"
        ],
        "pack-password.webp": [
            "🔑",
            "Senha compartilhada"
        ],
        "pack-screenshot.webp": [
            "🖼️",
            "Captura de tela completa"
        ],
        "stage1-pack-board.webp": [
            "🎒",
            "Mochila de decisão"
        ],
        "stage1-integrity-reference.webp": [
            "📄",
            "Relatório de referência"
        ],
        "stage1-integrity-altered.webp": [
            "🔍",
            "Relatório alterado"
        ],
        "stage1-camp-scene-a.webp": [
            "🔒",
            "Estação corporativa bloqueada"
        ],
        "stage1-camp-scene-b.webp": [
            "📷",
            "Área industrial controlada"
        ],
        "stage1-camp-scene-c.webp": [
            "✅",
            "Documento corporativo aprovado"
        ]
    };

    function pageName() {
        return location.pathname
            .split("/")
            .pop()
            .toLowerCase();
    }

    function markCampPage() {
        if (pageName() === "camp.html") {
            document.body.dataset.uiPage = "camp";
        }
    }

    function replaceMissingVisual(img) {
        const source = String(
            img.getAttribute("src") || ""
        );

        const filename = source
            .split("/")
            .pop()
            .split("?")[0];

        const spec = fallbackMap[filename];

        if (!spec) {
            return;
        }

        const fallback = document.createElement("div");
        fallback.dataset.visualFallback = "true";
        fallback.dataset.visualFilename = filename;
        fallback.setAttribute("role", "img");
        fallback.setAttribute(
            "aria-label",
            spec[1]
        );

        const icon = document.createElement("span");
        icon.dataset.visualFallbackIcon = "true";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = spec[0];

        const label = document.createElement("span");
        label.dataset.visualFallbackLabel = "true";
        label.textContent = spec[1];

        fallback.append(icon, label);

        img.replaceWith(fallback);
    }

    function installVisualFallbacks() {
        document.querySelectorAll("img").forEach((img) => {
            const source = String(
                img.getAttribute("src") || ""
            );

            const filename = source
                .split("/")
                .pop()
                .split("?")[0];

            if (!fallbackMap[filename]) {
                return;
            }

            img.addEventListener(
                "error",
                () => replaceMissingVisual(img),
                { once: true }
            );

            if (img.complete && img.naturalWidth === 0) {
                replaceMissingVisual(img);
            }
        });
    }

    function markSpeedTest() {
        const elements = Array.from(
            document.querySelectorAll(
                "div, section, article, aside"
            )
        );

        const candidates = elements.filter((element) => {
            const text = normalize(element.textContent);

            return (
                text.includes("speed test") &&
                text.includes(
                    "cada decisao avanca imediatamente"
                )
            );
        });

        candidates.sort(
            (a, b) =>
                a.querySelectorAll("*").length -
                b.querySelectorAll("*").length
        );

        const banner = candidates[0];

        if (!banner) {
            return;
        }

        banner.dataset.speedTestBanner = "true";

        const title = Array.from(
            banner.querySelectorAll(
                "strong, b, small, span, div"
            )
        ).find((element) =>
            normalize(element.textContent) ===
            "speed test"
        );

        if (title) {
            title.dataset.speedTestTitle = "true";
        }
    }

    function parseDecisionCard(card, index) {
        if (card.dataset.decisionCard === "true") {
            return;
        }

        const rawText = String(
            card.textContent || ""
        )
            .replace(/\s+/g, " ")
            .trim();

        if (rawText.length < 20) {
            return;
        }

        card.dataset.decisionCard = "true";

        const categoryCandidates = [
            "Recursos da empresa",
            "Proteção de Dados",
            "Jeong-do Management",
            "Assédio e Respeito",
            "Diversidade x Meritocracia"
        ];

        const category =
            categoryCandidates.find((value) =>
                normalize(rawText).includes(
                    normalize(value)
                )
            ) || "Situação";

        let question = rawText;

        question = question.replace(
            new RegExp(
                "^\\s*" + index + "\\s*",
                "i"
            ),
            ""
        );

        question = question.replace(
            category,
            ""
        ).trim();

        const number = document.createElement("span");
        number.dataset.decisionNumber = "true";
        number.textContent = String(index);

        const categoryElement =
            document.createElement("span");

        categoryElement.dataset.decisionCategory =
            "true";

        categoryElement.textContent = category;

        const questionElement =
            document.createElement("span");

        questionElement.dataset.decisionQuestion =
            "true";

        questionElement.textContent = question;

        card.replaceChildren(
            number,
            categoryElement,
            questionElement
        );
    }

    function markDecisionBox() {
        const allElements = Array.from(
            document.querySelectorAll(
                "div, section, article"
            )
        );

        const labels = allElements.filter((element) => {
            const text = normalize(element.textContent);

            return (
                text.includes("caixa de decisoes") &&
                text.includes("recursos da empresa") &&
                text.includes("protecao de dados")
            );
        });

        labels.sort(
            (a, b) =>
                a.querySelectorAll("*").length -
                b.querySelectorAll("*").length
        );

        const box = labels[0];

        if (!box) {
            return;
        }

        box.dataset.decisionBox = "true";

        let cards = Array.from(box.children).filter(
            (element) => {
                const text = normalize(
                    element.textContent
                );

                return (
                    text.includes("recursos da empresa") ||
                    text.includes("protecao de dados") ||
                    text.includes("jeong-do management") ||
                    text.includes("assedio e respeito") ||
                    text.includes(
                        "diversidade x meritocracia"
                    )
                );
            }
        );

        if (cards.length < 5) {
            cards = Array.from(
                box.querySelectorAll(
                    "button, [role='button'], li"
                )
            ).filter((element) => {
                const text = normalize(
                    element.textContent
                );

                return (
                    text.includes("recursos da empresa") ||
                    text.includes("protecao de dados") ||
                    text.includes("jeong-do management") ||
                    text.includes("assedio e respeito") ||
                    text.includes(
                        "diversidade x meritocracia"
                    )
                );
            });
        }

        cards
            .slice(0, 5)
            .forEach((card, index) =>
                parseDecisionCard(
                    card,
                    index + 1
                )
            );
    }

    function markCurrentLevel() {
        const progressCard =
            document.querySelector("#progressCard");

        if (!progressCard) {
            return;
        }

        const image = Array.from(
            progressCard.querySelectorAll("img")
        ).find((img) =>
            /13-primeiros-passos|32-nivel-guardiao|33-nivel-multiplicador|34-nivel-lider/i.test(
                String(img.getAttribute("src") || "")
            )
        );

        if (!image) {
            return;
        }

        image.dataset.levelArt = "true";

        if (image.parentElement) {
            image.parentElement.dataset.currentLevelArt =
                "true";
        }
    }

    function apply() {
        markCampPage();
        installVisualFallbacks();
        markSpeedTest();
        markDecisionBox();
        markCurrentLevel();
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

    window.setTimeout(apply, 300);
    window.setTimeout(apply, 900);
})();
