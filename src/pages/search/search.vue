<template>
  <view class="searchContainer">
    <!-- 头部搜索区域 -->
    <view class="header">
      <view class="searchInput">
        <text class="iconfont icon-search1 searchIcon"></text>
        <input
          type="text"
          :value="searchContent"
          :placeholder="placeholderContent"
          placeholder-class="placeholder"
          @input="handleInputChange"
        />
        <text class="clear" @tap="clearSearchContent" v-if="searchContent">
          ×
        </text>
      </view>
      <text class="cancel" @tap="getsearchSongs">搜索</text>
    </view>

    <!-- 搜索歌曲列表 -->
    <block v-if="SingleContentdisList.length">
      <!-- 你可能感兴趣 -->
      <view class="musicinterest">
        <text class="interestText">你可能感兴趣</text>
        <view class="Singer">
          <image :src="SingerContentdisList.img1v1Url"></image>
          <text class="singername">歌手：{{ SingerContentdisList.name }}</text>
          <text class="attention">+关注</text>
        </view>
        <view class="Album">
          <image :src="AlbumContentdisList.img"></image>
          <view>
            <text>专辑：{{ AlbumContentdisList.name }}</text>
            <text class="singername">{{ AlbumContentdisList.singerName }}</text>
          </view>
        </view>
      </view>
      <!-- 单曲 -->
      <view class="ListContainer">
        <view class="listHeader">
          <text class="Single">单曲</text>
          <text class="changeMore">▶播放</text>
        </view>

        <!-- 内容区 -->
        <scroll-view scroll-y class="listScroll">
          <view
            class="scrollItem"
            :data-index="index"
            :data-song="item"
            @tap="toSongDetail"
            v-for="(item, index) in SingleContentdisList"
            :key="index"
          >
            <image :src="item.album.artist.img1v1Url"></image>

            <view class="musicInfo">
              <text class="musicName">{{ item.name }}</text>
              <text class="author">{{ item.artists[0].name }}</text>
            </view>

            <text class="iconfont icon-gengduo"></text>
          </view>
        </scroll-view>
      </view>
    </block>

    <block v-else>
      <block v-if="searchList.length">
        <!-- 搜索内容展示 -->
        <view class="showSearchContent">
          <view class="searchContent">搜索内容: {{ searchContent }}</view>
          <view class="searchList">
            <view
              class="searchItem"
              :data-song="item"
              @tap="HotSearch"
              v-for="(item, index) in searchList"
              :key="index"
            >
              <text class="iconfont icon-search1"></text>

              <text class="content">{{ item.name }}</text>
            </view>
          </view>
        </view>
      </block>

      <block v-else>
        <!-- 搜索历史记录 -->
        <view class="history" v-if="historyList.length">
          <view class="title">历史</view>
          <view
            class="historyItem"
            :data-song="item"
            @tap="HotSearch"
            v-for="(item, index) in historyList"
            :key="index"
          >
            {{ item }}
          </view>
          <text
            class="iconfont icon-shanchu delete"
            @tap="deleteSearchHistory"
          ></text>
        </view>
        <!-- 热搜榜 -->
        <view class="hotContainer">
          <view class="title">热搜榜</view>
          <!-- 热搜列表 -->
          <view class="hotList">
            <view
              class="hotItem"
              :data-song="item"
              @tap="HotSearch"
              v-for="(item, index) in hotList"
              :key="index"
            >
              <text class="order">{{ index + 1 }}</text>

              <text>{{ item.searchWord }}</text>

              <image
                class="iconImg"
                v-if="item.iconUrl"
                :src="item.iconUrl"
              ></image>
            </view>
          </view>
        </view>
      </block>
    </block>
  </view>
</template>

