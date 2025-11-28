export function barycentricCoordinates(x, y, x0, y0, x1, y1, x2, y2) {
	const denominator = (x0 - x2) * (y1 - y2) - (x1 - x2) * (y0 - y2)
	if (Math.abs(denominator) < 1e-10) return null
	const lambda0 = ((x - x2) * (y1 - y2) - (x1 - x2) * (y - y2)) / denominator

	const lambda1 = ((x0 - x2) * (y - y2) - (x - x2) * (y0 - y2)) / denominator
	const lambda2 = 1.0 - lambda0 - lambda1
	if (lambda0 < -0.005 || lambda1 < -0.005 || lambda2 < -0.005) return null
	return { lambda0, lambda1, lambda2 }
}

export function vertexRendering(
	zBuffer,
	canvasWidth,
	canvasHeight,
	x0,
	y0,
	z0,
	I0,
	u0,
	v0,
	x1,
	y1,
	z1,
	I1,
	u1,
	v1,
	x2,
	y2,
	z2,
	I2,
	u2,
	v2,
	color = { r: 0, g: 0, b: 0 },
	texture = undefined,
	pixels = undefined,
	data
) {
	if (Math.abs((x0 - x2) * (y1 - y2) - (x1 - x2) * (y0 - y2)) < 0.0000000001) {
		return
	}
	const xmin = Math.max(0, Math.floor(Math.min(x0, x1, x2)) - 4)
	const xmax = Math.min(canvasWidth, Math.ceil(Math.max(x0, x1, x2)) + 4)
	const ymin = Math.max(0, Math.floor(Math.min(y0, y1, y2)) - 4)
	const ymax = Math.min(canvasHeight, Math.ceil(Math.max(y0, y1, y2)) + 4)
	for (let countX = xmin; countX <= xmax; countX++) {
		for (let countY = ymin; countY <= ymax; countY++) {
			const result = barycentricCoordinates(
				countX + 0.5,
				countY + 0.5,
				x0,
				y0,
				x1,
				y1,
				x2,
				y2
			)
			if (
				result != undefined &&
				result.lambda0 >= -0.005 &&
				result.lambda1 >= -0.005 &&
				result.lambda2 >= -0.005
			) {
				const pixelIndex = countY * canvasWidth + countX
				const dataIndex = pixelIndex * 4
				let I = -(
					result.lambda0 * I0 +
					result.lambda1 * I1 +
					result.lambda2 * I2
				)
				I = Math.max(0, Math.min(1, I))
				let r, g, b
				if (texture && pixels) {
					let textureX = Math.round(
						(texture.width - 1) *
							(result.lambda0 * u0 + result.lambda1 * u1 + result.lambda2 * u2)
					)
					let textureY = Math.round(
						(texture.height - 1) *
							(result.lambda0 * v0 + result.lambda1 * v1 + result.lambda2 * v2)
					)

					const textureColor = getPixelColor(
						textureX,
						textureY,
						pixels,
						texture.width
					)
					r = Math.min(255, Math.floor(textureColor.r * I))
					g = Math.min(255, Math.floor(textureColor.g * I))
					b = Math.min(255, Math.floor(textureColor.b * I))
				} else {
					r = Math.min(255, Math.floor(color.r * I))
					g = Math.min(255, Math.floor(color.g * I))
					b = Math.min(255, Math.floor(color.b * I))
				}

				const z =
					result.lambda0 * z0 + result.lambda1 * z1 + result.lambda2 * z2
				if (z < zBuffer[pixelIndex]) {
					zBuffer[pixelIndex] = z
					data[dataIndex] = r
					data[dataIndex + 1] = g
					data[dataIndex + 2] = b
					data[dataIndex + 3] = 255
				}
			}
		}
	}
}

