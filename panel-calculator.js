const roofInput = document.getElementById("roofWidth");
const panelInput = document.getElementById("panelWidth");
const customCheck = document.getElementById("customFirstPanel");
const firstPanelInput = document.getElementById("firstPanelWidth");
const results = document.getElementById("results");
const preview = document.getElementById("preview");
const roofText = document.getElementById("roof-text");
const liveUpdateCheck = document.getElementById("liveUpdate");

const panelInfo = document.getElementById("panel-info");
const panelNumber = document.getElementById("panel-number");
const panelPosition = document.getElementById("panel-position");
const panelDirection = document.getElementById("panel-direction");
const toggleEdgeBtn = document.getElementById("toggle-edge");
const prevPanelBtn = document.getElementById("prev-panel");
const nextPanelBtn = document.getElementById("next-panel");

let calculateFromRight = false; // default calculation edge
let currentPanels = [];
let currentPositions = [];
let selectedIndex = null;

const scale = 1 / 5; // 1px = 5 mm

// Show/hide first panel width input
customCheck.addEventListener("change", () => {
    firstPanelInput.style.display = customCheck.checked ? "inline-block" : "none";
    if (!customCheck.checked) firstPanelInput.value = "";
    if (liveUpdateCheck.checked) calculatePanels();
});

// Main calculation function
function calculatePanels() {
    const roof = Number(roofInput.value);
    const panelWidth = Number(panelInput.value);
    const useCustom = customCheck.checked;
    const firstWidth = Number(firstPanelInput.value);

    if (!roof || roof <= 0) {
        results.style.display = "block";
        results.innerHTML = "Sisesta korrektne katuse laius.";
        roofText.textContent = "";
        preview.innerHTML = "";
        panelInfo.style.display = "none";
        return;
    }

    if (useCustom && (!firstWidth || firstWidth <= 0)) {
        results.style.display = "block";
        results.innerHTML = "Sisesta korrektne esimese pleki laius.";
        preview.innerHTML = "";
        panelInfo.style.display = "none";
        return;
    }

    roofText.textContent = `Katuse laius: ${roof} mm`;

    let remainingWidth = roof;
    const panels = [];

    // First panel custom width
    if (useCustom) {
        panels.push(firstWidth);
        remainingWidth -= firstWidth;
    }

    // Full panels
    const fullPanelsCount = Math.floor(remainingWidth / panelWidth);
    let remainder = remainingWidth - fullPanelsCount * panelWidth;

    for (let i = 0; i < fullPanelsCount; i++) panels.push(panelWidth);

    // Last panel fills remaining width
    if (remainder > 0) panels.push(remainder);

    currentPanels = panels;

    // Draw preview
    preview.innerHTML = "";
    const positions = [];
    let currentStart = 0;

    panels.forEach((w, idx) => {
        const div = document.createElement("div");
        div.className = "panel";
        div.style.width = (w * scale) + "px";

        if (useCustom && idx === 0) div.style.background = "#a1d1a1";
        if (idx === panels.length - 1 && remainder > 0) div.style.background = "#ffd1d1";

        let start, end;
        if (!calculateFromRight) {
            start = currentStart;
            end = start + w;
            currentStart = end;
        } else {
            end = roof - currentStart;
            start = end - w;
            currentStart += w;
        }

        positions.push({ start, end });

        div.addEventListener("click", () => {
            selectedIndex = idx;
            updatePanelSelection();
            showPanelInfo(idx, positions);
        });

        preview.appendChild(div);
    });

    currentPositions = positions;

    results.style.display = "block";
    results.innerHTML = `
        Paneele kokku: <b>${panels.length}</b><br>
        Täispaneelide arv: <b>${fullPanelsCount}</b><br>
        Viimane plekk: <b>${panels[panels.length - 1].toFixed(0)} mm</b>
    `;

    if (selectedIndex !== null) {
        updatePanelSelection();
        showPanelInfo(selectedIndex, positions);
    }
}

// Update visual selection
function updatePanelSelection() {
    document.querySelectorAll("#preview .panel").forEach((p, idx) => {
        if (idx === selectedIndex) p.classList.add("active");
        else p.classList.remove("active");
    });
}

// Show panel info
function showPanelInfo(idx, positions) {
    panelInfo.style.display = "block";
    const pos = positions[idx];
    const panelWidth = currentPanels[idx]; // get panel width

    panelNumber.textContent = `Paneel #${idx + 1}`;
    panelPosition.textContent = `Positsioon: ${pos.start.toFixed(0)} mm → ${pos.end.toFixed(0)} mm`;
    
    // Panel width info under position
    let widthInfo = document.getElementById("panel-width-info");
    if (!widthInfo) {
        widthInfo = document.createElement("p");
        widthInfo.id = "panel-width-info";
        panelPosition.insertAdjacentElement('afterend', widthInfo);
    }
    widthInfo.textContent = `Paneeli laius: ${panelWidth.toFixed(0)} mm`;

    panelDirection.textContent = `Arvutatud ${calculateFromRight ? "paremalt" : "vasakult"}`;
    toggleEdgeBtn.textContent = calculateFromRight ? "Arvuta vasakult" : "Arvuta paremalt";
}



// Toggle edge calculation
toggleEdgeBtn.addEventListener("click", () => {
    calculateFromRight = !calculateFromRight;
    calculatePanels();
});

// Previous / Next buttons
prevPanelBtn.addEventListener("click", () => {
    if (selectedIndex > 0) selectedIndex--;
    updatePanelSelection();
    showPanelInfo(selectedIndex, currentPositions);
});

nextPanelBtn.addEventListener("click", () => {
    if (selectedIndex < currentPanels.length - 1) selectedIndex++;
    updatePanelSelection();
    showPanelInfo(selectedIndex, currentPositions);
});

// Main calculate button
document.getElementById("calcBtn").addEventListener("click", calculatePanels);

// Live update
[roofInput, panelInput, firstPanelInput].forEach(input => {
    input.addEventListener("input", () => {
        if (liveUpdateCheck.checked) calculatePanels();
    });
});

customCheck.addEventListener("change", () => {
    if (liveUpdateCheck.checked) calculatePanels();
});
