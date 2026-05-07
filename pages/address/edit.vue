<template>
	<view class="container">
		<view class="form">
			<view class="form-item">
				<text class="label">收货人</text>
				<input v-model="form.name" placeholder="请输入收货人姓名" />
			</view>
			<view class="form-item">
				<text class="label">联系电话</text>
				<input v-model="form.phone" type="number" maxlength="11" placeholder="请输入手机号" />
			</view>
			<view class="form-item">
				<text class="label">省份</text>
				<input v-model="form.province" placeholder="请输入省份" />
			</view>
			<view class="form-item">
				<text class="label">城市</text>
				<input v-model="form.city" placeholder="请输入城市" />
			</view>
			<view class="form-item">
				<text class="label">区县</text>
				<input v-model="form.district" placeholder="请输入区县" />
			</view>
			<view class="form-item">
				<text class="label">详细地址</text>
				<textarea v-model="form.detail" placeholder="请输入详细地址（街道、门牌号等）" />
			</view>
			<view class="form-item switch-item">
				<text class="label">设为默认地址</text>
				<switch :checked="form.isDefault === 1" @change="e => form.isDefault = e.detail.value ? 1 : 0" />
			</view>
		</view>

		<view class="btn-save" @click="save">保存</view>
		<view class="btn-delete" v-if="isEdit" @click="deleteAddress">删除地址</view>
	</view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { get, post, put, del } from '@/utils/request'

const isEdit = ref(false)
const addressId = ref(null)
const form = reactive({
	name: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: 0
})

onMounted(() => {
	const pages = getCurrentPages()
	const page = pages[pages.length - 1]
	if (page.$page?.options?.id) {
		addressId.value = page.$page.options.id
		isEdit.value = true
		loadAddress()
	}
})

const loadAddress = async () => {
	try {
		const res = await get(`/api/address/${addressId.value}`)
		Object.assign(form, res.data)
	} catch (e) { console.error('加载地址失败', e) }
}

const save = async () => {
	if (!form.name) return uni.showToast({ title: '请输入收货人', icon: 'none' })
	if (!form.phone) return uni.showToast({ title: '请输入电话', icon: 'none' })
	if (!form.detail) return uni.showToast({ title: '请输入详细地址', icon: 'none' })
	try {
		if (isEdit.value) {
			await put('/api/address/update', { id: addressId.value, ...form })
		} else {
			await post('/api/address/add', form)
		}
		uni.showToast({ title: '保存成功', icon: 'success' })
		setTimeout(() => uni.navigateBack(), 1000)
	} catch (e) { console.error('保存地址失败', e) }
}

const deleteAddress = () => {
	uni.showModal({
		title: '提示', content: '确定删除该地址？',
		success: async (res) => {
			if (res.confirm) {
				await del(`/api/address/${addressId.value}`)
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
	textarea { width: 100%; height: 120rpx; font-size: 26rpx; }
}
.switch-item {
	display: flex; align-items: center; justify-content: space-between;
	.label { margin-bottom: 0; }
}
.btn-save {
	margin-top: 40rpx; text-align: center; padding: 28rpx;
	background: #FF9500; color: #fff; border-radius: 40rpx; font-size: 30rpx;
}
.btn-delete {
	margin-top: 20rpx; text-align: center; padding: 28rpx;
	color: #FF5252; font-size: 28rpx;
}
</style>
