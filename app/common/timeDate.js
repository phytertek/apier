const DAYS = n => n * 24 * 60 * 60 * 1000;
module.exports = {
  todayPlusNDays(n) {
    const now = new Date();
    const currentTime = now.getTime();
    return new Date(currentTime + DAYS(n));
  }
};
