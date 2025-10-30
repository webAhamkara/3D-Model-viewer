import {
	rotate,
	calculatingTheNormal,
	calculatingTheCos,
	randomColor,
	vertexRendering,
} from './use3DMath'

export function renderModel(
	ctx,
	originalVertices,
	polygons,
	canvasSize,
	angle = 0,
	modelColor
) {
	ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
	try {
		const tempVertices = JSON.parse(JSON.stringify(originalVertices))
		for (let i = 0; i < tempVertices.length; i++) {
			const newCoordinates = rotate(
				tempVertices[i].x,
				tempVertices[i].y,
				tempVertices[i].z,
				0,
				angle,
				0
			)
			tempVertices[i].x = newCoordinates.x
			tempVertices[i].y = newCoordinates.y
			tempVertices[i].z = newCoordinates.z
		}
		const zBuffer = []
		let allX = 0,
			allY = 0,
			allZ = 0
		for (let j = 0; j < canvasSize.width; j++) {
			zBuffer[j] = new Array(canvasSize.height).fill(Infinity)
		}
		for (let k = 0; k < tempVertices.length; k++) {
			allX += tempVertices[k].x
			allY += tempVertices[k].y
			allZ += tempVertices[k].z
		}
		const centerX = allX / tempVertices.length
		const centerY = allY / tempVertices.length
		const centerZ = allZ / tempVertices.length

		const xShift = -centerX
		const yShift = -centerY
		const zShift = -centerZ + 1 // для положительности всех zTransformed
		const Ax = 4000
		const Ay = -4000

		const transformedVertices = []
		for (let i = 0; i < tempVertices.length; i++) {
			let xTransformed = tempVertices[i].x + xShift
			let yTransformed = tempVertices[i].y + yShift
			let zTransformed = tempVertices[i].z + zShift
			transformedVertices[i] = {
				x3D: xTransformed,
				y3D: yTransformed,
				z3D: zTransformed,
				screenX: (Ax * xTransformed) / zTransformed + 500,
				screenY: (Ay * yTransformed) / zTransformed + 400,
			}
		}

		for (let c = 0; c < polygons.length; c++) {
			//рисуем ребра(полигоны)
			const [id1, id2, id3] = polygons[c]
			const x1 = Math.round(transformedVertices[id1].screenX)
			const y1 = Math.round(transformedVertices[id1].screenY)
			const z1 = transformedVertices[id1].z3D

			const x2 = Math.round(transformedVertices[id2].screenX)
			const y2 = Math.round(transformedVertices[id2].screenY)
			const z2 = transformedVertices[id2].z3D

			const x3 = Math.round(transformedVertices[id3].screenX)
			const y3 = Math.round(transformedVertices[id3].screenY)
			const z3 = transformedVertices[id3].z3D
			const normal = calculatingTheNormal(
				tempVertices[id1].x,
				tempVertices[id1].y,
				tempVertices[id1].z,
				tempVertices[id2].x,
				tempVertices[id2].y,
				tempVertices[id2].z,
				tempVertices[id3].x,
				tempVertices[id3].y,
				tempVertices[id3].z
			)
			const cos = calculatingTheCos(
				normal.normalX,
				normal.normalY,
				normal.normalZ
			)

			if (cos < 0) {
				const currentColor = randomColor(cos, modelColor)
				vertexRendering(
					zBuffer,
					ctx,
					x1,
					y1,
					z1,
					x2,
					y2,
					z2,
					x3,
					y3,
					z3,
					currentColor,
					canvasSize.width,
					canvasSize.height
				)
			}
		}
	} catch (error) {
		console.error('Ошибка при работе с изображением:', error)
	}
}
