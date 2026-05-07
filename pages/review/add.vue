<template>
	<view class="container">
		<view class="review-card pixel-card">
			<text class="pixel-title">⭐ 写评价</text>
			<view class="pixel-divider"></view>

			<!-- 评分 -->
			<view class="score-section">
				<text class="section-label">评分</text>
				<view class="star-row">
					<text
						v-for="s in 5"
						:key="s"
						class="star"
						:class="{ active: s <= score }"
						@click="score = s"
					>{{ s <= score ? '⭐' : '☆' }}</text>
					<text class="score-text">{{ score }} / 5</text>
				</view>
			</view>

			<!-- 评价内容 -->
			<view class="content-section">
				<text class="section-label">评价内容</text>
				<textarea
					v-model="content"
					class="review-textarea pixel-input"
					placeholder="分享你的体验吧~（服务态度、环境、专业程度等）"
					maxlength="500"
				/>
				<text class="char-count">{{ content.length }} / 500</text>
			</view>

			<!-- 提交 -->
			<view class="submit-section">
				<view class="pixel-btn" @click="submitReview">
					<text>📝 提交评价</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { post } from '@/utils/request'

const targetType = ref('')
const targetId = ref(0)
const merchantId = ref(0)
const score = ref(5)
const content = ref('')

onMounted(() => {
	const pages = getCurrentPages()
	const page = pages[pages.length - 1]
	targetType.value = page.$page?.options?.targetType || ''
	targetId.value = Number(page.$page?.options?.targetId) || 0
	merchantId.value = Number(page.$page?.options?.merchantId) || 0
})

const submitReview = async () => {
	if (content.value.trim().length < 5) {
		return uni.showToast({ title: '评价内容至少5个字', icon: 'none' })
	}
	try {
		await post('/api/review/add', {
			targetType: targetType.value,
			targetId: targetId.value,
			merchantId: merchantId.value,
			score: score.value,
			content: content.value
		})
		uni.showToast({ title: '评价成功！', icon: 'success' })
		setTimeout(() => uni.navigateBack(), 1000)
	} catch (e) {
		console.log('评价失败', e)
	}
}
</script>

<style lang="scss">
.container { min-height: 100vh; padding: 24rpx 30rpx; }

.review-card { margin-top: 20rpx; }

.section-label {
	font-size: 28rpx;
	font-weight: bold;
	color: #3E2723;
	display: block;
	margin-bottom: 16rpx;
}

.score-section {
	margin-bottom: 30rpx;
	.star-row {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}
	.star {
		font-size: 50rpx;
		transition: transform 0.1s;
		&.active { transform: scale(1.15); }
	}
	.score-text {
		margin-left: 16rpx;
		font-size: 28rpx;
		color: #FF8F00;
		font-weight: bold;
	}
}

.content-section {
	margin-bottom: 40rpx;
	.review-textarea {
		width: 100%;
		height: 240rpx;
		padding: 20rpx !important;
		font-size: 28rpx;
		color: #3E2723;
	}
	.char-count {
		text-align: right;
		font-size: 22rpx;
		color: #A1887F;
		margin-top: 8rpx;
		display: block;
	}
}

.submit-section {
	text-align: center;
	.pixel-btn { display: inline-block; padding: 20rpx 60rpx; }
}
</style>
