import request from '../index.js'

const HomeApi = {
  BannerData: '/banner',
  SongData: '/personalized',
  RadioStationData: '/dj/hot',
  TopListData: '/toplist',
  TopListDetailData: '/toplist/detail'
}
// 获取轮播图数据
export const getBannerData = (param = {}) =>
  request.get({ url: HomeApi.BannerData, data: param })

// 获取推荐歌曲数据
export const getSongData = (param = {}) =>
  request.get({ url: HomeApi.SongData, data: param })

// 获取热门电台数据
export const getRadioStationData = (param = {}) =>
  request.get({ url: HomeApi.RadioStationData, data: param })

// 获取排行榜列表内容摘要数据
export const getTopListData = (param = {}) =>
  request.get({ url: HomeApi.TopListData, data: param })

// 获取排行榜列表内容摘要数据
export const getTopListDetailData = (param = {}) =>
  request.get({ url: HomeApi.TopListDetailData, data: param })
