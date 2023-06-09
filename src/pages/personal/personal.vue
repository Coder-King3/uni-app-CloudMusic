<template>
  <view class="personalContainer">
    <view class="user-section">
      <image
        class="bg"
        :src="
          userinfo.backgroundUrl
            ? userinfo.backgroundUrl
            : '/static/images/personal/bgImg2.jpg'
        "
      ></image>
      <view class="user-info-box" @click="toLogin">
        <view class="portrait-box">
          <image
            class="portrait"
            :src="
              userinfo.avatarUrl
                ? userinfo.avatarUrl
                : '/static/images/personal/missing-face.png'
            "
          ></image>
        </view>
        <view class="info-box">
          <text class="username">
            {{ userinfo.nickname ? userinfo.nickname : '游客' }}
          </text>
        </view>
      </view>

      <view class="vip-card-box">
        <image
          class="card-bg"
          src="/static/images/personal/vip-card-bg.png"
        ></image>
        <view class="b-btn">立即开通</view>
        <view class="tit">
          <!-- 会员图标 -->
          <text class="iconfont icon-huiyuan-"></text>
          King Music VIP
        </view>
        <text class="e-m">King Music</text>
        <text class="e-b">开通VIP听歌, 敲代码。</text>
      </view>
    </view>

    <view
      class="cover-container"
      @touchstart="bindtouchstart"
      @touchmove="bindtouchmove"
      @touchend="bindtouchend"
      :style="'transform: ' + coverTransform + '; transition:' + coveTransition"
    >
      <image class="arc" src="/static/images/personal/arc.png"></image>
      <!-- 个人中心导航 -->
      <view class="nav-section">
        <view class="nav-item" hover-class="common-hover" hover-stay-time="50">
          <text class="iconfont icon-xiaoxi"></text>
          <text>我的消息</text>
        </view>
        <view class="nav-item" hover-class="common-hover" hover-stay-time="50">
          <text class="iconfont icon-myRecommender"></text>
          <text>我的好友</text>
        </view>
        <view class="nav-item" hover-class="common-hover" hover-stay-time="50">
          <text class="iconfont icon-gerenzhuye"></text>
          <text>个人主页</text>
        </view>
        <view class="nav-item" hover-class="common-hover" hover-stay-time="50">
          <text class="iconfont icon-gexingzhuangban"></text>
          <text>个性装扮</text>
        </view>
      </view>

      <!-- 个人中心列表 -->
      <view class="personalContent">
        <!-- 我喜欢音乐 -->
        <view class="iIikeMusic">
          <view
            class="iIikeMusiclist"
            v-if="index < 1"
            @tap="toPlaylistDetails(item, index)"
            v-for="(item, index) in UserSongList"
            :key="index"
          >
            <image :src="item.coverImgUrl"></image>

            <view class="musicInfo">
              <text class="musicName">{{ item.name }}</text>
              <text class="musicNumber">{{ item.trackCount }}首</text>
            </view>

            <view class="heart">
              <text>❤</text>
              心动模式
            </view>
          </view>
        </view>

        <!-- 播放记录 -->
        <view class="recentPlayContainer">
          <text class="title">最近播放</text>
          <text class="more">﹥</text>
          <!-- 最近播放记录 -->
          <scroll-view
            v-if="recentPlayList.length"
            scroll-x
            class="recentScroll"
            enable-flex
          >
            <view
              class="recentItem"
              v-if="index < 10"
              @click="toplayRecordTab"
              v-for="(item, index) in recentPlayList"
              :key="index"
            >
              <image :src="item.song.al.picUrl"></image>
            </view>
          </scroll-view>
          <view v-else style="padding-left: 17rpx">暂无播放记录</view>
        </view>

        <!-- 我的歌单 -->
        <view class="card-item">
          <view class="card-title">
            <text class="title">我的歌单</text>
            <text class="more">﹥</text>
          </view>
          <!-- 歌单内容 -->
          <scroll-view v-if="UserSongList.length" scroll-y class="listScroll">
            <view
              class="card-musiclist"
              v-if="index != 0"
              @tap="toPlaylistDetails(item)"
              v-for="(item, index) in UserSongList"
              :key="index"
            >
              <image :src="item.coverImgUrl"></image>

              <view class="musicInfo">
                <text class="musicName">{{ item.name }}</text>
                <text class="musicNumber">{{ item.trackCount }}首</text>
              </view>

              <text class="iconfont icon-gengduo"></text>
            </view>
          </scroll-view>
          <view v-else style="padding-left: 17rpx">暂无音乐歌单</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getUserPlaylist } from '@/service/personal/personal.js'
