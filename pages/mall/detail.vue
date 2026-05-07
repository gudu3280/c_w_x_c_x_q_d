<template>
	<view class="container">
		<image class="main-img" :src="product.mainImage || '/static/logo.png'" mode="aspectFill" />

		<view class="info pixel-card">
			<text class="name">{{ product.name }}</text>
			<view class="price-row">
				<text class="pixel-price">¥{{ product.price }}</text>
				<text class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</text>
			</view>
			<view class="pixel-divider"></view>
			<text class="sales">📦 已售 {{ product.salesVolume || 0 }} | 库存 {{ product.stock || 0 }}</text>
		</view>

		<view class="desc pixel-card" v-if="product.description">
			<text class="pixel-title">📝 商品详情</text>
			<view class="pixel-divider"></view>
			<text class="desc-content">{{ product.description }}</text>
		</view>

		<!-- 用户评价 -->
		<view class="reviews pixel-card" style="margin-bottom:140rpx;">
			<text class="pixel-title">💬 用户评价 ({{ reviews.length }})</text>
			<view class="pixel-divider"></view>

			<view class="review-item" v-for="item in reviews" :key="item.id">
				<view class="review-header">
					<image class="review-avatar" :src="item.userAvatar || '/static/logo.png'" mode="aspectFill" />
					<view class="review-user">
						<text class="review-nickname">{{ item.userNickname || '铲屎官' }}</text>
						<text class="review-time">{{ item.createTime }}</text>
					</view>
					<text class="review-score">⭐ {{ item.score }}</text>
				</view>
				<text class="review-content">{{ item.content }}</text>
			</view>

			<view class="empty-review" v-if="reviews.length === 0">
				<text class="empty-emoji">📝</text>
				<text class="empty-text">暂无评价，买过的铲屎官快来评价吧</text>
			</view>
		</view>

		<view class="bottom-bar">
			<view class="pixel-btn pixel-btn-brown" @click="addCart">
				<text>🛒 加入购物车</text>
			</view>
			<view class="pixel-btn pixel-btn-gold" @click="buyNow">
				<text>💰 立即购买</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { get } from '@/utils/request'
import { useCartStore } from '@/store/cart'

const product = ref({})
const cartStore = useCartStore()
const reviews = ref([])
let productId = 0

onMounted(() => {
	const pages = getCurrentPages()
	const page = pages[pages.length - 1]
	productId = page.$page?.options?.id
	loadProduct(productId)
	loadReviews()
})

const loadProduct = async (id) => {
	try {
		const res = await get(`/api/product/${id}`)
		product.value = res.data
	} catch (e) { console.error('加载商品失败', e) }
}

const loadReviews = async () => {
	try {
		const res = await get('/api/review/list', { targetType: 'product', targetId: productId, page: 1, size: 20 })
		reviews.value = res.data?.records || []
	} catch (e) { console.error('加载评价失败', e) }
}

const addCart = async () => {
	await cartStore.addToCart(product.value.id, 1)
}

const buyNow = async () => {
	await cartStore.addToCart(product.value.id, 1)
	uni.navigateTo({ url: '/pages/mall/cart' })
}
</script>

<style lang="scss">
.container { padding-bottom: 120rpx; }
.main-img { width: 100%; height: 600rpx; border-bottom: 4rpx solid #6D4C41; }

.info { margin: 20rpx 30rpx; }
.name { display: block; font-size: 32rpx; color: #3E2723; font-weight: bold; margin-bottom: 12rpx; }
.price-row { display: flex; align-items: baseline; gap: 16rpx; }
.original-price { font-size: 26rpx; color: #A1887F; text-decoration: line-through; }
.sales { display: block; font-size: 24rpx; color: #8D6E63; margin-top: 8rpx; }

.desc { margin: 0 30rpx 20rpx; }
.desc-content { font-size: 26rpx; color: #5D4037; line-height: 1.8; }

// 评价列表
.reviews { margin: 0 30rpx 20rpx; }
.review-item {
	padding: 24rpx 0;
	border-bottom: 2rpx dashed #D7CCC8;
	&:last-child { border-bottom: none; }
}
.review-header {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 12rpx;
}
.review-avatar {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	border: 2rpx solid #6D4C41;
}
.review-user { flex: 1; }
.review-nickname {
	font-size: 26rpx;
	color: #3E2723;
	font-weight: bold;
	display: block;
}
.review-time {
	font-size: 22rpx;
	color: #A1887F;
	display: block;
	margin-top: 4rpx;
}
.review-score {
	font-size: 26rpx;
	color: #FF8F00;
	font-weight: bold;
}
.review-content {
	font-size: 26rpx;
	color: #5D4037;
	line-height: 1.6;
}
.empty-review {
	text-align: center;
	padding: 40rpx 0;
}
.empty-emoji { font-size: 60rpx; display: block; margin-bottom: 12rpx; }
.empty-text { font-size: 26rpx; color: #A1887F; }

.bottom-bar {
	position: fixed; bottom: 0; left: 0; right: 0;
	display: flex; padding: 20rpx 30rpx; gap: 20rpx;
	background: #FFFDE7; border-top: 4rpx solid #6D4C41;
}
</style>
