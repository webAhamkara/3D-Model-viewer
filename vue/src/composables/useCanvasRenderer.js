import {
	rotate,
	calculatingTheNormal,
	calculatingTheCos,
	vertexRendering,
} from './use3DMath'
let accumulatedAngleX = 0
let accumulatedAngleY = 0
let accumulatedAngleZ = 0
export function renderModel(
	ctx,
	originalVertices,
	originalTextures,
	polygons,
	vertexNormals,
	canvasSize,
	orientation,
	angleY = 0,
	angleX = 0,
	modelColor,
	size,
	texture = undefined,
	pixels = undefined
) {
	ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
	const imageData = ctx.createImageData(
		Math.round(canvasSize.width),
		Math.round(canvasSize.height)
	)
	const data = imageData.data
	try {
		accumulatedAngleX += angleX
		accumulatedAngleY += angleY
		if (orientation === 'Y' || orientation === 'Z') {
			accumulatedAngleY = 0
			accumulatedAngleZ -= angleY
		} else accumulatedAngleZ = 0
		const tempVertices = originalVertices.map(v => ({
			x: v.x,
			y: v.y,
			z: v.z,
		}))
		const tempVertexNormals = {
			x: [...vertexNormals.x],
			y: [...vertexNormals.y],
			z: [...vertexNormals.z],
		}

		for (let j = 0; j < tempVertexNormals.x.length; j++) {
			const rotatedVertexNormals = rotate(
				tempVertexNormals.x[j],
				tempVertexNormals.y[j],
				tempVertexNormals.z[j],
				accumulatedAngleX,
				accumulatedAngleY,
				accumulatedAngleZ
			)
			tempVertexNormals.x[j] = rotatedVertexNormals.x
			tempVertexNormals.y[j] = rotatedVertexNormals.y
			tempVertexNormals.z[j] = rotatedVertexNormals.z
		}

		for (let i = 0; i < tempVertices.length; i++) {
			const newCoordinates = rotate(
				tempVertices[i].x,
				tempVertices[i].y,
				tempVertices[i].z,
				accumulatedAngleX,
				accumulatedAngleY,
				accumulatedAngleZ
			)
			tempVertices[i].x = newCoordinates.x
			tempVertices[i].y = newCoordinates.y
			tempVertices[i].z = newCoordinates.z
		}
		const arrayCos = new Array(polygons.length).fill(0)
		for (let k = 0; k < polygons.length; k++) {
			const [id1, id2, id3] = polygons[k].vertices
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
			arrayCos[k] = cos
		}

		const zBuffer = new Float32Array(canvasSize.width * canvasSize.height)
		zBuffer.fill(Infinity)
		let allX = 0,
			allY = 0,
			allZ = 0
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
		const zShift = size.distance - centerZ
		const transformedVertices = []
		for (let i = 0; i < tempVertices.length; i++) {
			let xTransformed = tempVertices[i].x + xShift
			let yTransformed = tempVertices[i].y + yShift
			let zTransformed = tempVertices[i].z + zShift
			transformedVertices[i] = {
				x3D: xTransformed,
				y3D: yTransformed,
				z3D: zTransformed,
				screenX:
					(size.scaleX * xTransformed) / zTransformed + canvasSize.width / 2,
				screenY:
					(-size.scaleY * yTransformed) / zTransformed + canvasSize.height / 2,
			}
		}

		const lightingArray = []
		const lightDirection = [0, 0, 1]
		for (let i = 0; i < polygons.length; i++) {
			const [id1, id2, id3] = polygons[i].vertices
			const I_0 =
				(tempVertexNormals.x[id1] * lightDirection[0] +
					tempVertexNormals.y[id1] * lightDirection[1] +
					tempVertexNormals.z[id1] * lightDirection[2]) /
				(Math.sqrt(
					tempVertexNormals.x[id1] ** 2 +
						tempVertexNormals.y[id1] ** 2 +
						tempVertexNormals.z[id1] ** 2
				) *
					Math.sqrt(
						lightDirection[0] ** 2 +
							lightDirection[1] ** 2 +
							lightDirection[2] ** 2
					))
			const I_1 =
				(tempVertexNormals.x[id2] * lightDirection[0] +
					tempVertexNormals.y[id2] * lightDirection[1] +
					tempVertexNormals.z[id2] * lightDirection[2]) /
				(Math.sqrt(
					tempVertexNormals.x[id2] ** 2 +
						tempVertexNormals.y[id2] ** 2 +
						tempVertexNormals.z[id2] ** 2
				) *
					Math.sqrt(
						lightDirection[0] ** 2 +
							lightDirection[1] ** 2 +
							lightDirection[2] ** 2
					))
			const I_2 =
				(tempVertexNormals.x[id3] * lightDirection[0] +
					tempVertexNormals.y[id3] * lightDirection[1] +
					tempVertexNormals.z[id3] * lightDirection[2]) /
				(Math.sqrt(
					tempVertexNormals.x[id3] ** 2 +
						tempVertexNormals.y[id3] ** 2 +
						tempVertexNormals.z[id3] ** 2
				) *
					Math.sqrt(
						lightDirection[0] ** 2 +
							lightDirection[1] ** 2 +
							lightDirection[2] ** 2
					))
			lightingArray.push([I_0, I_1, I_2])
		}

		for (let j = 0; j < polygons.length; j++) {
			const [id1, id2, id3] = polygons[j].vertices
			if (arrayCos[j] < 0) {
				const [I0, I1, I2] = lightingArray[j]
				vertexRendering(
					zBuffer,
					Math.round(canvasSize.width),
					Math.round(canvasSize.height),
					transformedVertices[id1].screenX,
					transformedVertices[id1].screenY,
					transformedVertices[id1].z3D,
					I0,
					texture ? originalTextures[polygons[j].textures[0]].x : 0,
					texture ? 1 - originalTextures[polygons[j].textures[0]].y : 0,
					transformedVertices[id2].screenX,
					transformedVertices[id2].screenY,
					transformedVertices[id2].z3D,
					I1,
					texture ? originalTextures[polygons[j].textures[1]].x : 0,
					texture ? 1 - originalTextures[polygons[j].textures[1]].y : 0,
					transformedVertices[id3].screenX,
					transformedVertices[id3].screenY,
					transformedVertices[id3].z3D,
					I2,
					texture ? originalTextures[polygons[j].textures[2]].x : 0,
					texture ? 1 - originalTextures[polygons[j].textures[2]].y : 0,
					modelColor,
					texture,
					pixels,
					data
				)
			}
		}
		ctx.putImageData(imageData, 0, 0)
	} catch (error) {
		console.error('Ошибка при работе с изображением:', error)
	}
}