<script>
import {
  fetchSearch,
  fetchSearchHot,
  fetchSearchKeyWord
} from '@/service/search/search.js'
import PubSub from 'pubsub-js'
let isSend = false // 函数节流使用
export default {
  data() {
    return {
      placeholderContent: '',
      // placeholder的内容
      hotList: [],
      // 热搜榜数据
      searchContent: '',
      // 用户输入的表单项数据
      searchList: [],
      // 关键字模糊匹配的数据
      historyList: [],
      // 搜索历史记录
      index: 0,
      // 点击音乐的下标
      SingleContentdisList: [],
      //搜索内容单曲数据
      SingerContentdisList: [],
      //搜索内容歌手数据
      AlbumContentdisList: [] //搜索内容专辑数据
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */ onLoad: function (options) {
    // 获取初始化数据
    this.getInitData()

    // 获取历史记录
    this.getSearchHistory()

    // 订阅来自songDetail页面发布的消息
    PubSub.subscribe('switchType', (msg, type) => {
      if (SingleContentdisList == null) {
        var { searchList, index } = this
        var musicSong = searchList.length
      } else {
        var { SingleContentdisList, index } = this
        var musicSong = SingleContentdisList.length
      }
      if (type === 'pre') {
        // 上一首
        if (index == 0) {
          index = musicSong
        }
        index -= 1
      } else {
        // 下一首
        if (index == musicSong - 1) {
          index = -1
        }
        index += 1
      }

      // 更新下标
      this.index = index
      let musicId = searchList[index].id
      // 将musicId回传给songDetail页面
      PubSub.publish('musicId', musicId)
    })
  },
  methods: {
    // 获取初始化的数据
    async getInitData() {
      let placeholderData = await fetchSearchKeyWord()
      let hotListData = await fetchSearchHot()
      this.placeholderContent = placeholderData.data.showKeyword
      this.hotList = hotListData.data
    },

    // 获取本地历史记录的功能函数
    getSearchHistory() {
      let historyList = uni.getStorageSync('searchHistory')
      if (historyList) {
        this.historyList = historyList
      }
    },

    // 表单项内容发生改变的回调
    handleInputChange(event) {
      // 更新searchContent的状态数据
      this.searchContent = event.detail.value.trim()

      if (isSend) {
        return
      }
      isSend = true
      this.getSearchList()
      // 函数节流
      setTimeout(() => {
        isSend = false
      }, 36)
    },

    // 获取搜索数据的功能函数
    async getSearchList() {
      if (!this.searchContent) {
        this.searchList = []
        this.SingleContentdisList = []
        return
      } else if (this.searchContent == '') {
        this.searchList = []
        this.SingleContentdisList = []
        return
      }
      let { searchContent } = this
      // 发请求获取关键字模糊匹配数据
      let searchListData = await fetchSearch({
        keywords: searchContent,
        type: 1,
        limit: 10
      })
      this.searchList = searchListData.result.songs
    },

    // 清空搜索内容
    clearSearchContent() {
      this.searchContent = ''
      this.searchList = []
      this.SingleContentdisList = []
    },

    // 删除搜索历史记录
    deleteSearchHistory() {
      uni.showModal({
        content: '确认删除吗?',
        success: (res) => {
          if (res.confirm) {
            // 清空data中historyList
            this.historyList = []

            // 移除本地的历史记录缓存
            uni.removeStorageSync('searchHistory')
          }
        }
      })
    },

    //搜索内容预览
    HotSearch(event) {
      let searchContent = ''
      let searchContentA = event.currentTarget.dataset.song.searchWord //排行name
      let searchContentB = event.currentTarget.dataset.song
      let searchContentC = event.currentTarget.dataset.song.name //
      if (searchContentA != undefined) {
        searchContent = searchContentA
      } else if (searchContentB != '') {
        searchContent = searchContentB
      } else {
        searchContent = searchContentC
      }
      this.searchContent = searchContent

      if (isSend) {
        return
      }
      isSend = true
      this.getSearchList()
      // 函数节流
      setTimeout(() => {
        isSend = false
      }, 36)
    },

    //搜索内容展示
    async getsearchSongs(event) {
      if (!this.searchContent) {
        this.SingleContentdisList = []

        return
      }
      let { searchContent } = this
      // 发请求获取单曲匹配数据
      let ContentdisListDQ = await fetchSearch({
        keywords: searchContent,
        type: 1,
        limit: 36
      })
      // 发请求获取歌手匹配数据
      let singerName = ContentdisListDQ.result.songs[0].artists[0].name
      let ContentdisListGS = await fetchSearch({
        keywords: singerName,
        type: 100,
        limit: 1
      })
      // 发请求获取专辑匹配数据
      let ContentdisListZJ = await fetchSearch({
        keywords: searchContent,
        type: 10,
        limit: 36
      })
      // 发请求获取歌单匹配数据
      // let ContentdisListGD = await fetchSearch( {keywords: searchContent , type: 1000 , limit: 36});
      // 发请求获取播单匹配数据
      // let ContentdisListBD = await fetchSearch( {keywords: searchContent , type: 1009 , limit: 36});

      //歌手列表
      let SingerContentdisList = ContentdisListGS.result.artists[0]
      //歌曲列表
      let SingleContentdisList = ContentdisListDQ.result.songs
      //专辑列表
      let AlbumContentdisList = {
        name: ContentdisListZJ.result.albums[0].name,
        img: ContentdisListZJ.result.albums[0].artist.img1v1Url,
        singerName: ContentdisListZJ.result.albums[0].artist.name
      }
      //歌单列表
      // let songltContentdisList =ContentdisListGD;
      //播单列表
      // let PlayltContentdisList =ContentdisListBD;

      //赋值给初始数据
      this.SingleContentdisList = SingleContentdisList
      this.SingerContentdisList = SingerContentdisList
      this.AlbumContentdisList = AlbumContentdisList

      //定义搜索关键字
      let { historyList } = this
      // 将搜索的关键字添加到搜索历史记录中
      if (historyList.indexOf(searchContent) !== -1) {
        historyList.splice(historyList.indexOf(searchContent), 1)
      }
      historyList.unshift(searchContent)
      this.historyList = historyList

      uni.setStorageSync('searchHistory', historyList)
    },

    // 跳转至songDetail页面
    toSongDetail(event) {
      let { song, index } = event.currentTarget.dataset
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

<style lang="less">
page {
  background: #f5f5f5;
}
/* 头部区域 */
.searchContainer {
  padding: 0 20rpx;
}
.header {
  display: flex;
  height: 60rpx;
  line-height: 60rpx;
  padding: 10rpx 0;
}

.searchInput {
  position: relative;
  flex: 1;
  background: white;
  border-radius: 30rpx;
}

.clear {
  position: absolute;
  right: 30rpx;
  z-index: 10;
  top: 0;
  font-size: 30rpx;
}
.cancel {
  width: 100rpx;
  text-align: center;
}

.searchIcon {
  position: absolute;
  left: 15rpx;
}
.searchInput input {
  margin-left: 50rpx;
  height: 60rpx;
}
.placeholder {
  font-size: 28rpx;
}

/* 热搜榜 */
.hotContainer {
  margin-top: 30rpx;
}
.hotContainer .title {
  font-size: 28rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-bottom: 1rpx solid #d9d9d9;
}

.hotList {
  display: flex;
  flex-wrap: wrap;
}

.hotItem {
  width: 50%;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 26rpx;
}

.hotItem .order {
  margin: 0 10rpx;
}

.hotItem .iconImg {
  width: 28rpx;
  height: 20rpx;
  margin-left: 10rpx;
}

/* 搜索内容展示 */
.searchContent {
  color: #d43c33;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 24rpx;
  border-bottom: 1rpx solid #d43c33;
}

.searchItem {
  height: 80rpx;
  line-height: 80rpx;
  display: flex;
}

.searchItem .content {
  flex: 1;
  margin-left: 20rpx;
  border-bottom: 1rpx solid #eee;
  font-size: 26rpx;
}

/* 搜索历史 */
.history {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  line-height: 50rpx;
  margin: 20rpx 0;
}

.history .title {
  font-size: 28rpx;
  height: 50rpx;
}

.history .historyItem {
  height: 50rpx;
  font-size: 26rpx;
  background: #ededed;
  margin-left: 20rpx;
  padding: 0 30rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}

.history .delete {
  position: absolute;
  bottom: 10rpx;
  right: 15rpx;
  font-size: 36rpx;
}
/*搜索歌曲列表*/
.musicinterest {
  height: 320rpx;
  background-color: #ffffff;
  margin: 30rpx 0;
  border-radius: 30rpx;
  padding: 20rpx;
}
.musicinterest .interestText {
  color: #8c8c8c;
  font-size: 30rpx;
}
.musicinterest .Singer {
  padding: 20rpx;
  height: 100rpx;
}

.musicinterest .Singer image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  vertical-align: -30rpx;
}

.musicinterest .Singer .attention {
  margin-top: 20rpx;
  float: right;
  border: 1rpx solid #141414;
  border-radius: 50rpx;
  padding: 10rpx;
}

.musicinterest .Singer .singername {
  margin-left: 20rpx;
}

.musicinterest .Album {
  padding: 20rpx;
  height: 100rpx;
  display: flex;
}

.musicinterest .Album image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
}

.musicinterest .Album view {
  display: flex;
  flex-direction: column;
  margin-left: 20rpx;
}

.musicinterest .Album text {
  max-width: 400rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.musicinterest .Album .singername {
  color: #8c8c8c;
}

/* 单曲区域 */
.ListContainer {
  padding: 0 20rpx;
  border-radius: 30rpx;
  background-color: #ffffff;
}
.ListContainer .listHeader {
  height: 80rpx;
  line-height: 80rpx;
}

.ListContainer .listHeader .Single {
  font-size: 40rpx;
}
.ListContainer .listHeader .changeMore {
  float: right;
}

/* 内容区 */
.ListContainer .listScroll {
  height: 580rpx;
  padding-bottom: 25rpx;
}
.ListContainer .listScroll .scrollItem {
  position: relative;
  display: flex;
  margin-bottom: 20rpx;
}
.ListContainer .listScroll .scrollItem image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 8rpx;
}

.ListContainer .listScroll .scrollItem .musicInfo {
  display: flex;
  flex-direction: column;
  margin-left: 20rpx;
}

.ListContainer .listScroll .scrollItem .musicInfo text {
  height: 44rpx;
  line-height: 60rpx;
  font-size: 26rpx;
  max-width: 400rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ListContainer .listScroll .scrollItem .iconfont {
  position: absolute;
  right: 0;
  width: 80rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: right;
}
</style>
