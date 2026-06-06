# 对话数据流架构

记录 Trae AI 沙盒与用户之间的完整对话数据流。

---

## 1. 总体架构分层

```
                    ┌─────────────────────────────────────┐
                    │       用户层 (User Layer)            │
                    │  你在 Trae IDE 中输入文字或语音       │
                    └──────────────┬──────────────────────┘
                                   │ HTTPS / WSS
                                   ▼
                    ┌─────────────────────────────────────┐
                    │       接入层 (Access Layer)           │
                    │  Trae 后端网关                       │
                    │  - 负载均衡                          │
                    │  - 身份认证 (Token/Cookie)            │
                    │  - 请求路由                          │
                    │  - WebSocket 长连接管理               │
                    └──────────────┬──────────────────────┘
                                   │ 内部 RPC/gRPC
                                   ▼
                    ┌─────────────────────────────────────┐
                    │       推理层 (Inference Layer)        │
                    │  LLM 推理服务 (DeepSeek 模型)         │
                    │  ┌───────────┐ ┌───────────────────┐ │
                    │  │ 对话管理   │ │ 上下文管理         │ │
                    │  │ Session   │ │ Context Window     │ │
                    │  ├───────────┤ ├───────────────────┤ │
                    │  │ 意图识别   │ │ 工具调用调度       │ │
                    │  │  & 规划   │ │ Function Calling   │ │
                    │  └───────────┘ └───────────────────┘ │
                    └──────────────┬──────────────────────┘
                                   │ K8s API (HTTPS)
                                   ▼
                    ┌─────────────────────────────────────┐
                    │       调度层 (Orchestration Layer)    │
                    │  Kubernetes v1.32.3-vke.10          │
                    │  - Pod 创建/销毁                     │
                    │  - 资源配额管理                       │
                    │  - 网络策略                          │
                    │  - 存储卷挂载                        │
                    └──────────────┬──────────────────────┘
                                   │ containerd -> Kata-runtime
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 执行层 (Execution Layer - 沙盒)                       │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │         Kata Container (轻量级虚拟机)                        │   │
│  │         - 独立 Linux 内核 5.15.120.byteatom                 │   │
│  │         - 2 vCPU Intel Xeon Platinum 8457C                 │   │
│  │         - ~4 GB RAM                                        │   │
│  │         - vsock 与宿主机通信                                │   │
│  │         - 容器网络: 10.54.x.x/12                           │   │
│  │                                                             │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │  Supervisor (进程管理器)                             │   │   │
│  │  │  PID 1: tini → supervisord                          │   │   │
│  │  │  配置: /app/supervisord.conf                        │   │   │
│  │  │  职责: 管理 agent-tool-host 生命周期                  │   │   │
│  │  │  - 自动启动 (autostart=true)                        │   │   │
│  │  │  - 崩溃自动重启 (autorestart=true)                   │   │   │
│  │  │  - 最多重试 3 次 (startretries=3)                   │   │   │
│  │  └──────────────────┬──────────────────────────────────┘   │   │
│  │                      │ 管理                                 │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │  Agent Tool Host (工具执行代理)                      │   │   │
│  │  │  二进制: /app/bin/agent-tool-host                   │   │   │
│  │  │  配置:                                              │   │   │
│  │  │  - MCP 服务配置: /app/etc/mcp_servers.json          │   │   │
│  │  │  - IDE 配置: /app/etc/ide_dynamic_config_basic.json │   │   │
│  │  │  职能:                                              │   │   │
│  │  │  ├── 接收推理服务的工具调用指令                      │   │   │
│  │  │  ├── 在沙盒内执行 (代码/文件/命令)                   │   │   │
│  │  │  ├── 管理 MCP 子进程                                │   │   │
│  │  │  └── 结果回传给推理服务                              │   │   │
│  │  └───┬──────────┬──────────┬─────────────────────────┘   │   │
│  │       │          │          │                             │   │
│  │       ▼          ▼          ▼                             │   │
│  │  ┌────────┐ ┌────────┐ ┌────────────────────┐           │   │
│  │  │ 代码   │ │ 文件   │ │ 技能脚本 (按需)     │           │   │
│  │  │ 执行   │ │ 操作   │ │ - Browser (CDP)    │           │   │
│  │  │        │ │        │ │ - PDF               │           │   │
│  │  │        │ │        │ │ - DOCX              │           │   │
│  │  │        │ │        │ │ - PPTX              │           │   │
│  │  │        │ │        │ │ - XLSX              │           │   │
│  │  └────────┘ └────────┘ └────────────────────┘           │   │
│  │                                                             │   │
│  │  存储架构:                                                  │   │
│  │  ├── / (OverlayFS) — 容器镜像层 (只读) + 可写层 (临时)        │   │
│  │  ├── /workspace (ext4, /dev/vda) — 用户工作区 (持久化)       │   │
│  │  ├── /data/user (ext4) — 技能定义和脚本 (持久化)             │   │
│  │  ├── /data/tool (ext4) — 工具缓存 (持久化)                   │   │
│  │  └── /var/log/tool (ext4) — 运行日志 (持久化)               │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. 完整数据流 (7 步详解)

### Step 1 — 用户输入

你在 Trae IDE 中产生一次交互：

| 输入类型 | 数据格式 | 说明 |
|----------|----------|------|
| 文本消息 | JSON (Chat Completions API) | 普通文字对话 |
| 语音消息 | Opus/WebM 音频 → ASR 转文字 | 语音转文字后同文本流程 |
| 文件上传 | Base64 / Multipart Form | 图片、文档等附件 |
| 代码选择 | 选中行号 + 代码内容 | 上下文补全或解释 |

### Step 2 — IDE 到云端

Trae IDE 通过 HTTPS/WSS 将请求发送到后端网关：

```
请求路径:
  Trae IDE (用户设备)
    → HTTPS Proxy/网关 (认证、限流、路由)
    → 推理服务集群 (负载均衡分发)

