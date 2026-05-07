/**
 * 网络请求封装
 */
const BASE_URL = 'http://localhost:9999'

// 请求拦截
const request = (options) => {
	return new Promise((resolve, reject) => {
		const token = uni.getStorageSync('token')
		const header = {
			'Content-Type': 'application/json',
			...options.header
		}
		if (token) {
			header['Authorization'] = `Bearer ${token}`
		}

		uni.request({
			url: BASE_URL + options.url,
			method: options.method || 'GET',
			data: options.data,
			header,
			success: (res) => {
				if (res.statusCode === 200) {
					const data = res.data
					if (data.code === 200) {
						resolve(data)
					} else if (data.code === 401) {
						// token过期，跳转登录
						uni.removeStorageSync('token')
						uni.navigateTo({ url: '/pages/user/login' })
						reject(data)
					} else {
						uni.showToast({ title: data.message || '请求失败', icon: 'none' })
						reject(data)
					}
				} else {
					uni.showToast({ title: '网络错误', icon: 'none' })
					reject(res)
				}
			},
			fail: (err) => {
				uni.showToast({ title: '网络连接失败', icon: 'none' })
				reject(err)
			}
		})
	})
}

export const get = (url, data) => request({ url, method: 'GET', data })
export const post = (url, data) => request({ url, method: 'POST', data })
export const put = (url, data) => request({ url, method: 'PUT', data })
export const del = (url, data) => request({ url, method: 'DELETE', data })

export default { get, post, put, del, BASE_URL }
