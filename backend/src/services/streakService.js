export const updateStreak = async (userId) => {
    const user = await User.findById(userId);
    const lastActive = user.lastActive || new Date();
    
    const daysSince = Math.floor((new Date() - lastActive) / (1000 * 3600 * 24));
    
    if(daysSince === 1) {
      user.streak += 1;
    } else if(daysSince > 1) {
      user.streak = 1;
    }
  
    user.lastActive = new Date();
    
    // Check for badges
    if(user.streak >= 7 && !user.badges.includes('7-day-streak')) {
      user.badges.push('7-day-streak');
    }
    
    await user.save();
  };