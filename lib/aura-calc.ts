export const calculateAuraLocally = (log: string) => {
    const words = log.toLowerCase();
    let score = 2; // Starting floor
  
    const weights = [
      { words: ['built', 'shipped', 'deployed', 'coded', 'component'], points: 3 },
      { words: ['gym', 'run', 'workout', 'pushups', 'training'], points: 2 },
      { words: ['read', 'learned', 'studied', 'planned'], points: 1 }
    ];
  
    weights.forEach(tier => {
      tier.words.forEach(w => { if(words.includes(w)) score += tier.points; });
    });
  
    const finalScore = Math.min(score, 10);
    const verdicts = [
      "Dormant energy. The grid is hungry.",
      "Initial spark. Keep the momentum high.",
      "Flow state achieved. Kinetic frequency rising.",
      "God-mode. You are the architect of 2026."
    ];
  
    return { 
      score: finalScore, 
      verdict: finalScore < 4 ? verdicts[0] : finalScore < 7 ? verdicts[1] : finalScore < 9 ? verdicts[2] : verdicts[3] 
    };
  };