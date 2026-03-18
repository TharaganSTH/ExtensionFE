document.getElementById("analyzeBtn").addEventListener("click", async () => {
    const inputText = document.getElementById("inputText").value.trim();
    const resultsDiv = document.getElementById("results");

    if (!inputText) {
        resultsDiv.innerHTML = "<p>Please enter some text.</p>";
        return;
    }

    resultsDiv.innerHTML = "<p>Analyzing...</p>";

    try {
        const response = await fetch("http://127.0.0.1:8000/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: inputText })
        });

        const data = await response.json();
        const results = data.results;

        if (results.length === 0) {
            resultsDiv.innerHTML = "<p>No diseases detected.</p>";
            return;
        }

        resultsDiv.innerHTML = "";
        results.forEach(item => {
            const block = document.createElement("div");
            block.innerHTML = `
                <p><strong>${item.mention}</strong></p>
                <p><em>Synonyms:</em> ${item.synonyms.join(", ")}</p>
                <p><em>Explanation:</em> ${item.explanation}</p>
                <hr>
            `;
            resultsDiv.appendChild(block);
        });

    } catch (error) {
        resultsDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
});



const checkbox = document.getElementById("toggleHighlight");

// Restore toggle state on popup open
chrome.storage.local.get(["highlightingEnabled"], (result) => {
    checkbox.checked = result.highlightingEnabled || false;
});

checkbox.addEventListener("change", () => {
    chrome.storage.local.set({ highlightingEnabled: checkbox.checked });
});
