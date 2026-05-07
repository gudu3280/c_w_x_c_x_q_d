<template>
	<view class="container">
		<!-- 商家封面 -->
		<view class="header">
			<image class="cover" :src="merchant.coverImage || '/static/logo.png'" mode="aspectFill" />
			<view class="info pixel-card">
				<text class="name">🏪 {{ merchant.name }}</text>
				<text class="address">📍 {{ merchant.address }}</text>
				<text class="hours">🕐 营业时间: {{ merchant.businessHours }}</text>
				<view class="score-row">
					<text class="score">⭐ {{ merchant.avgScore }}</text>
					<text class="reviews">{{ merchant.reviewCount }}条评价</text>
				</view>
			</view>
		</view>

		<!-- 可预约日历 -->
		<view class="section pixel-card">
			<text class="pixel-title">📅 可预约日期</text>
			<view class="pixel-divider"></view>

			<!-- 月切换 -->
			<view class="calendar-nav">
				<text class="nav-btn" @click="prevMonth">◀</text>
				<text class="nav-title">{{ calendarYear }}年{{ calendarMonth }}月</text>
				<text class="nav-btn" @click="nextMonth">▶</text>
			</view>

			<!-- 星期头 -->
			<view class="calendar-weekdays">
				<text class="weekday" v-for="d in weekdays" :key="d">{{ d }}</text>
			</view>

			<!-- 日期格子 -->
			<view class="calendar-grid">
				<view
					class="calendar-cell"
					:class="{
						empty: !d.day,
						available: d.status === 'available',
						full: d.status === 'full',
						closed: d.status === 'closed',
						selected: selectedDate === d.dateStr,
						past: d.isPast
					}"
					v-for="(d, idx) in calendarDays"
					:key="idx"
					@click="selectDate(d)"
				>
					<text class="day-num" v-if="d.day">{{ d.day }}</text>
					<view class="day-dot" v-if="d.day && d.status">
						<text>{{ d.status === 'available' ? '✓' : d.status === 'full' ? '满' : '休' }}</text>
					</view>
				</view>
			</view>

			<!-- 图例 -->
			<view class="calendar-legend">
				<view class="legend-item"><text class="dot green"></text><text>可预约</text></view>
				<view class="legend-item"><text class="dot orange"></text><text>已约满</text></view>
				<view class="legend-item"><text class="dot red"></text><text>休息</text></view>
			</view>

			<!-- 已选日期提示 -->
			<view class="calendar-selected" v-if="selectedDate">
				<text>已选择：📅 {{ selectedDate }}</text>
				<view class="pixel-btn" @click="goBookingWithDate" style="margin-top:16rpx;">
					<text>📋 预约这一天</text>
				</view>
			</view>
		</view>

		<!-- 寄养价格 -->
		<view class="section pixel-card" v-if="boardingSetting">
			<text class="pixel-title">💰 寄养价格（元/天）</text>
			<view class="pixel-divider"></view>
			<view class="price-grid">
				<view class="price-item pixel-card">
					<text class="price-label">🐕 小型犬</text>
					<text class="price-value">¥{{ boardingSetting.smallDogPrice }}</text>
				</view>
				<view class="price-item pixel-card">
					<text class="price-label">🐕 中型犬</text>
					<text class="price-value">¥{{ boardingSetting.mediumDogPrice }}</text>
				</view>
				<view class="price-item pixel-card">
					<text class="price-label">🦮 大型犬</text>
					<text class="price-value">¥{{ boardingSetting.bigDogPrice }}</text>
				</view>
				<view class="price-item pixel-card" v-if="boardingSetting.catPrice">
					<text class="price-label">🐱 猫咪</text>
					<text class="price-value">¥{{ boardingSetting.catPrice }}</text>
				</view>
			</view>
		</view>

		<!-- 美容服务 -->
		<view class="section pixel-card" v-if="groomingServices.length > 0">
			<text class="pixel-title">✂️ 美容服务</text>
			<view class="pixel-divider"></view>
			<view class="grooming-list">
				<view class="grooming-item" v-for="item in groomingServices" :key="item.id">
					<view class="grooming-info">
						<text class="grooming-name">{{ item.serviceName }}</text>
						<text class="grooming-desc">{{ item.description }} | {{ item.duration }}分钟</text>
					</view>
					<text class="pixel-price">¥{{ item.price }}</text>
				</view>
			</view>
		</view>

		<!-- 预约按钮 -->
		<view class="bottom-bar">
			<view class="pixel-btn pixel-btn-brown" @click="callMerchant">
				<text>📞 电话咨询</text>
			</view>
			<view class="pixel-btn" @click="goBooking">
				<text>📋 立即预约</text>
			</view>
		</view>

		<!-- 用户评价 -->
		<view class="section pixel-card" style="margin-bottom:140rpx;">
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
				<text class="empty-emoji">💬</text>
				<text class="empty-text">暂无评价，快来预约体验吧</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { get } from '@/utils/request'

