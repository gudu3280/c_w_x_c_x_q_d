<template>
	<view class="container">
		<view class="login-box pixel-card">
			<view class="logo-area">
				<text class="logo-emoji">🐱</text>
			</view>
			<text class="pixel-title" style="text-align:center;">欢迎来到宠物小镇</text>
			<view class="pixel-divider"></view>

			<view class="input-group">
				<text class="input-label">📱</text>
				<input class="pixel-input" v-model="mobile" type="number" maxlength="11" placeholder="请输入手机号" />
			</view>
			<view class="input-group">
				<text class="input-label">🔑</text>
				<input class="pixel-input" v-model="code" type="number" maxlength="6" placeholder="请输入验证码" />
				<view class="pixel-btn" @click="sendCode" style="padding:8rpx 20rpx;font-size:22rpx;">{{ codeText }}</view>
			</view>

			<view class="pixel-btn" @click="login" style="width:100%;margin-top:30rpx;">
				<text>🚀 开始冒险</text>
			</view>

			<text class="tip">💡 任意手机号 + 4位以上验证码</text>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const mobile = ref('')
const code = ref('')
const codeText = ref('获取验证码')
let timer = null

const sendCode = () => {
	if (!mobile.value || mobile.value.length !== 11) {
		return uni.showToast({ title: '请输入正确手机号', icon: 'none' })
	}
	if (timer) return
	let seconds = 60
	codeText.value = `${seconds}s`
	timer = setInterval(() => {
		seconds--
		if (seconds <= 0) {
			clearInterval(timer)
			timer = null
			codeText.value = '获取验证码'
		} else {
			codeText.value = `${seconds}s`
		}
	}, 1000)
	uni.showToast({ title: '验证码已发送（模拟）', icon: 'none' })
}

const login = async () => {
	if (!mobile.value || mobile.value.length !== 11) {
		return uni.showToast({ title: '请输入正确手机号', icon: 'none' })
	}
	if (!code.value || code.value.length < 4) {
		return uni.showToast({ title: '请输入验证码', icon: 'none' })
	}
	try {
		await userStore.login(mobile.value, code.value)
		uni.showToast({ title: '登录成功', icon: 'success' })
		setTimeout(() => uni.navigateBack(), 1000)
	} catch (e) { console.error('登录失败', e) }
}
</script>

<style lang="scss">
.container {
	min-height: 100vh; display: flex; align-items: center; justify-content: center;
	padding: 40rpx;
}
.login-box { width: 100%; padding: 50rpx 40rpx !important; }
.logo-area { text-align: center; margin-bottom: 20rpx; }
.logo-emoji { font-size: 80rpx; }
.input-group {
	display: flex; align-items: center; gap: 12rpx;
	margin-bottom: 24rpx;
}
.input-label { font-size: 36rpx; }
.pixel-input { flex: 1; }
.tip { display: block; text-align: center; font-size: 22rpx; color: #A1887F; margin-top: 24rpx; }
</style>
