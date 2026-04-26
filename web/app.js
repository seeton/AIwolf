const TOPICS = [
  {
    title: "雨の日の過ごし方",
    description: "雨の日に家や外でどう過ごすか。具体的な行動や気分を交えて話してください。",
    keywords: ["雨", "傘", "室内", "カフェ", "本", "映画", "散歩", "音"],
    prompts: ["雨の日は", "傘を持つなら", "家にいるなら", "外に出るなら"],
    details: ["窓の音", "温かい飲み物", "足元", "空気の匂い"]
  },
  {
    title: "コンビニでつい買うもの",
    description: "コンビニで目的外につい手に取るものを、理由込みで話してください。",
    keywords: ["コンビニ", "お菓子", "飲み物", "レジ", "新作", "夜", "スイーツ", "棚"],
    prompts: ["コンビニだと", "夜に寄ると", "新作を見ると", "レジ前では"],
    details: ["限定感", "小腹", "甘さ", "気分転換"]
  },
  {
    title: "学生時代の昼休み",
    description: "学生時代の昼休みにしていたことや、印象に残っている場面を話してください。",
    keywords: ["昼休み", "教室", "校庭", "購買", "友達", "弁当", "席", "授業"],
    prompts: ["昼休みは", "購買に行くなら", "教室では", "友達といると"],
    details: ["席替え", "時間の短さ", "人気メニュー", "笑い声"]
  },
  {
    title: "旅行先で好きな時間帯",
    description: "旅行先で一番好きな時間帯と、その理由を話してください。",
    keywords: ["旅行", "朝", "夜", "散歩", "景色", "ホテル", "駅", "食事"],
    prompts: ["旅行だと", "朝なら", "夜なら", "移動中は"],
    details: ["静けさ", "空気", "明かり", "期待感"]
  }
];

const MBTI_PROFILES = {
  INTJ: { label: "建築家", style: "構造化して要点を絞る", opener: "整理すると", humanCue: "個人的には", trustBias: 0.12 },
  INFJ: { label: "提唱者", style: "共感と静かな理想を混ぜる", opener: "なんとなく", humanCue: "私は", trustBias: 0.18 },
  ENFJ: { label: "主人公", style: "相手を巻き込む温かい言い方", opener: "みんなで考えると", humanCue: "たしかに", trustBias: 0.2 },
  ENTP: { label: "討論者", style: "少しひねった視点を入れる", opener: "逆に言うと", humanCue: "でも実は", trustBias: 0.08 },
  ISFP: { label: "冒険家", style: "感覚や雰囲気を素直に話す", opener: "感覚で言うと", humanCue: "自分は", trustBias: 0.22 },
  ESFJ: { label: "領事", style: "日常感と親しみやすさを重ねる", opener: "わりと", humanCue: "うちは", trustBias: 0.19 },
  INFP: { label: "仲介者", style: "柔らかく余韻を残す", opener: "どちらかといえば", humanCue: "ちょっと", trustBias: 0.21 },
  ESTP: { label: "起業家", style: "テンポよく体感ベースで話す", opener: "正直", humanCue: "自分だと", trustBias: 0.09 }
};

const NAMES = [
  "葵", "蓮", "美桜", "湊", "紬", "樹", "凛", "陽菜", "大和", "結衣", "蒼", "花音", "直", "千尋"
];

const HIDDEN_HUMAN_BASE_TRUST = 0.32;
const HIDDEN_HUMAN_TRUST_VARIANCE = 0.18;
const MAX_MESSAGE_SCORE = 0.45;
const MAX_CALLBACK_LENGTH = 18;
const TRUST_RECOGNITION_THRESHOLD = 0.75;

const state = {
  config: {
    aiCount: 8,
    humanCount: 2,
    rounds: 5,
    typingSeconds: 10,
    streakLimit: 1
  },
  topic: null,
  participants: [],
  chat: [],
  currentRound: 1,
  timer: null,
  remainingSeconds: 0,
  selectedGuessId: null
};

