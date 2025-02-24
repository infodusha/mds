export function displayDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours > 0 ? `${hours} ч ` : ''}${minutes > 0 ? `${minutes} мин` : ''}`;
}
