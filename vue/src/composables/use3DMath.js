export function barycentricCoordinates(x, y, x0, y0, x1, y1, x2, y2) {
	const lambda0 =
		((x - x2) * (y1 - y2) - (x1 - x2) * (y - y2)) /
		((x0 - x2) * (y1 - y2) - (x1 - x2) * (y0 - y2))
	const lambda1 =
		((x0 - x2) * (y - y2) - (x - x2) * (y0 - y2)) /
		((x0 - x2) * (y1 - y2) - (x1 - x2) * (y0 - y2))
	const lambda2 = 1.0 - lambda0 - lambda1
	return { lambda0, lambda1, lambda2 }
}

export function vertexRendering(
	zBuffer,
	ctx,
	x0,
	y0,
	z0,
	x1,
	y1,
	z1,
	x2,
	y2,
	z2,
	color = `rgba(0, 0, 0, 1)`,
	canvasWidth,
	canvasHeight
) {
	if (Math.abs((x0 - x2) * (y1 - y2) - (x1 - x2) * (y0 - y2)) < 0.0000000001) {
		return
	}
	const xmin = Math.max(0, Math.floor(Math.min(x0, x1, x2)) - 4)
	const xmax = Math.min(canvasWidth, Math.ceil(Math.max(x0, x1, x2)) + 4)
	const ymin = Math.max(0, Math.floor(Math.min(y0, y1, y2)) - 4)
	const ymax = Math.min(canvasHeight, Math.ceil(Math.max(y0, y1, y2)) + 4)
	const visiblePixels = []
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
				const z =
					result.lambda0 * z0 + result.lambda1 * z1 + result.lambda2 * z2
				if (z < zBuffer[countX][countY]) {
					visiblePixels.push({ x: countX, y: countY, z: z })
				}
			}
		}
	}
	if (visiblePixels.length > 0) {
		ctx.fillStyle = color
		visiblePixels.forEach(pixel => {
			ctx.fillRect(pixel.x, pixel.y, 1, 1)
		})
		visiblePixels.forEach(pixel => {
			zBuffer[pixel.x][pixel.y] = pixel.z
		})
	}
}
export function randomColor(cos, modelColor) {
	const lightIntensity = 0.3 + (cos + 1) * 0.7
	const r = Math.round(modelColor.r * lightIntensity)
	const g = Math.round(modelColor.g * lightIntensity)
	const b = Math.round(modelColor.b * lightIntensity)
	return `rgb(${r}, ${g}, ${b})`
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
