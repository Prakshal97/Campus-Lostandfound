const { areZonesAdjacent } = require('../config/zones');

/**
 * Tokenize and normalize text for keyword matching
 */
function tokenize(text) {
  if (!text) return new Set();
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)
  );
}

/**
 * Calculate Jaccard Similarity index between two text sets
 */
function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  setA.forEach(item => {
    if (setB.has(item)) intersection++;
  });
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Calculate match score between a lost item and a found item
 */
function calculateMatchScore(lostItem, foundItem) {
  let score = 0;
  const reasons = [];

  // 1. Same Category (Weight: 35)
  if (lostItem.category && foundItem.category && lostItem.category.toLowerCase() === foundItem.category.toLowerCase()) {
    score += 35;
    reasons.push(`Same category (${lostItem.category})`);
  }

  // 2. Keyword & Tag overlap (Weight: 30)
  const lostTokens = tokenize(`${lostItem.title} ${lostItem.description} ${(lostItem.tags || []).join(' ')}`);
  const foundTokens = tokenize(`${foundItem.title} ${foundItem.description} ${(foundItem.tags || []).join(' ')}`);
  const similarity = jaccardSimilarity(lostTokens, foundTokens);
  
  if (similarity > 0) {
    const keywordScore = Math.min(30, Math.round(similarity * 40));
    score += keywordScore;
    if (keywordScore >= 10) {
      reasons.push(`High keyword overlap in description (${Math.round(similarity * 100)}% match)`);
    }
  }

  // 3. Location Zone (Weight: 20)
  if (lostItem.location === foundItem.location) {
    score += 20;
    reasons.push(`Exact same campus location zone`);
  } else if (areZonesAdjacent(lostItem.location, foundItem.location)) {
    score += 10;
    reasons.push(`Adjacent campus zones`);
  }

  // 4. Date/Time proximity (Weight: 10)
  if (lostItem.eventDate && foundItem.eventDate) {
    const lostTime = new Date(lostItem.eventDate).getTime();
    const foundTime = new Date(foundItem.eventDate).getTime();
    const diffHours = (foundTime - lostTime) / (1000 * 60 * 60);

    if (diffHours >= -6 && diffHours <= 24) {
      score += 10;
      reasons.push(`Found within 24 hours of lost timestamp`);
    } else if (diffHours > 24 && diffHours <= 72) {
      score += 5;
      reasons.push(`Found within 3 days of lost timestamp`);
    }
  }

  // 5. Colour / Brand match (Weight: 5)
  let brandMatch = false;
  let colorMatch = false;
  if (lostItem.brand && foundItem.brand && lostItem.brand.toLowerCase() === foundItem.brand.toLowerCase()) {
    brandMatch = true;
    score += 3;
  }
  if (lostItem.colour && foundItem.colour && lostItem.colour.toLowerCase() === foundItem.colour.toLowerCase()) {
    colorMatch = true;
    score += 2;
  }
  if (brandMatch || colorMatch) {
    const details = [];
    if (brandMatch) details.push(`Brand: ${lostItem.brand}`);
    if (colorMatch) details.push(`Color: ${lostItem.colour}`);
    reasons.push(`Matching details (${details.join(', ')})`);
  }

  return {
    score: Math.min(100, score),
    reasons
  };
}

/**
 * Find top matches for a given item among all items in store
 */
function findMatchesForItem(targetItem, allItems, minScore = 50) {
  const matches = [];

  // We match Lost items with Found items, or vice versa
  const candidateType = targetItem.type === 'lost' ? 'found' : 'lost';

  const candidateItems = allItems.filter(item => 
    item._id !== targetItem._id && 
    item.type === candidateType && 
    item.status !== 'Returned' && 
    item.status !== 'Expired'
  );

  candidateItems.forEach(candidate => {
    const lostItem = targetItem.type === 'lost' ? targetItem : candidate;
    const foundItem = targetItem.type === 'found' ? targetItem : candidate;
    
    const { score, reasons } = calculateMatchScore(lostItem, foundItem);
    
    if (score >= minScore) {
      matches.push({
        item: candidate,
        score,
        reasons
      });
    }
  });

  // Sort descending by score
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 3);
}

module.exports = {
  calculateMatchScore,
  findMatchesForItem
};
