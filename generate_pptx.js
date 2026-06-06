const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Trae AI";
pres.title = "对话数据流架构";

// === Color Palette (Dark Tech Theme) ===
const C = {
  darkBg: "0D1117",
  darkerBg: "06090E",
  cardBg: "161B22",
  accent: "00F7FF",      // Cyan accent
  accent2: "58A6FF",     // Blue accent
  accent3: "3FB950",     // Green accent
  accent4: "D29922",     // Yellow/gold
  accent5: "F85149",     // Red
  textPrimary: "F0F6FC",
  textSecondary: "8B949E",
  textMuted: "484F58",
  border: "21262D",
  white: "FFFFFF",
};

// === Helper: Add slide background ===
function addBg(slide, color = C.darkBg) {
  slide.background = { color };
}

// === Helper: Add title bar at top ===
function addTitleBar(slide, title, subtitle) {
  // Top accent line
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.accent },
  });
  slide.addText(title, {
    x: 0.6, y: 0.2, w: 8.8, h: 0.5, fontSize: 22, fontFace: "Arial",
    color: C.textPrimary, bold: true, margin: 0,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6, y: 0.65, w: 8.8, h: 0.3, fontSize: 11, fontFace: "Arial",
      color: C.textSecondary, margin: 0,
    });
  }
  // Separator line
  slide.addShape(pres.shapes.LINE, {
    x: 0.6, y: 0.95, w: 8.8, h: 0, line: { color: C.border, width: 1 },
  });
}

// === Helper: Card box ===
function addCard(slide, x, y, w, h, color = C.cardBg) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, fill: { color }, line: { color: C.border, width: 0.5 },
    rectRadius: 0.08,
  });
}

// ============================================================
// SLIDE 1: Title Slide
// ============================================================
let slide1 = pres.addSlide();
slide1.background = { color: C.darkerBg };

// Decorative elements
slide1.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.accent },
});
slide1.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.accent },
});

// Title
slide1.addText("对话数据流架构", {
  x: 0.8, y: 1.2, w: 8.5, h: 1.0, fontSize: 40, fontFace: "Arial",
  color: C.textPrimary, bold: true, margin: 0,
});

// Subtitle
slide1.addText("Trae AI 沙盒 — 从用户输入到工具执行的完整链路", {
  x: 0.8, y: 2.2, w: 8.5, h: 0.5, fontSize: 16, fontFace: "Arial",
  color: C.accent, margin: 0,
});

// Tags
const tags = [
  { text: "Kata Containers", color: C.accent2 },
  { text: "Kubernetes v1.32", color: C.accent3 },
  { text: "Ubuntu 24.04", color: C.accent4 },
  { text: "ByteDance infra", color: C.accent5 },
];
let tagX = 0.8;
tags.forEach((t) => {
  slide1.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: tagX, y: 2.9, w: 1.8, h: 0.35, fill: { color: C.cardBg },
    line: { color: t.color, width: 0.5 }, rectRadius: 0.06,
  });
  slide1.addText(t.text, {
    x: tagX, y: 2.9, w: 1.8, h: 0.35, fontSize: 10, fontFace: "Arial",
    color: t.color, align: "center", valign: "middle", margin: 0,
  });
  tagX += 2.0;
});

// Bottom info
slide1.addText("2026-06-06  |  Architecture Overview", {
  x: 0.8, y: 4.6, w: 8.5, h: 0.3, fontSize: 11, fontFace: "Arial",
  color: C.textMuted, margin: 0,
});

// ============================================================
// SLIDE 2: Table of Contents
// ============================================================
let slide2 = pres.addSlide();
addBg(slide2);
addTitleBar(slide2, "目录", "CONTENTS");

const tocItems = [
  { num: "01", title: "总体架构分层", desc: "用户层 → 接入层 → 推理层 → 调度层 → 执行层" },
  { num: "02", title: "完整数据流", desc: "从输入到响应的 7 步详解" },
  { num: "03", title: "进程模型", desc: "沙盒内进程树与 Supervisor 管理" },
  { num: "04", title: "网络架构", desc: "网络拓扑、公网访问与限制" },
  { num: "05", title: "存储架构", desc: "磁盘布局、OverlayFS 与持久卷" },
  { num: "06", title: "安全与隔离模型", desc: "5 层隔离机制与沙盒限制" },
  { num: "07", title: "MCP 服务", desc: "内置工具服务与通信方式" },
  { num: "08", title: "预装工具链与规格", desc: "开发工具版本与环境规格汇总" },
];