export function calculatingTheNormal(x0, y0, z0, x1, y1, z1, x2, y2, z2) {
	const normalX = (y1 - y2) * (z1 - z0) - (z1 - z2) * (y1 - y0)
	const normalY = (z1 - z2) * (x1 - x0) - (x1 - x2) * (z1 - z0)
	const normalZ = (x1 - x2) * (y1 - y0) - (y1 - y2) * (x1 - x0)
	return { normalX, normalY, normalZ }
}
export function calculatingTheCos(x, y, z) {
	const l = [0, 0, 1]
	const cos =
		(x * l[0] + y * l[1] + z * l[2]) /
		(Math.sqrt(x ** 2 + y ** 2 + z ** 2) *
			Math.sqrt(l[0] ** 2 + l[1] ** 2 + l[2] ** 2))
	return cos
}
export function rotate(x, y, z, alpha = 0, beta = 0, gamma = 0) {
	const Rx = [
		[1, 0, 0],
		[0, Math.cos(alpha), Math.sin(alpha)],
		[0, -Math.sin(alpha), Math.cos(alpha)],
	]
	const Ry = [
		[Math.cos(beta), 0, Math.sin(beta)],
		[0, 1, 0],
		[-Math.sin(beta), 0, Math.cos(beta)],
	]
	const Rz = [
		[Math.cos(gamma), Math.sin(gamma), 0],
		[-Math.sin(gamma), Math.cos(gamma), 0],
		[0, 0, 1],
	]
	const Rxy = [
		[0, 0, 0],
		[0, 0, 0],
		[0, 0, 0],
	]
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			let result = 0
			for (let k = 0; k < 3; k++) {
				const a = Rx[j][k] * Ry[k][i]
				result += a
			}
			Rxy[j][i] = result
		}
	}
	const Rxyz = [
		[0, 0, 0],
		[0, 0, 0],
		[0, 0, 0],
	]
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			let result = 0
			for (let k = 0; k < 3; k++) {
				const a = Rxy[j][k] * Rz[k][i]
				result += a
			}
			Rxyz[j][i] = result
		}
	}
	const xNew = Rxyz[0][0] * x + Rxyz[0][1] * y + Rxyz[0][2] * z
	const yNew = Rxyz[1][0] * x + Rxyz[1][1] * y + Rxyz[1][2] * z
	const zNew = Rxyz[2][0] * x + Rxyz[2][1] * y + Rxyz[2][2] * z
	return { x: xNew, y: yNew, z: zNew }
}
function getPixelColor(x, y, pixels, width) {
	const index = (y * width + x) * 4
	return {
		r: pixels[index],
		g: pixels[index + 1],
		b: pixels[index + 2],
	}
}

export function calculatingAutoScale(vertices, canvasWidth, canvasHeight) {
	if (vertices.length === 0) return null

	let minX = Infinity,
		maxX = -Infinity
	let minY = Infinity,
		maxY = -Infinity
	let minZ = Infinity,
		maxZ = -Infinity

	for (const v of vertices) {
		minX = Math.min(minX, v.x)
		maxX = Math.max(maxX, v.x)
		minY = Math.min(minY, v.y)
		maxY = Math.max(maxY, v.y)
		minZ = Math.min(minZ, v.z)
		maxZ = Math.max(maxZ, v.z)
	}

	const centerX = (minX + maxX) / 2
	const centerY = (minY + maxY) / 2
	const centerZ = (minZ + maxZ) / 2

	const sizeX = maxX - minX
	const sizeY = maxY - minY
	const sizeZ = maxZ - minZ

	const maxDimension = Math.max(sizeX, sizeY, sizeZ)

	const distance = maxDimension * 2.5

	const minCanvasDimension = Math.min(canvasWidth, canvasHeight)
	const scale = (minCanvasDimension * 0.8) / maxDimension

	const perspectiveScale = distance * scale

	return {
		scaleX: perspectiveScale,
		scaleY: perspectiveScale,
		distance: distance,
		center: { x: centerX, y: centerY, z: centerZ },
	}
}