网络协议:
  - 文本对话: WebSocket (持久连接, 全双工)
  - 文件上传: HTTPS POST (Multipart)
  - 流式响应: Server-Sent Events (SSE) over WebSocket

认证:
  - Cookie / Token (用户身份)
  - API Key (IDE 客户端标识)
```

### Step 3 — LLM 推理

推理服务收到请求后：

```
1. 对话管理模块解析 Session ID
2. 从上下文存储加载历史记录
3. 组装 Prompt (System + History + User Input)
4. LLM (DeepSeek) 进行推理:
   ├── 直接回答 (不需要工具)
   ├── 调用工具 (需要执行操作)
   │   ├── read / write / edit — 文件操作
   │   ├── RunCommand — 命令执行
   │   ├── WebSearch — 联网搜索
   │   ├── Grep / Glob / SearchCodebase — 代码搜索
   │   └── MCP 服务调用 (浏览器 / Office 等)
   └── 流式输出 Token (通过 SSE 推送到 IDE)
```

### Step 4 — 工具调用调度

当 LLM 决定调用工具时：

```
推理服务
  → 识别需要沙盒执行的工具
  → 通过 K8s API Server (HTTPS, 172.30.0.1:443)
  → 向目标 Pod (当前沙盒) 发送工具调用请求
  → 请求经过:
      K8s API Server (认证/鉴权)
        → kubelet / kata-runtime
          → Agent Tool Host (沙盒内)