tocItems.forEach((item, i) => {
  const y = 1.2 + i * 0.52;
  addCard(slide2, 0.6, y, 1.0, 0.42);
  slide2.addText(item.num, {
    x: 0.6, y, w: 1.0, h: 0.42, fontSize: 16, fontFace: "Arial",
    color: C.accent, align: "center", valign: "middle", bold: true, margin: 0,
  });
  addCard(slide2, 1.7, y, 7.7, 0.42);
  slide2.addText(item.title, {
    x: 1.85, y: y + 0.02, w: 7.4, h: 0.22, fontSize: 13, fontFace: "Arial",
    color: C.textPrimary, bold: true, margin: 0,
  });
  slide2.addText(item.desc, {
    x: 1.85, y: y + 0.22, w: 7.4, h: 0.18, fontSize: 9, fontFace: "Arial",
    color: C.textSecondary, margin: 0,
  });
});

// ============================================================
// SLIDE 3: Architecture Overview - 5 Layers
// ============================================================
let slide3 = pres.addSlide();
addBg(slide3);
addTitleBar(slide3, "总体架构分层", "FIVE-LAYER ARCHITECTURE");

const layers = [
  { name: "用户层", tag: "User Layer", desc: "你在 Trae IDE 中输入文字或语音", color: C.accent5 },
  { name: "接入层", tag: "Access Layer", desc: "Trae 后端网关 · 负载均衡 · 认证 · WebSocket", color: C.accent4 },
  { name: "推理层", tag: "Inference Layer", desc: "LLM 推理 (DeepSeek) · 对话管理 · 工具调用调度", color: C.accent3 },
  { name: "调度层", tag: "Orchestration", desc: "Kubernetes v1.32 · Pod 管理 · 网络策略 · 存储卷", color: C.accent2 },
  { name: "执行层", tag: "Execution Layer", desc: "Kata Container · Supervisor · Agent Tool Host · MCP", color: C.accent },
];

layers.forEach((l, i) => {
  const y = 1.2 + i * 0.85;
  // Arrow connector between layers
  if (i > 0) {
    slide3.addShape(pres.shapes.LINE, {
      x: 1.85, y: 1.2 + i * 0.85 - 0.05, w: 0, h: 0.15,
      line: { color: C.border, width: 1.5 },
    });
  }
  // Number circle
  slide3.addShape(pres.shapes.OVAL, {
    x: 0.6, y: y + 0.08, w: 0.45, h: 0.45,
    fill: { color: l.color },
  });
  slide3.addText(String(i + 1), {
    x: 0.6, y: y + 0.08, w: 0.45, h: 0.45, fontSize: 16, fontFace: "Arial",
    color: C.white, align: "center", valign: "middle", bold: true, margin: 0,
  });
  // Layer card
  addCard(slide3, 1.2, y, 8.2, 0.65);
  slide3.addText(l.name, {
    x: 1.35, y: y + 0.05, w: 2.5, h: 0.3, fontSize: 15, fontFace: "Arial",
    color: l.color, bold: true, margin: 0,
  });
  slide3.addText(l.tag, {
    x: 1.35, y: y + 0.32, w: 2.5, h: 0.25, fontSize: 9, fontFace: "Arial",
    color: C.textMuted, margin: 0,
  });
  slide3.addText(l.desc, {
    x: 3.5, y: y + 0.08, w: 5.7, h: 0.5, fontSize: 11, fontFace: "Arial",
    color: C.textSecondary, valign: "middle", margin: 0,
  });
});

// ============================================================
// SLIDE 4: Data Flow - 7 Steps
// ============================================================
let slide4 = pres.addSlide();
addBg(slide4);
addTitleBar(slide4, "完整数据流", "7-STEP DATA FLOW");

