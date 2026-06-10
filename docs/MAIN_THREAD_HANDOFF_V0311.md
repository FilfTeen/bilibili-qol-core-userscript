# v0.3.11 主线程交接手册

本文件给下一任主线程使用。它记录截至本次交接时的真实工程状态、已完成的主线资产、仍需谨慎处理的风险和推荐下一步。

## 当前状态

- 当前版本：`0.3.11`
- 当前主线：`main`
- 当前 runtime release baseline：tag `v0.3.11` 指向 `2af59cb`
- 当前 docs-only mainline HEAD：后续线程必须运行 `git rev-parse main origin/main` 实时核对；该状态只代表 governance / evidence 文档状态
- 当前发布授权：无新的 runtime release；不得据此 tag、release、version bump 或 rebuild dist
- 当前产物：`dist/bilibili-qol-core.user.js`
- 当前仓库 slug：`FilfTeen/bilibili-qol-core-userscript`
- 当前 integration 分支：`codex/qol-core-integration`，内容与 v0.3.11 发布代码无差异；`main` 后续只包含 docs-only evidence / governance 提交
- 隔离实验分支：`codex/panel-choice-menu-version`，提交 `69194bc`，不属于发布主线
- v0.3.12 当前状态：MBGA Reality Evidence、Local Learning Reality Closure、SponsorBlock Core Safari Smoke、Release Readiness 和 GitHub 公开暴露面隐私收束均已完成；仍无 runtime release 授权
- 私有 agent governance 资产属于 repo 外个人协作资产；公开仓库不得 tracked 或公开其对象索引

如果接力时发现上述状态和本地 git 不一致，以 `git status --short --branch`、`git log --oneline --decorate --max-count=12`、分别核对 `main` / `origin/main` 和 release tag 的 `git rev-parse` 结果，以及 `git diff --name-only origin/main..main` 的实时结果为准。

## v0.3.11 已完成主线能力

### Local Learning Management

已进入主线：

- 控制台 `帮助 / 反馈` 页可查看本地视频学习记录。
- 支持单条删除、清空视频学习记录、查看/清空评论反馈锁数量。
- 单条删除不再依赖 Safari transition settle；删除成功后会立即更新计数并启动 authoritative refresh。
- `manual-dismiss` 已修复：会持久化、压制后续自动信号、失败不误报成功。
- 自动本地学习写入成功后会刷新 Help 页记录。
- 4+ 记录由列表容器滚动，item 不再被压缩/裁切。

已验证：

- 单元/全量测试通过。
- Safari 主窗口单条删除 blocker 已复验通过。
- Safari 主窗口最终 Local Learning 小验收为 `PASS WITH CAVEAT`：有机评论扫描触发自动写入仍需更多稳定真实样本。

### MBGA instrumentation 与文档真实性

已进入主线：

- MBGA decision telemetry。
- native request guard snapshot。
- 诊断报告接入 MBGA/native guard 摘要。
- 诊断样本 URL 归一化。
- `mbgaDisablePcdn` 新用户默认关闭，已有显式配置保留。
- 文档表述降级为 best-effort / known-rule / partial / experimental。

必须保持：

- 不宣称完整隐私防护。
- 不宣称完整遥测阻断。
- 不宣称完整 PCDN/WebRTC 禁用。
- 不把 live MBGA 当成已完整支持。

### 发布面

已完成：

- `package.json` / `package-lock.json` / `src/constants.ts` / dist metadata 均为 `0.3.11`。
- `dist/bilibili-qol-core.user.js` 为唯一发布产物。
- `dist/bilibili-sponsorblock.user.js` 不存在。
- tag build 曾验证不会生成 `@version v0.3.11`。

## 当前已知 caveats

- MBGA 仍是高风险边界能力：V0312 已完成现实证据 pass，结论为 `PASS WITH CAVEAT`，只支持部分已知规则的 best-effort / partial cleanup，不授权 claim 或默认策略扩张。
- native request guard 的 `blocked-fetch` / `would-block-xhr` 真实触发证据仍有限。
- PCDN/WebRTC 仍是实验子项；不要提升默认策略或扩大声明，除非有新的 Safari A/B 证据。
- 评论扫描触发自动本地学习写入仍缺更多稳定真实评论样本。
- SponsorBlock Core Safari smoke 已验证 sampled page 的 segment load、preview bar、auto-skip 和 undo；keep-current 仍为 partial，mute / POI 未验证。
- SponsorBlock 真实上游投票路径没有在最近一轮中做破坏性实投验收；真实投票必须由用户明确授权。
- `@connect *` 仍是 userscript 权限风险，当前因服务地址可配置而保留。
- GitHub 公开暴露面隐私事故已闭环：公开 main 已 scrub，Support purge 后 withheld P1 对象 API 不可访问；不要把私有 purge draft、旧对象 ID 或 private path index 写回公开仓库。