const elements = {
  aiCount: document.getElementById("ai-count"),
  humanCount: document.getElementById("human-count"),
  roundCount: document.getElementById("round-count"),
  typingSeconds: document.getElementById("typing-seconds"),
  aiCountValue: document.getElementById("ai-count-value"),
  humanCountValue: document.getElementById("human-count-value"),
  roundCountValue: document.getElementById("round-count-value"),
  typingSecondsValue: document.getElementById("typing-seconds-value"),
  topicTitle: document.getElementById("topic-title"),
  topicDescription: document.getElementById("topic-description"),
  topicKeywords: document.getElementById("topic-keywords"),
  shuffleTopic: document.getElementById("shuffle-topic"),
  startGame: document.getElementById("start-game"),
  setupPanel: document.getElementById("setup-panel"),
  gamePanel: document.getElementById("game-panel"),
  guessPanel: document.getElementById("guess-panel"),
  resultPanel: document.getElementById("result-panel"),
  activeTopic: document.getElementById("active-topic"),
  roundIndicator: document.getElementById("round-indicator"),
  timerIndicator: document.getElementById("timer-indicator"),
  participantList: document.getElementById("participant-list"),
  systemMessage: document.getElementById("system-message"),
  chatLog: document.getElementById("chat-log"),
  chatForm: document.getElementById("chat-form"),
  messageInput: document.getElementById("message-input"),
  inputHint: document.getElementById("input-hint"),
  sendMessage: document.getElementById("send-message"),
  skipTurn: document.getElementById("skip-turn"),
  guessOptions: document.getElementById("guess-options"),
  confirmGuess: document.getElementById("confirm-guess"),
  resultTitle: document.getElementById("result-title"),
  resultCopy: document.getElementById("result-copy"),
  resultSummary: document.getElementById("result-summary"),
  restartGame: document.getElementById("restart-game")
};

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle(list) {
  const cloned = [...list];
  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[randomIndex]] = [cloned[randomIndex], cloned[index]];
  }
  return cloned;
}

function formatParticipantRole(participant) {
  if (participant.id === "player") {
    return "あなた";
  }
  return `${participant.name} / ${participant.mbti}`;
}

function truncateCharacters(text, maxCharacters) {
  return Array.from(text).slice(0, maxCharacters).join("");
}

function buildInitialHiddenTrust(mbti) {
  return Math.min(
    0.95,
    HIDDEN_HUMAN_BASE_TRUST + Math.random() * HIDDEN_HUMAN_TRUST_VARIANCE + MBTI_PROFILES[mbti].trustBias
  );
}

function getRecentSpeakerStreak() {
  if (state.chat.length === 0) {
    return { speakerId: null, streak: 0 };
  }

  const lastSpeakerId = state.chat[state.chat.length - 1].speakerId;
  let streak = 0;
  for (let index = state.chat.length - 1; index >= 0; index -= 1) {
    if (state.chat[index].speakerId !== lastSpeakerId) {
      break;
    }
    streak += 1;
  }

  return { speakerId: lastSpeakerId, streak };
}

function applyStreakLimit(participants) {
  const ordered = shuffle(participants);
  const { speakerId, streak } = getRecentSpeakerStreak();
  if (!speakerId || streak < state.config.streakLimit) {
    return ordered;
  }

  const blockedIndex = ordered.findIndex((participant) => participant.id === speakerId);
  if (blockedIndex >= 0) {
    const [blockedParticipant] = ordered.splice(blockedIndex, 1);
    ordered.push(blockedParticipant);
  }
  return ordered;
}

function pickTopic() {
  state.topic = randomItem(TOPICS);
  elements.topicTitle.textContent = state.topic.title;
  elements.topicDescription.textContent = state.topic.description;
  elements.topicKeywords.textContent = `必須キーワード候補: ${state.topic.keywords.join(" / ")}`;
}

function updateSetupValues() {
  state.config.aiCount = Number(elements.aiCount.value);
  state.config.humanCount = Number(elements.humanCount.value);
  state.config.rounds = Number(elements.roundCount.value);
  state.config.typingSeconds = Number(elements.typingSeconds.value);
  elements.aiCountValue.textContent = `${state.config.aiCount}人`;
  elements.humanCountValue.textContent = `${state.config.humanCount}人`;
  elements.roundCountValue.textContent = `${state.config.rounds}ラウンド`;
  elements.typingSecondsValue.textContent = `${state.config.typingSeconds}秒`;
}

function createParticipants() {
  const humansToHide = Math.max(state.config.humanCount - 1, 1);
  const namePool = shuffle(NAMES);
  const mbtiPool = shuffle(Object.keys(MBTI_PROFILES));

  const participants = [
    {
      id: "player",
      name: "あなた",
      role: "player",
      mbti: "----",
      trustFromHumans: []
    }
  ];

  for (let index = 0; index < humansToHide; index += 1) {
    participants.push({
      id: `human-${index + 1}`,
      name: namePool[index],
      role: "hidden-human",
      mbti: mbtiPool[index % mbtiPool.length],
      trustTowardPlayer: buildInitialHiddenTrust(mbtiPool[index % mbtiPool.length])
    });
  }

  for (let index = 0; index < state.config.aiCount; index += 1) {
    participants.push({
      id: `ai-${index + 1}`,
      name: namePool[humansToHide + index] || `参加者${index + 1}`,
      role: "ai",
      mbti: mbtiPool[(humansToHide + index) % mbtiPool.length],
      trustTowardPlayer: 0
    });
  }

  state.participants = participants;
}

