import { Gamification } from '@/database';
import { LeaderboardType } from '@/interfaces';
import fs from 'fs';
import path from 'path';

const getStartDateByType = (type:LeaderboardType) => {
  const now = new Date();
  if (type === 'DAILY') {
    now.setHours(0, 0, 0, 0);
  } else if (type === 'WEEKLY') {
    const day = now.getDay();
    now.setDate(now.getDate() - day);
    now.setHours(0, 0, 0, 0);
  } else if (type === 'MONTHLY') {
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
  }
  return now;
};

const generateLeaderboard = async (type: LeaderboardType) => {
  const startDate = getStartDateByType(type);
  const endDate = new Date();

  const gamificationData = await Gamification.find();
  
  const userScores: Record<string, number> = {};

  gamificationData.forEach((user) => {
    const actions = user.actions.filter(
      (a) =>
        a.createdAt !== undefined &&
        a.createdAt >= startDate &&
        a.createdAt <= endDate
    );

    const total = actions.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
    if (total > 0) {
      userScores[user.userId.toString()] =
        (userScores[user.userId.toString()] || 0) + total;
    }
  });

  const sorted = Object.entries(userScores)
    .sort((a, b) => b[1] - a[1])
    .map(([userId, points]) => ({ userId, points }));

  const publicDir = path.join(process.cwd(), 'public', 'leaderboards');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(publicDir, `${type.toLowerCase()}.json`),
    JSON.stringify(sorted, null, 2)
  );

  if (sorted.length > 0) {
    const top = sorted[0];
  }
  return sorted;
};

export {
  getStartDateByType,
  generateLeaderboard,
}
