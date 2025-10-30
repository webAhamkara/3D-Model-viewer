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
import { getObj } from '../composables/useModelLoader'
import { renderModel } from '@/composables/useCanvasRenderer'
import { ref, reactive, onMounted, watch } from 'vue'
const props = defineProps({
	rotationAngle: {
		type: Number,
		default: 0,
	},
	modelColor: {
		type: Object,
	},
})
const modelData = ref(null)
const ctx = ref(null)
const originalVertices = ref(null)
onMounted(async () => {
	const loadedData = await getObj('./model_1.obj')
	modelData.value = loadedData
	originalVertices.value = JSON.parse(JSON.stringify(loadedData.vertices))
	ctx.value = canvasRef.value.getContext('2d')
	renderModel(
		ctx.value,
		originalVertices.value,
		modelData.value.polygons,
		canvasSize,
		props.rotationAngle,
		props.modelColor
	)
})
watch(
	() => props.rotationAngle,
	() => {
		if (modelData.value && originalVertices.value) {
			renderModel(
				ctx.value,
				originalVertices.value,
				modelData.value.polygons,
				canvasSize,
				props.rotationAngle,
				props.modelColor
			)
		}
	}
)
watch(
	() => props.modelColor,
	() => {
		if (modelData.value && originalVertices.value) {
			renderModel(
				ctx.value,
				originalVertices.value,
				modelData.value.polygons,
				canvasSize,
				props.rotationAngle,
				props.modelColor
			)
		}
	},
	{ deep: true }
)

const canvasRef = ref(null)
const canvasSize = reactive({ width: 1000, height: 800 })
</script>
<style scoped></style>
