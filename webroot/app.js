const APP_NAME = "Flare Node ☄️";
const APP_VERSION = "1.0.0";
const APP_AUTHOR = "AReD Soft";
const MOD_DIR = "/data/adb/modules/flare_node";
const LOG_DIR = "/sdcard/flare_node";
const TOKEN_PATH = `${MOD_DIR}/token.txt`;
const BIN_PATH = `${MOD_DIR}/cloudflared`;

// Display Metadata
document.querySelectorAll("[app-name]").forEach(el => el.textContent = APP_NAME);
document.querySelectorAll("[app-version]").forEach(el => el.textContent = APP_VERSION);
document.querySelectorAll("[app-author]").forEach(el => el.textContent = APP_AUTHOR);

// Log System
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function appendLog(message, type = "info") {
    const log = document.getElementById("log");
    const safeText = escapeHtml(message).replace(/\n/g, "<br>");
    const className = type === "error" ? "log-error" : type === "warning" ? "log-warning" : "log-info";
    log.innerHTML += `<span class="${className}">${safeText}</span><br>`;
    log.scrollTop = log.scrollHeight;
}

function appendError(message) {
    appendLog(message, "error");
}

function appendWarning(message) {
    appendLog(message, "warning");
}

function clearLog() {
    document.getElementById("log").innerHTML = "";
}

// Fetch Device Info
async function fetchDevice() {
    const out = document.getElementById("device");
    out.textContent = "Fetching device info...\n";
    if (!window.ksu) {
        out.textContent += "ERROR: KernelSU not available\n";
        return;
    }
    try {
        const model = await window.ksu.exec("getprop ro.product.model");
        const android = await window.ksu.exec("getprop ro.build.version.release");
        const kernel = await window.ksu.exec("uname -r");
        let version = "Unknown";
        try {
            const verOut = await window.ksu.exec(`${BIN_PATH} --version`);
            if (verOut) {
                version = verOut.split(/\r?\n/)[0].trim();
            }
        } catch {
            version = "Not available";
        }
        out.textContent = `Model   : ${model.trim()}\nAndroid : ${android.trim()}\nKernel  : ${kernel.trim()}\nTunnel  : ${version}\n`;
    } catch (e) {
        out.textContent += "Error: " + e;
    }
}

// Check Tunnel Status
async function checkStatus(diagnoseIfStopped = false) {
    const el = document.getElementById("tunnelStatus");
    el.textContent = "Checking...";
    el.className = "unknown";

    if (!window.ksu) return;

    try {
        const res = await window.ksu.exec("pidof cloudflared");
        if (res && res.trim()) {
            el.textContent = `RUNNING ✅ (PID: ${res.trim()})`;
            el.className = "mounted";
        } else {
            el.textContent = "STOPPED 💀";
            el.className = "unmounted";
            if (diagnoseIfStopped) {
                await diagnoseDaemonFailure();
            }
        }
    } catch (e) {
        el.textContent = "Error";
        el.className = "unmounted";
        if (diagnoseIfStopped) {
            appendError("Unable to check daemon status: " + e);
            appendError(`Check /sdcard/flare_node/flare_daemon.log for additional details.`);
        }
    }
}

// Load Token
async function loadToken() {
    appendLog("Reading token configuration...\n");
    try {
        const res = await window.ksu.exec(`cat ${TOKEN_PATH}`);
        if(res && !res.includes("No such file")) {
            document.getElementById("tokenInput").value = res.trim();
            appendLog("Token loaded successfully.\n");
        } else {
            appendLog("Token is empty or not created yet.\n");
        }
    } catch (e) {
        appendLog("Error reading token: " + e + "\n");
    }
}

// Save Token
async function saveToken() {
    const token = document.getElementById("tokenInput").value.trim();
    if (!token) {
        appendLog("ERROR: Token is empty. Cancelled.\n");
        return;
    }

    const ok = await showConfirm(
        "Save Token Configuration",
        "Save the new token to the system?\n\nContinue?"
    );

    if (!ok) {
        appendLog("Save cancelled by user.\n");
        return;
    }

    appendLog("Saving token file...\n");
    try {
        // Write the token file via shell redirection
        const cmd = `cat <<'EOF' > ${TOKEN_PATH}\n${token}\nEOF\nchmod 644 ${TOKEN_PATH}`;
        await window.ksu.exec(cmd);
        appendLog("Token saved successfully.\n");
    } catch (e) {
        appendLog("Failed to save token: " + e + "\n");
    }
}

