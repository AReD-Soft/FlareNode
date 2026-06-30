# Flare Node ☄️

Flare Node is a Cloudflared Tunnel Manager designed for rooted Android and Linux-based environments.  
It provides a streamlined utility project focused on networking, allowing developers and advanced users to easily run and manage Cloudflare Tunnels directly from their Android devices.

The project enables secure exposure of local services or secure outbound traffic routing via Cloudflare Zero Trust without requiring a dedicated desktop server or complex terminal commands.

---

## Overview

Flare Node provides an intuitive WebUI to manage the `cloudflared` daemon within a **Magisk/KernelSU environment**. 

It simplifies the process of configuring tunnels by allowing users to input their Cloudflare Token, control the daemon state, and monitor logs directly from the dashboard.

The project is intended for advanced use cases such as:
- Exposing local Android web servers or services to the internet securely
- Managing remote access to the device
- Custom networking and tunneling workflows
- Development and testing of edge network configurations
  
---

## Dashboard Preview

<p align="left">
<img width="400" alt="image" src="https://github.com/user-attachments/assets/09fb4470-926e-4f0b-b25d-4a0a30745c2f" alt="Flare Node UI"/>
</p>

---

## Key Capabilities

- **Real-time Device Insights:** Displays active Model, Android Version, Kernel, and currently installed `cloudflared` version.
- **Daemon Control:** One-click operations to **Start**, **Stop**, and monitor the Tunnel Status (including active PID).
- **Token Management:** Securely input and save your Cloudflare Tunnel Token directly through the UI.
- **Integrated Log Viewer:** Read real-time daemon execution logs (`flare_daemon.log`) to track connection states (e.g., protocol suggestions like QUIC, precheck status) and clear them as needed.
- Modular and flexible design suitable for advanced networking workflows.

---

## Logging and Configuration

Flare Node maintains execution logs to ensure transparency and aid in debugging tunnel connections.

### Execution Logs
- Logs are actively recorded in `flare_daemon.log`.
- The UI provides direct access to view the last execution lines or clear the log buffer.
- Logs are critical for debugging:
  - Network reachability issues
  - Token authentication errors
  - Protocol fallbacks (e.g., failing over to QUIC)

---

## Requirements

Before using Flare Node, ensure the following components are installed:

### Root Framework
- **Magisk** https://github.com/topjohnwu/Magisk

or

- **KernelSU** https://github.com/tiann/KernelSU

### Web Interface (Required for UI-based management)
- **KSU WebUI** https://github.com/tiann/KernelSU-WebUI

> **Note:** Even if you use Magisk root instead of KernelSU, you can still utilize the WebUI interface as long as the KSU WebUI module is properly configured.
> A valid Cloudflare Zero Trust account and a generated Tunnel Token are required to establish a connection.

---

## License

This project is licensed under the **Apache License, Version 2.0**.

You are free to:
- Use
- Modify
- Distribute
- Integrate this project into commercial or non-commercial products

As long as you comply with the terms of the license.

See the `LICENSE` file for full details.

---

## Attribution

Copyright © 2026  
**AReD Soft**

---

## Disclaimer

This project is provided **"as is"**, without warranty of any kind.  
The author is not responsible for system instability, data loss, or network breaches resulting from improper usage or misconfigured exposed tunnels.

Use with caution when exposing local services to the public internet via Cloudflare Tunnels.

---

## Contributions

Contributions and improvements are welcome.

Please ensure that all contributions:
- Are clearly described
- Do not introduce unsafe system or network behavior
- Remain consistent with the project scope and license

---

## Contact

For bug reports, feature requests, or discussion, please use the GitHub Issues section of this repository.
