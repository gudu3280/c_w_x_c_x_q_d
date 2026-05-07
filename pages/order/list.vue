<template>
	<view class="container">
		<!-- Tab切换 -->
		<view class="type-tabs">
			<view class="tab" :class="{ active: currentTab === 'booking' }" @click="currentTab='booking'">📋 预约订单</view>
			<view class="tab" :class="{ active: currentTab === 'mall' }" @click="currentTab='mall'">📦 商城订单</view>
		</view>

		<!-- 预约订单 -->
		<view v-if="currentTab === 'booking'">
			<view class="order-card pixel-card" v-for="item in bookingOrders" :key="item.id">
				<view class="order-header">
					<text class="order-no">{{ item.orderNo }}</text>
					<text class="order-status pixel-tag" :class="item.status === 'paid' ? 'pixel-tag-green' : ''">{{ statusMap[item.status] }}</text>
				</view>
				<view class="order-body">
					<text class="order-type">{{ item.orderType === 'boarding' ? '🏠 寄养' : '✂️ 美容' }}</text>
					<text class="order-date">{{ item.startDate }} {{ item.endDate ? ' ~ ' + item.endDate : '' }}</text>
				</view>
				<view class="order-footer">
					<text class="pixel-price">¥{{ item.totalAmount }}</text>
					<view class="pixel-btn" v-if="item.status === 'pending_pay'" @click="cancelBooking(item.id)" style="padding:6rpx 20rpx;font-size:22rpx;">取消</view>
					<view class="pixel-btn pixel-btn-gold" v-if="item.status === 'completed'" @click="goReview(item)" style="padding:6rpx 20rpx;font-size:22rpx;">评价</view>
				</view>
			</view>
			<view class="empty-state pixel-card" v-if="bookingOrders.length === 0">
				<text class="empty-emoji">📋</text>
				<text class="empty-text">暂无预约订单</text>
			</view>
		</view>

		<!-- 商城订单 -->
		<view v-if="currentTab === 'mall'">
			<view class="order-card pixel-card" v-for="item in mallOrders" :key="item.id">
				<view class="order-header">
					<text class="order-no">{{ item.orderNo }}</text>
					<text class="order-status pixel-tag" :class="item.status === 'shipped' ? 'pixel-tag-blue' : ''">{{ statusMap[item.status] }}</text>
				</view>
				<view class="order-footer">
					<text class="pixel-price">¥{{ item.totalAmount }}</text>
					<text class="order-time">{{ item.createTime }}</text>
				</view>
			</view>
			<view class="empty-state pixel-card" v-if="mallOrders.length === 0">
				<text class="empty-emoji">📦</text>
				<text class="empty-text">暂无商城订单</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { get, post } from '@/utils/request'

const currentTab = ref('booking')
const bookingOrders = ref([])
const mallOrders = ref([])
const statusMap = {
	pending_pay: '待支付', paid: '已支付', in_service: '服务中',
	completed: '已完成', cancelled: '已取消', shipped: '已发货'
}

onMounted(() => {
	loadBookingOrders()
	loadMallOrders()
})

const loadBookingOrders = async () => {
	try {
		const res = await get('/api/booking/list')
		bookingOrders.value = res.data || []
	} catch (e) { console.error('加载预约订单失败', e) }
}
const loadMallOrders = async () => {
	try {
		const res = await get('/api/order/mall/list')
		mallOrders.value = res.data || []
	} catch (e) { console.error('加载商城订单失败', e) }
}
const cancelBooking = async (id) => {
	uni.showModal({
		title: '提示', content: '确定取消该订单？',
		success: async (res) => {
			if (res.confirm) { await post(`/api/booking/cancel/${id}`); loadBookingOrders() }
		}
	})
}
const goReview = (item) => {
	uni.navigateTo({
		url: `/pages/review/add?targetType=booking&targetId=${item.id}&merchantId=${item.merchantId}`
	})
}
</script>

<style lang="scss">
.container { min-height: 100vh; }
.type-tabs {
	display: flex;
	background: #FFFDE7;
	padding: 20rpx 30rpx;
	gap: 20rpx;
	border-bottom: 4rpx solid #6D4C41;
	.tab {
		flex: 1; text-align: center; padding: 16rpx;
		font-size: 28rpx; font-weight: bold;
		background: #F5E6CC; color: #6D4C41;
		border: 3rpx solid #6D4C41;
		box-shadow: 3rpx 3rpx 0 #3E2723;
		&.active { background: #4CAF50; color: #FFF8E1; border-color: #2E7D32; }
	}
}
.order-card { margin: 20rpx 30rpx; }
.order-header { display: flex; justify-content: space-between; margin-bottom: 16rpx; }
.order-no { font-size: 24rpx; color: #8D6E63; }
.order-body { margin-bottom: 16rpx; }
.order-type { font-size: 28rpx; color: #3E2723; font-weight: bold; margin-right: 16rpx; }
.order-date { font-size: 24rpx; color: #A1887F; }
.order-footer { display: flex; justify-content: space-between; align-items: center; }
.order-time { font-size: 22rpx; color: #A1887F; }

.empty-state { text-align: center; padding: 100rpx 0 !important; margin: 20rpx 30rpx; }
.empty-emoji { font-size: 72rpx; display: block; margin-bottom: 20rpx; }
.empty-text { font-size: 28rpx; color: #8D6E63; }
</style>
