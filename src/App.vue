<script>
export default {
  globalData: {
    isMusicPlay: false, // 是否有音乐在播放
    musicId: '' // 音乐id
  },
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  }
}
</script>

<style lang="less">
/*每个页面公共css */
@import './static/iconfont/iconfont.css';
</style>