```

### Step 5 — 沙盒内执行

Agent Tool Host 收到指令后的执行流程：

```
Agent Tool Host 解析指令:
  ├── 文件操作 (Read / Write / Edit / SearchReplace)
  │     → 直接操作 /workspace 文件系统
  │
  ├── 命令执行 (RunCommand)
  │     → 创建子进程 (bash)
  │     → 设置工作目录: /workspace
  │     → 设置环境变量 (PATH, HOME 等)
  │     → 捕获 stdout/stderr
  │     → 返回退出码 + 输出
  │
  ├── 代码搜索 (Grep / Glob / SearchCodebase)
  │     → 直接执行搜索操作
  │     → 返回匹配结果
  │
  └── MCP 服务调用
        → 启动/复用 MCP 子进程
        → 通过 JSON-RPC 与 MCP 服务通信
        → 处理浏览器自动化、Office 文档等
```

工具执行过程中可能产生副作用：

| 操作 | 副作用 | 说明 |
|------|--------|------|
| 文件写入 | 修改 /workspace 内容 | 持久保留，下次会话可见 |
| 安装依赖 | 下载包到 /workspace 或系统 | 消耗磁盘和网络 |
| 启动服务 | 占用端口、CPU、内存 | 需要显式停止 |
| 浏览器操作 | 截图保存到 /data/tool | 用于结果反馈 |

### Step 6 — 结果返回

```
Agent Tool Host
  → 工具执行结果 (stdout/stderr/退出码/文件内容)
  → K8s API Server
  → 推理服务 (注入到 LLM 上下文)
```

结果数据包括：

| 字段 | 说明 |
|------|------|
| stdout | 标准输出内容 |
| stderr | 错误输出内容 |
| exit_code | 进程退出码 (0=成功) |
| output_files | 生成的文件路径 |
| execution_time | 执行耗时 |
| error | 异常信息 (如有) |

### Step 7 — 生成响应

```
LLM 结合原始问题和工具结果:
  1. 分析工具输出
  2. 推理得出结论
  3. 流式生成最终回答 Token
  4. 通过 WebSocket SSE 推送到 Trae IDE
  5. IDE 渲染显示 (文本/代码高亮/图片)
```

---

## 3. 进程模型

### 沙盒内进程树

```
PID 1: /usr/bin/tini  (init 进程, 处理僵尸进程)
  └─ PID 825: /usr/bin/supervisord
       └─ PID 826: /app/bin/agent-tool-host
            ├─ (子进程) bash — 用户命令执行
            ├─ (子进程) 技能脚本 — 浏览器自动化 (CDP)
            ├─ (子进程) 技能脚本 — PDF 处理
            ├─ (子进程) 技能脚本 — Office 文档
            └─ (子进程) 其他工具进程
```

### Supervisor 配置 (/app/supervisord.conf)

```
[supervisord]
nodaemon=true          # 前台运行
user=root              # root 用户

[program:agent-tool-host]
command=/app/bin/agent-tool-host
directory=/workspace
autostart=true         # 自动启动
autorestart=true       # 崩溃自动重启
startretries=3         # 最多重试 3 次
startsecs=2            # 启动后等待 2 秒确认存活
stdout_logfile=/var/log/tool/agent-tool-host.stdout.log
stderr_logfile=/var/log/tool/agent-tool-host.stderr.log
```

---

## 4. 网络架构

### 网络拓扑

```
用户设备 (手机/电脑)
    │ 公网
    ▼
Trae 后端网关 (公网可达)
    │ 内网
    ▼
推理服务集群 (私有网络)
    │
    ├── K8s API Server (172.30.0.1:443)
    │       │
    │       ▼
    │   Kata Container 沙盒
    │   IP: 10.54.11.105/12
    │   GW: 10.48.0.1
    │       │
    │       ├── HTTPS Proxy (127.0.0.1:18080)
    │       │     └→ 外网 (NAT → 公网)
    │       │
    │       └── K8s DNS (172.30.1.10)
    │
    └── 其他内部服务 (日志/监控/存储)
