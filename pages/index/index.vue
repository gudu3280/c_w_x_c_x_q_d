<template>
	<view class="container">
		<!-- 顶部像素风搜索栏 -->
		<view class="search-bar">
			<view class="search-input pixel-input" @click="goSearch">
				<text class="search-icon">🔍</text>
				<text class="search-placeholder">搜索服务或商品...</text>
			</view>
		</view>

		<!-- 像素风 Banner -->
		<view class="banner">
			<swiper indicator-dots autoplay circular indicator-color="rgba(255,255,255,0.4)" indicator-active-color="#FFC107">
				<swiper-item>
					<view class="banner-item banner-green">
						<image class="banner-icon" src="/static/service-boarding.png" mode="aspectFit" />
						<view class="banner-text">
							<text class="banner-title">🏕️ 宠物寄养</text>
							<text class="banner-desc">温馨的林间小屋等你来</text>
						</view>
					</view>
				</swiper-item>
				<swiper-item>
					<view class="banner-item banner-blue">
						<image class="banner-icon" src="/static/service-grooming.png" mode="aspectFit" />
						<view class="banner-text">
							<text class="banner-title">✨ 宠物美容</text>
							<text class="banner-desc">让毛孩子闪耀每一天</text>
						</view>
					</view>
				</swiper-item>
				<swiper-item>
					<view class="banner-item banner-gold">
						<image class="banner-icon" src="/static/service-mall.png" mode="aspectFit" />
						<view class="banner-text">
							<text class="banner-title">🎒 宠物商城</text>
							<text class="banner-desc">冒险旅途的必备好物</text>
						</view>
					</view>
				</swiper-item>
			</swiper>
		</view>

		<!-- 服务入口 - 像素风格子 -->
		<view class="service-section pixel-card">
			<text class="pixel-title">⚔️ 服务菜单</text>
			<view class="pixel-divider"></view>
			<view class="service-grid">
				<view class="service-item" @click="goService('boarding')">
					<image class="service-icon" src="/static/service-boarding.png" mode="aspectFit" />
					<text class="service-name">宠物寄养</text>
				</view>
				<view class="service-item" @click="goService('grooming')">
					<image class="service-icon" src="/static/service-grooming.png" mode="aspectFit" />
					<text class="service-name">宠物美容</text>
				</view>
				<view class="service-item" @click="goMall">
					<image class="service-icon" src="/static/service-mall.png" mode="aspectFit" />
					<text class="service-name">宠物商城</text>
				</view>
				<view class="service-item" @click="goPet">
					<image class="service-icon" src="/static/service-pet.png" mode="aspectFit" />
					<text class="service-name">宠物档案</text>
				</view>
			</view>
		</view>

		<!-- 推荐商家 - 像素风 -->
		<view class="section">
			<view class="section-header">
				<text class="pixel-title">🏪 推荐商家</text>
				<view class="pixel-btn pixel-btn-gold" @click="goService('')">
					<text>查看全部 →</text>
				</view>
			</view>

			<view class="merchant-list">
				<view class="merchant-card pixel-card" v-for="item in merchants" :key="item.id" @click="goMerchantDetail(item.id)">
					<image class="merchant-img" :src="item.coverImage || '/static/logo.png'" mode="aspectFill" />
					<view class="merchant-info">
						<text class="merchant-name">{{ item.name }}</text>
						<view class="merchant-tags">
							<text class="pixel-tag" v-for="tag in getTags(item.tags)" :key="tag">{{ tag }}</text>
						</view>
						<view class="merchant-bottom">
							<text class="merchant-score">⭐ {{ item.avgScore || '5.0' }}</text>
							<text class="merchant-distance" v-if="item.distance">📍 {{ item.distance.toFixed(1) }}km</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty-state pixel-card" v-if="merchants.length === 0">
				<text class="empty-emoji">🐱</text>
				<text class="empty-text">暂无附近商家，快来入驻吧~</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { loadNearbyMerchants } from '@/utils/location'

const merchants = ref([])

onMounted(() => {
	loadMerchants()
})

const loadMerchants = async () => {
	const result = await loadNearbyMerchants(null, 50)
	merchants.value = (result.data || []).slice(0, 4)
}

