<template>
  <view class="header">
    <view>
      <text class="title">{{ nav }}</text>
      <text class="more">查看更多</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'nav-header',
  props: {
    nav: {
      type: String,
      value: '我是默认值'
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang="less">
.header {
  padding-bottom: 30rpx;
  .title {
    font-size: 35rpx;
    font-weight: bold;
  }
  .more {
    float: right;
    border: 1rpx solid #333;
    padding: 10rpx 20rpx;
    font-size: 24rpx;
    border-radius: 30rpx;
  }
}
</style>