const steps = [
  { num: "1", title: "用户输入", desc: "文字 / 语音 / 文件上传", color: C.accent5 },
  { num: "2", title: "传输到云端", desc: "HTTPS / WebSocket → 后端网关", color: C.accent4 },
  { num: "3", title: "LLM 推理", desc: "理解意图 → 决定是否调工具", color: C.accent3 },
  { num: "4", title: "工具调度", desc: "K8s API → Pod 指令下发", color: C.accent2 },
  { num: "5", title: "沙盒执行", desc: "agent-tool-host 执行操作", color: C.accent },
  { num: "6", title: "结果返回", desc: "stdout → K8s API → 推理服务", color: "F97583" },
  { num: "7", title: "生成响应", desc: "LLM 整合 → SSE 推送 → IDE 渲染", color: "BC8CFF" },
];

steps.forEach((s, i) => {
  const x = 0.5 + i * 1.35;
  // Card
  addCard(slide4, x, 1.3, 1.2, 2.3);
  // Arrow between cards
  if (i > 0) {
    slide4.addShape(pres.shapes.LINE, {
      x: 0.5 + i * 1.35 - 0.08, y: 2.45, w: 0.16, h: 0,
      line: { color: C.textMuted, width: 1 },
    });
  }
  // Step number circle
  slide4.addShape(pres.shapes.OVAL, {
    x: x + 0.35, y: 1.45, w: 0.5, h: 0.5,
    fill: { color: s.color },
  });
  slide4.addText(s.num, {
    x: x + 0.35, y: 1.45, w: 0.5, h: 0.5, fontSize: 18, fontFace: "Arial",
    color: C.white, align: "center", valign: "middle", bold: true, margin: 0,
  });
  // Title
  slide4.addText(s.title, {
    x: x + 0.05, y: 2.1, w: 1.1, h: 0.5, fontSize: 12, fontFace: "Arial",
    color: C.textPrimary, align: "center", bold: true, margin: 0,
  });
  // Desc
  slide4.addText(s.desc, {
    x: x + 0.05, y: 2.55, w: 1.1, h: 0.8, fontSize: 9, fontFace: "Arial",
    color: C.textSecondary, align: "center", margin: 0,
  });
});

// Summary row at bottom
addCard(slide4, 0.5, 4.0, 9.0, 1.0, "0D1A29");
slide4.addText([
  { text: "数据流向: ", options: { bold: true, color: C.accent } },
  { text: "你 → Trae IDE → 推理服务 → K8s API → Kata Container(agent-tool-host) → K8s API → 推理服务 → 你", options: { color: C.textSecondary } },
], {
  x: 0.7, y: 4.1, w: 8.6, h: 0.8, fontSize: 11, fontFace: "Arial",
  valign: "middle", margin: 0,
  lineSpacingMultiple: 1.3,
});

// ============================================================
// SLIDE 5: Process Model
// ============================================================
let slide5 = pres.addSlide();
addBg(slide5);
addTitleBar(slide5, "进程模型", "PROCESS HIERARCHY");

// Process tree visualization
const procs = [
  { level: 0, name: "tini (PID 1)", desc: "init 进程，处理僵尸进程", color: C.accent4 },
  { level: 1, name: "supervisord (PID 825)", desc: "进程管理器，监控 agent-tool-host", color: C.accent5 },
  { level: 2, name: "agent-tool-host (PID 826)", desc: "工具执行代理，接收推理服务指令", color: C.accent },
  { level: 3, name: "bash (子进程)", desc: "用户命令执行 (RunCommand)", color: C.textSecondary },
  { level: 3, name: "MCP Browser", desc: "浏览器自动化服务", color: C.textSecondary },
  { level: 3, name: "MCP PDF", desc: "PDF 表单填充/校验/提取", color: C.textSecondary },
  { level: 3, name: "MCP Office", desc: "DOCX/PPTX/XLSX 文档处理", color: C.textSecondary },
];

let treeY = 1.3;
procs.forEach((p) => {
  const indent = 0.8 + p.level * 0.8;
  // Connector line
  if (p.level > 0) {
    slide5.addShape(pres.shapes.LINE, {
      x: indent - 0.15, y: treeY - 0.04, w: 0, h: 0.2,
      line: { color: C.border, width: 1 },
    });
  }
  // Circle indicator
  slide5.addShape(pres.shapes.OVAL, {
    x: indent, y: treeY + 0.08, w: 0.25, h: 0.25,
    fill: { color: p.color },
  });
  // Name
  slide5.addText(p.name, {
    x: indent + 0.35, y: treeY, w: 3.5, h: 0.22, fontSize: 12, fontFace: "Arial",
    color: p.color, bold: p.level <= 2, margin: 0,
  });
  // Description
  slide5.addText(p.desc, {
    x: indent + 0.35, y: treeY + 0.2, w: 5, h: 0.2, fontSize: 9, fontFace: "Arial",
    color: C.textSecondary, margin: 0,
  });
  treeY += 0.55;
});

