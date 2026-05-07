<template>
	<view class="container">
		<view class="pet-list" v-if="pets.length > 0">
			<view class="pet-card pixel-card" v-for="item in pets" :key="item.id" @click="editPet(item.id)">
				<image class="pet-img" :src="item.photoUrl || '/static/logo.png'" mode="aspectFill" />
				<view class="pet-info">
					<text class="pet-name">{{ item.name }}</text>
					<text class="pet-breed">{{ item.breed }} | {{ item.gender === 1 ? '♂公' : item.gender === 2 ? '♀母' : '未知' }}</text>
					<text class="pet-detail">{{ item.weight || '?' }}kg | {{ item.isNeutered ? '已绝育' : '未绝育' }}</text>
					<text class="pet-medical" v-if="item.medicalHistory">🏥 {{ item.medicalHistory.substring(0, 30) }}{{ item.medicalHistory.length > 30 ? '...' : '' }}</text>
					<text class="pet-vaccine" v-if="item.vaccineRecord">💉 {{ item.vaccineRecord.substring(0, 30) }}{{ item.vaccineRecord.length > 30 ? '...' : '' }}</text>
				</view>
			</view>
		</view>

		<view class="empty-state pixel-card" v-else>
			<text class="empty-emoji">🐾</text>
			<text class="empty-text">还没有添加宠物哦</text>
		</view>

		<view class="add-section">
			<view class="pixel-btn" @click="addPet">+ 添加新宠物</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { get } from '@/utils/request'

const pets = ref([])
onMounted(() => { loadPets() })

const loadPets = async () => {
	try {
		const res = await get('/api/pet/list')
		pets.value = res.data || []
	} catch (e) { console.error('加载宠物列表失败', e) }
}

const addPet = () => { uni.navigateTo({ url: '/pages/pet/edit' }) }
const editPet = (id) => { uni.navigateTo({ url: `/pages/pet/edit?id=${id}` }) }
</script>

<style lang="scss">
.container { min-height: 100vh; padding: 20rpx 30rpx; }
.pet-card {
	display: flex !important;
	flex-direction: row !important;
	padding: 20rpx !important;
}
.pet-img { width: 130rpx; height: 130rpx; border: 3rpx solid #6D4C41; margin-right: 20rpx; }
.pet-info { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 8rpx; }
.pet-name { font-size: 30rpx; font-weight: bold; color: #3E2723; }
.pet-breed { font-size: 24rpx; color: #8D6E63; }
.pet-detail { font-size: 22rpx; color: #A1887F; }
.pet-medical { font-size: 22rpx; color: #E57373; margin-top: 4rpx; display: block; }
.pet-vaccine { font-size: 22rpx; color: #42A5F5; margin-top: 2rpx; display: block; }

.empty-state { text-align: center; padding: 100rpx 0 !important; }
.empty-emoji { font-size: 80rpx; display: block; margin-bottom: 20rpx; }
.empty-text { font-size: 28rpx; color: #8D6E63; }

.add-section { margin-top: 30rpx; }
</style>
