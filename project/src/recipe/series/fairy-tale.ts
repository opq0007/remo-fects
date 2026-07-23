import type { BlessingSeriesPack } from '../types';

export const fairyTaleSeries: BlessingSeriesPack = {
  id: 'fairy_tale',
  name: '童话系列',
  primaryColor: '#FF8FA3',
  secondaryColor: '#B892FF',
  characters: [
    { type: 'cinderella', imageSrc: 'pic/灰姑娘.png', name: '灰姑娘', greeting: '祝你梦想成真！' },
    { type: 'snow_white', imageSrc: 'pic/白雪公主.png', name: '白雪公主', greeting: '祝你永远快乐！' },
    { type: 'mickey', imageSrc: 'pic/米奇.png', name: '米奇', greeting: '祝你生日快乐！' },
  ],
};
