<template>
	<view class="container">
		<!-- 分类栏 - 像素风 -->
		<scroll-view scroll-x class="category-bar">
			<view class="cat-item" :class="{ active: currentCat === '' }" @click="switchCat('')">🎒 全部</view>
			<view class="cat-item" :class="{ active: currentCat === 'dog_food' }" @click="switchCat('dog_food')">🦴 狗粮</view>
			<view class="cat-item" :class="{ active: currentCat === 'snack' }" @click="switchCat('snack')">🍖 零食</view>
			<view class="cat-item" :class="{ active: currentCat === 'toy' }" @click="switchCat('toy')">🧸 玩具</view>
			<view class="cat-item" :class="{ active: currentCat === 'wash' }" @click="switchCat('wash')">🧴 洗护</view>
			<view class="cat-item" :class="{ active: currentCat === 'other' }" @click="switchCat('other')">📦 其他</view>
		</scroll-view>

		<!-- 商品列表 - 像素风 -->
		<view class="product-grid">
			<view class="product-card pixel-card" v-for="item in products" :key="item.id" @click="goDetail(item.id)">
				<image class="product-img" :src="item.mainImage || '/static/logo.png'" mode="aspectFill" />
				<view class="product-info">
					<text class="product-name">{{ item.name }}</text>
					<view class="product-bottom">
						<text class="pixel-price">¥{{ item.price }}</text>
						<text class="product-sales">售出 {{ item.salesVolume }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 购物车悬浮按钮 - 像素风 -->
		<view class="cart-float" @click="goCart">
			<text class="cart-icon">🛒</text>
			<text class="cart-badge pixel-badge" v-if="cartCount > 0">{{ cartCount }}</text>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { get } from '@/utils/request'
import { useCartStore } from '@/store/cart'

const cartStore = useCartStore()
const currentCat = ref('')
const products = ref([])
const cartCount = ref(0)

onMounted(() => {
	loadProducts()
	loadCartCount()
})

const switchCat = (cat) => {
	currentCat.value = cat
	loadProducts()
}

const loadProducts = async () => {
	try {
		const params = { page: 1, size: 20 }
		if (currentCat.value) params.category = currentCat.value
		const res = await get('/api/products', params)
		products.value = res.data?.records || []
	} catch (e) {
		console.log('加载失败', e)
	}
}

const loadCartCount = async () => {
	try {
		await cartStore.loadCart()
		cartCount.value = cartStore.cartCount
	} catch (e) { console.error('加载购物车失败', e) }
}

const goDetail = (id) => {
	uni.navigateTo({ url: `/pages/mall/detail?id=${id}` })
}
const goCart = () => {
	uni.navigateTo({ url: '/pages/mall/cart' })
}
</script>

<style lang="scss">
.container { min-height: 100vh; padding-bottom: 20rpx; }

.category-bar {
	white-space: nowrap;
	background: #FFFDE7;
	padding: 20rpx 30rpx;
	border-bottom: 4rpx solid #6D4C41;
	.cat-item {
		display: inline-block;
		padding: 12rpx 24rpx;
		margin-right: 16rpx;
		font-size: 26rpx;
		font-weight: bold;
		background: #F5E6CC;
		color: #6D4C41;
		border: 3rpx solid #6D4C41;
		box-shadow: 3rpx 3rpx 0 #3E2723;
		&.active {
			background: #4CAF50;
			color: #FFF8E1;
			border-color: #2E7D32;
			box-shadow: 3rpx 3rpx 0 #1B5E20;
		}
	}
}

.product-grid {
	display: flex; flex-wrap: wrap; padding: 20rpx; gap: 20rpx;
}
.product-card {
	width: calc(50% - 10rpx);
	padding: 0 !important;
	overflow: hidden;
}
.product-img {
	width: 100%;
	height: 300rpx;
	border-bottom: 3rpx solid #6D4C41;
	image-rendering: pixelated;
}
.product-info { padding: 16rpx 20rpx; }
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
	margin-top: 12rpx;
}
.product-sales { font-size: 22rpx; color: #8D6E63; }

.cart-float {
	position: fixed; right: 40rpx; bottom: 140rpx;
	width: 110rpx; height: 110rpx;
	background: #FFC107;
	border: 4rpx solid #FF8F00;
	box-shadow: 6rpx 6rpx 0 #E65100;
	display: flex; align-items: center; justify-content: center;
}
.cart-icon { font-size: 50rpx; }
.cart-badge {
	position: absolute; top: -10rpx; right: -10rpx;
}
</style>
