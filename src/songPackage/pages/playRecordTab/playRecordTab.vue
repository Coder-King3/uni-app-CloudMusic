<template>
  <view class="playlistDetailsContainer">
    <!-- 头部 -->
    <view class="header">
      <view class="avatar">
        <image src="/static/images/LogoBlack.png"></image>
      </view>

      <view class="introduction">
        <text class="playlistName mone"
          >{{ userinfo.nickname }}的播放记录🎵</text
        >
        <view class="creator">
          <image :src="userinfo.avatarUrl"></image>
          <text>{{ userinfo.nickname }}</text>
        </view>
        <view class="description">
          <text class="fontContent mone">{{ userinfo.signature }}></text>
        </view>
      </view>
    </view>

    <!-- 列表区域 -->
    <view class="ListContainer">
      <view class="listHeader">
        <text>播放全部</text>
        <text class="changeMore">多选</text>
      </view>

      <!-- 内容区 -->
      <scroll-view scroll-y class="listScroll">
        <view
          class="scrollItem"
          @tap="toSongDetail(index, item.song)"
          v-for="(item, index) in recentPlayweekData"
          :key="index"
        >
          <image :src="item.song.al.picUrl"></image>

          <view class="musicInfo">
            <text class="musicName">{{ item.song.name }}</text>
            <text class="author">{{ item.song.ar[0].name }}</text>
          </view>

          <text class="iconfont icon-gengduo"></text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { getUserPlaybackRecord } from '@/service/song/song.js'
import PubSub from 'pubsub-js'
export default {
  data() {
    return {
      recentPlayweekData: [],
      //播放记录详情
      index: 0,
      // 点击音乐的下标
      userinfo: [] //用户信息
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */ onLoad: function (options) {
    //读取用户信息
    let userinfo = uni.getStorageSync('userinfo')
    if (userinfo) {
      // 更新user的状态
      this.userinfo = JSON.parse(userinfo)
    }
    // 显示正在加载
    uni.showLoading({
      title: '正在加载'
    })

    // 获取用户播放记录
    this.getUserRecentPlayList(this.userinfo.userId)

    // 订阅来自songDetail页面发布的消息
    PubSub.subscribe('switchType', (msg, type) => {
      let { recentPlayweekData, index } = this
      if (type === 'pre') {
        // 上一首
        if (index == 0) {
          index = recentPlayweekData.length
        }
        index -= 1
      } else {
        // 下一首
        if (index == recentPlayweekData.length - 1) {
          index = -1
        }
        index += 1
      }
      // 更新下标
      this.index = index

      let musicId = recentPlayweekData[index].song.id
      // 将musicId回传给songDetail页面
      PubSub.publish('musicId', musicId)
    })
  },
  methods: {
    // 获取用户播放记录的功能函数
    async getUserRecentPlayList(userId) {
      let recentPlayListData = await getUserPlaybackRecord({
        uid: userId,
        type: 1
      })
      this.recentPlayweekData = recentPlayListData.weekData

      // 关闭消息提示框
      uni.hideLoading()
    },

    // 跳转至songDetail页面
    toSongDetail(index, song) {
      this.index = index

      // 路由跳转传参： query参数
      uni.navigateTo({
        // 不能直接将song对象作为参数传递，长度过长，会被自动截取掉
        url: '/songPackage/pages/songDetail/songDetail?musicId=' + song.id
      })
    }
  }
}
</script>
<style>
.playlistDetailsContainer .header {
  width: 100%;
  height: 300rpx;
  background: linear-gradient(to bottom, #91cdf6, #0094ff);
  padding: 36rpx 36rpx 0rpx 36rpx;
  display: flex;
}

.playlistDetailsContainer .header .avatar {
  width: 220rpx;
  height: 220rpx;
}

.avatar image {
  width: 100%;
  height: 100%;
  border-radius: 36rpx;
}
.playlistDetailsContainer .header .introduction {
  width: 414rpx;
  height: 220rpx;
  padding-left: 36rpx;
}

.introduction .mone {
  display: inline-block;
  width: 400rpx;
  word-break: break-all;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.introduction .creator {
  font-size: 24rpx;
  color: #595959;
  margin-top: 20rpx;
  margin-bottom: 36rpx;
}

.introduction .description {
  font-size: 24rpx;
  color: #595959;
}

.playlistDetailsContainer .header .introduction .creator image {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50rpx;
  vertical-align: -10rpx;
}

/* 列表区域 */
.ListContainer {
  position: relative;
  top: -20rpx;
  padding: 0 20rpx;
  border-radius: 30rpx;
  background: #fff;
}
.listHeader {
  height: 80rpx;
  line-height: 80rpx;
}
.listHeader .changeMore {
  float: right;
}

/* 内容区 */
.listScroll {
  height: calc(100vh - 380rpx);
}
.scrollItem {
  position: relative;
  display: flex;
  margin-bottom: 20rpx;
}
.scrollItem image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 8rpx;
}

.musicInfo {
  display: flex;
  flex-direction: column;
  margin-left: 20rpx;
}

.musicInfo text {
  height: 44rpx;
  line-height: 60rpx;
  font-size: 26rpx;
  max-width: 400rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.scrollItem .iconfont {
  position: absolute;
  right: 0;
  width: 80rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: right;
}
</style>