// Supervisor config card
addCard(slide5, 5.5, 1.3, 3.8, 3.6);
slide5.addText("Supervisor 配置", {
  x: 5.7, y: 1.4, w: 3.4, h: 0.3, fontSize: 11, fontFace: "Arial",
  color: C.accent2, bold: true, margin: 0,
});
const configLines = [
  "autostart=true",
  "autorestart=true",
  "startretries=3",
  "startsecs=2",
  "stdout: /var/log/tool/",
  "stderr: /var/log/tool/",
];
slide5.addText(configLines.map((l, i) => ({
  text: l + (i < configLines.length - 1 ? "\n" : ""),
  options: { fontSize: 9, fontFace: "Consolas", color: C.textSecondary, breakLine: i < configLines.length - 1 },
})), {
  x: 5.7, y: 1.8, w: 3.4, h: 2.5, margin: 0,
  lineSpacingMultiple: 1.4,
});

// ============================================================
// SLIDE 6: Network Architecture
// ============================================================
let slide6 = pres.addSlide();
addBg(slide6);
addTitleBar(slide6, "网络架构", "NETWORK TOPOLOGY");

// Network topology visualization
const netBoxes = [
  { x: 0.6, y: 1.2, w: 2.5, h: 0.6, label: "用户设备", sub: "手机 / 电脑", color: C.accent5 },
  { x: 3.7, y: 1.2, w: 2.5, h: 0.6, label: "Trae 后端网关", sub: "公网可达", color: C.accent4 },
  { x: 6.8, y: 1.2, w: 2.5, h: 0.6, label: "推理服务集群", sub: "私有网络", color: C.accent3 },
  { x: 0.6, y: 3.5, w: 3.0, h: 0.8, label: "Kata Container", sub: "10.54.11.105/12", color: C.accent },
  { x: 4.2, y: 3.5, w: 2.2, h: 0.8, label: "HTTPS Proxy", sub: "127.0.0.1:18080", color: C.accent2 },
  { x: 7.0, y: 3.5, w: 2.2, h: 0.8, label: "K8s DNS", sub: "172.30.1.10", color: C.textMuted },
];

// Connection lines
slide6.addShape(pres.shapes.LINE, { x: 3.1, y: 1.5, w: 0.6, h: 0, line: { color: C.textMuted, width: 1 } });
slide6.addShape(pres.shapes.LINE, { x: 6.2, y: 1.5, w: 0.6, h: 0, line: { color: C.textMuted, width: 1 } });
slide6.addShape(pres.shapes.LINE, { x: 1.85, y: 1.8, w: 0, h: 0.6, line: { color: C.textMuted, width: 1, dashType: "dash" } });
// Vertical connector from inference to K8s
slide6.addShape(pres.shapes.LINE, { x: 8.05, y: 1.8, w: 0, h: 0.6, line: { color: C.textMuted, width: 1 } });
slide6.addShape(pres.shapes.LINE, { x: 8.05, y: 2.4, w: -2.8, h: 0, line: { color: C.textMuted, width: 1 } });
slide6.addShape(pres.shapes.LINE, { x: 5.25, y: 2.4, w: 0, h: 1.1, line: { color: C.textMuted, width: 1 } });

netBoxes.forEach((b) => {
  addCard(slide6, b.x, b.y, b.w, b.h, b.color === C.textMuted ? C.cardBg : undefined);
  if (b.color !== C.textMuted) {
    slide6.addShape(pres.shapes.RECTANGLE, {
      x: b.x, y: b.y, w: 0.06, h: b.h, fill: { color: b.color },
    });
  }
  slide6.addText(b.label, {
    x: b.x + 0.15, y: b.y + 0.08, w: b.w - 0.2, h: 0.35, fontSize: 12, fontFace: "Arial",
    color: b.color === C.textMuted ? C.textSecondary : b.color, bold: true, margin: 0,
  });
  slide6.addText(b.sub, {
    x: b.x + 0.15, y: b.y + 0.42, w: b.w - 0.2, h: 0.3, fontSize: 9, fontFace: "Arial",
    color: C.textSecondary, margin: 0,
  });
});

