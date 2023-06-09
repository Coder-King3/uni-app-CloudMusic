import request from '../index.js'

const LoginApi = {
  // CellphoneLogin: '/login/cellphone',
  EmailLogin: '/login',
  SendCode: '/captcha/sent',
  VerifyCode: '/captcha/verify'
}
// 验证码登录
export const fetchEmailLogin = (param = {}) =>
  request.get({
    url: LoginApi.EmailLogin,
    data: { ...param, timestamp: new Date().getTime() }
  })

// 发动短信验证码
export const fetchSendCode = (param = {}) =>
  request.get({
    url: LoginApi.SendCode,
    data: { ...param, timestamp: new Date().getTime() }
  })

// 验证短信验证码
export const fetchVerifyCode = (param = {}) =>
  request.get({
    url: LoginApi.VerifyCode,
    data: { ...param, timestamp: new Date().getTime() }
  })
