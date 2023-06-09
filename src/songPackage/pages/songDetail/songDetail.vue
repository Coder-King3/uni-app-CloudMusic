<template>
  <view class="songDetailContainer">
    <!-- 摇杆磁盘 -->
    <view v-if="isRast == 3" class="author">{{ nickname }}</view>
    <view v-else class="author">{{ song.ar[0].name }}</view>

    <view class="circle"></view>
    <image
      :class="'needle ' + (isPlay && 'needleRotate')"
      src="@/static/images/song/needle.png"
    ></image>
    <view :class="'discContainer ' + (isPlay && 'discAnimation')">
      <image class="disc" src="@/static/images/song/disc.png"></image>
      <image v-if="isRast == 3" class="musicImg" :src="song.coverUrl"></image>
      <image v-else class="musicImg" :src="song.al.picUrl"></image>
    </view>

    <!-- 进度条控制区域 -->
    <view class="progressControl">
      <text>{{ currentTime }}</text>
      <!-- 总进度条 -->
      <view class="barControl">
        <!-- 实时进度条 -->
        <view
          class="audio-currentTime-Bar"
          :style="'width: ' + (currentWidth + 'rpx')"
        >
          <!-- 小圆球 -->
          <view class="audio-circle"></view>
        </view>
      </view>
      <text>{{ durationTime }}</text>
    </view>

    <!-- 播放列表 -->
    <view v-if="isOpenList">
      <ul></ul>
    </view>

    <!-- 底部控制区域 -->
    <view class="musicControl">
      <text class="iconfont icon-iconsMusicyemianbofangmoshiRepeat"></text>

      <text
        class="iconfont icon-shangyishou"
        id="pre"
        @tap="handleSwitch"
      ></text>

      <text
        :class="
          'iconfont ' + (isPlay ? 'icon-zanting' : 'icon-bofang') + ' big'
        "
        @tap="handleMusicPlay"
      ></text>

      <text class="iconfont icon-next" id="next" @tap="handleSwitch"></text>

      <text
        class="iconfont icon-iconsMusicyemianbofangmoshiPlayList"
        @click="openPlaylist(pid)"
      ></text>
    </view>
  </view>
</template>

