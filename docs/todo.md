# 今後の TODO

## A. リポジトリ / インフラ (すぐ片付く系)

- [x] 初回 commit (`c5b56ba` Bootstrap)
- [x] GitHub リモート作成 + push (`https://github.com/seeton/AIwolf`)
- [x] `.gitkeep` 削除
- [ ] 実機 (iPhone Safari) での動作確認 — ユーザ手動 (Pages 公開済み: `https://seeton.github.io/AIwolf/`)
- [x] GitHub Pages で URL 配信 (`.github/workflows/pages.yml` で `web/` をデプロイ)

## B. コード — 既存実装の改善

- [ ] お題オフトピック判定を LLM / 埋め込み類似度に置換 (現状の単純キーワードマッチはキーワード混入で突破可)
- [x] MBTI ペルソナの強度パラメータ化 — `state.config.personaIntensity` (0-1, default 0.7) を追加。setup スライダーで調整、`buildAgentMessage` 内で確率的にペルソナ装飾を発火する分岐
- [ ] 非プレイヤー発話の pacing / streak 制御の妥当性検証 — 計測ログが出るようになったので Round 3 候補
- [x] お題の短期再出題抑止 (`TOPIC_HISTORY_LIMIT=2` 件を `state.recentTopicTitles` で除外)
- [x] 移植直後の streak バグ修正の自動テスト化 — 純粋関数を `web/logic.js` に分離し、`web/test.html` で 500 回 shuffle してインデックス 0 ケースを潰す回帰テストを実装 (browser で開けば走る)

## C. コード — 未実装機能

- [ ] **マルチプレイヤー化** (現状は隠れ人間も simulated。MVP の本質的拡張)
  - [ ] ルーム管理
  - [ ] リアルタイム通信 (WebSocket / WebRTC)
  - [ ] 切断 / 再接続
- [ ] 信頼度の双方向化 (現状: 隠れ人間 → プレイヤーのみ)
- [ ] ラウンド中の「怪しい」フラグ付け中間 UI
- [ ] お題カードの追加運用フロー (誰が / どう承認 / どこに置く)
- [x] お題難易度ラベル (`difficulty: easy|medium` を TOPICS に追加、`#topic-difficulty` で表示)
- [x] 計測ログ出力先決定 — `console` + `localStorage` 両方採用 (終局時 `[AIwolf] session metrics:` 出力 / `aiwolf:metrics-history` に最大 50 件保持)
- [ ] 隠れ人間のペルソナ崩れ検知 (崩れたら判定減点 etc.)

## D. パラメータ決定 (現状ハードコード or 未定)

- [ ] `TRUST_RECOGNITION_THRESHOLD` の値と決め方
- [ ] 信頼度の増減重みづけ
- [ ] AI 人数 / 人間人数のデフォルトとバランス検証
- [ ] `streakLimit` 値の妥当性
- [ ] 終局判定分布 (完全勝利:片側:完全敗北 = 1:2:1 目安) の実測

## E. ドキュメント

- [ ] `docs/spec.md` `persona.md` `trust.md` `eval.md` の「未決事項」を順次解消
- [x] アーキテクチャ図 / ゲームフロー図 (`docs/architecture.md` に mermaid で 3 図)
- [ ] マルチプレイヤー化したらサーバ・クライアント責務分割図

## F. プロセス / 品質

- [ ] **`empirical-prompt-tuning` の本格運用** — 新規 slash command や重要プロンプトを書いたら iter 1 以降まで回す習慣化
- [ ] 評価指標 (`docs/eval.md`) の baseline 測定 — 調整前に「今こうだ」を取っておく
- [ ] 失敗パターン台帳の保管場所決定 (`CLAUDE.md` か `docs/ledger.md`)
- [ ] iter 0 軽微指摘:
  - [ ] `SKILL.md` description を body の use case 全部カバーする形に拡張 (ユーザ提供本文のため保留中)
  - [x] `CLAUDE.md` top に「Claude Code 用の指示書も兼ねる」1 行追加

## G. 中長期構想 (思考メモ枠)

- [ ] ゲームモードのバリエーション (時間制 / お題自由 / MBTI 公開)
- [ ] ランキング / プレイヤー履歴 (永続化レイヤ要検討)
- [ ] スペクテイターモード / リプレイ
- [ ] 言語切替 (現状 ja-JP 専用)

## 優先順の目安

1. **A** をまず潰す → done
2. **B のオフトピック判定改善** は体験への効きが大きいので早め
3. **D の baseline 測定** はバランス調整の前提なので「実機で何度かプレイ → 数字取る」を一度入れる (Round 2 で計測ログが出るようになったので地ならし完了)
4. **C のマルチプレイヤー化** は別リポジトリ規模の大物。MVP 単体で楽しめる状態にしてから着手