// Network capabilities table at bottom
addCard(slide6, 0.6, 4.6, 8.8, 0.7);
slide6.addText("出站: GitHub ✅  |  通用外网 ✅ (NAT)  |  Google ❌  |  入站从公网: ❌ 不可达  |  出口 IP 不固定", {
  x: 0.8, y: 4.65, w: 8.4, h: 0.6, fontSize: 9, fontFace: "Arial",
  color: C.textSecondary, valign: "middle", margin: 0,
});

// ============================================================
// SLIDE 7: Storage Architecture
// ============================================================
let slide7 = pres.addSlide();
addBg(slide7);
addTitleBar(slide7, "存储架构", "STORAGE LAYOUT");

// Disk layout
const disks = [
  { label: "/dev/vda (40 GB)", color: C.accent2, items: [
    { name: "/workspace", desc: "用户工作区 (ext4, 持久化)", size: "32G/40G" },
    { name: "/data/user", desc: "技能定义和脚本 (ext4, 持久化)", size: "" },
    { name: "/data/tool", desc: "工具缓存 (ext4, 持久化)", size: "" },
    { name: "/var/log/tool", desc: "运行日志 (ext4, 持久化)", size: "" },
  ]},
  { label: "OverlayFS (40 GB, 临时)", color: C.accent5, items: [
    { name: "/ (根文件系统)", desc: "46 层只读镜像层 + 可写层", size: "容器销毁后丢失" },
    { name: "/app", desc: "应用二进制和配置", size: "" },
    { name: "/root", desc: "预装开发环境 (nvm/pyenv等)", size: "" },
  ]},
  { label: "/dev/pmem0 (1.4 GB)", color: C.accent4, items: [
    { name: "持久内存设备", desc: "Kata Container 根文件系统", size: "" },
  ]},
];

let diskY = 1.3;
disks.forEach((d) => {
  // Disk header
  slide7.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: diskY, w: 8.8, h: 0.35, fill: { color: C.cardBg },
    line: { color: d.color, width: 0.5 }, rectRadius: 0.04,
  });
  slide7.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: diskY, w: 0.06, h: 0.35, fill: { color: d.color },
  });
  slide7.addText(d.label, {
    x: 0.8, y: diskY, w: 6, h: 0.35, fontSize: 11, fontFace: "Arial",
    color: d.color, bold: true, valign: "middle", margin: 0,
  });
  diskY += 0.4;

  d.items.forEach((item) => {
    addCard(slide7, 0.9, diskY, 8.5, 0.32);
    slide7.addText(item.name, {
      x: 1.1, y: diskY, w: 2.5, h: 0.32, fontSize: 10, fontFace: "Arial",
      color: C.textPrimary, bold: true, valign: "middle", margin: 0,
    });
    slide7.addText(item.desc, {
      x: 3.6, y: diskY, w: 4.0, h: 0.32, fontSize: 9, fontFace: "Arial",
      color: C.textSecondary, valign: "middle", margin: 0,
    });
    if (item.size) {
      slide7.addText(item.size, {
        x: 7.6, y: diskY, w: 1.6, h: 0.32, fontSize: 8, fontFace: "Arial",
        color: C.textMuted, valign: "middle", align: "right", margin: 0,
      });
    }
    diskY += 0.37;
  });

  diskY += 0.12;
});

// ============================================================
// SLIDE 8: Security & Isolation
// ============================================================
let slide8 = pres.addSlide();
addBg(slide8);
addTitleBar(slide8, "安全与隔离模型", "SECURITY & ISOLATION");

const secLayers = [
  { level: 5, name: "Kata VM", desc: "硬件虚拟化，独立内核", protection: "防止容器逃逸到宿主机" },
  { level: 4, name: "K8s NetworkPolicy", desc: "网络 ACL", protection: "限制 Pod 间通信" },
  { level: 3, name: "容器用户隔离", desc: "以 root 运行但受限", protection: "沙盒内操作隔离" },
  { level: 2, name: "工具调用沙盒", desc: "agent-tool-host 控制执行", protection: "限制工具调用范围" },
  { level: 1, name: "上下文隔离", desc: "每个 Session 独立", protection: "不同对话不互相干扰" },
];