// Start Tunnel (using service.sh)
async function startTunnel() {
    const token = document.getElementById("tokenInput").value.trim();
    if (!token) {
        appendError("Token not found. Save it first!");
        return;
    }

    const ok = await showConfirm("Start Flare Node", "Run the Cloudflared daemon in the background?");
    if (!ok) return;

    appendLog("Applying start command via service.sh...");
    try {
        const res = await window.ksu.exec(
            "/system/bin/sh /data/adb/modules/flare_node/service.sh"
        );
        if (res && res.toLowerCase().includes("error:")) {
            appendError(res.trim());
            appendError(`Start command failed. Check /sdcard/flare_node/flare_daemon.log for details.`);
            return;
        }

        appendLog(res.trim() || "Daemon triggered.");
        setTimeout(() => checkStatus(true), 1500);
    } catch (e) {
        appendError("Failed to execute start: " + e);
        appendError(`Check /sdcard/flare_node/flare_daemon.log for details.`);
    }
}

// Stop Tunnel (killall directly)
async function stopTunnel() {
    const ok = await showConfirm("Stop Flare Node", "Force-stop all Cloudflared processes?");
    if (!ok) return;

    appendLog("Stopping daemon...\n");
    try {
        const res = await window.ksu.exec("killall cloudflared");
        appendLog(res || "Daemon stopped.\n");
        setTimeout(checkStatus, 1500);
    } catch (e) {
        appendLog("Failed to stop: " + e + "\n");
    }
}

// Daemon log diagnostics
async function tailDaemonLog(lines = 20) {
    try {
        const logPath = `${LOG_DIR}/flare_daemon.log`;
        const res = await window.ksu.exec(`[ -f ${logPath} ] && tail -n ${lines} ${logPath} || echo "No daemon log found."`);
        return res ? res.trim() : "No daemon log available.";
    } catch (e) {
        return `Unable to read daemon log: ${e}`;
    }
}

async function diagnoseDaemonFailure() {
    appendError("Daemon did not start or exited immediately.");
    const tail = await tailDaemonLog(20);
    appendError("Last flare_daemon.log output:");
    appendError(tail);
    appendError(`For full failure details, inspect /sdcard/flare_node/flare_daemon.log`);
}

async function viewDaemonLog() {
    const logPath = `${LOG_DIR}/flare_daemon.log`;
    appendLog("Loading flare_daemon.log...", "info");

    try {
        const res = await window.ksu.exec(`[ -f ${logPath} ] && tail -n 200 ${logPath} || echo "Daemon log not found."`);
        const out = document.getElementById("log");
        out.innerHTML = `<span class="log-info">=== flare_daemon.log (last 200 lines) ===</span><br>${escapeHtml(res || "No daemon log content.").replace(/\n/g, "<br>")}`;
        out.scrollTop = out.scrollHeight;
    } catch (e) {
        appendError("Failed to read daemon log: " + e);
    }
}

// Modal Logic
function showConfirm(title, message) {
    return new Promise(resolve => {
        const modal = document.getElementById("confirmModal");
        const t = document.getElementById("confirmTitle");
        const m = document.getElementById("confirmMessage");
        const yes = document.getElementById("confirmYes");
        const no = document.getElementById("confirmNo");

        t.textContent = title;
        m.textContent = message;
        modal.classList.remove("hidden");

        const cleanup = () => {
            modal.classList.add("hidden");
            yes.onclick = null;
            no.onclick = null;
        };

        yes.onclick = () => { cleanup(); resolve(true); };
        no.onclick = () => { cleanup(); resolve(false); };
    });
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    fetchDevice();
    loadToken();
    checkStatus();
    setInterval(checkStatus, 3000);
});