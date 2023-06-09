import request from '../index.js'

const SongApi = {
  PlaylistDetails: '/playlist/detail', // 获取歌单详情
  PodcastDetails: '/dj/detail', // 获取播客详情
  PodcastSongDetails: '/dj/program', // 获取播客节目详情
  UserPlaybackRecord: '/user/record', // 获取用户播放记录
  DayRecommendSongs: '/recommend/songs', // 获取用户每日推荐歌曲
  SongDetail: '/song/detail', // 获取音乐详情
  ProgramDetail: '/dj/program/detail', //获取电台节目详情
  SongUrl: '/song/url' // 获取音乐播放链接
}

// 获取歌单详情
export const getPlaylistDetails = (param = {}) =>
  request.get({ url: SongApi.PlaylistDetails, data: param })

// 获取播客详情
export const getPodcastDetails = (param = {}) =>
  request.get({ url: SongApi.PodcastDetails, data: param })

// 获取播客节目详情
export const getPodcastSongDetails = (param = {}) =>
  request.get({ url: SongApi.PodcastSongDetails, data: param })

// 获取用户播放记录
export const getUserPlaybackRecord = (param = {}) =>
  request.get({ url: SongApi.UserPlaybackRecord, data: param })

// 获取用户每日推荐歌曲
export const getDayRecommendSongs = (param = {}) =>
  request.get({ url: SongApi.DayRecommendSongs, data: param })

// 获取音乐详情
export const getSongDetail = (param = {}) =>
  request.get({ url: SongApi.SongDetail, data: param })

//获取电台节目详情
export const getProgramDetail = (param = {}) =>
  request.get({ url: SongApi.ProgramDetail, data: param })

// 获取音乐播放链接
export const getSongUrl = (param = {}) =>
  request.get({ url: SongApi.SongUrl, data: param })