<script>
import {
  getSongDetail,
  getProgramDetail,
  getSongUrl,
  getPlaylistDetails
} from '@/service/song/song.js'
import PubSub from 'pubsub-js'
import moment from 'moment'
// 获取全局实例
const app = getApp()
export default {
  data() {
    return {
      isPlay: false,
      // 音乐是否播放
      song: {
        ar: '',
        al: {
          picUrl: ''
        },
        coverUrl: ''
      },
      // 歌曲详情对象
      isRast: 0,
      //电台Boolean
      programId: '',
      //电台节目详情id
      musicId: '',
      // 音乐id
      muasId: '',
      //电台节目id
      musicLink: '',
      // 音乐的链接
      currentTime: '00:00',
      // 实时时间
      durationTime: '00:00',
      // 总时长
      currentWidth: 0,
      // 实时进度条的宽度
      pid: 0,
      // 歌单id
      PlaylistDetails: [],
      //歌单列表
      // 是否显示播放列表
      isOpenList: false,
      name: '',
      nickname: ''
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let musicId = options.musicId
    let isRast = options.isRast
    let programId = options.programId
    let pid = options.pid
    this.musicId = musicId
    this.isRast = isRast
    this.programId = programId
    this.pid = pid
    // debugger
    console.log('options', options)
    // 判断是音乐还是电台
    if (isRast == 3) {
      console.log('获取电台详情', isRast)
      //获取电台详情
      this.getRadiostationInfo(programId)
    } else {
      console.log('获取音乐详情', isRast)
      //获取音乐详情
      this.getMusicInfo(musicId)
    }

    /*
     * 问题： 如果用户操作系统的控制音乐播放/暂停的按钮，页面不知道，导致页面显示是否播放的状态和真实的音乐播放状态不一致
     * 解决方案：
     *   1. 通过控制音频的实例 backgroundAudioManager 去监视音乐播放/暂停
     */

    // 判断当前页面音乐是否在播放
    if (app.globalData.isMusicPlay && app.globalData.musicId === musicId) {
      // 修改当前页面音乐播放状态为true
      this.isPlay = true
    }

    //创建控制音乐播放的实例
    this.backgroundAudioManager = uni.getBackgroundAudioManager()
    // 监视音乐播放/暂停/停止
    this.backgroundAudioManager.onPlay(() => {
      //播放
      this.changePlayState(true)
      app.globalData.musicId = musicId
    })
    this.backgroundAudioManager.onPause(() => {
      //暂停
      this.changePlayState(false)
    })
    this.backgroundAudioManager.onStop(() => {
      //停止
      this.changePlayState(false)
    })
    // 监听音乐播放自然结束
    this.backgroundAudioManager.onEnded(() => {
      // 自动切换至下一首音乐，并且自动播放
      if (this.isRast == 3) {
        // 订阅来自页面发布的musicId消息
        PubSub.subscribe('musicId', (msg, musicId) => {
          //获取电台详情
          this.getRadiostationInfo(musicId.info)
          // 自动播放当前的音乐
          this.musicControl(true, musicId.id)
          // 取消订阅
          PubSub.unsubscribe('musicId')
        })
        // 发布消息数据给recommendSong页面
        PubSub.publish('switchType', 'next')
      } else {
        // 订阅来自页面发布的musicId消息
        PubSub.subscribe('musicId', (msg, musicId) => {
          //获取音乐详情
          this.getMusicInfo(musicId)
          // 自动播放当前的音乐
          this.musicControl(true, musicId)
          // 取消订阅
          PubSub.unsubscribe('musicId')
        })
        // 发布消息数据给recommendSong页面
        PubSub.publish('switchType', 'next')
      }
      // 将实时进度条的长度还原成 0；时间还原成 0；
      this.currentWidth = 0
      this.currentTime = '00:00'
    })

    // 监听音乐实时播放的进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      // console.log('总时长: ', this.backgroundAudioManager.duration);
      // console.log('实时的时长: ', this.backgroundAudioManager.currentTime);
      // 格式化实时的播放时间
      let currentTime = moment(
        this.backgroundAudioManager.currentTime * 1000
      ).format('mm:ss')
      let currentWidth =
        (this.backgroundAudioManager.currentTime /
          this.backgroundAudioManager.duration) *
        422
      //判断当前歌曲是否在播放
      if (app.globalData.isMusicPlay && app.globalData.musicId === musicId) {
        //播放则实时化进度条
        this.currentTime = currentTime
        this.currentWidth = currentWidth
      } else {
        //不播放则清空进度条
        this.currentTime = '00:00'
        this.currentWidth = 0
      }
    })
  },
  methods: {
    // 修改播放状态的功能函数
    changePlayState(isPlay) {
      // 修改音乐是否的状态
      this.isPlay = isPlay

      //修改全局音乐播放的状态
      app.globalData.isMusicPlay = isPlay
      console.log('song', this.song)
    },

    // 获取音乐详情的功能函数
    async getMusicInfo(musicId) {
      let songData = await getSongDetail({
        ids: musicId
      })
      console.log('songData', songData)
      // songData.songs[0].dt 单位ms
      this.durationTime = moment(songData.songs[0].dt).format('mm:ss')
      this.song = songData.songs[0]

      // 动态修改窗口标题
      uni.setNavigationBarTitle({
        title: this.song.name ?? 'King Cloud-Music'
      })
    },

    // 获取电台节目详情的功能函数
    async getRadiostationInfo(musicId) {
      //获取电台节目详情
      let rogramData = await getProgramDetail({
        id: musicId
      })
      console.log('rogramData', rogramData)
      this.durationTime = moment(
        rogramData.program.mainSong.bMusic.playTime
      ).format('mm:ss')
      this.song = rogramData.program
      this.muasId = rogramData.program.mainSong.id

      // 动态修改窗口标题
      uni.setNavigationBarTitle({
        title: this.song.name ?? 'King Cloud-Music'
      })
    },

    // 点击播放/暂停的回调
    handleMusicPlay() {
      let isPlay = !this.isPlay
      // 修改是否播放的状态
      // this.isPlay = isPlay

      let { musicId, musicLink } = this
      this.musicControl(isPlay, musicId, musicLink)
    },

    // 控制音乐播放/暂停的功能函数
    async musicControl(isPlay, musicId, musicLink) {
      if (isPlay) {
        // 音乐播放
        if (!musicLink) {
          // 获取音乐播放链接
          let musicLinkData = await getSongUrl({
            id: musicId
          })
          musicLink = musicLinkData.data[0].url
          this.musicLink = musicLink
        }
        this.backgroundAudioManager.src = musicLink
        this.backgroundAudioManager.title = this.song.name
      } else {
        // 暂停音乐
        this.backgroundAudioManager.pause()
      }
    },

    // 点击切歌的回调
    handleSwitch(event) {
      // 获取切歌的类型
      let type = event.currentTarget.id
      // 关闭当前播放的音乐
      this.backgroundAudioManager.stop()
      if (this.isRast == 3) {
        // 订阅来自页面发布的musicId消息
        PubSub.subscribe('musicId', (msg, musicId) => {
          //获取电台详情
          this.getRadiostationInfo(musicId.info)
          // 自动播放当前的音乐
          this.musicControl(true, musicId.id)
          // 取消订阅
          PubSub.unsubscribe('musicId')
        })
        // 发布消息数据给recommendSong页面
        PubSub.publish('switchType', type)
      } else {
        // 订阅来自页面发布的musicId消息
        PubSub.subscribe('musicId', (msg, musicId) => {
          console.log('接受音乐Id：' + musicId)
          //获取音乐详情
          this.getMusicInfo(musicId)
          // 自动播放当前的音乐
          this.musicControl(true, musicId)
          // 取消订阅
          PubSub.unsubscribe('musicId')
        })
        // 发布消息数据给recommendSong页面
        PubSub.publish('switchType', type)
      }
    },

    //显示播放列表
    openPlaylist(pid) {
      // PubSub.subscribe('getSongSheet', (msg,isRast,playlistId) => {
      //   console.log(msg,isRast,playlistId);
      //   this.isRast = isRast
      //   this.playlistId = playlistId

      //   // 取消订阅
      //   PubSub.unsubscribe('getSongSheet');
      // })
      // // 发布消息数据给recommendSong页面
      // // PubSub.publish('getSongSheet', 'next')
      // console.log(this.data);
      this.fetchPlaylistDetails(pid)
    },

    // 获取歌单详情功能函数
    async fetchPlaylistDetails(playlistId) {
      let PlaylistDetailsong = await getPlaylistDetails({
        id: playlistId
      })
      let PlaylistDetails = PlaylistDetailsong.playlist
      console.log(PlaylistDetails)

      // this.PlaylistDetails = PlaylistDetails
      // 关闭消息提示框
      // wx.hideLoading();
    }
  }
}
</script>
<style lang="less">
page {
  height: 100%;
}

