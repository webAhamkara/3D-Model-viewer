<template>
	<div class="page__control">
		<div class="page__control-panel">
			<label
				>R:
				<input
					type="range"
					min="0"
					max="255"
					v-model="newColor.r"
					@input="updateColor"
					:disabled="hasTexture"
			/></label>
			<label
				>G:
				<input
					type="range"
					min="0"
					max="255"
					v-model="newColor.g"
					@input="updateColor"
					:disabled="hasTexture"
			/></label>
			<label
				>B:
				<input
					type="range"
					min="0"
					max="255"
					v-model="newColor.b"
					@input="updateColor"
					:disabled="hasTexture"
			/></label>
		</div>
		<div class="page__size-panel">
			<div class="page__size-panel-distance">
				<div class="dropdown-container">
					<svg
						@click="toggleDropdown"
						width="14"
						height="11"
						viewBox="0 0 14 11"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M0 0L7 11L14 0H0Z" fill="black" />
					</svg>
					<div v-if="dropDownState" class="dropdown-menu">
						<div class="dropdown-menu__slider" @click="sliderAction">
							Slider
						</div>
						<div class="dropdown-menu__field" @click="fieldAction">Field</div>
					</div>
				</div>

				<label
					>Distance:<input
						v-if="sliderState"
						type="range"
						step="0.25"
						min="0.001"
						max="15"
						v-model="newScale.distance"
						@input="updateScale"
					/>
					<input
						v-if="fieldState"
						v-model="newScale.distance"
						ref="inputDistance"
						type="number"
						min="0.00001"
						max="10000"
					/>
				</label>
				<button
					v-if="fieldState"
					@click="applyDistance"
					:disabled="!isDistanceValid"
				>
					Apply
				</button>
			</div>
			<label
				>Scale X:<input
					type="range"
					step="50"
					min="0.001"
					max="10000"
					v-model="newScale.scaleX"
					@input="updateScale"
			/></label>
			<label
				>Scale Y:<input
					type="range"
					step="50"
					min="0.001"
					max="10000"
					v-model="newScale.scaleY"
					@input="updateScale"
			/></label>
		</div>
		<div class="page__control-addFIle">
			<div>
				Model:
				<input type="file" accept=".obj" @change="selectFileModel" />
			</div>
			<div>
				Texture:
				<input
					type="file"
					accept=".png, .jpg, .jpeg"
					@change="selectFileTexture"
					ref="textureInputRef"
				/>
			</div>
		</div>
	</div>
</template>
<script setup>
import { reactive, watch, ref, computed } from 'vue'
const sliderState = ref(true)
const fieldState = ref(false)
const textureInputRef = ref(null)
const hasTexture = ref(false)
const sliderAction = () => {
	if (!sliderState.value) {
		sliderState.value = true
		fieldState.value = false
		dropDownState.value = false
	}
}
const fieldAction = () => {
	if (!fieldState.value) {
		fieldState.value = true
		sliderState.value = false
		dropDownState.value = false
	}
}
const newColor = reactive({ r: 128, g: 128, b: 128 })
const props = defineProps({
	parametersScale: {
		type: Object,
		default: () => ({ scaleX: 1000, scaleY: 1000, distance: 1 }),
	},
})
const newScale = reactive({
	scaleX: props.parametersScale.scaleX,
	scaleY: props.parametersScale.scaleY,
	distance: props.parametersScale.distance,
})
function selectFileModel(event) {
	const file = event.target.files[0]
	if (!file) {
		console.log('Файл не выбран')
		return
	}
	const reader = new FileReader()
	reader.onload = fileEvent => {
		const result = fileEvent.target.result
		if (textureInputRef.value) {
			textureInputRef.value.value = ''
		}
		hasTexture.value = false
		emit('file-loaded', result)
		emit('texture-loaded', null)
	}
	reader.onerror = error => {
		console.error('Не удалось прочитать файл:' + error)
	}
	reader.readAsText(file)
}
function selectFileTexture(event) {
	const file = event.target.files[0]
	if (!file) {
		console.log('Файл не выбран')
		return
	}
	const reader = new FileReader()
	reader.onload = fileEvent => {
		const dataURL = fileEvent.target.result
		const image = new Image()
		image.onload = () => {
			hasTexture.value = true
			emit('texture-loaded', image)
		}
		image.src = dataURL
	}
	reader.onerror = error => {
		console.error('Не удалось прочитать файл:' + error)
	}
	reader.readAsDataURL(file)
}
const emit = defineEmits([
	'update:color',
	'update:scale',
	'file-loaded',
	'texture-loaded',
])
const updateColor = () => {
	if (!hasTexture.value) {
		emit('update:color', { ...newColor })
	}
}