const merchant = ref({})
const boardingSetting = ref(null)
const groomingServices = ref([])
const merchantId = ref(0)
const reviews = ref([])

// 日历状态
const weekdays = ['一', '二', '三', '四', '五', '六', '日']
const calendarYear = ref(0)
const calendarMonth = ref(0)
const calendarDays = ref([])
const selectedDate = ref('')
const calendarDataMap = ref({})

onMounted(() => {
	const pages = getCurrentPages()
	const page = pages[pages.length - 1]
	merchantId.value = page.$page?.options?.id
	loadDetail()
	loadReviews()
	initCalendar()
})

const loadReviews = async () => {
	try {
		const res = await get(`/api/review/merchant/${merchantId.value}`, { page: 1, size: 20 })
		reviews.value = res.data?.records || []
	} catch (e) { console.error('加载评价失败', e) }
}

const loadDetail = async () => {
	try {
		const res = await get(`/api/merchant/${merchantId.value}`)
		merchant.value = res.data.merchant || {}
		boardingSetting.value = res.data.boardingSetting
		groomingServices.value = res.data.groomingServices || []
	} catch (e) {
		console.log('加载失败', e)
	}
}

const callMerchant = () => {
	if (merchant.value.phone) {
		uni.makePhoneCall({ phoneNumber: merchant.value.phone })
	}
}

const goBooking = () => {
	const url = selectedDate.value
		? `/pages/merchant/booking?id=${merchantId.value}&date=${selectedDate.value}`
		: `/pages/merchant/booking?id=${merchantId.value}`
	uni.navigateTo({ url })
}

const goBookingWithDate = () => {
	if (!selectedDate.value) return
	uni.navigateTo({ url: `/pages/merchant/booking?id=${merchantId.value}&date=${selectedDate.value}` })
}

// ========== 日历 ==========
const initCalendar = () => {
	const now = new Date()
	calendarYear.value = now.getFullYear()
	calendarMonth.value = now.getMonth() + 1
	loadCalendarData()
}

const prevMonth = () => {
	if (calendarMonth.value === 1) {
		calendarYear.value--
		calendarMonth.value = 12
	} else {
		calendarMonth.value--
	}
	selectedDate.value = ''
	loadCalendarData()
}

const nextMonth = () => {
	if (calendarMonth.value === 12) {
		calendarYear.value++
		calendarMonth.value = 1
	} else {
		calendarMonth.value++
	}
	selectedDate.value = ''
	loadCalendarData()
}

const loadCalendarData = async () => {
	const ym = `${calendarYear.value}-${String(calendarMonth.value).padStart(2, '0')}`
	try {
		const res = await get('/api/merchant/calendar', { merchantId: merchantId.value, yearMonth: ym })
		const list = res.data || []
		const map = {}
		list.forEach(item => {
			const dateStr = item.serviceDate || ''
			let status = 'available'
			if (item.isClosed === 1) status = 'closed'
			else if (item.usedCapacity >= item.totalCapacity) status = 'full'
			map[dateStr] = status
		})
		calendarDataMap.value = map
	} catch (e) { console.error('加载日历失败', e) }
	buildCalendarDays()
}

const buildCalendarDays = () => {
	const days = []
	const year = calendarYear.value
	const month = calendarMonth.value
	const firstDay = new Date(year, month - 1, 1)
	const lastDay = new Date(year, month, 0)
	const totalDays = lastDay.getDate()
	// 周一=0
	let startWeekDay = firstDay.getDay()
	startWeekDay = startWeekDay === 0 ? 6 : startWeekDay - 1

	const today = new Date()
	const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

	// 前置空白
	for (let i = 0; i < startWeekDay; i++) {
		days.push({ day: null })
	}

	for (let d = 1; d <= totalDays; d++) {
		const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
		const status = calendarDataMap.value[dateStr] || ''
		const isPast = dateStr < todayStr
		days.push({ day: d, dateStr, status, isPast })
	}

	calendarDays.value = days
}

