ui_print "- Preparing directories..."
mkdir -p "$MODPATH"

ui_print "- Detecting device architecture..."
ARCH=$(uname -m 2>/dev/null || true)
case "$ARCH" in
  aarch64|arm64)
    BINARY_NAME="cloudflared-linux-arm64"
    ;;
  armv7*|armv6*|arm)
    BINARY_NAME="cloudflared-linux-arm"
    ;;
  x86_64|amd64)
    BINARY_NAME="cloudflared-linux-amd64"
    ;;
  i686|i386|x86)
    BINARY_NAME="cloudflared-linux-386"
    ;;
  *)
    ui_print "! Unsupported architecture: $ARCH"
    abort "! Unsupported architecture: $ARCH"
    ;;
esac

ui_print "- Architecture detected: $ARCH"
ui_print "- Downloading Cloudflared ($BINARY_NAME)..."
# Make sure your device is connected to internet while flashing via KSU App
curl -L -o "$MODPATH/cloudflared" "https://github.com/cloudflare/cloudflared/releases/latest/download/$BINARY_NAME"

if [ -f "$MODPATH/cloudflared" ]; then
    ui_print "- Download completed. Setting permissions..."
    chmod +x "$MODPATH/cloudflared"
    chmod +x "$MODPATH/service.sh"
    chmod +x "$MODPATH/cloudflared-manager.sh"
else
    abort "! Failed to download binary. Make sure internet is active!"
fi

# Create empty token file
touch "$MODPATH/token.txt"
chmod 644 "$MODPATH/token.txt"

ui_print "- Module ready!"