const updateScale = () => {
	emit('update:scale', { ...newScale })
}
watch(
	() => props.parametersScale,
	newVal => {
		if (
			newVal &&
			newVal.scaleX !== null &&
			newVal.scaleY !== null &&
			newVal.distance !== null
		) {
			Object.assign(newScale, {
				scaleX: newVal.scaleX,
				scaleY: newVal.scaleY,
				distance: newVal.distance,
			})
		}
	},
	{ deep: true, immediate: true }
)
const dropDownState = ref(false)
const toggleDropdown = () => {
	if (dropDownState.value) {
		dropDownState.value = false
	} else {
		dropDownState.value = true
	}
}
const inputDistance = ref(null)
const applyDistance = () => {
	const value = inputDistance.value.value
	newScale.distance = parseFloat(value)
	emit('update:scale', { ...newScale })
}
const isDistanceValid = computed(() => {
	if (!inputDistance.value) return false
	const value = parseFloat(newScale.distance)
	if (0.00001 > value || value > 10000 || isNaN(value)) return false
	return true
})
</script>
<style scoped>
.page__control {
	border-radius: 5px;
	border: 2px solid black;
	background-color: rgba(82, 128, 151, 0.49);
	padding: 20px !important;
	box-sizing: border-box;
}
.page__control-panel {
	display: flex;
	flex-direction: row;
	gap: 10vw;
	user-select: none;
	color: rgb(63, 98, 116);
}
.page__size-panel {
	display: flex;
	flex-direction: row;
	gap: 5vw;
	user-select: none;
	color: rgb(63, 98, 116);
}
.page__size-panel-distance {
	display: flex;
	flex-direction: row;
	align-items: center !important;
	justify-content: center;
	gap: 5px;
}
.page__size-panel-distance > label {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 8px;
}
.page__size-panel-distance button:not(:disabled):active {
	scale: 1.2;
}
.page__size-panel-distance button:disabled {
	cursor: not-allowed;
}
.page__size-panel-distance svg:hover {
	scale: 1.2;
}
.dropdown-container {
	display: flex;
	position: relative;
}
.dropdown-menu {
	position: absolute;
	display: block;
	top: 200%;
	left: 50%;
	transform: translateX(-50%);
	border-radius: 5px;
	border: 2px solid #527e97;
	background: white;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(82, 126, 151, 0.2);
	font-size: 14px;
}
.dropdown-menu::after {
	position: absolute;
	content: '';
	left: 0;
	right: 0;
	top: 50%;
	height: 2px;
	background: #527e97;
}
.dropdown-menu > div {
	padding: 10px;
}
.dropdown-menu > div:hover {
	background-color: rgba(144, 140, 140, 0.686);
}
.page__size-panel-distance input[type='number']::-webkit-outer-spin-button,
.page__size-panel-distance input[type='number']::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}
.page__control-addFIle {
	display: flex;
	flex-direction: row;
	justify-content: center;
	color: rgb(63, 98, 116);
	align-items: center !important;
}
.page__control-addFIle > div {
	display: flex;
	align-items: center;
}
.page__control-addFIle input {
	margin-left: 5px;
}
</style>
