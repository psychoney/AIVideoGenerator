const form = document.querySelector("#generatorForm");
const promptInput = document.querySelector("#prompt");
const fileInput = document.querySelector("#imageUpload");
const fileName = document.querySelector("#fileName");
const button = document.querySelector("#generateButton");
const statusText = document.querySelector("#statusText");
const progressValue = document.querySelector("#progressValue");
const progressBar = document.querySelector("#progressBar");
const queueList = document.querySelector("#queueList");
const videoPreview = document.querySelector("#videoPreview");

const demoPrompts = [
  "一款轻量跑鞋，城市夜跑场景，霓虹灯反射在湿润路面，镜头跟随脚步，突出缓震和速度感",
  "高端护肤精华瓶，清晨自然光，水滴与透明质感，镜头慢速环绕，适合电商详情页短视频",
  "AI 课程宣传片，数字人口播，干净办公空间背景，字幕强调效率提升和实战案例"
];

let activeTimer = null;

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  fileName.textContent = file ? file.name : "PNG/JPG 商品图或人物图";
});

promptInput.addEventListener("focus", () => {
  if (!promptInput.value.trim()) {
    promptInput.value = demoPrompts[Math.floor(Math.random() * demoPrompts.length)];
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const payload = {
    prompt: formData.get("prompt")?.toString().trim(),
    model: formData.get("model"),
    ratio: formData.get("ratio"),
    duration: formData.get("duration"),
    style: formData.get("style"),
    hasReferenceImage: Boolean(fileInput.files?.[0])
  };

  if (!payload.prompt) {
    promptInput.focus();
    setStatus("请输入提示词", 0);
    return;
  }

  button.disabled = true;
  button.textContent = "中转中";
  videoPreview.classList.remove("generated");
  videoPreview.querySelector("p").textContent = "生成中";
  addQueueItem(payload);

  try {
    await mockGenerateVideo(payload);
    videoPreview.classList.add("generated");
    videoPreview.querySelector("p").textContent = "已生成预览";
    setStatus("生成完成", 100);
  } catch (error) {
    setStatus("生成失败，请重试", 0);
  } finally {
    button.disabled = false;
    button.textContent = "创建中转任务";
  }
});

function setStatus(label, progress) {
  statusText.textContent = label;
  progressValue.textContent = `${progress}%`;
  progressBar.style.width = `${progress}%`;
  const activeItem = queueList.querySelector(".queue-item.active");
  if (activeItem) {
    activeItem.querySelector("small").textContent = label;
    activeItem.lastElementChild.textContent = progress === 100 ? "MP4" : `${progress}%`;
    activeItem.querySelector(".queue-dot").classList.toggle("done", progress === 100);
  }
}

function addQueueItem(payload) {
  const item = document.createElement("article");
  item.className = "queue-item active";
  item.innerHTML = `
    <span class="queue-dot"></span>
    <div>
      <strong>${escapeHtml(payload.style || "AI 视频")}</strong>
      <small>排队中</small>
    </div>
    <span>0%</span>
  `;

  queueList.querySelectorAll(".queue-item.active").forEach((node) => {
    node.classList.remove("active");
  });
  queueList.prepend(item);
}

function mockGenerateVideo(payload) {
  clearInterval(activeTimer);
  const steps = [
    [8, "校验请求参数"],
    [18, payload.model === "auto" ? "选择最优上游模型" : `锁定 ${payload.model} 模型`],
    [32, "提交上游任务"],
    [48, "轮询上游状态"],
    [66, "同步 credits 成本"],
    [84, "拉取视频结果"],
    [100, "中转完成"]
  ];
  let index = 0;

  return new Promise((resolve) => {
    setStatus(steps[0][1], steps[0][0]);
    activeTimer = setInterval(() => {
      index += 1;
      const step = steps[index];
      if (!step) {
        clearInterval(activeTimer);
        resolve();
        return;
      }
      setStatus(step[1], step[0]);
    }, 680);
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return entities[character];
  });
}

// Replace mockGenerateVideo with a real relay request when your backend is ready:
// async function generateVideo(payload) {
//   const response = await fetch("/api/video-tasks", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload)
//   });
//   if (!response.ok) throw new Error("Video generation failed");
//   return response.json();
// }
