<template>
	<view class="container">
		<!-- 收货地址 -->
		<view class="address-section pixel-card" v-if="cartList.length > 0">
			<text class="address-label">📦 收货地址</text>
			<view class="address-box" @click="goAddress">
				<text v-if="selectedAddress" class="address-text">
					{{ selectedAddress.name }} {{ selectedAddress.phone }}
					{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }} {{ selectedAddress.detail }}
				</text>
				<text v-else class="address-empty">请选择收货地址 →</text>
			</view>
		</view>

		<view class="cart-list" v-if="cartList.length > 0">
			<view class="cart-item pixel-card" v-for="item in cartList" :key="item.id">
				<image class="item-img" :src="item.product?.mainImage || '/static/logo.png'" mode="aspectFill" />
				<view class="item-info">
					<text class="item-name">{{ item.product?.name }}</text>
					<text class="pixel-price">¥{{ item.product?.price }}</text>
					<view class="quantity-control">
						<view class="qty-btn" @click="changeQty(item, -1)">-</view>
						<text class="qty-num">{{ item.quantity }}</text>
						<view class="qty-btn" @click="changeQty(item, 1)">+</view>
						<view class="delete-btn" @click="removeItem(item.id)">🗑 删除</view>
					</view>
				</view>
			</view>
		</view>

		<view class="empty-state pixel-card" v-else>
			<text class="empty-emoji">🛒</text>
			<text class="empty-text">购物车是空的</text>
			<view class="pixel-btn" @click="goShop">去逛逛</view>
		</view>

		<!-- 底部结算栏 -->
		<view class="bottom-bar" v-if="cartList.length > 0">
			<view class="total">
				<text>合计: </text>
				<text class="total-price">¥{{ totalPrice }}</text>
			</view>
			<view class="pixel-btn pixel-btn-gold" @click="checkout">结算 ({{ cartList.length }})</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/store/cart'
import { get, post } from '@/utils/request'

const cartStore = useCartStore()
const cartList = computed(() => cartStore.cartList)
const totalPrice = computed(() => cartStore.totalPrice)
const selectedAddress = ref(null)

onMounted(() => {
	cartStore.loadCart()
})

const loadDefaultAddress = async () => {
	try {
		const res = await get('/api/address/list')
		const list = res.data || []
		if (list.length > 0) {
			selectedAddress.value = list.find(a => a.isDefault === 1) || list[0]
		}
	} catch (e) { console.error('加载地址失败', e) }
}

const goAddress = () => {
	uni.navigateTo({ url: '/pages/address/list' })
}

// 页面返回时刷新地址
onShow(() => {
	loadDefaultAddress()
})

const changeQty = (item, delta) => {
	const newQty = item.quantity + delta
	if (newQty <= 0) {
		cartStore.removeItem(item.id)
	} else {
		cartStore.updateQuantity(item.id, newQty)
	}
}

const removeItem = (id) => {
	uni.showModal({
		title: '提示', content: '确定删除该商品？',
		success: (res) => {
			if (res.confirm) cartStore.removeItem(id)
		}
	})
}

const checkout = async () => {
	if (!selectedAddress.value) {
		return uni.showToast({ title: '请选择收货地址', icon: 'none' })
	}
	try {
		const addrJson = JSON.stringify(selectedAddress.value)
		const res = await post('/api/order/create', { addressJson: addrJson })
		await post('/api/pay/wx/callback', { orderNo: res.data.orderNo, orderType: 'mall' })
		uni.showToast({ title: '下单成功', icon: 'success' })
		cartStore.loadCart()
	} catch (e) { console.error('下单失败', e) }
}

const goShop = () => {
	uni.switchTab({ url: '/pages/mall/list' })
}
</script>

<style lang="scss">
.container { min-height: 100vh; padding-bottom: 120rpx; }

// 地址区域
.address-section { margin: 20rpx 30rpx; }
.address-label { font-size: 24rpx; color: #8D6E63; display: block; margin-bottom: 10rpx; }
.address-box {
	background: #E8F5E9;
	border: 3rpx dashed #81C784;
	border-radius: 12rpx;
	padding: 20rpx;
}
.address-text { font-size: 26rpx; color: #2E7D32; line-height: 1.6; }
.address-empty { font-size: 26rpx; color: #A1887F; text-align: center; display: block; }

.cart-list { padding: 20rpx 30rpx; }
.cart-item {
	display: flex !important;
	flex-direction: row !important;
	padding: 20rpx !important;
}
.item-img { width: 150rpx; height: 150rpx; border: 3rpx solid #6D4C41; margin-right: 20rpx; }
.item-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.item-name { font-size: 26rpx; color: #3E2723; font-weight: bold; }
.quantity-control { display: flex; align-items: center; gap: 16rpx; }
.qty-btn {
	width: 48rpx; height: 48rpx;
	background: #F5E6CC; border: 2rpx solid #6D4C41;
	display: flex; align-items: center; justify-content: center;
	font-size: 28rpx; font-weight: bold; color: #3E2723;
}
.qty-num { font-size: 28rpx; min-width: 40rpx; text-align: center; }
.delete-btn { margin-left: auto; font-size: 24rpx; color: #E53935; }

.empty-state { text-align: center; padding: 160rpx 0 !important; margin: 20rpx 30rpx; }
.empty-emoji { font-size: 80rpx; display: block; margin-bottom: 20rpx; }
.empty-text { font-size: 28rpx; color: #8D6E63; display: block; margin-bottom: 30rpx; }

.bottom-bar {
	position: fixed; bottom: 0; left: 0; right: 0;
	display: flex; align-items: center; justify-content: space-between;
	padding: 20rpx 30rpx; background: #FFFDE7; border-top: 4rpx solid #6D4C41;
}
.total { font-size: 26rpx; color: #3E2723; }
.total-price { font-size: 34rpx; color: #FF8F00; font-weight: bold; }
</style>
