# 首页场景首屏接入 — 2026-11-14

用户已看过独立首屏方案，反馈“看上去还不错。比之前的好很多。”本轮据此接入本地首页，未提交、推送、部署、请求索引或发送真实询盘。

## 实际修改

- 替换首页原 G938 静态首屏，采用此前用户已审阅、以提供的 G946 图片为参照生成的场景图。保留“Gaming audio. / Your brand.”排版、冷暖灯光及两个主要按钮。
- 首屏标注 Illustrative scene，图片不是客户实拍、连接演示或性能测试。没有新增价格、认证、兼容性、起订量或产品性能声明。
- Explore Headsets 指向既有电竞耳机分类；Discuss Your Project 进入电竞耳机询价表单；One headset. Two packages. 指向原 G946 两配置区。同一耳机与充电桩的说明仍以原产品页为准。
- 首屏保留型号目录、工厂照片和 CE/RED & RoHS 适用范围的直接入口。
- 独立 homepage-hero.css 负责首屏与原采购信息条/产品分类区间距。没有替换全站公共样式，原导航、固定联系栏、产品目录、工厂图片、证书、品牌介绍及询盘表单均保留。
- 从 buyer-strip 开始到文件结束的首页 HTML 与本轮开始时逐字节一致。搜索标题、描述、canonical 保持原值。首页 OG/Twitter 与 WebPage 主图对应新视觉，WebPage/sitemap 日期为 2026-11-14，llms 说明场景为示意。
- 原生成图与提示词保存在 marketing/visuals/home-hero-20261114/，不进入公开发布包。旧 G938 首屏和全部产品原图仍保留。
- 新图交付尺寸为 640 / 960 / 1672px；文件分别为 20682 / 36424 / 84188 bytes。使用正常 HTML 响应式图片和 fetchpriority=high，无首屏视频、轮播或新的运行时脚本。
- 可用 python3 scripts/build-entry-images.py home-g946-lifestyle 单独再生成交付图；仅等比例缩放与编码，不另行改变耳机外形。

## 已完成核对

- 30 项仓库检查通过。
- 发布包 98 页、3134 链接、1372 资源引用，0 问题。
- 1440 / 1024 / 820 / 390 / 320 宽度无整页横向溢出，首屏图片加载、单一 H1、原目录和询盘表单存在；桌面与手机截图已目视检查。
- 三个主要新链接实际打开：电竞耳机分类；产品=Gaming Headset Collection、意图=Quotation request 的联系页；G946 #sample-configuration 两配置区。均无真实提交。
- 手机导航可展开/关闭。浏览器未记录页面错误；没有为测试主动接受统计同意或写入来源信息。
- 本轮修改 6 个既有文件，开始时其余 1154 个已跟踪文件哈希不变。首页的脚本、表单、证书和原产品素材未改动；新原图与已审阅概念源文件一致。
- 已验证新页面、样式和三个 WebP 与构建文件一致，marketing 与 scripts 被排除在公开包外。本轮生成的 public 已核对并清理，临时预览关闭。
- 证据目录：/Users/lily/Documents/New project 3/outputs/talrivo-homepage-hero-20261114/

## 建议提交

更新首页电竞场景视觉与移动端布局

GitHub Desktop 选择 talrivo-site / main，核对 Changes 后 Commit to main，再 Push origin。main 推送会触发既有部署工作流。本地检查通过不等于已部署或已经提升流量；上线后再观察相关点击、继续浏览与真实询盘。
