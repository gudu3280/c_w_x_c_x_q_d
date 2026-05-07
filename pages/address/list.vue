<template>
	<view class="container">
		<view class="address-list">
			<view class="address-card pixel-card" v-for="item in addresses" :key="item.id" @click="editAddress(item.id)">
				<view class="address-info">
					<view class="address-top">
						<text class="name">{{ item.name }}</text>
						<text class="phone">{{ item.phone }}</text>
						<text class="default-tag pixel-tag" v-if="item.isDefault">默认</text>
					</view>
					<text class="detail">📍 {{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}</text>
				</view>
			</view>
		</view>

		<view class="empty-state pixel-card" v-if="addresses.length === 0">
			<text class="empty-emoji">📍</text>
			<text class="empty-text">暂无收货地址</text>
		</view>

		<view class="add-section">
			<view class="pixel-btn" @click="addAddress">+ 新增地址</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { get } from '@/utils/request'

const addresses = ref([])
onMounted(() => { loadAddresses() })

const loadAddresses = async () => {
	try {
		const res = await get('/api/address/list')
		addresses.value = res.data || []
	} catch (e) { console.error('加载地址失败', e) }
}

const addAddress = () => { uni.navigateTo({ url: '/pages/address/edit' }) }
const editAddress = (id) => { uni.navigateTo({ url: `/pages/address/edit?id=${id}` }) }
</script>

<style lang="scss">
.container { min-height: 100vh; padding: 20rpx 30rpx; }
.address-card { padding: 24rpx !important; }
.address-top { display: flex; align-items: center; gap: 16rpx; margin-bottom: 8rpx; }
.name { font-size: 28rpx; font-weight: bold; color: #3E2723; }
.phone { font-size: 26rpx; color: #8D6E63; }
.detail { font-size: 24rpx; color: #A1887F; }

.empty-state { text-align: center; padding: 100rpx 0 !important; }
.empty-emoji { font-size: 80rpx; display: block; margin-bottom: 20rpx; }
.empty-text { font-size: 28rpx; color: #8D6E63; }

.add-section { margin-top: 30rpx; }
</style>
