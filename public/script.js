
document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chatBox");
  const userPrompt = document.getElementById("userPrompt");

  function showTab(tabName) {
    document.querySelectorAll(".tab").forEach(tab => tab.style.display = "none");
    document.getElementById(tabName).style.display = "block";
  }

  window.showTab = showTab;

  function logAI(text) {
    const msg = document.createElement("div");
    msg.className = "ai-msg";
    msg.innerText = "Ai: " + text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function logUser(text) {
    const msg = document.createElement("div");
    msg.className = "user-msg";
    msg.innerText = "User: " + text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  async function sendPrompt() {
    const prompt = userPrompt.value.trim();
    if (!prompt) return;

    logUser(prompt);
    logAI("Processing your request...");

    try {
      const res = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();
      if (data.files && typeof data.files === "object") {
        for (const [filename, content] of Object.entries(data.files)) {
          const cleanContent = content.replace(/```[a-z]*\n?|```/g, "");
          logAI(`Creating ${filename}...`);
          await fetch("/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename, content: cleanContent })
          });
          logAI(`Done creating ${filename}.`);
        }
      }

      if (data.message) logAI(data.message);

      setTimeout(() => checkConsoleForErrors(), 1000);

    } catch (err) {
      logAI("Error occurred: " + err.message);
    }

    userPrompt.value = "";
  }

  window.sendPrompt = sendPrompt;

  function checkConsoleForErrors() {
    try {
      const iframe = document.querySelector("iframe");
      const iframeWindow = iframe.contentWindow;

      if (!iframeWindow) return;

      const originalError = iframeWindow.onerror;
      iframeWindow.onerror = function (msg, url, lineNo, columnNo, error) {
        logAI("Console error detected: " + msg);
        logAI("I'll try to fix it automatically...");
        // You could integrate error-fixing logic here
      };
    } catch (err) {
      logAI("Could not check console: " + err.message);
    }
  }
});
