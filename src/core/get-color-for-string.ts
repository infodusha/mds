export function getColorForString(str: string) {
  const colors = [
    'bg-red-500/20 text-red-600 dark:bg-red-500/30 dark:text-red-200',
    'bg-blue-500/20 text-blue-600 dark:bg-blue-500/30 dark:text-blue-200',
    'bg-green-500/20 text-green-600 dark:bg-green-500/30 dark:text-green-200',
    'bg-yellow-500/20 text-yellow-600 dark:bg-yellow-500/30 dark:text-yellow-200',
    'bg-purple-500/20 text-purple-600 dark:bg-purple-500/30 dark:text-purple-200',
    'bg-pink-500/20 text-pink-600 dark:bg-pink-500/30 dark:text-pink-200',
  ];
  const index = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}
