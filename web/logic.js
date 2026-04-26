// Pure logic shared by app.js and test.html.
// Anything stateful belongs in app.js; only deterministic-given-args functions live here.
(function () {
  function shuffle(list) {
    const cloned = [...list];
    for (let index = cloned.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [cloned[index], cloned[randomIndex]] = [cloned[randomIndex], cloned[index]];
    }
    return cloned;
  }

  function getRecentSpeakerStreak(chat) {
    if (chat.length === 0) {
      return { speakerId: null, streak: 0 };
    }

    const lastSpeakerId = chat[chat.length - 1].speakerId;
    let streak = 0;
    for (let index = chat.length - 1; index >= 0; index -= 1) {
      if (chat[index].speakerId !== lastSpeakerId) {
        break;
      }
      streak += 1;
    }

    return { speakerId: lastSpeakerId, streak };
  }

  function applyStreakLimit(participants, chat, streakLimit) {
    const ordered = shuffle(participants);
    const { speakerId, streak } = getRecentSpeakerStreak(chat);
    if (!speakerId || streak < streakLimit) {
      return ordered;
    }

    const blockedIndex = ordered.findIndex((participant) => participant.id === speakerId);
    if (blockedIndex >= 0) {
      const [blockedParticipant] = ordered.splice(blockedIndex, 1);
      ordered.push(blockedParticipant);
    }
    return ordered;
  }

  function isOnTopic(text, keywords) {
    const lowered = text.trim().toLowerCase();
    return keywords.some((keyword) => lowered.includes(keyword.toLowerCase()));
  }

  window.AIwolfLogic = { shuffle, getRecentSpeakerStreak, applyStreakLimit, isOnTopic };
})();
