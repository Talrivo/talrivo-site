# 采购资料入口与包装图片优化 — 2026-11-13

本轮为本地修改，保留上一轮 AI 来源提示、自报来源和 G946 核对表。未提交、推送、部署或发送真实询盘。

## 发现与修改

- G946 专用核对表此前只有产品页入口。在 Insights 免费采购资料区增加第六张资源卡片；包装配件指南也补入模型专用表和配置说明入口。
- 两个入口均指向既有 G946 页面 #sample-configuration。维持一个型号、两种套装；耳机相同，耳机版不含桩，桩版给耳机无线充电，其他配件仍待样品和书面清单核对。
- 包装指南六个图片标签和 Insights 主图复用既有 480/960 WebP，无新增或重制产品图。图库五个入口继续去各型号产品页，原图与原有分享/结构化图片 URL 保留；延迟图片保留长宽比占位。
- 六张不同原图共 850556 bytes，对应 960px 预览共 244982 bytes，减少 71.20%。此为选定图片文件比较，不是整页传输、加载时间或搜索流量改善。
- 包装指南可见更新时间、Article.dateModified 和 sitemap 同步为 2026-11-13。两个页面标题、描述、canonical 保持原值。
- 复用现有同意后 buyer_resource_click 统计；两个新增下载入口均记录固定 g946_packing_sheet 类别。拒绝统计时不触发；下载不是询盘或样品审批。

## 验证

- 30 项仓库检查通过；构建发布包 98 页、3137 链接、1371 资源引用，0 问题。
- 两页在 1440 / 820 / 390 / 320 四种宽度无整页横向溢出，已加载图片无破图。桌面和手机截图已目视检查。
- 两条实际 G946 配置入口均成功到达原产品配置区。从该区继续进入充电桩套装询盘，URL 保留 product=g946、inquiry=sample、reference=g946-wireless-charging-dock；无真实提交。
- 下载 HTTP 200，3397 bytes，与现有源文件相同。未验证用户浏览器最终保存完成。
- 本轮只改变 7 个既有文件；开始时记录的其他 1152 个文件哈希保持一致。原素材完整保留，构建内容与源文件一致。已清除本轮生成的 public，关闭临时标签和服务器。
- 证据：/Users/lily/Documents/New project 3/outputs/talrivo-resource-discovery-20261113/

## 如何提交

1. GitHub Desktop 选择 talrivo-site；路径 /Users/lily/Documents/GitHub/talrivo-site；分支 main。
2. Changes 中核对本轮及上轮修改。Summary 建议：完善 AI 来源识别、G946 采购资料与指南加载。
3. 点击 Commit to main，完成本地提交。
4. 点击 Push origin 上传；仓库现有 Deploy public website 工作流会在 main 推送后自动验证与部署。
5. 到 GitHub 仓库 Actions 查看 Deploy public website，等待绿色成功，再检查实际线上页面。未推送或部署未成功时不能当作已上线。

官方操作说明：https://docs.github.com/en/desktop/making-changes-in-a-branch/committing-and-reviewing-changes-to-your-project-in-github-desktop

## 后续观察

上线后使用新导出的按页面/查询/国家/设备细分 GSC 数据观察相关点击、曝光、排名和点击率，并结合统计同意范围下的资料点击与真实去重询盘。不要将本地检查通过或文件更小描述成自然流量已增长；本轮未获得新 GSC 数据。