import { getUserPlaybackRecord } from '@/service/song/song.js'
import PubSub from 'pubsub-js'
export default {
  data() {
    return {
      coverTransform: 'translateY(0)',
      coveTransition: '',
      userinfo: {
        backgroundUrl: false,
        avatarUrl: false,
        nickname: false
      },
      //用户信息
      recentPlayList: [],
      // 用户播放记录展览
      recentPlayweekData: [],
      //用户播放记录歌单
      UserSongList: [],
      //用户歌单
      UserRadioStationList: [],
      //用户电台
      index: 0,
      // 点击音乐的下标
      playlistId: 0, //歌单id
      staetY: 0, //手指起始坐标
      moveX: 0, //手指移动坐标
      moveDistance: 0 //手指移动距离
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */ onLoad: function (options) {
    //读取用户信息
    let userinfo = uni.getStorageSync('userinfo')
    if (userinfo) {
      // 更新userInfo的状态
      this.userinfo = JSON.parse(userinfo)

      // 获取用户播放记录
      this.getUserRecentPlayList(this.userinfo.userId)
      // 获取用户歌单
      this.getUserSongList(this.userinfo.userId)
    }
  },
  methods: {
    // 获取用户播放记录的功能函数
    async getUserRecentPlayList(userId) {
      let recentPlayListData = await getUserPlaybackRecord({
        uid: userId,
        type: 1
      })
      let recentPlayList = recentPlayListData.weekData
      this.recentPlayList = recentPlayList
    },

    // 获取用户歌单的功能函数
    async getUserSongList(userId) {
      let UserSongList = await getUserPlaylist({
        uid: userId
      })
      this.UserSongList = UserSongList.playlist
    },

    //跳转歌单详情界面
    toPlaylistDetails(song, index) {
      let playlistId = song.id
      uni.navigateTo({
        url:
          '../../songPackage/pages/playlistDetails/playlistDetails?playlistId=' +
          playlistId
      })
    },

    toplayRecordTab(event) {
      uni.navigateTo({
        url: '../../songPackage/pages/playRecordTab/playRecordTab'
      })
    },

    bindtouchstart(e) {
      //获取手指起始坐标
      this.staetY = e.touches[0].clientY
      this.coveTransition = ''
    },

    bindtouchmove(e) {
      //获取手指移动坐标与手指移动距离
      this.moveX = e.touches[0].clientY
      this.moveDistance = this.moveX - this.staetY
      if (this.moveDistance <= 0) {
        return
      }
      if (this.moveDistance >= 80) {
        this.moveDistance = 80
      }
      //更新coverTransfrom的状态值
      this.coverTransform = `translateY(${this.moveDistance}rpx)`
    },

    bindtouchend() {
      //更新coverTransfrom的状态值
      this.coverTransform = `translateY(0rpx)`
      this.coveTransition = 'transform 1s'
    },

    toLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
      })
    }
  }
}
</script>
<style lang="less">
page {
  background: #f5f5f5;
}
.personalContainer {
  width: 100%;
  height: 100%;
}

.personalContainer .user-section {
  height: 520rpx;
  position: relative;
  padding: 30rpx 30rpx 0;
}
.user-section .bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0.7;
  filter: blur(1px);
}

