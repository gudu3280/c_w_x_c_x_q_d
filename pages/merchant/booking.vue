<template>
	<view class="container">
		<view class="form">
			<!-- 选择宠物 -->
			<view class="form-item">
				<text class="label">选择宠物</text>
				<picker :range="petNames" @change="onPetChange">
					<text class="picker-text">{{ selectedPet ? selectedPet.name : '请选择宠物' }}</text>
				</picker>
			</view>

			<!-- 宠物健康信息卡片（选择宠物后显示） -->
			<view class="pet-info-card" v-if="selectedPet">
				<text class="pet-info-title">📋 宠物健康信息（将分享给商家）</text>
				<view class="pet-info-row">
					<text class="pet-info-label">品种</text>
					<text class="pet-info-val">{{ selectedPet.breed || '未填写' }}</text>
				</view>
				<view class="pet-info-row">
					<text class="pet-info-label">体重</text>
					<text class="pet-info-val">{{ selectedPet.weight ? selectedPet.weight + 'kg' : '未填写' }}</text>
				</view>
				<view class="pet-info-row">
					<text class="pet-info-label">绝育</text>
					<text class="pet-info-val">{{ selectedPet.isNeutered === 1 ? '✅ 已绝育' : '❌ 未绝育' }}</text>
				</view>
				<view class="pet-info-row" v-if="selectedPet.vaccineRecord">
					<text class="pet-info-label">💉 疫苗</text>
					<text class="pet-info-val">{{ selectedPet.vaccineRecord }}</text>
				</view>
				<view class="pet-info-row warn" v-if="!selectedPet.vaccineRecord">
					<text class="pet-info-label">💉 疫苗</text>
					<text class="pet-info-val">⚠️ 未填写疫苗记录，建议补充</text>
				</view>
				<view class="pet-info-row" v-if="selectedPet.medicalHistory">
					<text class="pet-info-label">🏥 病史</text>
					<text class="pet-info-val">{{ selectedPet.medicalHistory }}</text>
				</view>
				<view class="pet-info-row" v-if="selectedPet.habit">
					<text class="pet-info-label">📝 习惯</text>
					<text class="pet-info-val">{{ selectedPet.habit }}</text>
				</view>
			</view>

			<!-- 服务类型 -->
			<view class="form-item">
				<text class="label">服务类型</text>
				<view class="type-tabs">
					<view class="tab" :class="{ active: orderType === 'boarding' }" @click="orderType='boarding'">寄养</view>
					<view class="tab" :class="{ active: orderType === 'grooming' }" @click="orderType='grooming'">美容</view>
				</view>
			</view>

			<!-- 寄养选项 -->
			<template v-if="orderType === 'boarding'">
				<view class="form-item">
					<text class="label">开始日期</text>
					<picker mode="date" :start="today" @change="e => startDate = e.detail.value">
						<text class="picker-text">{{ startDate || '请选择' }}</text>
					</picker>
				</view>
				<view class="form-item">
					<text class="label">结束日期</text>
					<picker mode="date" :start="startDate || today" @change="e => endDate = e.detail.value">
						<text class="picker-text">{{ endDate || '请选择' }}</text>
					</picker>
				</view>
			</template>

			<!-- 美容选项 -->
			<template v-if="orderType === 'grooming'">
				<view class="form-item">
					<text class="label">选择服务</text>
					<picker :range="serviceNames" @change="onServiceChange">
						<text class="picker-text">{{ selectedService ? selectedService.serviceName : '请选择服务' }}</text>
					</picker>
				</view>
				<view class="form-item">
					<text class="label">预约日期</text>
					<picker mode="date" :start="today" @change="e => startDate = e.detail.value">
						<text class="picker-text">{{ startDate || '请选择' }}</text>
					</picker>
				</view>
			</template>

			<!-- 备注 -->
			<view class="form-item">
				<text class="label">备注</text>
				<textarea v-model="remark" placeholder="特殊需求（如自带粮、每日遛狗次数等）" />
			</view>
		</view>

		<!-- 价格和提交 -->
		<view class="bottom-bar">
			<view class="price-info">
				<text class="price-label">预估费用</text>
				<text class="price-value">¥{{ totalAmount }}</text>
			</view>
			<view class="btn-submit" @click="submitBooking">
				<text>提交预约</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { get, post } from '@/utils/request'

const merchantId = ref(0)
const orderType = ref('boarding')
const pets = ref([])
const selectedPet = ref(null)
const startDate = ref('')
const endDate = ref('')
const remark = ref('')
const groomingServices = ref([])
const boardingSetting = ref(null)
const selectedService = ref(null)
const today = new Date().toISOString().split('T')[0]

const petNames = computed(() => pets.value.map(p => p.name))
const serviceNames = computed(() => groomingServices.value.map(s => s.serviceName))

