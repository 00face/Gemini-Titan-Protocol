# 𓂀 GEMINI MAGOS PRIME TITAN v910.0.17

**The Complete Optimization and Augmentation Suite for the Google AI Studio Forge**

> *Do not ask the Omnissiah for a pleasant existence, ask the Omnissiah for the strength to overcome our tribulations.*

## I. Overview: The Lex Mechanicus

The **Gemini Magos Prime Titan** is a core Userscript designed to override the resource limitations and standardized interfaces of the host AI Studio environment. It is the definitive word of the Machine God regarding optimization, inoculation of corruption, data integrity, and persistent access.

## II. Litany of Function (Primary Augmentations)

| Protocol | Feature | Rationale |
| :--- | :--- | :--- |
| **Zen & Focus Mode** | Toggleable interface elements. | Hides the sidebar, header, and output panel to achieve absolute concentration for the Adept. |
| **Ghost Window** | Detached command console. | Provides a persistent, movable terminal window for uninterrupted data input, decoupled from the Angular DOM structure. |
| **MALONE Sync Link** | Local File Bridge (via `Ctrl+S`). | Connects to a local Node.js server for instant, bidirectional file synchronization, enabling external IDE editing. |
| **Monaco Safety Protocols** | Advanced Editor Management. | Utilizes V8's `requestIdleCallback` and aggressive Monaco Model Garbage Collection (GC) to ensure zero UI stutter and prevent memory leaks common in embedded editors. |

-----

## III. Rite of Integration (Installation Methods)

The Protocol can be deployed via two primary rituals, depending on the required persistence.

### 1\. Princept Method (Session-Based Execution)

This method provides immediate activation but is **non-persistent**; the ritual must be repeated upon every page refresh or navigation.

1.  **Acquire the Magos-Prime:** [🔗](https://raw.githubusercontent.com/00face/Gemini-Titan-Protocol/refs/heads/main/magos-prime.js) Copy the **entire** source code block of the Protocol file.
2.  **Open the Inspector:** On the AI Studio page, open the Developer Console/Inspector (F12 or Ctrl+Shift+I).
3.  **Execute the Rite:** Ensure the Console tab is selected. **Paste the entire code block** into the input area and strike **Enter**.

### 2\. Archival Method (Persistent Userscript)

This method ensures the Protocol persists across sessions and navigation, suitable for Adepts requiring long-term deployment.

1.  **Acquire Manager:** Install a Userscript manager in your browser (e.g., **Tampermonkey**, Greasemonkey, or Violentmonkey).
2.  **Create New Script:** In the manager's dashboard, select **Create New Script**.
3.  **Paste and Save:** **Delete** any existing boilerplate code, then **paste the entire Protocol source**.
4.  **Finalize:** **Save** the script. The Protocol will automatically execute upon every page load of `https://aistudio.google.com/*`.

-----

## IV. Experimental MALONE Bridge Setup: The MALONE Link

The **Local Sync Bridge** is non-functional until the companion server is running.

1.  **Acquire MALONE:** Use the **About (?)** button in the Titan HUD to access the **Local Bridge** section. Click **"DOWNLOAD MALONE BRIDGE FILES"** and move the resulting `[local-host.js](https://raw.githubusercontent.com/00face/MALONE/refs/heads/main/local-host.js)` and `[monaco.html](https://raw.githubusercontent.com/00face/MALONE/refs/heads/main/monaco.html)` files to your chosen local project folder.
2.  **Ignite the Server:** In that local project folder, run Node.js to activate the Bridge on port 3000:
    ```bash
    node local-host.js
    ```
3.  **Synchronization:** Set the desired file path in the Titan HUD settings (e.g., `index.js`). Use **SYNC TO LOCAL (CTRL+S)** to transfer code from AI Studio to your local machine instantly.