```

### 沙盒网络能力

| 方向 | 目标 | 可达性 | 协议 |
|------|------|--------|------|
| 出站 | GitHub | ✅ 可达 | HTTPS |
| 出站 | 通用外网 | ✅ 可达 (经 NAT) | HTTPS |
| 出站 | Google | ❌ 超时 (被墙) | HTTPS |
| 出站 | K8s API Server | ✅ 内网直达 | HTTPS |
| 入站 | 从公网 | ❌ 不可达 | — |
| 入站 | 从 K8s | ✅ API Server 代理 | HTTPS |

### 关键网络限制

- 无固定公网出口 IP（NAT 出口 IP 不固定：`101.126.128.7` / `115.190.22.21`）
- 外部下载速度约 `~320 KB/s`（实测到 Cloudflare）
- 内部 K8s DNS 可用，集群内服务名解析正常

---

## 5. 存储架构

### 磁盘布局

```
块设备: /dev/vda (40 GB)
  ├── /workspace     — 用户工作区 (ext4, 持久化)
  │     └── README.md, .git/
  │
  ├── /data/user     — 技能定义和脚本 (ext4, 持久化)
  │     ├── builtin/   — 内置技能 (web-dev)
  │     ├── work/      — 工作技能 (docx/pdf/pptx/xlsx 处理脚本)
  │     └── global/    — 全局技能 (数字人/技能创建)
  │
  ├── /data/tool     — 工具数据 (ext4, 持久化)
  │     └── browser_snapshots/, cdp-client-browser/
  │
  ├── /var/log/tool  — 运行日志 (ext4, 持久化)
  │     ├── agent-tool-host.stdout.log
  │     ├── agent-tool-host.stderr.log
  │     ├── supervisord.log
  │     └── jobs/       — 任务执行日志
  │
  └── /run/shared    — 共享运行时数据 (ext4)

根文件系统: OverlayFS (40 GB, 临时)
  下层: 46 层只读镜像层 (containerd 快照)
  上层: 可写层 (容器销毁后丢失)
  ├── /app/         — 应用二进制和配置
  ├── /root/        — root 用户环境 (nvm/pyenv/rustup 等)
  ├── /usr/         — 系统库和工具
  └── /etc/         — 系统配置

持久内存设备: /dev/pmem0 (1.4 GB)
  └── 用作 Kata Container 根文件系统
```

### 存储生命周期

| 存储位置 | 会话间持久化 | 说明 |
|----------|-------------|------|
| /workspace | ✅ 是 | 代码和文档跨会话保留 |
| /data/user | ✅ 是 | 技能配置全局共享 |
| /data/tool | ✅ 是 | 工具缓存和浏览器数据 |
| / (OverlayFS) | ❌ 否 | 每次新 Pod 重置 |
| 进程/临时文件 | ❌ 否 | 随会话结束销毁 |

---

## 6. 安全与隔离模型

### 多层隔离

| 层级 | 隔离机制 | 防护目标 |
|------|----------|----------|
| **Kata VM** | 硬件虚拟化，独立内核 | 防止容器逃逸到宿主机 |
| **K8s NetworkPolicy** | 网络 ACL | 限制 Pod 间通信 |
| **容器用户** | 以 root 运行, 但受限 | 沙盒内操作隔离 |
| **工具调用沙盒** | agent-tool-host 控制执行 | 限制工具调用范围 |
| **上下文隔离** | 每个 Session 独立 | 不同对话不互相干扰 |

### 沙盒限制

- 无 GPU 设备
- 无 `/dev/dri` 或 `/dev/nvidia*`
- 无法加载内核模块
- K8s API 仅可通过代理访问
- 无 ServiceAccount Token 挂载（无法操作 K8s 资源）
- 公网入站不可达

---

## 7. 会话生命周期

```
用户打开 Trae IDE
    │
    ▼
K8s 创建新的 Pod (Kata Container)
    ├── 拉取镜像 trae/ai_agent/tool_host:1.0.0.573
    ├── 挂载持久卷 (/workspace, /data/user, /data/tool)
    ├── 分配网络 (10.54.x.x/12)
    ├── 启动 init 进程 (tini)
    ├── 启动 supervisord
    └── 启动 agent-tool-host
    │
    ▼
