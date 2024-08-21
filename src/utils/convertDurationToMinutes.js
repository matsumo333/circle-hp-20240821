// src/utils/convertDurationToMinutes.js

export const convertDurationToMinutes = (duration) => {
  // 例えば、"2h30m" の形式を処理する
  const hours = parseInt(duration.match(/(\d+)h/)?.[1] || "0", 10);
  const minutes = parseInt(duration.match(/(\d+)m/)?.[1] || "0", 10);
  return hours * 60 + minutes;
};