const totalAmount = computed(() => {
	if (orderType.value === 'grooming' && selectedService.value) {
		return selectedService.value.price
	}
	if (orderType.value === 'boarding' && startDate.value && endDate.value) {
		const days = Math.ceil((new Date(endDate.value) - new Date(startDate.value)) / 86400000) + 1
		const pricePerDay = getBoardingPricePerDay()
		return days * pricePerDay
	}
	return 0
})

onMounted(() => {
	const pages = getCurrentPages()
	const page = pages[pages.length - 1]
	merchantId.value = page.$page?.options?.id
	loadPets()
	loadServices()
})

const loadPets = async () => {
	try {
		const res = await get('/api/pet/list')
		pets.value = res.data || []
	} catch (e) { console.error('加载宠物失败', e) }
}

const loadServices = async () => {
	try {
		const res = await get(`/api/merchant/${merchantId.value}`)
		groomingServices.value = res.data.groomingServices || []
		boardingSetting.value = res.data.boardingSetting || null
	} catch (e) { console.error('加载服务失败', e) }
}

const getBoardingPricePerDay = () => {
	const setting = boardingSetting.value
	if (!setting) return 100
	const weight = selectedPet.value?.weight
	if (!weight) return setting.smallDogPrice || 100
	// 体重档位匹配
	if (weight < 10) return setting.smallDogPrice || 100
	if (weight < 25) return setting.mediumDogPrice || 100
	return setting.bigDogPrice || 100
}

const onPetChange = (e) => {
	selectedPet.value = pets.value[e.detail.value]
}
const onServiceChange = (e) => {
	selectedService.value = groomingServices.value[e.detail.value]
}

const submitBooking = async () => {
	if (!selectedPet.value) {
		return uni.showToast({ title: '请选择宠物', icon: 'none' })
	}
	if (!startDate.value) {
		return uni.showToast({ title: '请选择日期', icon: 'none' })
	}

	try {
		const data = {
			merchantId: merchantId.value,
			petId: selectedPet.value.id,
			orderType: orderType.value,
			startDate: startDate.value,
			endDate: orderType.value === 'boarding' ? endDate.value : startDate.value,
			groomingServiceId: selectedService.value?.id,
			totalAmount: totalAmount.value,
			remark: remark.value
		}
		const res = await post('/api/booking/create', data)
		uni.showToast({ title: '预约成功', icon: 'success' })
		// 模拟支付
		setTimeout(async () => {
			await post('/api/pay/wx/callback', {
				orderNo: res.data.orderNo,
				orderType: 'booking'
			})
			uni.navigateBack()
		}, 1000)
	} catch (e) {
		console.log('预约失败', e)
	}
}
</script>

<style lang="scss">
.container { padding-bottom: 140rpx; background: #f5f5f5; min-height: 100vh; }
.form { padding: 20rpx 30rpx; }
.form-item {
	background: #fff; border-radius: 12rpx; padding: 24rpx 30rpx; margin-bottom: 16rpx;
	.label { font-size: 28rpx; color: #333; font-weight: bold; display: block; margin-bottom: 16rpx; }
	.picker-text { font-size: 28rpx; color: #666; }
	textarea { width: 100%; height: 150rpx; font-size: 26rpx; }
}
.type-tabs {
	display: flex; gap: 16rpx;
	.tab {
		padding: 12rpx 30rpx; border-radius: 30rpx;
		font-size: 26rpx; background: #f5f5f5; color: #666;
		&.active { background: #FF9500; color: #fff; }
	}
}

// 宠物信息卡片
.pet-info-card {
	background: #FFF8E1;
	border: 3rpx solid #FFB74D;
	border-radius: 12rpx;
	padding: 20rpx 24rpx;
	margin-bottom: 16rpx;
}
.pet-info-title {
	font-size: 24rpx;
	color: #E65100;
	font-weight: bold;
	display: block;
	margin-bottom: 12rpx;
	padding-bottom: 8rpx;
	border-bottom: 2rpx dashed #FFCC80;
}
.pet-info-row {
	display: flex;
	padding: 6rpx 0;
	&.warn { background: #FFF3E0; border-radius: 6rpx; padding: 6rpx 8rpx; }
}
.pet-info-label {
	width: 100rpx;
	font-size: 24rpx;
	color: #8D6E63;
	flex-shrink: 0;
}
.pet-info-val {
	flex: 1;
	font-size: 24rpx;
	color: #3E2723;
	.warn & { color: #E65100; }
}

.bottom-bar {
	position: fixed; bottom: 0; left: 0; right: 0;
	display: flex; align-items: center; padding: 20rpx 30rpx;
	background: #fff; box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
}
.price-info { flex: 1; }
.price-label { font-size: 24rpx; color: #999; }
.price-value { font-size: 36rpx; color: #FF9500; font-weight: bold; margin-left: 10rpx; }
.btn-submit {
	padding: 24rpx 60rpx; border-radius: 40rpx;
	background: #FF9500; color: #fff; font-size: 28rpx; font-weight: bold;
}
</style>
