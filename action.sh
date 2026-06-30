#!/system/bin/sh

MODDIR="/data/adb/modules/flare_node"
WEBUI_LAUNCHED=0

launch_webui() {
    echo "- Launching WebUI via $1..."
    am start -n "$2" -e $3 "flare_node"
    WEBUI_LAUNCHED=1
}

if [ -z "$MMRL" ]; then

    if [ -n "$MAGISKTMP" ] && pm path io.github.a13e300.ksuwebui >/dev/null 2>&1; then
        launch_webui "KSU WebUI" \
            "io.github.a13e300.ksuwebui/.WebUIActivity" \
            "id"
    fi

    if [ $WEBUI_LAUNCHED -eq 0 ] && \
       [ -n "$MAGISKTMP" ] && \
       pm path com.dergoogler.mmrl.wx >/dev/null 2>&1; then
        launch_webui "MMRL WebUI" \
            "com.dergoogler.mmrl.wx/.ui.activity.webui.WebUIActivity" \
            "MOD_ID"
    fi
fi

if [ $WEBUI_LAUNCHED -eq 0 ]; then
    echo "- No WebUI available"
fi