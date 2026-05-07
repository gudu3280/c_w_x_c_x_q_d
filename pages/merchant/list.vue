<template>
	<view class="container">
		<!-- 类型切换 + 视图切换 -->
		<view class="top-bar">
			<view class="type-tabs">
				<view class="tab" :class="{ active: currentType === 'boarding' }" @click="switchType('boarding')">🏠 寄养</view>
				<view class="tab" :class="{ active: currentType === 'grooming' }" @click="switchType('grooming')">✂️ 美容</view>
			</view>
			<view class="view-toggle">
				<text class="vt-btn" :class="{ active: mode === 'list' }" @click="mode='list'">📋</text>
				<text class="vt-btn" :class="{ active: mode === 'map' }" @click="mode='map'">🗺️</text>
			</view>
		</view>

		<!-- 地图模式 -->
		<view class="map-container" v-if="mode === 'map'">
			<map
				class="map-view"
				:latitude="mapCenter.lat"
				:longitude="mapCenter.lng"
				:markers="mapMarkers"
				:scale="14"
				@markertap="onMarkerTap"
			/>
		</view>

		<!-- 列表模式 -->
		<view class="list" v-else>
			<view class="merchant-card pixel-card" v-for="item in merchants" :key="item.id" @click="goDetail(item.id)">
				<image class="card-img" :src="item.coverImage || '/static/logo.png'" mode="aspectFill" />
				<view class="card-info">
					<text class="card-name">{{ item.name }}</text>
					<text class="card-address">📍 {{ item.address }}</text>
					<view class="card-tags">
						<text class="pixel-tag" v-for="tag in getTags(item.tags)" :key="tag">{{ tag }}</text>
					</view>
					<view class="card-bottom">
						<text class="card-score">⭐ {{ item.avgScore }} ({{ item.reviewCount }}评)</text>
						<text class="card-distance" v-if="item.distance">{{ item.distance.toFixed(1) }}km</text>
					</view>
				</view>
			</view>

			<view class="empty-state pixel-card" v-if="merchants.length === 0">
				<text class="empty-emoji">🐾</text>
				<text class="empty-text">暂无附近商家</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { loadNearbyMerchants, getLocation } from '@/utils/location'

const mode = ref('list')
const currentType = ref('boarding')
const merchants = ref([])
const myLocation = ref({ lat: 39.9, lng: 116.4 })

// 地图中心点
const mapCenter = computed(() => ({
	lat: myLocation.value.lat,
	lng: myLocation.value.lng
}))

// 地图标记点
const mapMarkers = computed(() =>
	merchants.value
		.filter(m => m.lat && m.lng)
		.map((m, i) => ({
			id: m.id,
			latitude: m.lat,
			longitude: m.lng,
			title: m.name,
			iconPath: `/static/tab-home${i % 2 === 0 ? '' : '-active'}.png`,
			width: 30,
			height: 30,
			callout: {
				content: `${m.name}\n⭐${m.avgScore || 5} | ${m.distance?.toFixed(1) || '?'}km`,
				fontSize: 12,
				color: '#3E2723',
				bgColor: '#FFFDE7',
				borderRadius: 8,
				padding: 8,
				display: 'ALWAYS'
			}
		}))
)

onMounted(async () => {
	const pages = getCurrentPages()
	const page = pages[pages.length - 1]
	if (page.$page?.options?.type) {
		currentType.value = page.$page.options.type
	}
	// 获取用户位置（用于地图中心）
	try {
		myLocation.value = await getLocation()
	} catch (e) { console.error('获取位置失败', e) }
	loadMerchants()
})

const switchType = (type) => {
	currentType.value = type
	loadMerchants()
}

const getTags = (tagsStr) => {
	if (!tagsStr) return []
	return tagsStr.split(',').filter(t => t.trim())
}

const loadMerchants = async () => {
	const result = await loadNearbyMerchants(currentType.value, 50)
	merchants.value = result.data || []
}

const goDetail = (id) => {
	uni.navigateTo({ url: `/pages/merchant/detail?id=${id}` })
}

const onMarkerTap = (e) => {
	const markerId = e.detail?.markerId || e.markerId
	if (markerId) goDetail(markerId)
}
</script>

<style lang="scss">
.container { min-height: 100vh; display: flex; flex-direction: column; }

// 顶部栏
.top-bar {
	display: flex;
	align-items: center;
	background: #FFFDE7;
	padding: 16rpx 20rpx;
	border-bottom: 4rpx solid #6D4C41;
	gap: 16rpx;
}
.type-tabs {
	display: flex;
	flex: 1;
	gap: 12rpx;
	.tab {
		flex: 1;
		text-align: center;
		padding: 14rpx 8rpx;
		font-size: 26rpx;
		font-weight: bold;
		color: #6D4C41;
		background: #F5E6CC;
		border: 3rpx solid #6D4C41;
		box-shadow: 3rpx 3rpx 0 #3E2723;
		&.active {
			color: #FFF8E1;
			background: #4CAF50;
			border-color: #2E7D32;
			box-shadow: 3rpx 3rpx 0 #1B5E20;
		}
	}
}

// 视图切换按钮
.view-toggle {
	display: flex;
	gap: 8rpx;
	margin-left: 16rpx;
	flex-shrink: 0;
}
.vt-btn {
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 36rpx;
	background: #F5E6CC;
	border: 3rpx solid #6D4C41;
	box-shadow: 2rpx 2rpx 0 #3E2723;
	border-radius: 8rpx;
	&.active {
		background: #4CAF50;
		border-color: #2E7D32;
		box-shadow: 2rpx 2rpx 0 #1B5E20;
		transform: scale(1.05);
	}
}

// 地图
.map-container {
	flex: 1;
	width: 100%;
}
.map-view {
	width: 100%;
	height: 100%;
}

// 列表
.list { padding: 20rpx 30rpx; }
.merchant-card {
	display: flex !important;
	flex-direction: row !important;
	padding: 20rpx !important;
}
.card-img {
	width: 160rpx;
	height: 160rpx;
	border: 3rpx solid #6D4C41;
	margin-right: 20rpx;
}
.card-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}
.card-name { font-size: 30rpx; font-weight: bold; color: #3E2723; }
.card-address { font-size: 24rpx; color: #8D6E63; margin-top: 8rpx; }
.card-tags {
	display: flex; flex-wrap: wrap; gap: 8rpx; margin-top: 8rpx;
}
.card-bottom {
	display: flex; justify-content: space-between; margin-top: 8rpx;
}
.card-score { font-size: 24rpx; color: #FF8F00; font-weight: bold; }
.card-distance { font-size: 24rpx; color: #8D6E63; }
.empty-state { text-align: center; padding: 80rpx 0 !important; }
.empty-emoji { font-size: 72rpx; display: block; margin-bottom: 20rpx; }
.empty-text { font-size: 28rpx; color: #8D6E63; }
</style>
