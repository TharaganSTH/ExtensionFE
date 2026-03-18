

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}




function walkAndHighlight(node, mentionMap) {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);

    // Sort longer mentions first (to match "gastritis" before "gastri")
    const sortedMentions = Array.from(mentionMap.entries()).sort((a, b) => b[0].length - a[0].length);

    const regexMap = sortedMentions.map(([key, { mention, explanation, synonyms }]) => ({
        regex: new RegExp(`\\b${escapeRegex(mention)}\\b`, "gi"),
        tooltip: `🧬 Synonyms: ${synonyms.join(", ") || "None"} | 📘 ${explanation}`,
        mention
    }));

    const nodesToUpdate = [];

    while (walker.nextNode()) {
        const currentNode = walker.currentNode;
        const parent = currentNode.parentNode;

        if (!currentNode.nodeValue.trim()) continue;
        if (!parent || parent.closest("span[data-highlighted]")) continue;

        let originalText = currentNode.nodeValue;
        let offset = 0;
        let modifiedHTML = '';
        let lastIndex = 0;
        const replacements = [];

        regexMap.forEach(({ regex, tooltip, mention }) => {
            let match;
            while ((match = regex.exec(originalText)) !== null) {
                const start = match.index;
                const end = start + match[0].length;

                // Check overlap with existing replacements
                if (replacements.some(r => (start < r.end && end > r.start))) continue;

                replacements.push({ start, end, mention: match[0], tooltip });
            }
        });

        if (replacements.length === 0) continue;

        // Sort by start index and rebuild the new HTML string
        replacements.sort((a, b) => a.start - b.start);
        replacements.forEach(r => {
            modifiedHTML += originalText.slice(lastIndex, r.start);
            modifiedHTML += `<span style="background-color: cyan; font-weight: bold;" data-highlighted="true" title="${r.tooltip}">${r.mention}</span>`;
            lastIndex = r.end;
        });
        modifiedHTML += originalText.slice(lastIndex);

        const spanWrapper = document.createElement("span");
        spanWrapper.innerHTML = modifiedHTML;
        nodesToUpdate.push({ oldNode: currentNode, newNode: spanWrapper });
    }

    nodesToUpdate.forEach(({ oldNode, newNode }) => {
        oldNode.parentNode.replaceChild(newNode, oldNode);
    });

    console.log("✅ Highlighting complete.");
}



function highlightMentions(mentions) {
    if (!mentions || mentions.length === 0) return;

    const mentionMap = new Map();

    mentions.forEach(item => {
        const mention = item.mention;
        const explanation = item.explanation || "No explanation available.";
        const synonyms = (item.synonyms[0] === "No synonyms found.") ? [] : item.synonyms;

        console.log(`🟡 Mention: ${mention}`);
        console.log(`🔁 Synonyms: ${synonyms}`);
        console.log(`📘 Explanation: ${explanation}`);

        const key = mention.toLowerCase();
        if (!mentionMap.has(key)) {
            mentionMap.set(key, { mention, explanation, synonyms });
        }
    });

    walkAndHighlight(document.body, mentionMap);
}

function analyzePageText(text) {
    if (document.contentType === "application/pdf") {
        console.log("❌ Skipping PDF file — not supported.");
        return;
    }
    chrome.runtime.sendMessage({ action: "analyze_text", text }, (response) => {
        if (response && response.success) {
            console.log("📦 Got results from background script");
            highlightMentions(response.results);
        } else {
            console.error("❌ Error from background script:", response?.error);
        }
    });
}

if (window.top === window) {
    chrome.runtime.sendMessage({ action: "get_toggle_state" }, (response) => {
        if (!response || !response.enabled) {
            console.log("🟡 Highlighting disabled by toggle.");
            return;
        }

        const fullText = document.body.innerText;
        console.log("📄 Extracted full text");
        analyzePageText(fullText);
    });
}
