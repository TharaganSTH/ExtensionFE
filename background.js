


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "get_toggle_state") {
        chrome.storage.local.get(["highlightingEnabled"], (result) => {
            sendResponse({ enabled: result.highlightingEnabled || false });
        });
        return true; // Keep the message port open for async response
    }

    if (message.action === "analyze_text") {
        fetch("http://127.0.0.1:8000/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: message.text })
        })
        .then(async res => {
            const text = await res.text();
            try {
                const json = JSON.parse(text);
                sendResponse({ success: true, results: json.results });
            } catch (e) {
                console.error("❌ JSON parse error:", e, "\n🔴 Raw response:", text);
                sendResponse({ success: false, error: "Invalid JSON response from server." });
            }
        })
        .catch(err => {
            console.error("❌ Network or fetch error:", err);
            sendResponse({ success: false, error: err.message });
        });

        return true; // needed to make sendResponse async
    }
});

