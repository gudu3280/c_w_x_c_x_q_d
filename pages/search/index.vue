<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-header">
			<view class="search-box pixel-input">
				<text class="search-icon">🔍</text>
				<input
					class="search-field"
					v-model="keyword"
					placeholder="搜索服务或商品..."
					placeholder-style="color:#A1887F"
					confirm-type="search"
					@confirm="doSearch"
					@input="onInput"
					focus
				/>
				<text class="search-clear" v-if="keyword" @click="clearSearch">✕</text>
			</view>
			<view class="search-cancel" @click="goBack">取消</view>
		</view>

		<!-- 加载中 -->
		<view class="loading-box" v-if="loading">
			<text class="loading-text">🔍 搜索中...</text>
		</view>

		<!-- 初始状态：刚进入 -->
		<view class="empty-hint" v-else-if="!searched && !keyword">
			<text class="empty-icon">🔍</text>
			<text class="empty-text">输入关键词，搜索服务或商品</text>
			<text class="empty-sub">支持搜索商家名称、商品名等</text>
		</view>

		<!-- 空状态：还没搜 -->
		<view class="empty-hint" v-else-if="!searched && keyword">
			<text class="empty-icon">⌨️</text>
			<text class="empty-text">按回车开始搜索</text>
		</view>

		<!-- 空状态：没搜到 -->
		<view class="empty-hint" v-else-if="searched && merchants.length === 0 && products.length === 0">
			<text class="empty-icon">🔎</text>
			<text class="empty-text">没有找到相关内容</text>
			<text class="empty-sub">换个关键词试试吧~</text>
		</view>

		<!-- 搜索结果 -->
		<view v-else-if="searched && !loading">
			<!-- 相关服务 -->
			<view class="result-section" v-if="merchants.length > 0">
				<view class="section-header">
					<text class="pixel-title">🏪 相关服务</text>
					<view class="pixel-divider"></view>
				</view>
				<view
					class="merchant-card pixel-card"
					v-for="item in merchants"
					:key="'m' + item.id"
					@click="goMerchant(item.id)"
				>
					<image class="merchant-img" :src="item.coverImage || '/static/logo.png'" mode="aspectFill" />
					<view class="merchant-info">
						<text class="merchant-name">{{ item.name }}</text>
						<view class="merchant-tags">
							<text class="pixel-tag" v-for="tag in (item.tags || '').split(',').filter(Boolean)" :key="tag">{{ tag }}</text>
						</view>
						<view class="merchant-meta">
							<text class="merchant-addr">📍 {{ item.address }}</text>
							<text class="merchant-score" v-if="item.avgScore">⭐ {{ item.avgScore }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 相关商品 -->
			<view class="result-section" v-if="products.length > 0">
				<view class="section-header">
					<text class="pixel-title">🎒 相关商品</text>
					<view class="pixel-divider"></view>
				</view>
				<view class="product-grid">
					<view class="product-card pixel-card" v-for="item in products" :key="'p' + item.id" @click="goProduct(item.id)">
						<image class="product-img" :src="item.mainImage || '/static/logo.png'" mode="aspectFill" />
						<view class="product-info">
							<text class="product-name">{{ item.name }}</text>
							<view class="product-bottom">
								<text class="pixel-price">¥{{ item.price }}</text>
								<text class="product-sales">售 {{ item.salesVolume }}</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 加载更多 -->
				<view class="load-more" v-if="hasMore" @click="loadMore">
					<text class="pixel-btn">加载更多商品...</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { get } from '@/utils/request'

const keyword = ref('')
const searched = ref(false)
const loading = ref(false)
const merchants = ref([])
const products = ref([])
const page = ref(1)
const hasMore = ref(false)
let searchTimer = null

const onInput = () => {
	clearTimeout(searchTimer)
	searchTimer = setTimeout(() => {
		if (keyword.value.trim()) {
			doSearch()
		}
	}, 500)
}

const doSearch = () => {
	const kw = keyword.value.trim()
	if (!kw) return

	page.value = 1
	loading.value = true
	searched.value = true

	get('/api/search', { keyword: kw, page: 1, size: 10 }).then(res => {
		merchants.value = res.data?.merchants || []
		products.value = res.data?.products || []
		const total = res.data?.totalProducts || 0
		hasMore.value = total > products.value.length
	}).catch(() => {
		merchants.value = []
		products.value = []
	}).finally(() => {
		loading.value = false
	})
}

const loadMore = () => {
	const kw = keyword.value.trim()
	page.value++
	loading.value = true
	get('/api/search', { keyword: kw, page: page.value, size: 10 }).then(res => {
		const newProducts = res.data?.products || []
		products.value = [...products.value, ...newProducts]
		const total = res.data?.totalProducts || 0
		hasMore.value = total > products.value.length
	}).finally(() => {
		loading.value = false
	})
}

const clearSearch = () => {
	keyword.value = ''
	searched.value = false
	merchants.value = []
	products.value = []
}

const goMerchant = (id) => {
	uni.navigateTo({ url: `/pages/merchant/detail?id=${id}` })
}

const goProduct = (id) => {
	uni.navigateTo({ url: `/pages/mall/detail?id=${id}` })
}

const goBack = () => {
	uni.navigateBack()
}
</script>

<style lang="scss">
.container { min-height: 100vh; }

.search-header {
	display: flex;
	align-items: center;
	padding: 20rpx 30rpx;
	background: #4CAF50;
	gap: 20rpx;
}

.search-box {
	flex: 1;
	display: flex;
	align-items: center;
	padding: 14rpx 20rpx !important;
	border-radius: 10rpx;
}

.search-icon { font-size: 32rpx; margin-right: 12rpx; }

.search-field {
	flex: 1;
	font-size: 28rpx;
	font-family: 'Courier New', Courier, monospace;
	color: #3E2723;
}

.search-clear {
	font-size: 28rpx;
	color: #8D6E63;
	padding: 0 10rpx;
}

.search-cancel {
	font-size: 28rpx;
	color: #FFF8E1;
	font-weight: bold;
	flex-shrink: 0;
}

.loading-box {
	padding: 80rpx 0;
	text-align: center;
}
.loading-text { font-size: 28rpx; color: #8D6E63; }

.empty-hint {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 120rpx 0;
}
.empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.empty-text { font-size: 30rpx; color: #3E2723; font-weight: bold; }
.empty-sub { font-size: 24rpx; color: #8D6E63; margin-top: 12rpx; }

.result-section { padding: 20rpx 24rpx; }

.section-header {
	padding: 10rpx 0;
	.pixel-title { display: block; }
}

// 商家卡片
.merchant-card {
	display: flex;
	padding: 20rpx !important;
	gap: 20rpx;
	margin-bottom: 20rpx;
}
.merchant-img {
	width: 140rpx;
	height: 140rpx;
	border-radius: 10rpx;
	border: 3rpx solid #6D4C41;
	flex-shrink: 0;
}
.merchant-info { flex: 1; display: flex; flex-direction: column; gap: 10rpx; }
.merchant-name {
	font-size: 30rpx;
	color: #3E2723;
	font-weight: bold;
}
.merchant-tags { display: flex; flex-wrap: wrap; gap: 8rpx; }
.merchant-meta { display: flex; flex-wrap: wrap; gap: 16rpx; }
.merchant-addr { font-size: 24rpx; color: #8D6E63; }
.merchant-score { font-size: 24rpx; color: #FF8F00; }

// 商品网格
.product-grid {
	display: flex; flex-wrap: wrap; gap: 20rpx;
}
.product-card {
	width: calc(50% - 10rpx);
	padding: 0 !important;
	overflow: hidden;
}
.product-img {
	width: 100%;
	height: 260rpx;
	border-bottom: 3rpx solid #6D4C41;
}
.product-info { padding: 14rpx 16rpx; }
.product-name {
	font-size: 26rpx;
	color: #3E2723;
	font-weight: bold;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
.product-bottom {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 10rpx;
}
.product-sales { font-size: 22rpx; color: #8D6E63; }

.load-more {
	text-align: center;
	padding: 30rpx 0;
}
</style>
