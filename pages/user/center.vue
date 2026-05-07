<template>
	<view class="container">
		<!-- 用户信息卡片 - 像素风 -->
		<view class="user-card">
			<view class="avatar-frame">
				<image class="avatar" :src="userInfo.avatarUrl || '/static/logo.png'" />
			</view>
			<view class="user-info" v-if="isLoggedIn">
				<text class="nickname">🌟 {{ userInfo.nickname }}</text>
				<text class="mobile">{{ userInfo.mobile }}</text>
			</view>
			<view class="user-info" v-else @click="goLogin">
				<text class="nickname">👋 点击登录</text>
				<text class="mobile">开始你的宠物冒险吧~</text>
			</view>
		</view>

		<!-- 功能菜单 - 像素风 -->
		<view class="menu-group pixel-card">
			<text class="pixel-title">📋 我的功能</text>
			<view class="pixel-divider"></view>
			<view class="menu-item" @click="goPage('/pages/order/list')">
				<text class="menu-icon">📋</text>
				<text class="menu-text">我的订单</text>
				<text class="menu-arrow">→</text>
			</view>
			<view class="menu-item" @click="goPage('/pages/pet/list')">
				<text class="menu-icon">🐾</text>
				<text class="menu-text">宠物档案</text>
				<text class="menu-arrow">→</text>
			</view>
			<view class="menu-item" @click="goPage('/pages/address/list')">
				<text class="menu-icon">📍</text>
				<text class="menu-text">地址管理</text>
				<text class="menu-arrow">→</text>
			</view>
			<view class="menu-item" @click="goPage('/pages/mall/cart')">
				<text class="menu-icon">🛒</text>
				<text class="menu-text">购物车</text>
				<text class="menu-arrow">→</text>
			</view>
		</view>

		<!-- 退出登录 -->
		<view class="logout-section" v-if="isLoggedIn">
			<view class="pixel-btn pixel-btn-brown logout-btn" @click="logout">
				<text>🚪 退出登录</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo)

const goLogin = () => {
	uni.navigateTo({ url: '/pages/user/login' })
}

const goPage = (url) => {
	if (!isLoggedIn.value) {
		return uni.navigateTo({ url: '/pages/user/login' })
	}
	uni.navigateTo({ url })
}

const logout = () => {
	uni.showModal({
		title: '提示', content: '确定退出登录？',
		success: (res) => {
			if (res.confirm) {
				userStore.logout()
				uni.showToast({ title: '已退出', icon: 'success' })
			}
		}
	})
}
</script>

<style lang="scss">
.container { min-height: 100vh; }
.user-card {
	display: flex;
	align-items: center;
	padding: 40rpx 30rpx;
	background: #4CAF50;
	border-bottom: 6rpx solid #2E7D32;
}
.avatar-frame {
	width: 130rpx;
	height: 130rpx;
	border: 5rpx solid #FFC107;
	box-shadow: 4rpx 4rpx 0 #3E2723;
	margin-right: 24rpx;
	padding: 4rpx;
	background: #FFFDE7;
}
.avatar { width: 100%; height: 100%; }
.user-info { flex: 1; }
.nickname {
	font-size: 32rpx;
	color: #FFF8E1;
	font-weight: bold;
	display: block;
	text-shadow: 2rpx 2rpx 0 rgba(0,0,0,0.3);
}
.mobile {
	font-size: 24rpx;
	color: rgba(255,248,225,0.8);
	margin-top: 8rpx;
	display: block;
}

.menu-group {
	margin: 24rpx 30rpx;
}
.menu-item {
	display: flex;
	align-items: center;
	padding: 28rpx 0;
	border-bottom: 2rpx dashed #D7CCC8;
}
.menu-item:last-child { border-bottom: none; }
.menu-icon { font-size: 36rpx; margin-right: 20rpx; }
.menu-text { flex: 1; font-size: 28rpx; color: #3E2723; font-weight: bold; }
.menu-arrow { font-size: 28rpx; color: #8D6E63; font-weight: bold; }

.logout-section {
	padding: 40rpx 30rpx;
}
.logout-btn {
	width: 100%;
}
</style>
