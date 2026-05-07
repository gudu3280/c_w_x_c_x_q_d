import { defineStore } from 'pinia'
import { get, post } from '@/utils/request'

export const useUserStore = defineStore('user', {
	state: () => ({
		token: uni.getStorageSync('token') || '',
		userInfo: JSON.parse(uni.getStorageSync('userInfo') || '{}')
	}),
	getters: {
		isLoggedIn: (state) => !!state.token
	},
	actions: {
		async login(mobile, code) {
			const res = await post('/api/login/wechat', { mobile, code })
			this.token = res.data.token
			this.userInfo = res.data.userInfo
			uni.setStorageSync('token', this.token)
			uni.setStorageSync('userInfo', JSON.stringify(this.userInfo))
			return res
		},
		async getUserInfo() {
			const res = await get('/api/user/info')
			this.userInfo = res.data
			uni.setStorageSync('userInfo', JSON.stringify(this.userInfo))
		},
		logout() {
			this.token = ''
			this.userInfo = {}
			uni.removeStorageSync('token')
			uni.removeStorageSync('userInfo')
		}
	}
})
