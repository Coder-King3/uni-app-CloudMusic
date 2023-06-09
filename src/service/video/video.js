import request from '../index.js'

const VideoApi = {
  VideoGroupList: '/video/group/list',
  VideoGroup: '/video/group'
}

// 获取视频标签列表
export const getVideoGroupList = (param = {}) =>
  request.get({ url: VideoApi.VideoGroupList, data: param })

// 获取视频标签/分类下的视频
export const getVideoGroup = (param = {}) =>
  request.get({ url: VideoApi.VideoGroup, data: param })