const getTags = (tagsStr) => {
	if (!tagsStr) return []
	return tagsStr.split(',').filter(t => t.trim())
}

const goService = (type) => {
	uni.navigateTo({ url: `/pages/merchant/list?type=${type}` })
}
const goMall = () => {
	uni.switchTab({ url: '/pages/mall/list' })
}
const goPet = () => {
	uni.navigateTo({ url: '/pages/pet/list' })
}
const goMerchantDetail = (id) => {
	uni.navigateTo({ url: `/pages/merchant/detail?id=${id}` })
}
const goSearch = () => {
	uni.navigateTo({ url: '/pages/search/index' })
}
</script>

<style lang="scss">
.container {
	padding-bottom: 20rpx;
	min-height: 100vh;
}

/* 搜索栏 */
.search-bar {
	padding: 20rpx 30rpx;
	background: #4CAF50;
	border-bottom: 6rpx solid #2E7D32;
}
.search-input {
	display: flex;
	align-items: center;
	background: #FFFDE7 !important;
	padding: 18rpx 24rpx !important;
}
.search-icon { margin-right: 16rpx; font-size: 32rpx; }
.search-placeholder { font-size: 26rpx; color: #A1887F; }

/* Banner */
.banner {
	padding: 20rpx 30rpx;
	swiper { height: 200rpx; }
}
.banner-item {
	height: 200rpx;
	display: flex;
	align-items: center;
	padding: 0 40rpx;
	border: 4rpx solid #3E2723;
	box-shadow: 6rpx 6rpx 0 #3E2723;
}
.banner-green { background: linear-gradient(135deg, #66BB6A, #43A047); }
.banner-blue { background: linear-gradient(135deg, #42A5F5, #1E88E5); }
.banner-gold { background: linear-gradient(135deg, #FFC107, #FF8F00); }
.banner-icon {
	width: 100rpx;
	height: 100rpx;
	margin-right: 25rpx;
	border-radius: 10rpx;
	flex-shrink: 0;
	box-shadow: 2rpx 2rpx 0 rgba(0,0,0,0.3);
}
.banner-text { display: flex; flex-direction: column; }
.banner-title {
	color: #FFF8E1;
	font-size: 34rpx;
	font-weight: bold;
	letter-spacing: 4rpx;
	text-shadow: 3rpx 3rpx 0 rgba(0,0,0,0.3);
}
.banner-desc {
	color: rgba(255,248,225,0.9);
	font-size: 24rpx;
	margin-top: 8rpx;
	letter-spacing: 2rpx;
}

/* 服务网格 */
.service-section {
	margin: 0 30rpx 30rpx;
}
.service-grid {
	display: flex;
	justify-content: space-around;
	padding: 20rpx 0;
}
.service-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.service-icon {
	width: 140rpx;
	height: 140rpx;
	border-radius: 14rpx;
	box-shadow: 3rpx 3rpx 0 #3E2723;
}
.service-name {
	font-size: 24rpx;
	color: #3E2723;
	margin-top: 12rpx;
	font-weight: bold;
}

/* 推荐商家区域 */
.section {
	margin: 0 30rpx 30rpx;
}
.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

/* 商家卡片 */
.merchant-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}
.merchant-card {
	display: flex !important;
	flex-direction: row !important;
	padding: 20rpx !important;
}
.merchant-img {
	width: 140rpx;
	height: 140rpx;
	border: 3rpx solid #6D4C41;
	margin-right: 20rpx;
}
.merchant-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}
.merchant-name {
	font-size: 30rpx;
	font-weight: bold;
	color: #3E2723;
}
.merchant-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
	margin: 8rpx 0;
}
.merchant-bottom {
	display: flex;
	justify-content: space-between;
}
.merchant-score { font-size: 24rpx; color: #FF8F00; font-weight: bold; }
.merchant-distance { font-size: 24rpx; color: #8D6E63; }

/* 空状态 */
.empty-state {
	text-align: center;
	padding: 60rpx 0 !important;
}
.empty-emoji { font-size: 80rpx; display: block; margin-bottom: 20rpx; }
.empty-text { font-size: 28rpx; color: #8D6E63; }
</style>
