<template>
  <view class="playlistDetailsContainer">
    <!-- 歌单区域 -->
    <block v-if="isRast != 3">
      <!-- 头部 -->
      <view class="header">
        <view class="avatar">
          <image :src="PlaylistDetails.coverImgUrl"></image>
        </view>

        <view class="introduction">
          <text class="playlistName mone">{{ PlaylistDetails.name }}</text>
          <view class="creator">
            <image :src="PlaylistDetails.creator.avatarUrl"></image>
            <text>{{ PlaylistDetails.creator.nickname }} ></text>
          </view>
          <view class="description">
            <text class="mone" v-if="PlaylistDetails.description != null"
              >{{ PlaylistDetails.description }} ></text
            >
            <text v-else>King Cloud-Music，给你最好的音质体验。></text>
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
            @click="toSongDetail(index, item, playlistId)"
            v-for="(item, index) in PlaylistDetails.tracks"
            :key="index"
          >
            <image :src="item.al.picUrl"></image>

            <view class="musicInfo">
              <text class="musicName">{{ item.name }}</text>
              <text class="author" v-if="item.ar[0].name != null">{{
                item.ar[0].name
              }}</text>
              <text class="author" v-else>未知艺人</text>
            </view>

            <text class="iconfont icon-gengduo"></text>
          </view>
        </scroll-view>
      </view>
    </block>
    <!-- 播客区域 -->
    <block v-else>
      <!-- 头部 -->
      <view class="header">
        <view class="avatar">
          <image :src="podcastDetails.picUrl"></image>
        </view>

        <view class="introduction">
          <text class="playlistName mone">{{ podcastDetails.name }}</text>
          <view class="creator">
            <image :src="podcastDetails.dj.avatarUrl"></image>
            <text>{{ podcastDetails.dj.nickname }} ></text>
          </view>
          <view class="description">
            <text class="mone" v-if="podcastDetails.desc != null"
              >{{ podcastDetails.desc }} ></text
            >
            <text v-else>King Cloud-Music，给你最好的音质体验。></text>
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
            @click="toSongDetaildj(index, item)"
            v-for="(item, index) in podcastDetailt"
            :key="index"
          >
            <image :src="item.coverUrl"></image>

            <view class="musicInfo">
              <text class="musicName">{{ item.name }}</text>
              <text class="author">{{ item.dj.nickname }}</text>
            </view>

            <text class="iconfont icon-gengduo"></text>
          </view>
        </scroll-view>
      </view>
    </block>
  </view>
</template>

<script>
import {
  getPlaylistDetails,
  getPodcastDetails,
  getPodcastSongDetails
} from '@/service/song/song.js'
import PubSub from 'pubsub-js'
export default {
  data() {
    return {
      playlistId: 0,
      //歌曲Id
      isRast: 0,
      //电台Boolean
      PlaylistDetails: [],
      //歌单详情
      podcastDetails: [],
      //播客详情
      podcastDetailt: [],
      //播客节目详情
      // 点击音乐的下标
      index: 0,
      avatarUrl: '',
      nickname: ''
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let playlistId = options.playlistId
    this.playlistId = playlistId
    let isRast = options.isRast
    this.isRast = isRast
    // 显示正在加载
    uni.showLoading({
      title: '正在加载'
    })
    if (isRast != 3) {
      // 获取歌单详情
      this.getPlaylistDetails(playlistId)
    } else {
      // 获取播客详情
      this.getpodcastDetails(playlistId)
    }
    if (isRast != 3) {
      // 订阅来自songDetail页面发布的消息
      PubSub.subscribe('switchType', (msg, type) => {
        let { PlaylistDetails, index } = this
        if (type === 'pre') {
          // 上一首
          if (index == 0) {
            index = PlaylistDetails.tracks.length
          }
          index -= 1
        } else {
          // 下一首
          if (index == PlaylistDetails.tracks.length - 1) {
            index = -1
          }
          index += 1
        }
        // 更新下标
        this.index = index
        let musicId = PlaylistDetails.tracks[index].id
        // 将musicId回传给songDetail页面
        PubSub.publish('musicId', musicId)
      })
    } else {
      // 订阅来自songDetaildj页面发布的消息
      PubSub.subscribe('switchType', (msg, type) => {
        let { podcastDetailt, index } = this
        if (type === 'pre') {
          // 上一首
          if (index == 0) {
            index = podcastDetailt.length
          }
          index -= 1
        } else {
          // 下一首
          if (index == podcastDetailt.length - 1) {
            index = -1
          }
          index += 1
        }
        // 更新下标
        this.index = index
        let musicIds = podcastDetailt[index].mainSong.id
        let programId = podcastDetailt[index].id
        let musicId = {
          info: programId,
          id: musicIds
        }
        // 将musicId回传给songDetail页面
        PubSub.publish('musicId', musicId)
      })
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (this.isRast != 3) {
      // 将歌单列表发布给songDetail页面
      PubSub.publish('getSongSheet', this.isRast, this.playlistId)
    } else {
      // 将播单列表发布给songDetail页面
      PubSub.publish('getSongSheet', this.isRast, this.playlistId)
    }
  },
  methods: {
    // 获取歌单详情功能函数
    async getPlaylistDetails(playlistId) {
      let PlaylistDetailsong = await getPlaylistDetails({
        id: playlistId
      })
      this.PlaylistDetails = PlaylistDetailsong.playlist
      // 关闭消息提示框
      uni.hideLoading()
    },

    // 获取播客详情功能函数
    async getpodcastDetails(playlistId) {
      //获取播客详情
      let podcastDetailsong = await getPodcastDetails({
        rid: playlistId
      })
      console.log('podcastDetailsong', podcastDetailsong)
      let podcastDetails = podcastDetailsong.data
      this.podcastDetails = podcastDetails
      console.log('podcastDetails', podcastDetails)
      //获取播客节目详情
      let podcastDetailtong = await getPodcastSongDetails({
        rid: podcastDetails.id
      })
      let podcastDetailt = podcastDetailtong.programs
      this.podcastDetailt = podcastDetailt

      // 关闭消息提示框
      uni.hideLoading()
    },

    // 单曲跳转至songDetail页面
    toSongDetail(index, song, pid) {
      let isRast = 0
      this.index = index

      // 路由跳转传参： query参数
      uni.navigateTo({
        // 不能直接将song对象作为参数传递，长度过长，会被自动截取掉
        url:
          '/songPackage/pages/songDetail/songDetail?musicId=' +
          song.id +
          '&isRast=' +
          isRast +
          '&pid=' +
          pid
      })
    },

    // 电台跳转至songDetail页面
    toSongDetaildj(index, song) {
      let isRast = 3
      this.index = index

      // 路由跳转传参： query参数
      uni.navigateTo({
        // 不能直接将song对象作为参数传递，长度过长，会被自动截取掉
        url:
          '/songPackage/pages/songDetail/songDetail?musicId=' +
          song.mainSong.id +
          '&programId=' +
          song.id +
          '&isRast=' +
          isRast
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
  max-width: 360rpx;
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