.songDetailContainer {
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 底座 */
.circle {
  position: relative;
  z-index: 100;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #fff;
  margin: 10rpx 0;
}
/* 摇杆 */
.author {
  color: #d9d9d9;
  font-size: 26rpx;
  padding-top: 6rpx;
}

.needle {
  position: relative;
  z-index: 99;
  top: -40rpx;
  left: 60rpx;
  width: 192rpx;
  height: 274rpx;
  transform-origin: 40rpx 0;
  transform: rotate(-20deg);
  transition: transform 1s;
}

.needleRotate {
  transform: rotate(0deg);
}

/* 磁盘 */
.discContainer {
  position: relative;
  top: -170rpx;
  width: 598rpx;
  height: 598rpx;
}
.disc {
  width: 598rpx;
  height: 598rpx;
}

.discAnimation {
  animation: disc 4s linear infinite;
  animation-delay: 1s;
}

/*
  @keyframes: 设置动画帧
    1) from to
      - 使用于简单的动画，只有起始帧和结束帧
      - 北京 - 上海  直达
    2) 百分比
      - 多用于复杂的动画，动画不止两帧
      - 北京 - 上海 ---> 北京 -- 天津 --- 深圳 --- 上海
      - 0% - 100%, 可以任意拆分

*/

@keyframes disc {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.musicImg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  width: 370rpx;
  height: 370rpx;
  border-radius: 50%;
}

/* 底部控制区域 */
.musicControl {
  position: absolute;
  bottom: 40rpx;
  left: 0;
  border-top: 1rpx solid #fff;
  width: 100%;
  display: flex;
}

.musicControl text {
  width: 20%;
  height: 120rpx;
  line-height: 120rpx;
  text-align: center;
  color: #fff;
  font-size: 50rpx;
}

.musicControl text.big {
  font-size: 80rpx;
}

/* 进度条控制区域 */
.progressControl {
  position: absolute;
  bottom: 200rpx;
  width: 640rpx;
  height: 80rpx;
  line-height: 80rpx;
  display: flex;
  color: rgba(255, 255, 255, 0.7);
}

.barControl {
  position: relative;
  width: 430rpx;
  height: 4rpx;
  background: rgba(255, 255, 255, 0.3);
  margin: auto;
}

.audio-currentTime-Bar {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  height: 4rpx;
  background: #0094ff;
}

/* 小圆球 */
.audio-circle {
  position: absolute;
  right: -12rpx;
  top: -4rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #fff;
}
</style>
