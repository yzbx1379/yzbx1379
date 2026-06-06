# 对话数据流架构

记录 Trae AI 沙盒与用户之间的对话数据流。

---

## 整体架构

```
 用户 (你)
    │
    │ 输入文字/语音
    ▼
 Trae IDE (客户端)
    │
    │ HTTPS / WebSocket
    ▼
 LLM 推理服务 (云端)
    │
    │ 工具调用指令
    ▼
 Kubernetes API Server
    │
    │ 调度 Pod
    ▼
 Kata Container (沙盒 VM)
    │
    ├── Supervisor (进程管理)
    │
    └── Agent Tool Host (工具执行代理)
          │
          ├── 代码执行
          ├── 文件操作
          └── MCP 服务 (浏览器/Office等)
```

---

## 数据流步骤

### Step 1 — 输入
你在 Trae IDE 中输入消息（文字或语音）。

### Step 2 — 传输
IDE 通过 HTTPS/WebSocket 将消息发送到云端推理服务。

### Step 3 — 推理
LLM 处理输入，理解意图，决定直接回答还是调用工具。

### Step 4 — 工具调用
如果需要工具（读文件、执行代码、搜网页等），推理服务通过 K8s API 向沙盒 Pod 发出指令。

### Step 5 — 执行
沙盒内的 agent-tool-host 接收指令，调用相应工具执行。

### Step 6 — 结果返回
工具执行结果原路返回：agent-tool-host → K8s API → 推理服务。

### Step 7 — 响应
LLM 基于原始问题和工具结果生成最终回答，推送到 IDE 显示。

---

## 关键特性

| 特性 | 说明 |
|------|------|
| 请求处理 | 发生在云端推理服务，沙盒仅作为执行环境 |
| 工具调用 | 全部通过 agent-tool-host 在沙盒内完成 |
| 通信加密 | 全程 HTTPS 加密传输 |
| 沙盒隔离 | 外部不可直达沙盒，只能通过 K8s API 通信 |
| 会话生命周期 | 每次新对话可能创建新 Pod，工作区数据持久保留 |

---

## 环境规格

| 组件 | 规格 |
|------|------|
| 基础镜像 | trae/ai_agent/tool_host:1.0.0.573 (Ubuntu 24.04) |
| 容器运行时 | Kata Containers (轻量级 VM) |
| 编排平台 | Kubernetes v1.32.3-vke.10 (火山引擎 VKE) |
| 沙盒 IP | 10.54.x.x/12 (私网，无公网 IP) |
| 公网访问 | 出站走 NAT 网关，入站不可达 |
| CPU | 2 核 Intel Xeon Platinum 8457C |
| 内存 | ~4 GB |
| 磁盘 | 40 GB (OverlayFS + /workspace 持久卷) |