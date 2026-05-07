<template>
	<view class="container">
		<view class="form">
			<view class="form-item">
				<text class="label">宠物昵称</text>
				<input v-model="form.name" placeholder="请输入宠物昵称" />
			</view>
			<view class="form-item">
				<text class="label">品种</text>
				<input v-model="form.breed" placeholder="如：金毛、英短" />
			</view>
			<view class="form-item">
				<text class="label">性别</text>
				<view class="radio-group">
					<view class="radio-item" :class="{ active: form.gender === 1 }" @click="form.gender = 1">公</view>
					<view class="radio-item" :class="{ active: form.gender === 2 }" @click="form.gender = 2">母</view>
				</view>
			</view>
			<view class="form-item">
				<text class="label">出生日期</text>
				<picker mode="date" @change="e => form.birthday = e.detail.value">
					<text class="picker-text">{{ form.birthday || '请选择' }}</text>
				</picker>
			</view>
			<view class="form-item">
				<text class="label">体重(kg)</text>
				<input v-model="form.weight" type="digit" placeholder="请输入体重" />
			</view>
			<view class="form-item">
				<text class="label">是否绝育</text>
				<switch :checked="form.isNeutered === 1" @change="e => form.isNeutered = e.detail.value ? 1 : 0" />
			</view>
			<view class="form-item">
				<text class="label">生活习惯</text>
				<textarea v-model="form.habit" placeholder="喂食习惯、作息、注意事项等" />
			</view>

			<!-- 疫苗记录 -->
			<view class="form-item">
				<text class="label">💉 疫苗记录</text>
				<textarea v-model="form.vaccineRecord" placeholder="疫苗种类、接种时间、下次接种提醒等" />
			</view>

			<!-- 病史/过敏史 -->
			<view class="form-item">
				<text class="label">🏥 病史/过敏史</text>
				<textarea v-model="form.medicalHistory" placeholder="有无病史、过敏史、手术史等" />
			</view>

			<!-- 宠物照片 -->
			<view class="form-item">
				<text class="label">📷 宠物照片 {{ form.photoUrl ? '✓' : '(至少1张)' }}</text>
				<view class="photo-area">
					<image v-if="form.photoUrl" class="photo-preview" :src="form.photoUrl" mode="aspectFill" @click="choosePhoto" />
					<view class="photo-upload" v-else @click="choosePhoto">
						<text class="photo-plus">+</text>
						<text class="photo-hint">点击上传照片</text>
					</view>
				</view>
			</view>
		</view>

		<view class="btn-save" @click="save">保存</view>
		<view class="btn-delete" v-if="isEdit" @click="deletePet">删除宠物</view>
	</view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { get, post, put, del } from '@/utils/request'

const isEdit = ref(false)
const petId = ref(null)
const form = reactive({
	name: '', breed: '', gender: 1, birthday: '', weight: '',
	isNeutered: 0, habit: '', vaccineRecord: '', medicalHistory: '', photoUrl: ''
})

onMounted(() => {
	const pages = getCurrentPages()
	const page = pages[pages.length - 1]
	if (page.$page?.options?.id) {
		petId.value = page.$page.options.id
		isEdit.value = true
		loadPet()
	}
})

const loadPet = async () => {
	try {
		const res = await get(`/api/pet/${petId.value}`)
		Object.assign(form, res.data)
	} catch (e) { console.error('加载宠物失败', e) }
}

const save = async () => {
	if (!form.name) return uni.showToast({ title: '请输入宠物昵称', icon: 'none' })
	try {
		if (isEdit.value) {
			await put('/api/pet/update', { id: petId.value, ...form })
		} else {
			await post('/api/pet/add', form)
		}
		uni.showToast({ title: '保存成功', icon: 'success' })
		setTimeout(() => uni.navigateBack(), 1000)
	} catch (e) { console.error('保存宠物失败', e) }
}

const choosePhoto = () => {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		success: (res) => {
			form.photoUrl = res.tempFilePaths[0]
		},
		fail: () => {
			uni.showToast({ title: '请授权相册权限', icon: 'none' })
		}
	})
}

const deletePet = () => {
	uni.showModal({
		title: '提示', content: '确定删除这个宠物档案？',
		success: async (res) => {
			if (res.confirm) {
				await del(`/api/pet/${petId.value}`)
				uni.showToast({ title: '已删除', icon: 'success' })
				setTimeout(() => uni.navigateBack(), 1000)
			}
		}
	})
}
</script>

<style lang="scss">
.container { background: #f5f5f5; min-height: 100vh; padding: 20rpx 30rpx; }
.form-item {
	background: #fff; border-radius: 12rpx; padding: 24rpx 30rpx; margin-bottom: 16rpx;
	.label { font-size: 28rpx; color: #333; display: block; margin-bottom: 12rpx; }
	input { font-size: 28rpx; }
	textarea { width: 100%; height: 150rpx; font-size: 26rpx; }
	.picker-text { font-size: 28rpx; color: #666; }
}
.radio-group { display: flex; gap: 16rpx; }
.radio-item {
	padding: 10rpx 30rpx; border-radius: 20rpx; font-size: 26rpx;
	background: #f5f5f5; color: #666;
	&.active { background: #FF9500; color: #fff; }
}
.btn-save {
	margin-top: 40rpx; text-align: center; padding: 28rpx;
	background: #FF9500; color: #fff; border-radius: 40rpx; font-size: 30rpx;
}
.btn-delete {
	margin-top: 20rpx; text-align: center; padding: 28rpx;
	color: #FF5252; font-size: 28rpx;
}

.photo-area {
	margin-top: 12rpx;
}
.photo-upload {
	width: 200rpx;
	height: 200rpx;
	border: 4rpx dashed #D7CCC8;
	border-radius: 16rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: #FAFAFA;
}
.photo-plus {
	font-size: 60rpx;
	color: #A1887F;
	line-height: 1;
}
.photo-hint {
	font-size: 22rpx;
	color: #A1887F;
	margin-top: 8rpx;
}
.photo-preview {
	width: 200rpx;
	height: 200rpx;
	border-radius: 16rpx;
	border: 3rpx solid #A5D6A7;
}
</style>
