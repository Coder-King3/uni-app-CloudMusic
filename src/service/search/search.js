import request from '../index.js'

const SearchApi = {
  SearchKeyWord: '/search/default',
  SearchHot: '/search/hot/detail',
  Search: '/search'
}

// 默认搜索关键词
export const fetchSearchKeyWord = (param = {}) =>
  request.get({ url: SearchApi.SearchKeyWord, data: param })

// 热搜列表(详细)
export const fetchSearchHot = (param = {}) =>
  request.get({ url: SearchApi.SearchHot, data: param })

// 搜索
export const fetchSearch = (param = {}) =>
  request.get({ url: SearchApi.Search, data: param })
