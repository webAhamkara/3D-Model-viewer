<template>
	<div class="page">
		<div class="page__content">
			<div class="page__header">
				<h1>3D MODEL VIEWER</h1>
			</div>
			<div class="page__canvas">
				<div
					class="left-arrow"
					@mousedown="startContinuousTurn('left')"
					@mouseup="stopContinuousTurn"
					@mouseleave="stopContinuousTurn"
				>
					<svg
						width="102"
						height="83"
						viewBox="0 0 102 83"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M62.8732 0.203188C64.7254 -0.3167 66.7764 0.183389 67.9786 1.44796L100.062 35.1981C101.349 36.5522 101.349 38.4482 100.062 39.8024L67.9782 73.5524C66.7764 74.8172 64.7249 75.3171 62.8728 74.7974C61.0211 74.2772 59.7772 72.8522 59.7772 71.2502V56.2885C35.1244 56.7089 23.2798 60.5369 17.3296 64.6997C11.6734 68.6571 10.6432 73.3086 9.5633 78.1847C9.47099 78.6014 9.37827 79.0199 9.28234 79.4395C8.85715 81.2995 6.80482 82.609 4.49638 82.4931C2.18789 82.3772 0.346677 80.8724 0.202668 78.9839C-0.583048 68.6789 0.59656 53.7464 9.494 41.2529C18.128 29.1291 33.6774 19.8075 59.7772 18.8343V3.7502C59.7772 2.1482 61.0211 0.723126 62.8732 0.203188Z"
							fill="black"
						/>
					</svg>
				</div>
				<ModelViewer
					:rotation-angle="rotationAngle"
					:model-color="modelColor"
				/>
				<div
					class="right-arrow"
					@mousedown="startContinuousTurn('right')"
					@mouseup="stopContinuousTurn"
					@mouseleave="stopContinuousTurn"
				>
					<svg
						width="102"
						height="83"
						viewBox="0 0 102 83"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M62.8732 0.203188C64.7254 -0.3167 66.7764 0.183389 67.9786 1.44796L100.062 35.1981C101.349 36.5522 101.349 38.4482 100.062 39.8024L67.9782 73.5524C66.7764 74.8172 64.7249 75.3171 62.8728 74.7974C61.0211 74.2772 59.7772 72.8522 59.7772 71.2502V56.2885C35.1244 56.7089 23.2798 60.5369 17.3296 64.6997C11.6734 68.6571 10.6432 73.3086 9.5633 78.1847C9.47099 78.6014 9.37827 79.0199 9.28234 79.4395C8.85715 81.2995 6.80482 82.609 4.49638 82.4931C2.18789 82.3772 0.346677 80.8724 0.202668 78.9839C-0.583048 68.6789 0.59656 53.7464 9.494 41.2529C18.128 29.1291 33.6774 19.8075 59.7772 18.8343V3.7502C59.7772 2.1482 61.0211 0.723126 62.8732 0.203188Z"
							fill="black"
						/>
					</svg>
				</div>
			</div>
		</div>
		<div class="page__color-panel">
			<label
				>R: <input type="range" min="0" max="255" v-model="modelColor.r"
			/></label>
			<label
				>G: <input type="range" min="0" max="255" v-model="modelColor.g"
			/></label>
			<label
				>B: <input type="range" min="0" max="255" v-model="modelColor.b"
			/></label>
		</div>
	</div>
</template>

<script setup>
import ModelViewer from './components/ModelViewer.vue'
import { ref, computed, reactive } from 'vue'

const modelColor = reactive({ r: 128, g: 128, b: 128 })
const isTurningLeft = ref(false)
const isTurningRight = ref(false)
const rotationAngle = ref(3.3)
let turnInterval = null
const turnLeft = () => {
	rotationAngle.value += 0.1
}
const turnRight = () => {
	rotationAngle.value -= 0.1
}
const startContinuousTurn = direction => {
	if (turnInterval) {
		clearInterval(turnInterval)
	} else {
		turnInterval = setInterval(() => {
			if (direction === 'left') {
				turnLeft()
			} else {
				turnRight()
			}
		}, 16)
	}
}
const stopContinuousTurn = () => {
	if (turnInterval) {
		clearInterval(turnInterval)
		turnInterval = null
	}
}
</script>

<style scoped>
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}
.page {
	width: 100%;
	height: 100vh;
	position: relative;
	text-align: center;
	align-items: center;
	display: flex;
	flex-direction: column;
}
.page__header {
	user-select: none;
}
h1 {
	margin: 0;
	text-shadow: 5px 5px #9cd4e5a4;
	color: rgb(82, 128, 151);
}
.page__content {
	width: 80%;
	height: 80%;
}
.page__canvas {
	display: flex;
	flex-direction: row;
	align-items: center;
}
.left-arrow {
	transform: rotateY(180deg);
}
.left-arrow:hover,
.right-arrow:hover {
	scale: 1.1;
}
.page__color-panel {
	display: flex;
	flex-direction: row;
	gap: 200px;
	user-select: none;
	color: rgb(63, 98, 116);
}
</style>
