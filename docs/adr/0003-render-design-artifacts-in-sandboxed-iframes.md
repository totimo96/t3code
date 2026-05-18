# Render Design Artifacts in Sandboxed Iframes

Standalone Design Documents render in a restricted iframe sandbox instead of being injected into the T3 Code DOM. This protects the app from agent-generated HTML and keeps selection, hit-testing, and preview behavior behind a controlled bridge rather than granting generated scripts direct access to application state.
