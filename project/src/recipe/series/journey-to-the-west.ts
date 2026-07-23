import type { BlessingSeriesPack } from '../types';

export const journeyToTheWestSeries: BlessingSeriesPack = {
  id: 'journey_to_the_west',
  name: '西游记系列',
  primaryColor: '#FFD76A',
  secondaryColor: '#7EC8FF',
  characters: [
    {
      type: 'sun_wukong',
      imageSrc: 'pic/孙悟空.png',
      videoSrc: '孙悟空.mp4',
      name: '孙悟空',
      greeting: '俺老孙来也！祝你生日快乐！',
    },
    {
      type: 'tang_seng',
      imageSrc: 'pic/唐僧.png',
      videoSrc: '唐僧.mp4',
      name: '唐僧',
      greeting: '阿弥陀佛，祝你健康成长！',
    },
    {
      type: 'zhu_bajie',
      imageSrc: 'pic/猪八戒.png',
      videoSrc: '猪八戒.mp4',
      name: '猪八戒',
      greeting: '嘿嘿，生日快乐！',
    },
    {
      type: 'sha_wujing',
      imageSrc: 'pic/沙和尚.png',
      videoSrc: '沙和尚.mp4',
      name: '沙和尚',
      greeting: '祝你天天开心！',
    },
    {
      type: 'white_dragon_horse',
      imageSrc: 'pic/白龙马.png',
      videoSrc: '白龙马.mp4',
      name: '白龙马',
      greeting: '祝你一马当先！',
    },
  ],
};