.user-info-box {
  height: 180rpx;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.user-info-box .portrait {
  width: 130rpx;
  height: 130rpx;
  border: 5rpx solid #fff;
  border-radius: 50%;
}
.user-info-box .username {
  font-size: 24;
  color: #303133;
  margin-left: 20rpx;
}

/* vip-box */
.vip-card-box {
  position: relative;
  display: flex;
  flex-direction: column;
  background: linear-gradient(left, red, black);
  background: rgba(0, 0, 0, 0.5);
  height: 240rpx;
  color: #f7d680;
  border-radius: 16rpx 16rpx 0 0;
  padding: 20rpx 24rpx;
}

.vip-card-box .card-bg {
  position: absolute;
  top: 20rpx;
  right: 0;
  opacity: 0.85;
  width: 380rpx;
  height: 260rpx;
}

.vip-card-box .b-btn {
  position: absolute;
  right: 20rpx;
  top: 16rpx;
  width: 132rpx;
  height: 40rpx;
  text-align: center;
  line-height: 40rpx;
  font-size: 22rpx;
  color: #36343c;
  border-radius: 20px;
  background: #f9e6af;
  z-index: 1;
}

.vip-card-box .b-btn {
  position: absolute;
  right: 20rpx;
  top: 16rpx;
  width: 132rpx;
  height: 40rpx;
  text-align: center;
  line-height: 40rpx;
  font-size: 22rpx;
  color: #36343c;
  border-radius: 20px;
  /*background: linear-gradient(left, #f9e6af, #ffd465);*/
  background: #f9e6af;
  z-index: 1;
}

.vip-card-box .tit {
  font-size: 22rpx;
  color: #f7d680;
  margin-bottom: 28rpx;
}
.vip-card-box .tit .iconfont {
  color: #f6e5a3;
  margin-right: 16rpx;
}

.vip-card-box .e-m {
  font-size: 34rpx;
  margin-top: 10rpx;
}
.vip-card-box .e-b {
  font-size: 24rpx;
  color: #d8cba9;
  margin-top: 10rpx;
}

.cover-container {
  margin-top: -150rpx;
  padding: 0 30rpx;
  position: relative;
  background: #f5f5f5;
  padding-bottom: 20rpx;
}

.cover-container .arc {
  position: absolute;
  left: 0;
  top: -34rpx;
  width: 100%;
  height: 36rpx;
}

/* 导航部分 */
.cover-container .nav-section {
  display: flex;
  background: #fff;
  padding: 20rpx 0;
  border-radius: 15rpx;
}

.nav-section .nav-item {
  width: 25%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-section .nav-item .iconfont {
  font-size: 50rpx;
  color: #1890ff;
  line-height: 70rpx;
}

.nav-section .nav-item text:last-child {
  font-size: 25rpx;
  font-weight: bold;
}

/* 个人中心列表 */
.personalContent {
  background: #f5f5f5;
  border-radius: 16rpx;
  margin-top: 20rpx;
}
.recentPlayContainer .more {
  float: right;
  font-size: 55rpx;
  color: #333;
}

/* 我喜欢音乐 */
.iIikeMusic {
  margin-top: 20rpx;
  padding: 20rpx;
  border-radius: 17rpx;
  font-size: 26rpx;
  color: #333;
  background-color: #fff;
}
.iIikeMusiclist {
  position: relative;
  display: flex;
  width: 100%;
}
.iIikeMusic image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 8rpx;
}

.iIikeMusic .musicInfo {
  display: flex;
  flex-direction: column;
  margin-left: 20rpx;
}

.iIikeMusic .musicInfo text {
  height: 44rpx;
  line-height: 60rpx;
  font-size: 26rpx;
  max-width: 500rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.iIikeMusic .musicInfo .musicNumber {
  font-size: 22rpx;
  color: #8c8c8c;
}

.iIikeMusic .musicInfo .musicName {
  font-size: 26rpx;
  font-weight: bold;
}

.iIikeMusic .heart {
  position: absolute;
  right: 20rpx;
  top: 20rpx;
  padding-right: 26rpx;
  width: 160rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: right;
  border: 1px solid #d9d9d9;
  background-color: #f7f7f7;
  color: #cf1322;
  border-radius: 36rpx;
}

.iIikeMusic .heart text {
  color: red;
}
/* 最近播放 */
.personalContent .scrollView {
  display: flex;
  height: 160rpx;
}

.personalContent .recentPlay {
  display: flex;
}

.recentPlayContainer {
  background-color: #fff;
  border-radius: 16rpx;
  margin-top: 20rpx;
}

.recentPlayContainer .title {
  padding-left: 20rpx;
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  line-height: 80rpx;
}

.personalContent .recentPlay image {
  width: 160rpx;
  height: 160rpx;
  margin-left: 20rpx;
  border-radius: 20rpx;
}

/*个人歌单*/
.card-item {
  margin-top: 20rpx;
  padding: 20rpx;
  border-radius: 17rpx;
  color: #333;
  background-color: #fff;
}
.card-title {
  width: 100%;
  height: 80rpx;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  font-weight: bold;
  color: #333;
  line-height: 80rpx;
}

.card-item .more {
  float: right;
  font-size: 55rpx;
  line-height: 80rpx;
  color: #333;
}
.card-musiclist {
  position: relative;
  display: flex;
  width: 100%;
  margin-bottom: 20rpx;
}
.card-musiclist image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 8rpx;
}

.card-musiclist .musicInfo {
  display: flex;
  flex-direction: column;
  margin-left: 20rpx;
}

.card-musiclist .musicInfo text {
  height: 44rpx;
  line-height: 60rpx;
  font-size: 26rpx;
  max-width: 500rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-musiclist .musicInfo .musicNumber {
  font-size: 20rpx;
  color: #8c8c8c;
}

.card-musiclist .musicInfo .musicName {
  font-size: 26rpx;
}

.listScroll {
  width: 100%;
  max-height: 580rpx;
}

.card-musiclist .iconfont {
  position: absolute;
  right: 10rpx;
  width: 80rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: right;
}

/* 最近播放记录 */
.recentPlayContainer {
  padding: 20rpx;
}
.recentScroll {
  display: flex;
  height: 200rpx;
}
.recentItem {
  margin-right: 20rpx;
}
.recentItem image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 10rpx;
}
</style>
