# Agent Note: pt-BR 作为 web GUI 的第三种语言发布

Status: implemented

[English](2026-08-20-pt-br-web-gui-locale.md) | 中文

## Problem

web GUI 此前只提供 `zh` 与 `en` 两种语言，而这个「二」在 locale 包之外的地方也是承重结构：`LOCALE_IDS` 固定了 `LocaleId` 联合类型，每个插件都按 `{ zh, en }` 成对注册字典，基于 AST 的对称性门禁只比较这两侧，单测用例也断言两项的选项列表。巴西葡萄牙语读者只能借助英文使用产品。因此新增第三种语言意味着同时触及每一个字典所有者——若逐界面推进，类型检查器、门禁与测试各自报告的剩余工作子集会互不一致。

## Decision

**`pt` 加入 `LOCALE_IDS`，且每个已发布的命名空间在同一次变更中获得 pt-BR 字典。** `packages/client/locale/src/locale-settings.ts` 中的 `LOCALE_IDS` 仍是 `LocaleId` 联合类型的唯一来源，于是类型化的 `register(ns, { zh, en, pt })` 签名让编译器枚举出所有未完成的位置：只要某个插件的字典集合尚未扩展，构建就会失败，直到它拥有声明了该命名空间 key 联合类型中每个 key 的 `pt` 导出。所有已发布命名空间均已覆盖——common 与 settings 字典，以及每个插件命名空间（`feedback`、`skill`、`plan`、`workflow`、`conversation`、各设置分区、commands、trajectory、presets、permissions、directory picker 等）。

**对称性门禁从成对比较改为 N 个 locale 的比较。** `scripts/locale-dictionary-parity.spec.ts` 把发现的字典按命名空间派生的 pair key 分组为按 locale 的槽位，要求每个已发布 locale 都在场，并以 `zh` key 集合为真源逐一核对其他字典。它的预过滤、名字后缀表（`Zh`/`En`/`Pt`）与内联注册的 tag 检查都已接纳 `pt`，因此未来的第四种语言只需向 `SHIPPED_LOCALES` 加一行并补上后缀。

**locale 身份沿用既有规则。** locale id 是 `pt`（即 `detectBrowserLocale()` 匹配的主子标签），而 `<html lang>` 承载带地区的 `pt-BR`；标签以自身语言自述为 `Português (Brasil)`。`FALLBACK_LOCALE` 保持 `en`：pt 字典缺失的 key 沿用与之前相同的 ns → common → en → key 链条，[浏览器派生初始 locale](2026-07-31-browser-derived-initial-locale.md) 的决策所拥有的解析与回落语义不变。声明 `pt-BR` 或 `pt-PT` 的浏览器现在无需任何存储偏好即以葡萄牙语开场。

**翻译遵循同一份术语表。** 属于产品名的名词保留英文（`workspace`、`skill`、`Full access`），属于概念的名词翻译（`agent` → agente、`session` → sessão、`plan mode` → Modo de plano）。日期模板采用日/月/年顺序，`time.ago` 写作 `há {t}`。占位符、插值语法与 key 集合在各 locale 间逐字节一致，由对称性门禁与类型化字典共同强制。

## Alternatives considered

- **先只翻译高频界面**：一旦 `LOCALE_IDS` 增长，类型化的 `register` 签名会立即拒绝残缺的 `{ zh, en }` 对象，所以部分覆盖并不更便宜——它只是把同样必做的工作摊到多个 PR 里，而门禁与测试每次报告的子集还互相矛盾。
- **引入运行时 i18n 框架取代字典注册表**：注册表已提供命名空间、类型化查找、实时切换与 Host 持久化；再引入框架只会把这些能力在第二套 API 后面重复一遍。缺口在于内容（第三列译文），而非机制。
- **locale id 用 `pt-BR`**：id 是字典注册表的 key，也是 settings 枚举值，而主子标签匹配本就把所有葡萄牙语变体路由到同一条目；带地区的 id 只会把字典拆成产品并不撰写的变体。
- **在同一次变更中把文档本地化（en ↔ zh 文件配对）也扩展到 pt-BR**：文档与 GUI 文案是两套体系、各有各的验证；捆绑在一起会让这次变更无法评审。文档翻译推迟到出现真实消费方之后。

## Consequences

- 设置的语言行提供三个以自身语言自述的选项，请求葡萄牙语的全新浏览器以葡萄牙语开场；显式偏好的持久化行为不变。
- 此后每一条新 UI 文案从其引入的 PR 起就必须随三本字典一起发布：不对称由门禁指名失败，缺失字典由 TypeScript 在构建期失败。
- 固定两项选项列表的单测用例已更新为三项；组装后输出的快照车道是渲染文案的仲裁者。
- 更早行文中的「两种语言」措辞（包 README、`packages/client/AGENTS.md`）现已改说「每个已发布 locale」，避免在第四种语言时再度过时。
