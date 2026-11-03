# TALRIVO SEO / GEO 学习与执行单

核查日期：2026-11-03。本文是内部执行资料，不是流量增长报告。

## 这次查了什么

查阅 Google Search Central 官方 YouTube 学习路径介绍、Google AI 搜索与视频指南、YouTube 标题封面和测试说明，以及 Bing AI Performance 官方说明。YouTube 视频页抓取失败，未完整播放相关课程，不把课程介绍冒充完整观看笔记。

## 学习结论与网站做法

| 官方依据 | 对 TALRIVO 的执行判断 |
| --- | --- |
| [Google SEO 官方 YouTube 学习路径](https://developers.google.com/search/blog/2026/10/seo-learning-paths?hl=en)把抓取、索引、展示和衡量分开讲解。 | 先确认新版本已上线、可访问，再观察搜索表现。本地测试或提交代码不等于已被搜索引擎采用。 |
| [Google AI 搜索指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)继续强调 SEO 基础、独特价值和可读内容；特殊 AI 文件不是 Google 排名手段。 | 不把 llms.txt、增加 FAQ 数量或拆成大量短页面当作 GEO 增长方案。保留具体设备问题、实拍和可核对的资料。 |
| [Google 视频指南](https://developers.google.com/search/docs/appearance/video)要求观看页以单个视频为主，并让播放器和缩略图可发现；符合要求也不保证视频索引。 | 利用现有观看页，不再为已有视频重复建页。不伪造发布日期，也不把产品页中的辅助视频当作必然的视频搜索入口。 |
| [YouTube 标题与封面说明](https://support.google.com/youtube/answer/12340300?hl=en)强调准确、清楚，并按受众和展示位置观察。 | 用客户的问题开头，型号放后面；标题承诺必须在视频里兑现。不要为了吸引点击写成全设备兼容或已完成蓝牙配对。 |
| [YouTube 标题与封面测试](https://support.google.com/youtube/answer/16391400?hl=en)不只以 CTR 判定表现。 | 在账户支持时使用原生测试；同时看观看时长和受众。没有测试结果时，下面的标题只是候选，不是胜出方案。 |
| [Bing AI Performance](https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c)区分 AI 引用与访问。 | 引用次数、官网访问和有效询盘分别记录。不能把被引用一次算作一个访客或客户。 |

## 本轮已经落到网站的改动

- 指南总入口增加直达视频区的入口，并补上 G938 手机连接实拍观看页。
- 原来的产品宣传片仍保留，实拍演示与宣传片分开描述。
- G938 观看页同步搜索、Open Graph、Twitter 和 WebPage 描述，保留原标题和网址。
- 播放器、视频 ID、86 秒时长、原上传日期和章节不变；明确蓝牙配对结果未清楚显示，也没有完成所有设备和语音场景的测试。
- 原有抓取配置和询盘方式不变；没有发布社媒、提交代码、推送或请求索引。

## 关键词方向：先服务客户问题

以下是候选主题，不是已经验证搜索量的关键词清单。不能凭这些词推断采购意向或搜索规模。

| 意图 | 候选词组 | 现有承接页 |
| --- | --- | --- |
| 找供应商 | gaming headset manufacturer / private label gaming headsets | /gaming-headsets/、/oem-odm/ |
| 解决连接问题 | USB-C receiver gaming headset / 2.4GHz vs Bluetooth headset | 接收器指南、2.4GHz 与蓝牙对比指南 |
| 需要可检查的演示 | gaming headset phone setup / gaming headset assembly video | G938 手机实拍页、G935 装配观看页 |
| 准备采购 | gaming headset sample process / headset packing checklist | 样品流程页、配件包装清单 |

同一个问题优先完善现有页面，不为每个词形、国家或 AI 问法再建一页。型号词继续用于识别产品，但不是所有内容的主标题。

## 可手动用于现有 G938 视频的 YouTube 文案

现有视频：<https://youtu.be/AKqT0fzuqW8>。以下仅为待人工审核的标题与简介，不是已发布内容。

标题候选，选一个测试，不要同时反复修改多个视频：

1. Gaming Headset Phone Setup: USB-C Receiver & Controls | G938
2. USB-C Receiver or Bluetooth? A Hands-On Gaming Headset Demo
3. Before You Approve a Gaming Headset: Check the Connection

推荐先用 1，内容更明确；2 和 3 留作测试候选，不能预判哪一个 CTR 更高。

简介草稿：

```text
A USB-C plug fits. But which audio connection are you actually using?
Watch the receiver setup, Bluetooth settings and physical controls on a G938 gaming headset sample.

Setup notes and sample checks:
https://talrivo.com/videos/g938-phone-setup-controls/?utm_source=youtube&utm_medium=video&utm_campaign=g938_setup_review

00:00 USB-C receiver setup
00:38 Bluetooth settings
01:00 Controls and accessories

The completed Bluetooth pairing result is not clearly visible in this clip. Confirm playback, microphone input and controls on your exact device and selected sample version before approving product claims.

Sourcing gaming headsets for your brand? Send your target devices, connection requirements and market through the sample inquiry on the linked page.
```

封面和补拍方法，用中文执行：

- 封面用现有实拍里“手机接口、接收器、耳机”看得清楚的一帧，文字只保留 `USB-C OR BLUETOOTH?`。不要叠大量设备图或写“全平台通用”。
- 补拍开头先给接收器插入手机的近景，再展示手机识别和设置；让观众立即知道视频会回答什么。
- 要补充蓝牙证明时，先移除 USB 接收器，再连续拍设备名称、完成配对、播放和麦克风输入。未拍到的结果不要用字幕代替证明。
- 用现有音乐时另行确认配乐库和曲目；本轮不改视频、音乐或封面文件。

## 链接与衡量

2026-11-03 直接 GET 核实以下三个地址均返回 HTTP 200，且各自 canonical 与地址一致：

- <https://talrivo.com/videos/g938-phone-setup-controls/>
- <https://talrivo.com/gaming-headsets/g938-wireless/>
- <https://talrivo.com/insights/choose-2-4g-wireless-gaming-headset/>

以上是链接可用性核实，不是 Google 已索引、视频可播放或获得流量的证明。带 UTM 的链接用于后续来源识别，不能保证归因完整。

上线后的核查顺序：

1. D0：以确认的新版本上线为起点，检查页面、播放器、canonical 和询盘预选。不要以本地文件日期代替上线日。
2. D+7：查看抓取、索引、视频状态和展示问题；不要因一两个点击就重写整批标题。
3. D+28：比较口径一致的页面、查询、国家、设备和位置；样本不足时结论写“暂不能判断”。本轮没有获取新的 Search Console、YouTube Studio 或 Bing 账户数据。
4. 分开记录 Google 点击、YouTube 展示与观看、AI 引用、网站来源访问和真实提交的询盘。打开表单不算询盘，AI 引用也不算访问。

不购买虚假提及、不批量灌论坛、不复制品牌文章、不承诺收录、排名、引用或点击率上涨。
