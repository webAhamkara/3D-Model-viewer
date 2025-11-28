<template>
	<div class="model-viewer">
		<canvas
			id="window"
			ref="canvasRef"
			:width="canvasSize.width"
			:height="canvasSize.height"
		></canvas>
	</div>
</template>
<script setup>
import { parseObjText } from '../composables/useModelLoader'
import { renderModel } from '@/composables/useCanvasRenderer'
import { ref, reactive, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { calculatingAutoScale } from '@/composables/use3DMath'
const props = defineProps({
	rotationAngleX: {
		type: Number,
		default: 0,
	},
	rotationAngleY: {
		type: Number,
		default: 0,
	},
	modelColor: {
		type: Object,
		default: () => ({ r: 128, g: 128, b: 128 }),
	},

	modelScale: {
		type: Object,
		default: () => ({ scaleX: 1000, scaleY: 1000, distance: 1 }),
	},
	fileContent: {
		type: String,
	},
	textureModel: {
		type: Object,
	},
})
const modelData = ref(null)
const ctx = ref(null)
const originalVertices = ref(null)
const originalTextures = ref(null)
const originalNormals = ref(null)
const canvasTexture = ref(null)
const pixels = ref(null)
const windowWidth = ref(window.innerWidth * 0.7)
const windowHeight = ref(window.innerHeight * 0.7)
const orientation = ref(null)
const autoScale = ref(null)
const emit = defineEmits(['auto-scale'])
const safeRender = () => {
	if (
		ctx.value &&
		modelData.value &&
		originalVertices.value &&
		originalNormals.value
	) {
		renderModel(
			ctx.value,
			originalVertices.value,
			originalTextures.value,
			modelData.value.polygons,
			originalNormals.value,
			canvasSize,
			orientation.value,
			0,
			0,
			props.modelColor,
			props.modelScale,
			canvasTexture.value,
			pixels.value
		)
	}
}
onMounted(() => {
	if (canvasRef.value) ctx.value = canvasRef.value.getContext('2d')
	window.addEventListener('resize', updateWindowSize)
})
let resizeTimeout
const updateWindowSize = () => {
	clearTimeout(resizeTimeout)
	windowWidth.value = window.innerWidth * 0.7
	windowHeight.value = window.innerHeight * 0.7
	resizeTimeout = setTimeout(() => {
		nextTick(() => {
			safeRender()
		})
	}, 100)
}
onUnmounted(() => {
	window.removeEventListener('resize', updateWindowSize)
})

watch(
	() => [props.rotationAngleX, props.rotationAngleY],
	() => {
		if (ctx.value && modelData.value && originalVertices.value) {
			renderModel(
				ctx.value,
				originalVertices.value,
				originalTextures.value,
				modelData.value.polygons,
				originalNormals.value,
				canvasSize,
				orientation.value,
				props.rotationAngleX,
				props.rotationAngleY,
				props.modelColor,
				props.modelScale,
				canvasTexture.value,
				pixels.value
			)
		}
	},
	{ deep: true }
)
watch(
	() => props.modelColor,
	() => {
		if (ctx.value && modelData.value && originalVertices.value) {
			renderModel(
				ctx.value,
				originalVertices.value,
				originalTextures.value,
				modelData.value.polygons,
				originalNormals.value,
				canvasSize,
				orientation.value,
				0,
				0,
				props.modelColor,
				props.modelScale,
				canvasTexture.value,
				pixels.value
			)
		}
	},
	{ deep: true }
)
watch(
	() => props.modelScale,
	() => {
		if (ctx.value && modelData.value && originalVertices.value) {
			renderModel(
				ctx.value,
				originalVertices.value,
				originalTextures.value,
				modelData.value.polygons,
				originalNormals.value,
				canvasSize,
				orientation.value,
				0,
				0,
				props.modelColor,
				props.modelScale,
				canvasTexture.value,
				pixels.value
			)
		}
	},
	{ deep: true }
)
watch(
	() => props.textureModel,
	newTexture => {
		if (newTexture) {
			createCanvas(newTexture)
		} else {
			canvasTexture.value = null
			pixels.value = null
		}
		safeRender()
	}
)

watch(
	() => props.fileContent,
	() => {
		if (props.fileContent && ctx.value) {
			const loadedData = parseObjText(props.fileContent)
			modelData.value = loadedData
			originalVertices.value = [...loadedData.vertices]
			originalTextures.value = [...loadedData.textures]
			originalNormals.value = modelData.value.vertexNormals
			orientation.value = modelData.value.orientation
			autoScale.value = calculatingAutoScale(
				originalVertices.value,
				canvasSize.width,
				canvasSize.height
			)
			console.log(orientation.value)
			emit('auto-scale', autoScale.value)
			if (modelData.value && originalVertices.value) {
				renderModel(
					ctx.value,
					originalVertices.value,
					originalTextures.value,
					modelData.value.polygons,
					originalNormals.value,
					canvasSize,
					orientation.value,
					0,
					0,
					props.modelColor,
					props.modelScale,
					canvasTexture.value,
					pixels.value
				)
			}
		}
	}
)
const createCanvas = texture => {
	const tempTexture = document.createElement('canvas')
	const ctxTexture = tempTexture.getContext('2d')
	tempTexture.width = texture.width
	tempTexture.height = texture.height
	try {
		ctxTexture.drawImage(texture, 0, 0)
		const textureData = ctxTexture.getImageData(
			0,
			0,
			texture.width,
			texture.height
		)
		pixels.value = textureData.data
		canvasTexture.value = tempTexture
		setTimeout(() => {
			safeRender()
		}, 100)
	} catch (error) {
		console.error('Error creating texture canvas:', error)
	}
}

watch([windowWidth, windowHeight], () => {
	canvasSize.width = windowWidth.value
	canvasSize.height = windowHeight.value
	if (ctx.value && modelData.value && originalVertices.value) {
		renderModel(
			ctx.value,
			originalVertices.value,
			originalTextures.value,
			modelData.value.polygons,
			originalNormals.value,
			canvasSize,
			orientation.value,
			0,
			0,
			props.modelColor,
			props.modelScale,
			canvasTexture.value,
			pixels.value
		)
	}
})

const canvasRef = ref(null)
const canvasSize = reactive({
	width: windowWidth.value,
	height: windowHeight.value,
})
</script>
<style scoped></style>