secLayers.forEach((l) => {
  const y = 1.3 + (5 - l.level) * 0.75;
  // Layer bar
  const w = 3.0 + l.level * 0.7;
  slide8.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.5 - w / 2, y, w, h: 0.6,
    fill: { color: C.cardBg }, line: { color: C.accent2, width: 0.5 },
    rectRadius: 0.06,
  });
  slide8.addText(`${l.level}  ${l.name}`, {
    x: 5.5 - w / 2 + 0.1, y: y + 0.02, w: w - 0.2, h: 0.28, fontSize: 12, fontFace: "Arial",
    color: C.accent2, bold: true, margin: 0,
  });
  slide8.addText(`${l.desc}  →  ${l.protection}`, {
    x: 5.5 - w / 2 + 0.1, y: y + 0.28, w: w - 0.2, h: 0.28, fontSize: 9, fontFace: "Arial",
    color: C.textSecondary, margin: 0,
  });
});

// Restrictions card
addCard(slide8, 0.6, 4.3, 8.8, 0.9);
slide8.addText("沙盒限制", {
  x: 0.8, y: 4.35, w: 2, h: 0.3, fontSize: 11, fontFace: "Arial",
  color: C.accent5, bold: true, margin: 0,
});
slide8.addText("无 GPU  |  无 /dev/dri  |  无法加载内核模块  |  K8s API 仅代理访问  |  无 ServiceAccount  |  公网入站不可达", {
  x: 0.8, y: 4.65, w: 8.4, h: 0.45, fontSize: 9, fontFace: "Arial",
  color: C.textSecondary, valign: "middle", margin: 0,
});

// ============================================================
// SLIDE 9: Session Lifecycle
// ============================================================
let slide9 = pres.addSlide();
addBg(slide9);
addTitleBar(slide9, "会话生命周期", "SESSION LIFECYCLE");

const lifecycleSteps = [
  { label: "打开 IDE", desc: "触发会话创建" },
  { label: "K8s 创建 Pod", desc: "拉取镜像 → 挂载卷 → 分配网络" },
  { label: "启动进程", desc: "tini → supervisord → agent-tool-host" },
  { label: "对话进行中", desc: "LLM ↔ 沙盒 持续通信" },
  { label: "会话结束", desc: "Pod Terminating → 卸载卷 → 删除" },
  { label: "下次会话", desc: "新 Pod → 挂载同一 /workspace" },
];

lifecycleSteps.forEach((s, i) => {
  const y = 1.3 + i * 0.7;
  // Vertical connector
  if (i > 0) {
    slide9.addShape(pres.shapes.LINE, {
      x: 0.825, y: 1.3 + i * 0.7 - 0.05, w: 0, h: 0.15,
      line: { color: C.accent, width: 1.5 },
    });
  }
  // Circle
  slide9.addShape(pres.shapes.OVAL, {
    x: 0.6, y: y + 0.08, w: 0.45, h: 0.45,
    fill: { color: i < 4 ? C.accent : C.accent5 },
  });
  slide9.addText(String(i + 1), {
    x: 0.6, y: y + 0.08, w: 0.45, h: 0.45, fontSize: 14, fontFace: "Arial",
    color: C.white, align: "center", valign: "middle", bold: true, margin: 0,
  });
  // Card
  addCard(slide9, 1.3, y, 8.1, 0.52);
  slide9.addText(s.label, {
    x: 1.5, y: y + 0.03, w: 3, h: 0.25, fontSize: 13, fontFace: "Arial",
    color: C.textPrimary, bold: true, margin: 0,
  });
  slide9.addText(s.desc, {
    x: 1.5, y: y + 0.27, w: 7.5, h: 0.22, fontSize: 10, fontFace: "Arial",
    color: C.textSecondary, margin: 0,
  });
});

// ============================================================
// SLIDE 10: MCP Services
// ============================================================
let slide10 = pres.addSlide();
addBg(slide10);
addTitleBar(slide10, "MCP 服务", "MODEL CONTEXT PROTOCOL SERVICES");

