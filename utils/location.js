/**
 * 微信小程序定位工具
 */

import { get } from '@/utils/request'

// 请求用户定位权限
export function requestLocation() {
	return new Promise((resolve, reject) => {
		uni.authorize({
			scope: 'userLocation',
			success: () => {
				resolve(true)
			},
			fail: () => {
				// 权限未授予，提示用户手动开启
				reject(new Error('需要位置权限'))
			}
		})
	})
}

// 获取当前位置
export function getLocation() {
	return new Promise((resolve, reject) => {
		uni.getLocation({
			type: 'gcj02', // 国标坐标系
			timeout: 5000,
			success: (res) => {
				resolve({
					lng: res.longitude,
					lat: res.latitude
				})
			},
			fail: (err) => {
				console.log('定位失败', err)
				reject(err)
			}
		})
	})
}

// 加载附近商家（带降级）
export async function loadNearbyMerchants(type, radius = 50) {
	try {
		await requestLocation()
		const location = await getLocation()
		const res = await get('/api/merchant/nearby', {
			lat: location.lat,
			lng: location.lng,
			type,
			radius
		})
		return { success: true, data: res.data || [], location }
	} catch (e) {
		if (e.message === '需要位置权限' || (e.errMsg && e.errMsg.includes('fail'))) {
			// 降级：使用北京默认坐标
			console.log('定位失败，使用默认坐标')
			try {
				const res = await get('/api/merchant/nearby', {
					lat: 39.9,
					lng: 116.4,
					type,
					radius
				})

				// 提示用户
				uni.showModal({
					title: '提示',
					content: '无法获取您的位置，已使用默认城市「北京」的数据，您可以点击确定查看详情~',
					showCancel: false
				})
				
				return {
					success: true,
					data: res.data || [],
					defaultLocation: true,
					location: { lng: 116.4, lat: 39.9 }
				}
			} catch (fallbackErr) {
				console.error('所有方案都失败', fallbackErr)
				return { success: false, data: [] }
			}
		}
		
		// 其他错误直接返回失败
		return { success: false, data: [] }
	}
}