function renderParticipants() {
  const chips = state.participants.map((participant) => {
    const chip = document.createElement("div");
    chip.className = "participant-chip";
    chip.textContent = formatParticipantRole(participant);
    return chip;
  });
  elements.participantList.replaceChildren(...chips);
}

function showPanel(panelName) {
  elements.setupPanel.classList.toggle("hidden", panelName !== "setup");
  elements.gamePanel.classList.toggle("hidden", panelName !== "game");
  elements.guessPanel.classList.toggle("hidden", panelName !== "guess");
  elements.resultPanel.classList.toggle("hidden", panelName !== "result");
}

function addChatMessage(message) {
  state.chat.push(message);
  const card = document.createElement("article");
  card.className = `message-card ${message.speakerId === "player" ? "player" : ""}`;

  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.innerHTML = `<span>${message.speaker}</span><span>Round ${message.round}</span>`;

  const text = document.createElement("p");
  text.className = "message-text";
  text.textContent = message.text;

  card.append(meta, text);
  elements.chatLog.appendChild(card);
  elements.chatLog.scrollTop = elements.chatLog.scrollHeight;
}

function isOnTopic(text) {
  const lowered = text.trim().toLowerCase();
  return state.topic.keywords.some((keyword) => lowered.includes(keyword.toLowerCase()));
}

function scorePlayerMessage(text) {
  let score = 0.12;
  if (isOnTopic(text)) {
    score += 0.2;
  }
  if (text.includes("？") || text.includes("?")) {
    score += 0.12;
  }
  if (text.length >= 28) {
    score += 0.08;
  }
  if (state.topic.details.some((detail) => text.includes(detail))) {
    score += 0.12;
  }
  return Math.min(score, MAX_MESSAGE_SCORE);
}

function updateHiddenHumanTrust(text) {
  const gain = scorePlayerMessage(text);
  state.participants.forEach((participant) => {
    if (participant.role === "hidden-human") {
      participant.trustTowardPlayer = Math.min(
        0.98,
        participant.trustTowardPlayer + gain
      );
    }
  });
}

function buildAgentMessage(participant) {
  const profile = MBTI_PROFILES[participant.mbti];
  const prompt = randomItem(state.topic.prompts);
  const keyword = randomItem(state.topic.keywords);
  const detail = randomItem(state.topic.details);
  const previousPlayerMessage = [...state.chat].reverse().find((item) => item.speakerId === "player");
  const callback = previousPlayerMessage
    ? `、${truncateCharacters(previousPlayerMessage.text, MAX_CALLBACK_LENGTH)}に少し近い`
    : "";

  if (participant.role === "hidden-human") {
    return `${profile.humanCue}${callback}${prompt}${keyword}が入ると一気に空気が決まる気がします。${detail}まで思い出せる話の方が人っぽくて好きです。`;
  }

  return `${profile.opener}${callback}${keyword}の話になると、${profile.style}感じで${detail}まで触れる人は自然に見えます。自分はその辺を少し意識します。`;
}

function setComposerEnabled(enabled) {
  elements.messageInput.disabled = !enabled;
  elements.sendMessage.disabled = !enabled;
  elements.skipTurn.disabled = !enabled;
}

function startRound() {
  clearInterval(state.timer);
  elements.messageInput.value = "";
  state.remainingSeconds = state.config.typingSeconds;
  elements.roundIndicator.textContent = `Round ${state.currentRound}/${state.config.rounds}`;
  elements.timerIndicator.textContent = `送信解禁まで ${state.remainingSeconds}s`;
  elements.systemMessage.textContent = "入力時間です。送信はカウント終了後に解禁されます。";
  elements.inputHint.textContent = `キーワード例: ${state.topic.keywords.slice(0, 4).join(" / ")}`;
  setComposerEnabled(false);

  state.timer = setInterval(() => {
    state.remainingSeconds -= 1;
    if (state.remainingSeconds <= 0) {
      clearInterval(state.timer);
      elements.timerIndicator.textContent = "送信可能";
      elements.systemMessage.textContent = "このラウンドの発言を1回だけ送れます。";
      setComposerEnabled(true);
      return;
    }
    elements.timerIndicator.textContent = `送信解禁まで ${state.remainingSeconds}s`;
  }, 1000);
}

function advanceRound() {
  setComposerEnabled(false);
  if (state.currentRound >= state.config.rounds) {
    openGuessPhase();
    return;
  }
  state.currentRound += 1;
  startRound();
}

function processAgentTurns() {
  setComposerEnabled(false);
  const speakers = applyStreakLimit(state.participants.filter((participant) => participant.id !== "player"));

  speakers.forEach((participant) => {
    addChatMessage({
      speakerId: participant.id,
      speaker: formatParticipantRole(participant),
      round: state.currentRound,
      text: buildAgentMessage(participant)
    });
  });

  elements.systemMessage.textContent = "他の参加者の発言が終わりました。";
  advanceRound();
}