对话进行中...
    ├── LLM ↔ agent-tool-host 持续通信
    ├── 文件读写 /workspace
    └── 工具执行
    │
    ▼
会话结束 (用户关闭 / 超时)
    ├── Pod 进入 Terminating 状态
    ├── 持久卷卸载 (数据保留)
    ├── OverlayFS 可写层丢弃
    └── Pod 删除
    │
    ▼
下次会话 → 新 Pod → 挂载同一 /workspace
```

---

## 8. 工具技能服务

### 按需调用的技能脚本

沙盒不运行独立的 MCP 服务端进程。以下工具能力由 agent-tool-host 按需调用，以子进程方式执行：

| "服务" | 实际实现 | 启动方式 |
|--------|----------|----------|
| **browser** | CDP 端点连接浏览器实例 (`127.0.0.1:8088/v1/cdp`) | agent-tool-host 按需调用 |
| **pdf** | Python 脚本 (PyPDF2, pdfplumber) | 子进程执行 |
| **docx** | Python 脚本 (python-docx, OOXML) | 子进程执行 |
| **pptx** | Python + Node.js (pptxgenjs) | 子进程执行 |
| **xlsx** | Python 脚本 (openpyxl) | 子进程执行 |

### MCP 配置现状

```
/app/etc/mcp_servers.json           → {"mcpServers":{}}  (空)
/data/user/mcp/mcp-servers.json     → {"mcpServers":{}}  (空)
```

没有任何持久化的 MCP 服务端配置。这些能力通过 skill 脚本（存放在 `/data/user/builtin/work/` 下）提供给 agent-tool-host，调用时临时启动子进程，任务完成后退出。

### 唯一的 MCP 基础设施

`/app/mcp_proxy_bootstrap/preload.cjs` 是一个 HTTP 代理注入器（基于 undici 库），作用是在 Node.js 进程启动时自动设置全局代理，让所有 HTTP/HTTPS 请求走沙盒内的 HTTPS Proxy（`127.0.0.1:18080`），与 MCP 服务无关。

---

## 9. 预装开发工具链

| 工具 | 版本 | 安装方式 |
|------|------|----------|
| Node.js | v24.15.0 | nvm |
| Python | 3.14.4 | pyenv |
| Go | 1.25.1 | mise |
| Rust | 1.92.0 | rustup |
| Git | 2.43.0 | 系统包 |
| PHP | 8.x | phpenv |
| Bazelisk | latest | /usr/local/bin |
| Composer | latest | /usr/local/bin |
| Oh My Zsh | latest | 直接安装 |

---

## 10. 环境规格汇总

| 组件 | 规格 |
|------|------|
| 基础镜像 | trae/ai_agent/tool_host:1.0.0.573 |
| 镜像发布版本 | b5e0d70ed042660399cdae684b1bf84da171e253 |
| 镜像发布日期 | 2026-05-25 16:33:22 |
| 基础 OS | Ubuntu 24.04.3 LTS (Noble Numbat) |
| 架构 | x86_64 |
| 部署区域 | CN |
| 容器运行时 | Docker + containerd |
| 安全隔离 | Kata Containers (轻量级 VM) |
| 编排平台 | Kubernetes v1.32.3-vke.10 (火山引擎 VKE) |
| 物理 CPU | Intel Xeon Platinum 8457C (Sapphire Rapids) |
| vCPU 数量 | 2 核 |
| 内存 | ~4 GB (3.8 GiB) |
| 磁盘总容量 | 40 GB |
| 磁盘已用 | ~32 GB (镜像预装) |
| 磁盘可用 | ~7.6 GB |
| 沙盒 IP | 10.54.x.x/12 (私网) |
| 公网访问 | 出站 NAT，入站不可达 |
| 虚拟化平台 | OpenStack Nova |
| 基础设施 | ByteDance Inc. |