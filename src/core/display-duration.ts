export function displayDuration(sec: number) {
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = Math.floor(sec % 60);

  return `${hours > 0 ? `${hours} ч ` : ''}${minutes > 0 ? `${minutes} мин` : `${seconds} сек`}`;
}