const selectDate = (d) => {
	if (!d.day || d.isPast || d.status === 'closed') return
	selectedDate.value = d.dateStr === selectedDate.value ? '' : d.dateStr
}
</script>

<style lang="scss">
.container { padding-bottom: 120rpx; }
.header {
	.cover { width: 100%; height: 400rpx; border-bottom: 4rpx solid #6D4C41; }
	.info { margin: 20rpx 30rpx; }
	.name { font-size: 36rpx; font-weight: bold; color: #3E2723; display: block; }
	.address { font-size: 26rpx; color: #8D6E63; margin-top: 10rpx; display: block; }
	.hours { font-size: 24rpx; color: #A1887F; margin-top: 8rpx; display: block; }
	.score-row { display: flex; align-items: center; margin-top: 12rpx; gap: 20rpx; }
	.score { color: #FF8F00; font-size: 28rpx; font-weight: bold; }
	.reviews { color: #8D6E63; font-size: 24rpx; }
}
.section { margin: 20rpx 30rpx; }
.price-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.price-item {
	flex: 1; min-width: 42%;
	padding: 16rpx 20rpx !important;
	text-align: center;
	margin-bottom: 0 !important;
}
.price-label { font-size: 24rpx; color: #8D6E63; display: block; }
.price-value { font-size: 30rpx; color: #FF8F00; font-weight: bold; margin-top: 8rpx; display: block; }

.grooming-list { display: flex; flex-direction: column; gap: 16rpx; }
.grooming-item {
	display: flex; justify-content: space-between; align-items: center;
	padding: 20rpx; background: #F5E6CC; border: 2rpx solid #D7CCC8;
}
.grooming-info { flex: 1; }
.grooming-name { font-size: 28rpx; color: #3E2723; font-weight: bold; display: block; }
.grooming-desc { font-size: 22rpx; color: #8D6E63; margin-top: 6rpx; display: block; }

.bottom-bar {
	position: fixed; bottom: 0; left: 0; right: 0;
	display: flex; padding: 20rpx 30rpx; gap: 20rpx;
	background: #FFFDE7; border-top: 4rpx solid #6D4C41;
}

// 评价列表
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

// 日历
.calendar-nav {
	display: flex; justify-content: space-between; align-items: center;
	padding: 10rpx 0 20rpx;
}
.nav-btn { font-size: 32rpx; color: #6D4C41; padding: 8rpx 20rpx; }
.nav-title { font-size: 30rpx; font-weight: bold; color: #3E2723; }

.calendar-weekdays {
	display: flex;
	padding-bottom: 12rpx;
	border-bottom: 2rpx solid #D7CCC8;
}
.weekday {
	flex: 1; text-align: center; font-size: 24rpx; color: #8D6E63; font-weight: bold;
}

.calendar-grid {
	display: flex; flex-wrap: wrap;
}
.calendar-cell {
	width: calc(100% / 7);
	aspect-ratio: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	border-radius: 8rpx;
	margin-top: 6rpx;
	position: relative;

	&.empty { pointer-events: none; }
	&.past { opacity: 0.35; pointer-events: none; }
	&.closed { background: #FFEBEE; }
	&.full { background: #FFF3E0; }
	&.available { background: #E8F5E9; }
	&.selected { border: 3rpx solid #66BB6A; transform: scale(1.05); }

	.day-num { font-size: 28rpx; color: #3E2723; font-weight: bold; }
	.day-dot {
		margin-top: 2rpx;
		text { font-size: 18rpx; color: #A1887F; }
		.available & text { color: #43A047; }
		.full & text { color: #EF6C00; }
		.closed & text { color: #E53935; }
	}
}

.calendar-legend {
	display: flex; gap: 30rpx; margin-top: 20rpx; padding-top: 16rpx;
	border-top: 2rpx dashed #D7CCC8;
}
.legend-item {
	display: flex; align-items: center; gap: 8rpx; font-size: 22rpx; color: #8D6E63;
}
.dot {
	width: 24rpx; height: 24rpx; border-radius: 50%;
	&.green { background: #A5D6A7; }
	&.orange { background: #FFCC80; }
	&.red { background: #EF9A9A; }
}

.calendar-selected {
	margin-top: 24rpx; padding: 20rpx;
	background: #E8F5E9; border-radius: 12rpx;
	text-align: center;
	text { font-size: 28rpx; color: #2E7D32; }
}
</style>
