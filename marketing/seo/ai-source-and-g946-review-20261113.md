# AI 来源到询盘、G946 采购证据：本轮交接

日期：2026-11-13。基线为干净的 0187796。未提交、推送、部署、申请索引或发送真实询盘。

## 1. 线上抓取基础：已核实与未知分开

使用 macOS 自带 curl，保留正常 TLS 证书校验：
- https://talrivo.com/robots.txt：HTTP 200，text/plain；与本地规则一致。
- https://talrivo.com/gaming-headsets/g946-rgb/：HTTP 200。
- https://talrivo.com/sitemap.xml：HTTP 200。
- 当前线上 wildcard 规则允许公开页，对 OAI-SearchBot/GPTBot/ChatGPT-User 名称的规则解析均允许 G946、禁止 /admin/。

普通请求成功不等于已验证 OpenAI 官方 IP 的抓取，也不证明 AI 引用或索引。没有登录 CDN/WAF 后台；没有关闭防护或改 robots。

初次沙箱请求 DNS 不可用，放行网络后系统 Python 因本地信任链未完成校验；改用 macOS 原生 curl 正常验证后成功。没有使用 -k、禁用 TLS 或把环境问题当作站点宕机。

## 2. 修复一个实际归因缺口

原实现保留 firstReferrer，但 latestReferrer 随每次站内浏览覆盖；旧 UTM 也会在新的无 UTM 外部访问后继续保留。例如先有 LinkedIn 记录、后来从 ChatGPT 进入、再到询盘，可能只剩旧活动和站内来源，无法判断这次新的外部线索。

现在：
- 在既有 analytics 同意边界内记录最近一次可识别外部来源/utm_source 线索；站内导航不覆盖该线索。
- 精确匹配已列出的 ChatGPT/Perplexity/Gemini/Copilot 主机或标签；其它来源记 other，缺失记 unknown，不按名称子串猜测。
- 新的无标签外部访问清掉更早的 UTM 活动，避免把新客户算给旧活动。首次访问记录保留。
- 新线索只有固定 channel、evidence、无查询/哈希的 landingPath 和客户端 recordedAt，不新增原始对话/外部页面 URL 的收集。
- 首页 RFQ 和 Contact 表单在提交前重新检查同意和字段有效性；30 天内线索才写入新增 observed_source / source_evidence / source_recorded_at / source_landing_path。过期、异常、拒绝或存储不可用时显示为 unknown/unavailable，不阻止询盘。
- 两种表单的折叠选填区新增 How did you find TALRIVO?，无默认答案、不必填。客户自述 discovery_source 与自动线索分别写入询盘字段/邮件正文。拒绝 analytics 不妨碍客户主动填写这个问题。
- 新增自动线索和客户自述没有加入 GA 事件参数，也未创建新的访问/线索事件；只有既有接口明确返回成功才执行原有成功逻辑。源字段本身不是有效客户或 AI 影响的证明。

这是“最近观察到的来源线索”，不是第一触点、最后一次会话或因果归因模型。直接回访可能保留 30 天内的旧线索。标签可被人为填写，Referer 可能缺失，所有结果都需结合真实询盘判断。

## 3. G946 配置与实物核对资料

新增 assets/downloads/g946-configuration-packing-review.txt（3397 bytes），从 G946 两配置区直接下载，无留邮箱门槛。
- 分开记录 Headset Only 与 Dock Bundle 的接收器、线材、转接头、麦克风部件、说明书和包装。
- 只沿用已确认的两套定义：同一耳机；Headset Only 不含底座；Bundle 加无线充电底座。
- 底座供电、实际充电验证方式、灯态、测量条件、各设备播放/麦克风结果全部留待实物检查，未知写 Not confirmed。
- 两个样品后续链接分别保留正确的配置参考。
- 标明不是已批准配件清单、检测报告、报价或订单承诺，没有虚构结果。

G946 正文、FAQ、既有规格和搜索标题/描述保持；仅增加资料入口，并将本页 WebPage/sitemap 修订日期更新至 2026-11-13。

资料点击沿用 consented buyer_resource_click，固定类型 g946_packing_sheet；不当作下载完成、测试完成或询盘。

## 4. 改动范围为何看起来较多

133 个访客 HTML 同步 analytics 缓存版本，保证任意落地页能使用同一来源保留逻辑。除首页、Contact 和 G946 外的 130 个 HTML，已自动比较确认只改了这个脚本版本。生成器的模板和线上脚本检查地址也同步，防止下次生成倒退。

首页另同步 script.js 版本，Contact 同步 contact-form.js，两种表单更新 form_version 区分新旧版本。G946 使用已有 buyer-resource-link 样式及共享样式缓存版本。

没有更改产品标题/description/canonical、原始素材、认证文件、真实规格或公司信息；没有为了 GEO 增加 Product/FAQ 标记、公开价格、改写全部标题或增加大量文章。

## 5. 完成的验证

- 30 项既有部署检查全部通过，包含新增来源保留、真实主机与仿冒主机、UTM/Referer 区分、旧活动覆盖、拒绝/撤回、异常或过期数据、可选自述、两种真实提交函数的模拟网络检查。
- 只有模拟接口被调用；未提交真实表单。模拟检查区分 observed_source 与 discovery_source，保留买家原消息。
- 浏览器：Contact/Home/G946 在 320/390/820/1440px 无页面横向溢出；来源选择非必填，初始折叠；选择 ChatGPT 不自动提交、不改变 G946 配置或消息。
- G946 TXT 本地 HTTP 200、text/plain，响应逐字节匹配源码；下载链接及 download 属性正确，最终链接下划线可见。没有声称浏览器实际保存文件已完成。
- 本地发布包：98 页、3133 链接、1357 资源引用，0 个问题。最终发布文件与源码一致。
- git diff --check 通过。预览标签、服务和本轮生成的 public 临时构建已清理。

证据目录：/Users/lily/Documents/New project 3/outputs/talrivo-ai-source-20261113/
截图：source-desktop.png、g946-worksheet-desktop.png。

## 6. 上线后每周只做一次的核对

| 核对项 | 记录口径 | 当前状态 |
| --- | --- | --- |
| AI 引荐访问 | GA4 同范围来源/媒介及落地页，注明统计同意和 Referer 缺失的覆盖限制 | 未取得后台数据 |
| 收到的询盘 | 以实际收到、去重的询盘为准；区分 observed_source 与客户自述 | 未取得真实新询盘 |
| 有效需求 | 人工确认是否有品牌/渠道、目标市场、型号/设备和样品或采购需求 | 未判定 |
| Google 搜索 | GSC 页面筛选、国家、设备、查询、点击、曝光、CTR、位置 | 需要新数据 |
| 待补实物证据 | G946 两套实配、供电、灯态、连接/麦克风结果 | 等实际样品记录 |

操作顺序：
1. 选同一完整周，记录后台访问口径，避开尚未完整的最新日期。
2. 按实际询盘去重，在 CRM/私有记录中人工确认需求；仓库只留汇总，不写客户个人信息。
3. 观察来源线索与自述是否一致；不一致也分别保留，不强行都归 ChatGPT。
4. 只在分子、分母范围相同且样本足够时讨论转化率；不要拿全部自述询盘除以仅同意统计的访问量，不把资料点击相加当客户数。
5. 有真实材料再补原产品页；没有新数据或证据时，不反复改标题。

参考（已在前一轮核查，非增长承诺）：
- https://developers.openai.com/api/docs/bots
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/search/updates （FAQ 富结果自 2026-05-07 起停止）
- https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/

建议提交：完善 AI 来源识别与 G946 配置核对资料
