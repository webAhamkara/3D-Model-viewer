<template>
	<div class="page">
		<div class="page__content">
			<div class="page__header">
				<h1>3D MODEL VIEWER</h1>
			</div>
			<div class="page__canvas">
				<ModelViewer
					:rotation-angle-x="rotationAngleX"
					:rotation-angle-y="rotationAngleY"
					:model-color="modelColor"
					:model-scale="modelSize"
					:file-content="fileContent"
					:texture-model="textureImage"
					@auto-scale="functionAutoScale"
				/>
			</div>
			<div
				class="settings--close"
				:class="{ 'settings--open': openSettings }"
				@click="openWindow"
			>
				{{ openSettings ? 'Close' : 'Settings' }}
			</div>
			<div v-if="openSettings" class="windowSettings" ref="ignoreElement">
				<ModelSettings
					@update:color="colorChange"
					@update:scale="scaleChange"
					@file-loaded="fileChange"
					@texture-loaded="textureChange"
					:parameters-scale="parametersAutoScale"
				></ModelSettings>
			</div>
		</div>
	</div>
</template>

<script setup>
import ModelViewer from './components/ModelViewer.vue'
import ModelSettings from './components/ModelSettings.vue'
import { ref, reactive, onMounted, onUnmounted } from 'vue'
const modelColor = reactive({ r: 128, g: 128, b: 128 })
const fileContent = ref(null)
const textureImage = ref(null)
const modelSize = reactive({ scaleX: 1000, scaleY: 1000, distance: 1 })
const rotationAngleX = ref(3.3)
const rotationAngleY = ref(0)
const openSettings = ref(false)
const initialCoordinates = reactive({ x: null, y: null })
const finalCoordinates = reactive({ x: null, y: null })
const moving = reactive({ x: null, y: null })
const isChange = ref(false)
const sensitivity = 0.005
const parametersAutoScale = reactive({
	scaleX: 1000,
	scaleY: 1000,
	distance: 1,
})
const ignoreElement = ref(null)
onMounted(() => {
	window.addEventListener('mousedown', start)
	window.addEventListener('mousemove', movement)
	window.addEventListener('mouseup', finish)
})
onUnmounted(() => {
	window.removeEventListener('mousedown', start)
	window.removeEventListener('mousemove', movement)
	window.removeEventListener('mouseup', finish)
})
const start = event => {
	if (event.button === 0 && !ignoreElement.value?.contains(event.target)) {
		isChange.value = true
		initialCoordinates.x = event.clientX
		initialCoordinates.y = event.clientY
	}
}
const movement = event => {
	if (isChange.value) {
		finalCoordinates.x = event.clientX
		finalCoordinates.y = event.clientY
		moving.x = initialCoordinates.x - finalCoordinates.x
		moving.y = initialCoordinates.y - finalCoordinates.y
		rotationAngleX.value = moving.x * sensitivity
		rotationAngleY.value = -moving.y * sensitivity
		initialCoordinates.x = event.clientX
		initialCoordinates.y = event.clientY
	}
}
const finish = () => {
	isChange.value = false
}
const openWindow = () => {
	if (!openSettings.value) {
		openSettings.value = true
	} else {
		openSettings.value = false
	}
}
const colorChange = newColor => {
	Object.assign(modelColor, newColor)
}
const scaleChange = newScale => {
	Object.assign(modelSize, newScale)
}
const fileChange = newFileContent => {
	fileContent.value = newFileContent
	textureImage.value = null
}
const textureChange = newTexture => {
	textureImage.value = newTexture
}
const functionAutoScale = autoScale => {
	if (autoScale) {
		Object.assign(modelSize, {
			scaleX: autoScale.scaleX,
			scaleY: autoScale.scaleY,
			distance: autoScale.distance,
		})
		Object.assign(parametersAutoScale, {
			scaleX: autoScale.scaleX,
			scaleY: autoScale.scaleY,
			distance: autoScale.distance,
		})
	}
}
</script>

<style scoped>
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}
html,
body {
	overflow-x: hidden;
	overflow-y: hidden;
	width: 100%;
	max-width: 100vw;
}
.page {
	min-width: 320px;
	max-width: 100%;
	height: 100vh;
	position: relative;
	text-align: center;
	align-items: center;
	display: flex;
	flex-direction: column;
	overflow-x: hidden;
	overflow-y: hidden;
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
	position: relative;
	width: 80%;
	height: 80%;
	margin: 0 auto;
}
.page__canvas {
	position: relative;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
}

.left-arrow {
	transform: rotateZ(-90deg);
}
.right-arrow {
	transform: rotateZ(90deg);
}

.left-arrow:hover,
.right-arrow:hover {
	scale: 1.1;
}
.settings--close,
.settings--open {
	position: fixed;
	display: flex;
	justify-self: center;
	align-self: center;
	justify-content: center;
	align-items: center;
	bottom: 0;
	width: 100px;
	height: 30px;
	border: 3px solid black;
	font-size: 16px;
	user-select: none;
	transition: all 0.5s;
}
.settings--close {
	background-color: rgba(192, 192, 192, 0.428);
}
.settings--open {
	background-color: rgb(234, 82, 82);
}
.settings--close:hover,
.settings--open:hover {
	scale: 1.1;
}

.windowSettings {
	display: flex;
	justify-self: center;
	align-self: center;
	justify-content: center;
	align-items: center;
	flex-direction: column;
}
</style>
