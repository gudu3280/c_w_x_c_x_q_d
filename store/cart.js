import { defineStore } from 'pinia'
import { get, post, put, del } from '@/utils/request'

export const useCartStore = defineStore('cart', {
	state: () => ({
		cartList: [],
		cartCount: 0
	}),
	getters: {
		selectedItems: (state) => state.cartList.filter(item => item.selected),
		totalPrice: (state) => {
			return state.cartList
				.filter(item => item.selected)
				.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
				.toFixed(2)
		}
	},
	actions: {
		async loadCart() {
			const res = await get('/api/cart/list')
			this.cartList = res.data || []
			this.cartCount = this.cartList.reduce((sum, item) => sum + item.quantity, 0)
		},
		async addToCart(productId, quantity = 1) {
			await post('/api/cart/add', { productId, quantity })
			await this.loadCart()
			uni.showToast({ title: '已加入购物车', icon: 'success' })
		},
		async updateQuantity(cartId, quantity) {
			await put('/api/cart/update', { cartId, quantity })
			await this.loadCart()
		},
		async removeItem(cartId) {
			await del(`/api/cart/${cartId}`)
			await this.loadCart()
		}
	}
})
