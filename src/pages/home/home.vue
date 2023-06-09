<template>
  <view class="indexContainer">
    <!-- 轮播图 -->
    <swiper
      class="banners"
      indicator-dots
      indicator-color="ivory"
      indicator-active-color="#2f54eb"
      circular
      autoplay
      interval="5000"
    >
      <view class="imgshell">
        <swiper-item v-for="(bannersItem, index) in bannerList" :key="index">
          <image :src="bannersItem.pic"></image>
        </swiper-item>
      </view>
    </swiper>

    <!-- 图标导航区域 -->
    <view class="navContainer">
      <view class="navitem">
        <text class="iconfont icon-meirituijian-" @tap="toRecommendSong"></text>
        <text>每日推荐</text>
      </view>
      <view class="navitem">
        <text class="iconfont icon-gedan1"></text>
        <text>歌单</text>
      </view>
      <view class="navitem">
        <text class="iconfont icon-icon-ranking"></text>
        <text>排行榜</text>
      </view>
      <view class="navitem">
        <text class="iconfont icon-diantai"></text>
        <text>电台</text>
      </view>
      <view class="navitem">
        <text
          class="iconfont icon-zhiboguankanliangbofangsheyingshexiangjixianxing"
        ></text>
        <text>直播</text>
      </view>
    </view>

    <!-- 推荐歌曲区域 -->
    <view class="recommendContainer">
      <NavHeader nav="推荐歌单"></NavHeader>
      <scroll-view class="recommendScroll" enable-flex scroll-x>
        <view
          class="scrollitem"
          @click="toPlaylistDetails(item)"
          v-for="(item, index) in recommendList"
          :key="index"
        >
          <image :src="item.picUrl" />
          <text>{{ item.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 热门电台区域 -->
    <view class="recommendContainer">
      <!-- 头部区域 -->
      <NavHeader nav="热门电台"></NavHeader>
      <!-- 内容区 -->
      <scroll-view
        class="recommendScroll recommendScrolldj"
        enable-flex
        scroll-x
      >
        <view
          class="scrollitem scrollitemdj"
          @click="topodcastDetails(item)"
          v-for="(item, index) in radioStationListData"
          :key="index"
        >
          <image :src="item.picUrl" />

          <text>{{ item.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 排行榜区域 -->
    <view class="topList">
      <!-- 头部区域 -->
      <NavHeader nav="排行榜"></NavHeader>
      <!-- 内容区域 -->
      <swiper
        class="topListSwiper"
        circular
        next-margin="50rpx"
        previous-margin="20rpx"
      >
        <swiper-item
          @click="toPlaylistDetails(item)"
          v-for="(item, index) in topList"
          :key="index"
        >
          <view class="swiperItem">
            <view class="header">
              <span class="title">{{ item.name }}</span>
              <span class="subTitle">{{ item.updateFrequency }}</span>
            </view>
            <view class="contnt">
              <view class="coverImage">
                <image :src="item.coverImgUrl" />
              </view>
              <view class="musicList">
                <view
                  class="musicItem"
                  v-for="(musicItem, index1) in item.tracks"
                  :key="index1"
                >
                  <text class="count">{{ index1 + 1 }}</text>
                  <text class="musicName">{{
                    `${musicItem.first}-${musicItem.second}`
                  }}</text>
                </view>
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>

<script>
import NavHeader from '@/components/nav-header/nav-header.vue'
import {
  getBannerData,
  getSongData,
  getRadioStationData,
  getTopListDetailData
} from '@/service/home/home.js'
export default {
  name: 'Home',
  components: {
    NavHeader
  },
  data() {
    return {
      title: 'Hello',
      bannerList: [], //轮播图数据
      recommendList: [], //推荐歌单数据
      radioStationListData: [], //推荐播客数据
      topList: [], //排行榜数据
      index: 0, // 点击音乐的下标
      indexLength: 3 //排行榜音乐下标长度
    }
  },
  async onLoad() {
    //轮播图请求
    let BannerDataResult = await getBannerData({ type: 1 })
    console.log('BannerDataResult', BannerDataResult)
    this.bannerList = BannerDataResult.banners
    //推荐歌曲请求
    let songDataResult = await getSongData({ limit: 10 })
    console.log('songDataResult', songDataResult)
    this.recommendList = songDataResult.result
    //热门电台请求
    let RadioStationDataResult = await getRadioStationData({ limit: 10 })
    console.log('RadioStationDataResult', RadioStationDataResult)
    this.radioStationListData = RadioStationDataResult.djRadios
    //排行榜请求
    let topListDetailDataResult = await getTopListDetailData()
    this.topList = topListDetailDataResult.list.slice(0, 4)

    console.log('this.topList', this.topList)
  },
  methods: {
    // 跳转至recommendSong页面的回调
    toRecommendSong() {
      uni.navigateTo({
        url: '/songPackage/pages/recommendSong/recommendSong'
      })
    },

    //跳转歌单详情界面(歌单)
    toPlaylistDetails(song) {
      let playlistId = song.id
      let isRast = 0
      uni.navigateTo({
        url:
          '../../songPackage/pages/playlistDetails/playlistDetails?playlistId=' +
          playlistId +
          '&isRast=' +
          isRast
      })
    },

    //跳转歌单详情界面(电台)
    topodcastDetails(song) {
      let playlistId = song.id
      let isRast = 3
      uni.navigateTo({
        url:
          '../../songPackage/pages/playlistDetails/playlistDetails?playlistId=' +
          playlistId +
          '&isRast=' +
          isRast
      })
    }
  }
}
</script>

<style lang="less">
page {
  background: #f5f5f5;
}

/* 轮播图 */
.banners {
  width: 100%;
  height: 300rpx;
  .imgshell {
    padding: 16rpx;
  }
  image {
    width: 95%;
    height: 92%;
    border-radius: 16rpx;
  }
}

/* 图标导航区域 */
.navContainer {
  display: flex;
  background: #f5f5f5;
  .navitem {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 20%;
    font-size: 26rpx;
    .iconfont {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      text-align: center;
      line-height: 100rpx;
      background: #4a8ee2;
      font-size: 50rpx;
      color: white;
      margin: 20rpx 0;
    }
  }
}

/* 推荐歌单 */
.recommendContainer {
  padding: 20rpx;
  margin: 20rpx;
  border-radius: 16rpx;
  background: #fff;
  /* 推荐内容区 */
  .recommendScroll {
    display: flex;
    height: 290rpx;
    .scrollitem {
      width: 200rpx;
      margin-right: 20rpx;
      image {
        width: 200rpx;
        height: 200rpx;
        border-radius: 10rpx;
      }
      text {
        font-size: 26rpx;
        /* 多行文本溢出 省略号代替 */
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical; /*设置对其模式 */
        -webkit-line-clamp: 2; /*设置盒子行数*/
      }
    }
  }
  .recommendScrolldj {
    height: 260rpx;
    .scrollitemdj {
      text {
        /* 单行文本溢出 */
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

/* 排行榜 */
.topList {
  padding: 20rpx;
  margin: 20rpx;
  border-radius: 16rpx;
  background: #fff;
  .topListSwiper {
    height: 250rpx;
    .swiperItem {
      width: 92%;
      .header {
        height: 70rpx;
        line-height: 70rpx;
        display: flex;
        justify-content: space-between;
        .title {
          font-size: 33rpx;
        }
        .subTitle {
          font-size: 25rpx;
          color: rgba(0, 0, 0, 0.5);
        }
      }
      .contnt {
        display: flex;
        justify-content: space-between;
        .coverImage {
          width: 150rpx;
          height: 150rpx;
          image {
            width: 100%;
            height: 100%;
            border-radius: 10rpx;
          }
        }
        .musicList {
          width: 68%;
          .musicItem {
            display: block;
            height: 45rpx;
            line-height: 45rpx;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text {
              font-size: 22rpx;
            }
            .count {
              font-weight: bold;
            }
            .musicName {
              margin-left: 3px;
            }
          }
        }
      }
    }
  }
}
</style>
