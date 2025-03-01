import lyricsData from '@/data/lyrics.json';
import epochData from '@/data/epoch.json';
import storyData from '@/data/story.json';
import generalData from '@/data/general.json';
import placeData from '@/data/place.json';

export const PARAM_FIELDS = {
  LYRICS: 'Линейность сюжета',
  EPOCH: 'Время действия',
  STORY: 'Сюжетные ходы',
  GENERAL: 'Общие характеристики',
  PLACE: 'Место действия',
} as const;

export const allTags = [...generalData, ...placeData, ...epochData, ...storyData, ...lyricsData];

export const tagToParamMap = new Map<string, string>();
lyricsData.forEach(tag => tagToParamMap.set(tag, 'params.' + PARAM_FIELDS.LYRICS));
epochData.forEach(tag => tagToParamMap.set(tag, 'params.' + PARAM_FIELDS.EPOCH));
storyData.forEach(tag => tagToParamMap.set(tag, 'params.' + PARAM_FIELDS.STORY));
generalData.forEach(tag => tagToParamMap.set(tag, 'params.' + PARAM_FIELDS.GENERAL));
placeData.forEach(tag => tagToParamMap.set(tag, 'params.' + PARAM_FIELDS.PLACE));