const mcpServices = [
  { name: "docx", desc: "Word 文档生成/编辑", tech: "Python (python-docx, OOXML)", color: C.accent2 },
  { name: "pdf", desc: "PDF 表单填充/校验/提取", tech: "Python (PyPDF2, pdfplumber)", color: C.accent3 },
  { name: "pptx", desc: "PPT 幻灯片生成/设计", tech: "Python + pptxgenjs (Node.js)", color: C.accent4 },
  { name: "xlsx", desc: "Excel 电子表格操作", tech: "Python (openpyxl)", color: C.accent5 },
  { name: "browser", desc: "浏览器自动化", tech: "基于 CDP 协议", color: C.accent },
];

mcpServices.forEach((s, i) => {
  const x = 0.4 + i * 1.9;
  addCard(slide10, x, 1.3, 1.7, 2.6);
  // Top color bar
  slide10.addShape(pres.shapes.RECTANGLE, {
    x, y: 1.3, w: 1.7, h: 0.06, fill: { color: s.color },
  });
  // Name
  slide10.addText(s.name, {
    x: x + 0.1, y: 1.5, w: 1.5, h: 0.4, fontSize: 16, fontFace: "Arial",
    color: s.color, bold: true, margin: 0,
  });
  // Description
  slide10.addText(s.desc, {
    x: x + 0.1, y: 2.0, w: 1.5, h: 0.6, fontSize: 10, fontFace: "Arial",
    color: C.textPrimary, margin: 0,
  });
  // Tech
  slide10.addText(s.tech, {
    x: x + 0.1, y: 2.7, w: 1.5, h: 0.8, fontSize: 9, fontFace: "Arial",
    color: C.textSecondary, margin: 0,
  });
});

// Communication card
addCard(slide10, 0.4, 4.2, 9.2, 0.8);
slide10.addText("通信方式:  ", {
  x: 0.6, y: 4.3, w: 1.2, h: 0.3, fontSize: 11, fontFace: "Arial",
  color: C.accent, bold: true, margin: 0,
});
slide10.addText("Agent Tool Host ↔ MCP 子进程  |  JSON-RPC (stdin/stdout 或 HTTP)  |  标准输入接收请求 → 标准输出返回结果 → 标准错误输出日志", {
  x: 1.7, y: 4.3, w: 7.7, h: 0.6, fontSize: 10, fontFace: "Arial",
  color: C.textSecondary, valign: "middle", margin: 0,
});

// ============================================================
// SLIDE 11: Dev Tools
// ============================================================
let slide11 = pres.addSlide();
addBg(slide11);
addTitleBar(slide11, "预装工具链", "DEVELOPMENT TOOLCHAIN");

const tools = [
  { name: "Node.js", version: "v24.15.0", mgr: "nvm" },
  { name: "Python", version: "3.14.4", mgr: "pyenv" },
  { name: "Go", version: "1.25.1", mgr: "mise" },
  { name: "Rust", version: "1.92.0", mgr: "rustup" },
  { name: "Git", version: "2.43.0", mgr: "系统包" },
  { name: "PHP", version: "8.x", mgr: "phpenv" },
  { name: "Bazelisk", version: "latest", mgr: "/usr/local/bin" },
  { name: "Composer", version: "latest", mgr: "/usr/local/bin" },
  { name: "Oh My Zsh", version: "latest", mgr: "直接安装" },
];

// Build table data
const headerRow = [
  { text: "工具", options: { fill: { color: "1A2332" }, color: C.accent, bold: true, fontSize: 10, fontFace: "Arial" } },
  { text: "版本", options: { fill: { color: "1A2332" }, color: C.accent, bold: true, fontSize: 10, fontFace: "Arial" } },
  { text: "安装方式", options: { fill: { color: "1A2332" }, color: C.accent, bold: true, fontSize: 10, fontFace: "Arial" } },
];
const tableRows = tools.map((t, i) => {
  const bgColor = i % 2 === 0 ? C.cardBg : "0F1419";
  return [
    { text: t.name, options: { fill: { color: bgColor }, color: C.textPrimary, fontSize: 10, fontFace: "Arial", bold: true } },
    { text: t.version, options: { fill: { color: bgColor }, color: C.textSecondary, fontSize: 10, fontFace: "Consolas" } },
    { text: t.mgr, options: { fill: { color: bgColor }, color: C.textSecondary, fontSize: 10, fontFace: "Arial" } },
  ];
});