function submitPlayerMessage() {
  const text = elements.messageInput.value.trim();
  if (!text) {
    elements.systemMessage.textContent = "空欄では送信できません。";
    return;
  }
  if (!isOnTopic(text)) {
    elements.systemMessage.textContent = "お題外の発言は禁止です。キーワードを含めてください。";
    return;
  }

  addChatMessage({
    speakerId: "player",
    speaker: "あなた",
    round: state.currentRound,
    text
  });
  updateHiddenHumanTrust(text);
  processAgentTurns();
}

function openGuessPhase() {
  clearInterval(state.timer);
  showPanel("guess");
  elements.guessOptions.innerHTML = "";
  const cards = state.participants
    .filter((participant) => participant.id !== "player")
    .map((participant) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "guess-card";
      card.innerHTML = `<strong>${participant.name}</strong><br><span class="muted">${participant.mbti}</span>`;
      card.addEventListener("click", () => {
        state.selectedGuessId = participant.id;
        elements.confirmGuess.disabled = false;
        [...elements.guessOptions.children].forEach((element) => element.classList.remove("selected"));
        card.classList.add("selected");
      });
      return card;
    });
  elements.guessOptions.append(...cards);
}

function evaluateResult() {
  const guessedParticipant = state.participants.find((participant) => participant.id === state.selectedGuessId);
  const hiddenHumans = state.participants.filter((participant) => participant.role === "hidden-human");
  const humansWhoFoundYou = hiddenHumans.filter(
    (participant) => participant.trustTowardPlayer >= TRUST_RECOGNITION_THRESHOLD
  );
  const playerSuccess = guessedParticipant && guessedParticipant.role === "hidden-human";
  const humanSuccess = humansWhoFoundYou.length > 0;

  let title = "完全敗北";
  let toneClass = "status-defeat";
  let copy = "あなたも相手側も人間の正体を掴めませんでした。";

  if (playerSuccess && humanSuccess) {
    title = "完全勝利";
    toneClass = "status-complete";
    copy = "あなたは人間を見抜き、相手の人間もあなたを人間として捉えました。";
  } else if (playerSuccess || humanSuccess) {
    title = "片側勝利";
    toneClass = "status-partial";
    copy = playerSuccess
      ? "あなたは人間を見抜きましたが、相手側はあなたを見抜けませんでした。"
      : "相手の人間はあなたを見抜きましたが、あなたは人間を当てられませんでした。";
  }

  elements.resultTitle.textContent = title;
  elements.resultTitle.className = toneClass;
  elements.resultCopy.textContent = copy;

  const summaryBlocks = [
    `<div class="result-box"><strong>あなたの指名</strong><p>${guessedParticipant ? guessedParticipant.name : "未選択"}${playerSuccess ? " は人間でした。" : " はAIでした。"}</p></div>`,
    `<div class="result-box"><strong>実際の人間</strong><p>${hiddenHumans.map((participant) => `${participant.name} (${participant.mbti})`).join(" / ")}</p></div>`,
    `<div class="result-box"><strong>相手側の判定</strong><p>${humanSuccess ? `${humansWhoFoundYou.map((participant) => participant.name).join(" / ")} があなたを人間だと判断しました。` : "どの人間もあなたを人間だと確信できませんでした。"}</p></div>`
  ];

  elements.resultSummary.innerHTML = summaryBlocks.join("");
  showPanel("result");
}

function resetGame() {
  clearInterval(state.timer);
  state.participants = [];
  state.chat = [];
  state.currentRound = 1;
  state.selectedGuessId = null;
  elements.chatLog.innerHTML = "";
  elements.resultSummary.innerHTML = "";
  elements.confirmGuess.disabled = true;
  elements.resultTitle.className = "";
  showPanel("setup");
}

function startGame() {
  createParticipants();
  state.chat = [];
  state.currentRound = 1;
  state.selectedGuessId = null;
  elements.chatLog.innerHTML = "";
  renderParticipants();
  elements.activeTopic.textContent = state.topic.title;
  showPanel("game");
  startRound();
}

elements.aiCount.addEventListener("input", updateSetupValues);
elements.humanCount.addEventListener("input", updateSetupValues);
elements.roundCount.addEventListener("input", updateSetupValues);
elements.typingSeconds.addEventListener("input", updateSetupValues);
elements.shuffleTopic.addEventListener("click", pickTopic);
elements.startGame.addEventListener("click", startGame);
elements.chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitPlayerMessage();
});
elements.skipTurn.addEventListener("click", () => {
  elements.systemMessage.textContent = "あなたはこのラウンドをスキップしました。";
  processAgentTurns();
});
elements.confirmGuess.addEventListener("click", evaluateResult);
elements.restartGame.addEventListener("click", resetGame);

updateSetupValues();
pickTopic();
