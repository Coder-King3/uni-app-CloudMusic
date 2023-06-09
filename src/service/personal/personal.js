import request from '../index.js'

const PersonalApi = {
  UserPlaylist: '/user/playlist'
}
// 获取用户歌单
export const getUserPlaylist = (param = {}) =>
  request.get({ url: PersonalApi.UserPlaylist, data: param })
