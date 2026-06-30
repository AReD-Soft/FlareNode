#!/system/bin/sh
# post-fs-data.sh: Auto-start Flare Node daemon

MODDIR=/data/adb/modules/flare_node
LOG_DIR=/sdcard/flare_node
LOG_FILE=$LOG_DIR/daemon.log

mkdir -p "$LOG_DIR"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG_FILE"
}

# Wait until boot completes (if executed manually via WebUI, this step is skipped automatically)
until [ "$(getprop sys.boot_completed)" = "1" ]; do
    sleep 2
done

if [ -f "$MODDIR/token.txt" ]; then
    TOKEN=$(cat "$MODDIR/token.txt")
    if [ -n "$TOKEN" ]; then
        # Stop any old process to avoid double-run
        killall cloudflared >/dev/null 2>&1
        
        log "[post-fs-data] Starting Flare Node tunnel..."
        
        # Execute daemon with detached I/O so it is not killed when WebUI finishes calling it
        "$MODDIR/cloudflared" tunnel run --token "$TOKEN" </dev/null >$LOG_DIR/flare_daemon.log 2>&1 &
        
        log "[post-fs-data] Daemon active in background."
        echo "Flare Node daemon started."
    else
        log "[post-fs-data] Token empty, skipping execution."
        echo "Error: Token empty."
    fi
else
    log "[post-fs-data] Token file not found!"
    echo "Error: Token file not found."
fi