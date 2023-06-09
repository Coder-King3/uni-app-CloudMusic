<template>
  <view class="container">
    <view class="wrapper">
      <view class="left-top-sign">King Music</view>
      <view class="welcome"> 欢迎回来！ </view>
      <view class="input-content">
        <view class="input-item">
          <text class="tit">邮箱</text>
          <input type="text" placeholder="请输入邮箱" v-model="email" />
        </view>
        <!-- <view class="verifica-code"> -->
        <view class="input-item">
          <text class="tit">密码</text>
          <input type="password" placeholder="请输入密码" v-model="password" />
        </view>
        <!-- <button class="fetch-code" @click="getCode">获取</button> -->
        <!-- </view> -->
      </view>
      <button class="confirm-btn" @click="login">登录</button>
      <!-- login/verifyCode -->
      <view class="forget-section"> 忘记密码? </view>
    </view>
    <view class="register-section">
      还没有账号?
      <text>马上注册</text>
    </view>
  </view>
</template>

<script>
/**  说明：登录流程
	 1.收集表单项数据
	 2.前端验证
	    1)验证用户信息（账号，密码）是否合法
	    2)前端验证不通过就提示用户，不需要发请求给后端
	    3)前端验证通过了，发请求（携带账号，密码）给服务器端
	 3.后端验证
	    1)验证用户是否存在
	    2)用户不存在直接返回，告诉前端用户不存在
	    3)用户存在需要验证密码是否正确
	    4)密码不正确返回给前端提示密码不正确
	    5)密码正确返回给前端数据，提示用户登录成功（会携带用户的相关信息）
	**/
import {
  fetchEmailLogin
  // fetchSendCode,
  // fetchVerifyCode
} from '@/service/login/login.js'
export default {
  data() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    //登录回调
    async login() {
      //收集数据
      let email = this.email
      let password = this.password
      //前端验证
      if (!(email && email.trim() !== '')) {
        //提示用户
        uni.showToast({
          title: '邮箱不能为空',
          icon: 'none'
        })
        return
      }
      //格式验证
      let emailReg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (!emailReg.test(email)) {
        uni.showToast({
          title: '邮箱格式错误',
          icon: 'none'
        })
        return
      }
      if (!(password && password.trim() !== '')) {
        uni.showToast({
          title: '密码不能为空',
          icon: 'none'
        })
        return
      }
      //后端验证
      let result = await fetchEmailLogin({
        email,
        password,
        isLogin: true
      })
      console.log('result', result)
      if (result.code === 200) {
        uni.showToast({
          title: '登录成功'
        })
        //将用户信息存储本地
        uni.setStorageSync('userinfo', JSON.stringify(result.profile))
        //登录成功跳转主页
        uni.reLaunch({
          url: '/pages/personal/personal'
        })
      } else if (result.code === 400) {
        uni.showToast({
          title: '邮箱错误',
          icon: 'none'
        })
      } else if (result.code === 502) {
        uni.showToast({
          title: '密码错误',
          icon: 'none'
        })
      } else {
        uni.showToast({
          title: '登录失败，请重新登录',
          icon: 'none'
        })
      }
    }
    // async getCode() {
    //   let phone = this.phone
    //   if (!(phone && phone.trim() !== '')) {
    //     uni.showToast({
    //       title: '手机号不能为空',
    //       icon: 'none'
    //     })
    //     return
    //   }
    //   let phoneReg =
    //     /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[189]))\d{8}$/
    //   if (!phoneReg.test(phone)) {
    //     uni.showToast({
    //       title: '手机号格式错误',
    //       icon: 'none'
    //     })
    //     return
    //   }
    //   let sendCodeResult = await fetchSendCode({ phone })
    //   console.log('sendCodeResult', sendCodeResult)
    //   uni.showToast({
    //     title: '发送成功'
    //   })
    // },
    // async verifyCode() {
    //   let phone = this.phone
    //   let password = this.password
    //   let verifyResult = await fetchVerifyCode({
    //     phone: phone,
    //     captcha: password
    //   })
    //   console.log('verifyResult', verifyResult)
    //   if (verifyResult.code === 200) {
    //     // let loginResult = await fetchCellphoneLogin({
    //     //   phone,
    //     //   captcha: password,
    //     //   isLogin: true
    //     // })
    //     // console.log(loginResult)
    //     uni.reLaunch({
    //       url: '/pages/personal/personal'
    //     })
    //   } else {
    //     uni.showToast({
    //       title: '验证码错误！',
    //       icon: 'error'
    //     })
    //   }
    // }
  }
}
</script>

<style lang="less">
page {
  height: 100%;
}
.container {
  height: 100%;
  background: #f5f5f5;
  .wrapper {
    position: relative;
    z-index: 90;
    padding-bottom: 40rpx;
    .left-top-sign {
      font-size: 120rpx;
      color: #fff;
      position: relative;
      left: -5rpx;
    }
    .welcome {
      position: relative;
      left: 50rpx;
      top: -90rpx;
      font-size: 46rpx;
      color: #555;
    }
    .input-content {
      padding: 0 60rpx;
      .input-item {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        padding: 0 30rpx;
        background: #fff;
        height: 120rpx;
        border-radius: 4px;
        margin-bottom: 50rpx;
        .tit {
          height: 50rpx;
          line-height: 56rpx;
          font-size: 30rpx;
          color: #606266;
        }
        input {
          height: 60rpx;
          font-size: 30rpx;
          color: #303133;
          width: 100%;
        }
      }
      .input-item:last-child {
        margin-bottom: 0;
      }
      // .verifica-code {
      //   display: flex;
      //   .input-item {
      //     width: 70%;
      //   }
      //   .fetch-code {
      //     margin: 0 0 0 15rpx;
      //     padding: 0;
      //     height: 120rpx;
      //     width: 30%;
      //     font-size: 35rpx;
      //     line-height: 120rpx;
      //     color: #1e80ff;
      //     border: 1rpx solid #87bbff;
      //     border-radius: 10rpx;
      //     background-color: #eaf2ff;
      //   }
      //   .fetch-code:after {
      //     border: 0px;
      //   }
      // }
    }
    .confirm-btn {
      width: 630rpx !important;
      height: 76rpx;
      line-height: 76rpx;
      border-radius: 50rpx;
      margin-top: 70rpx;
      background: #4a8ee2;
      color: #fff;
      font-size: 32rpx;
      padding: 0;
    }
    .confirm-btn2:after {
      border-radius: 100px;
    }
    .forget-section {
      font-size: 28rpx;
      color: #4399fc;
      text-align: center;
      margin-top: 40rpx;
    }
  }
  .register-section {
    position: absolute;
    left: 0;
    bottom: 50rpx;
    width: 100%;
    font-size: 28rpx;
    color: #606266;
    text-align: center;
    text {
      color: #4399fc;
      margin-left: 10rpx;
    }
  }
}
</style>