## 下一任主线程建议

优先顺序：

1. 先让规划线程重新评估下一任务区块；当前不应自动启动 runtime release、integration 或新功能目标。
2. 若继续证据路线，优先考虑 SponsorBlock 核心体验常规 Safari smoke 的维护化，或评论/动态样本治理；不要继续扩大 MBGA。
3. 若继续 Local Learning，目标应是更多真实评论样本和误杀边界，而不是提高过滤攻击性。
4. 维护 `docs/ENGINEERING_FILE_INDEX.md` 和本交接手册，避免历史 BLOCK、历史目标卡或 pre-purge 状态被误读为当前 blocker。
5. 如要做 runtime work，重新裁决 integration 路线；不要从历史审计线程直接派生实现任务。

不建议：

- 不建议把 `codex/panel-choice-menu-version` 合入主线。
- 不建议把 MBGA 包装成隐私产品。
- 不建议在没有 Safari 主窗口重载证据时接受 UI/Tampermonkey 验收结论。
- 不建议为了节省线程而从复杂审计线程直接派生实现线程。
- 不建议把私有 agent governance、Support purge draft、旧对象 ID 或 private path index 写入公开 docs。

## 接力工作流

推荐下一阶段继续使用：

1. 主线程制定版本目标。
2. 研究线程补证据。
3. 实现线程在独立工作树实现。
4. integration 线程合并与统一验证。
5. 审计线程不信任实现线程，做独立复核。
6. Safari 验收线程使用主窗口、已登录态、已重载 dist 采样。
7. release prep / preflight 线程处理版本与发布面。

涉及 Safari/Tampermonkey 的任何线程都必须写清楚：

- 目标 dist 绝对路径。
- 如何重载 Tampermonkey。
- 如何证明页面加载了目标脚本。
- 不能只看 `@version`。

## 常用验证命令

```bash
npm run evaluate:recognition
npm test
npm run check
npm run build
npm run verify:compat
git diff --check
git branch --contains 69194bc
```

发布前额外验证：

```bash
GITHUB_REF_NAME=v0.3.11 npm run build
npm run verify:compat
rg "@version\\s+v" README.md docs src scripts package.json dist
```

Safari 辅助验证：

```bash
npm run validate:safari
```

注意：Safari WebDriver 不是已登录 Safari 主窗口验收。

## 工程文件完整性审计结果

本次交接前已审计：

- 根文档：`README.md`、`CONTRIBUTING.md`、`DISCLAIMER.md`、`NOTICE.md`
- 版本/构建文件：`package.json`、`package-lock.json`、`src/constants.ts`、`scripts/*`、`dist/bilibili-qol-core.user.js`
- 工程文档：`docs/*.md`
- 当前分支、tag、integration、choice menu 隔离状态

本次修复：

- 修正 `CONTRIBUTING.md` 的 Safari 验收入口，从 v0.3.7 历史清单改为 v0.3.11 当前清单。
- 修正 `docs/BRANCH_HEALTH_V037.md` 当前基线，从旧 v0.3.10 状态更新为 v0.3.11。
- 在历史 gap / completeness 文档顶部补充当前性说明，避免误读为当前 blocker。
- 新增 `docs/ENGINEERING_FILE_INDEX.md`。
- 新增本交接手册。

后续 docs-only governance / evidence 收束：

- V0312 MBGA Reality Evidence Pass 已完成：`PASS WITH CAVEAT`，不授权实现或 claim 升级。
- V0312 Local Learning Reality Closure 已完成：`PASS WITH CAVEAT`，只支持 isolated profile page-heuristic write / panel / delete / panel-derived refresh cleanup。
- V0312 SponsorBlock Core Safari Smoke 已完成：`PASS WITH CAVEAT / PARTIAL`，不授权 release。
- V0312 Release Readiness Decision 已完成：`NO RELEASE / PUSH DOCS ONLY`。
- GitHub 公开暴露面安全/隐私收束已完成：无 P0，公开 main scrubbed，Support purge 后 withheld P1 对象 API 不可访问。

## 交接结论

当前工程处于可接力状态。下一任主线程应把 `v0.3.11` tag `2af59cb` 视为已落地 runtime release baseline，并把 V0312 视为 docs-only evidence / governance milestone。

`origin/main` / `main` 的实时 HEAD 必须由后续线程运行 `git rev-parse main origin/main` 核对；该 docs-only governance / evidence 状态不改变 runtime release baseline。`v0.3.12` 只是 docs-only evidence / governance milestone，未授权 runtime release。

Local Learning Management 已进入 v0.3.11 运行时主线；MBGA 仍是需现实证据约束的 best-effort 能力。

如果下一任主线程发现本地工作树不是干净状态，第一步不是继续开发，而是先做 `git status --short --branch`、`git diff --stat` 和 `git log --oneline --decorate --max-count=12`，确认是否存在未提交的交接后改动。
