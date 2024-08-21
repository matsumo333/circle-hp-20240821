// utils.js
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0 && remainingMinutes === 0) {
    return ""; // 0分の場合は空文字を返す
  }
  if (hours === 0) {
    return `${remainingMinutes}分`; // 0時間の場合は分だけを返す
  }
  if (remainingMinutes === 0) {
    return `${hours}時間`; // 0分の場合は時間だけを返す
  }
  return `${hours}時間${remainingMinutes}分`; // 両方が0でない場合
};
