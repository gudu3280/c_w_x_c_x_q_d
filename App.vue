<script>
	export default {
		onLaunch: function() {
			console.log('宠物服务小程序启动')
		},
		onShow: function() {},
		onHide: function() {}
	}
</script>

<style>
	/* 星露谷物语像素风全局样式 */
	page {
		background-color: #FFF8E1;
		font-family: 'Courier New', Courier, monospace;
		font-size: 28rpx;
		color: #3E2723;
		image-rendering: pixelated;
	}
	view, text {
		box-sizing: border-box;
	}

	/* 像素风卡片 */
	.pixel-card {
		background: #FFFDE7;
		border: 4rpx solid #6D4C41;
		box-shadow: 6rpx 6rpx 0 #3E2723;
		padding: 24rpx;
		margin-bottom: 24rpx;
		position: relative;
	}
	.pixel-card::before {
		content: '';
		position: absolute;
		top: -4rpx; left: -4rpx; right: -4rpx; bottom: -4rpx;
		border: 2rpx solid #A1887F;
		pointer-events: none;
	}

	/* 像素风按钮 */
	.pixel-btn {
		background: #4CAF50;
		color: #FFF8E1;
		border: 4rpx solid #2E7D32;
		box-shadow: 4rpx 4rpx 0 #1B5E20;
		padding: 16rpx 32rpx;
		font-family: 'Courier New', Courier, monospace;
		font-weight: bold;
		font-size: 28rpx;
		text-align: center;
		letter-spacing: 2rpx;
		transition: all 0.1s;
	}
	.pixel-btn:active {
		box-shadow: 2rpx 2rpx 0 #1B5E20;
		transform: translate(2rpx, 2rpx);
	}
	.pixel-btn-gold {
		background: #FFC107;
		color: #3E2723;
		border-color: #FF8F00;
		box-shadow: 4rpx 4rpx 0 #E65100;
	}
	.pixel-btn-brown {
		background: #6D4C41;
		color: #FFF8E1;
		border-color: #3E2723;
		box-shadow: 4rpx 4rpx 0 #1B0000;
	}

	/* 像素风标题 */
	.pixel-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #3E2723;
		text-shadow: 2rpx 2rpx 0 #A1887F;
		letter-spacing: 4rpx;
		padding: 16rpx 0;
	}

	/* 像素风分割线 */
	.pixel-divider {
		height: 4rpx;
		background: repeating-linear-gradient(
			90deg,
			#6D4C41 0, #6D4C41 8rpx,
			transparent 8rpx, transparent 16rpx
		);
		margin: 20rpx 0;
	}

	/* 像素风标签 */
	.pixel-tag {
		display: inline-block;
		background: #FFC107;
		color: #3E2723;
		border: 2rpx solid #FF8F00;
		padding: 4rpx 16rpx;
		font-size: 22rpx;
		font-weight: bold;
		margin-right: 12rpx;
	}
	.pixel-tag-green {
		background: #A5D6A7;
		border-color: #4CAF50;
	}
	.pixel-tag-blue {
		background: #90CAF9;
		border-color: #42A5F5;
	}

	/* 像素风输入框 */
	.pixel-input {
		background: #FFFDE7;
		border: 3rpx solid #6D4C41;
		box-shadow: inset 3rpx 3rpx 0 #D7CCC8;
		padding: 16rpx 20rpx;
		font-family: 'Courier New', Courier, monospace;
		font-size: 28rpx;
		color: #3E2723;
	}

	/* 像素风徽章/数字 */
	.pixel-badge {
		background: #E53935;
		color: #FFF;
		border: 2rpx solid #B71C1C;
		min-width: 32rpx;
		height: 32rpx;
		line-height: 32rpx;
		text-align: center;
		font-size: 20rpx;
		font-weight: bold;
		padding: 0 8rpx;
	}

	/* 像素风列表项 */
	.pixel-list-item {
		background: #FFFDE7;
		border-bottom: 3rpx solid #D7CCC8;
		padding: 24rpx;
		display: flex;
		align-items: center;
	}
	.pixel-list-item:last-child {
		border-bottom: none;
	}

	/* 金币/价格样式 */
	.pixel-price {
		color: #FF8F00;
		font-weight: bold;
		font-size: 32rpx;
	}
	.pixel-price::before {
		content: '💰';
		margin-right: 4rpx;
	}
</style>