slide11.addTable([headerRow, ...tableRows], {
  x: 0.8, y: 1.3, w: 8.4,
  colW: [2.5, 3.0, 2.9],
  border: { pt: 0.5, color: C.border },
  rowH: [0.35, ...tools.map(() => 0.35)],
  margin: [2, 6, 2, 6],
  autoPage: false,
});

// OS info card
addCard(slide11, 0.8, 4.7, 8.4, 0.5);
slide11.addText("基础 OS: Ubuntu 24.04.3 LTS (Noble Numbat)  |  架构: x86_64  |  区域: CN", {
  x: 1.0, y: 4.75, w: 8.0, h: 0.4, fontSize: 10, fontFace: "Arial",
  color: C.textSecondary, valign: "middle", margin: 0,
});

// ============================================================
// SLIDE 12: Specs Summary
// ============================================================
let slide12 = pres.addSlide();
addBg(slide12);
addTitleBar(slide12, "环境规格汇总", "SPECIFICATIONS SUMMARY");

const specs = [
  ["基础镜像", "trae/ai_agent/tool_host:1.0.0.573"],
  ["镜像版本", "b5e0d70ed042660399cdae684b1bf84da171e253"],
  ["基础 OS", "Ubuntu 24.04.3 LTS (Noble Numbat)"],
  ["容器运行时", "Docker + containerd + Kata Containers"],
  ["编排平台", "Kubernetes v1.32.3-vke.10 (火山引擎 VKE)"],
  ["物理 CPU", "Intel Xeon Platinum 8457C (Sapphire Rapids)"],
  ["vCPU / 内存", "2 核 / ~4 GB (3.8 GiB)"],
  ["磁盘", "40 GB (已用 ~32 GB，可用 ~7.6 GB)"],
  ["沙盒 IP", "10.54.x.x/12 (私网)"],
  ["公网访问", "出站 NAT，入站不可达"],
  ["虚拟化平台", "OpenStack Nova / ByteDance Inc."],
];

const specHeader = [
  { text: "组件", options: { fill: { color: "1A2332" }, color: C.accent, bold: true, fontSize: 10, fontFace: "Arial" } },
  { text: "规格", options: { fill: { color: "1A2332" }, color: C.accent, bold: true, fontSize: 10, fontFace: "Arial" } },
];
const specRows = specs.map((s, i) => {
  const bgColor = i % 2 === 0 ? C.cardBg : "0F1419";
  return [
    { text: s[0], options: { fill: { color: bgColor }, color: C.textPrimary, fontSize: 10, fontFace: "Arial", bold: true } },
    { text: s[1], options: { fill: { color: bgColor }, color: C.textSecondary, fontSize: 10, fontFace: "Arial" } },
  ];
});

slide12.addTable([specHeader, ...specRows], {
  x: 0.6, y: 1.2, w: 8.8,
  colW: [2.5, 6.3],
  border: { pt: 0.5, color: C.border },
  rowH: [0.35, ...specs.map(() => 0.3)],
  margin: [2, 6, 2, 6],
  autoPage: false,
});

// ============================================================
// SLIDE 13: Thank You / End Slide
// ============================================================
let slide13 = pres.addSlide();
slide13.background = { color: C.darkerBg };

slide13.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.accent },
});

slide13.addText("THANK YOU", {
  x: 0.8, y: 1.8, w: 8.5, h: 1.0, fontSize: 44, fontFace: "Arial",
  color: C.textPrimary, bold: true, align: "center", margin: 0,
});

slide13.addText("对话数据流架构 · Architecture Overview", {
  x: 0.8, y: 2.8, w: 8.5, h: 0.5, fontSize: 16, fontFace: "Arial",
  color: C.accent, align: "center", margin: 0,
});

slide13.addText("完整文档见 ARCHITECTURE.md", {
  x: 0.8, y: 3.8, w: 8.5, h: 0.4, fontSize: 13, fontFace: "Arial",
  color: C.textSecondary, align: "center", margin: 0,
});

// ============================================================
// Save
// ============================================================
pres.writeFile({ fileName: "/workspace/对话数据流架构.pptx" })
  .then(() => console.log("PPTX saved successfully!"))
  .catch((err) => console.error("Error:", err));