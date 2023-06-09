<template>
  <view class="recommendSongContainer">
    <!-- 头部 -->
    <view class="header">
      <image src="/static/images/recommendSong/recommendSong.jpg"></image>
      <view class="date">
        <text class="month">{{ month }}</text>
        <text class="day">/ {{ day }}</text>
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
          @tap="toSongDetail(index, item)"
          v-for="(item, index) in recommendList"
          :key="index"
        >
          <image :src="item.al.picUrl"></image>

          <view class="musicInfo">
            <text class="musicName">{{ item.name }}</text>
            <text class="author">{{ item.ar[0].name }}</text>
          </view>

          <text class="iconfont icon-gengduo"></text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { getDayRecommendSongs } from '@/service/song/song.js'
import PubSub from 'pubsub-js'
export default {
  data() {
    return {
      day: '',
      //天
      month: '',
      //月
      recommendList: [],
      // 推荐列表数据
      index: 0 // 点击音乐的下标
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //判断用户是否登录
    let userinfo = uni.getStorageSync('userinfo')
    if (!userinfo) {
      uni.showToast({
        title: '请先登录',
        icon: 'none',
        success: () => {
          // 跳转至登录界面
          uni.reLaunch({
            url: '/pages/login/login'
          })
        }
      })
      return
    }
    //更新日期的动态数据
    this.day = new Date().getDate()
    this.month = new Date().getMonth() + 1

    //获取每日推荐的数据
    this.getRecommendList()

    // 订阅来自songDetail页面发布的消息
    PubSub.subscribe('switchType', (msg, type) => {
      let { recommendList, index } = this
      if (type === 'pre') {
        // 上一首
        if (index == 0) {
          index = recommendList.length
        }
        index -= 1
      } else {
        // 下一首
        if (index == recommendList.length - 1) {
          index = -1
        }
        index += 1
      }

      // 更新下标
      this.index = index

      let musicId = recommendList[index].id
      // 将musicId回传给songDetail页面
      PubSub.publish('musicId', musicId)
    })
  },
  methods: {
    // 获取用户每日推荐数据
    async getRecommendList() {
      let recommendListData = await getDayRecommendSongs()
      console.log('recommendListData', recommendListData)
      this.recommendList = recommendListData.data.dailySongs
    },

    // 跳转至songDetail页面
    toSongDetail(index, song) {
      this.index = index

      // 路由跳转传参： query参数
      uni.navigateTo({
        // 不能直接将song对象作为参数传递，长度过长，会被自动截取掉
        // url: '/pages/songDetail/songDetail?songPackage=' + JSON.stringify(songPackage)
        url: '/songPackage/pages/songDetail/songDetail?musicId=' + song.id
      })
    }
  }
}
</script>
<style>
.recommendSongContainer .header {
  position: relative;
  width: 100%;
  height: 300rpx;
}
.recommendSongContainer .header image {
  width: 100%;
  height: 100%;
}
.recommendSongContainer .header .date {
  position: absolute;
  left: 50%;
  right: 50%;
  margin-left: -140rpx;
  margin-top: -186rpx;
  width: 300rpx;
  height: 100rpx;
  text-align: center;
  line-height: 100rpx;
  color: #fff;
}
.recommendSongContainer .header .date .month {
  font-size: 36rpx;
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
  max-width: 500rpx;
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
