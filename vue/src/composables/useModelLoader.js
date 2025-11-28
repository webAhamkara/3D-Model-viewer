import { calculatingTheNormal, calculatingTheCos } from './use3DMath'

export function parseObjText(text) {
	const vertices = []
	const textures = []
	let polygons = []
	const lines = text.split('\n')
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].trim() === '') continue
		if (lines[i].startsWith('v ')) {
			const parts = lines[i].trim().split(/\s+/)
			vertices.push({
				x: parseFloat(parts[1]),
				y: parseFloat(parts[2]),
				z: parseFloat(parts[3]),
			})
		} else if (lines[i].startsWith('vt')) {
			const coordinates = lines[i].trim().split(/\s+/)
			if (coordinates.length >= 3) {
				const x = parseFloat(coordinates[1])
				const y = parseFloat(coordinates[2])
				const z = coordinates.length >= 4 ? parseFloat(coordinates[3]) : 0

				if (!isNaN(x) && !isNaN(y)) {
					textures.push({ x, y, z })
				}
			}
		}
	}

	for (let j = 0; j < lines.length; j++) {
		if (lines[j].trim() === '') continue
		if (lines[j].startsWith('f ')) {
			const verticesArray = []
			const textureArray = []
			const polygon = lines[j].split(' ')
			for (let i = 1; i < polygon.length; i++) {
				if (!polygon[i] || polygon[i].trim() === '') continue
				const point = parseFloat(polygon[i].split('/')[0]) - 1
				const texture = parseFloat(polygon[i].split('/')[1]) - 1
				verticesArray.push(point)
				textureArray.push(texture)
			}
			polygons.push({ vertices: verticesArray, textures: textureArray })
		}
	}
	const triangulatedPolygons = []
	for (let i = 0; i < polygons.length; i++) {
		if (polygons[i].vertices.length > 3) {
			const fixedVertex = polygons[i].vertices[0]
			const fixedTexture = polygons[i].textures[0]

			for (let j = 0; j < polygons[i].vertices.length - 2; j++) {
				triangulatedPolygons.push({
					vertices: [
						fixedVertex,
						polygons[i].vertices[j + 1],
						polygons[i].vertices[j + 2],
					],
					textures: [
						fixedTexture,
						polygons[i].textures[j + 1],
						polygons[i].textures[j + 2],
					],
				})
			}
		} else if (polygons[i].vertices.length === 3) {
			triangulatedPolygons.push({
				vertices: polygons[i].vertices,
				textures: polygons[i].textures,
			})
			continue
		}
	}
	polygons = triangulatedPolygons

	const vertexCount = new Array(vertices.length).fill(0)
	for (let i = 0; i < polygons.length; i++) {
		vertexCount[polygons[i].vertices[0]] += 1
		vertexCount[polygons[i].vertices[1]] += 1
		vertexCount[polygons[i].vertices[2]] += 1
	}

	const vertexNormalsX = new Array(vertices.length).fill(0)
	const vertexNormalsY = new Array(vertices.length).fill(0)
	const vertexNormalsZ = new Array(vertices.length).fill(0)

	for (let c = 0; c < polygons.length; c++) {
		const [id1, id2, id3] = polygons[c].vertices
		const normal = calculatingTheNormal(
			vertices[id1].x,
			vertices[id1].y,
			vertices[id1].z,
			vertices[id2].x,
			vertices[id2].y,
			vertices[id2].z,
			vertices[id3].x,
			vertices[id3].y,
			vertices[id3].z
		)
		const normalLength = Math.sqrt(
			normal.normalX ** 2 + normal.normalY ** 2 + normal.normalZ ** 2
		)
		if (normalLength === 0 || isNaN(normalLength)) {
			continue
		}
		vertexNormalsX[id1] += normal.normalX
		vertexNormalsY[id1] += normal.normalY
		vertexNormalsZ[id1] += normal.normalZ

		vertexNormalsX[id2] += normal.normalX
		vertexNormalsY[id2] += normal.normalY
		vertexNormalsZ[id2] += normal.normalZ

		vertexNormalsX[id3] += normal.normalX
		vertexNormalsY[id3] += normal.normalY
		vertexNormalsZ[id3] += normal.normalZ
	}
	for (let k = 0; k < vertices.length; k++) {
		vertexNormalsX[k] /= vertexCount[k]
		vertexNormalsY[k] /= vertexCount[k]
		vertexNormalsZ[k] /= vertexCount[k]
	}
	const vertexNormals = {
		x: vertexNormalsX,
		y: vertexNormalsY,
		z: vertexNormalsZ,
	}
	const orientation = determineTheOrientation(vertices)
	// console.log(orientation)
	return { vertices, textures, polygons, vertexNormals, orientation }
}

function determineTheOrientation(vertices) {
	let minX = Infinity,
		minY = Infinity,
		minZ = Infinity,
		maxX = -Infinity,
		maxY = -Infinity,
		maxZ = -Infinity
	vertices.forEach(v => {
		minX = Math.min(v.x, minX)
		minY = Math.min(v.y, minY)
		minZ = Math.min(v.z, minZ)
		maxX = Math.max(v.x, maxX)
		maxY = Math.max(v.y, maxY)
		maxZ = Math.max(v.z, maxZ)
	})
	const lengthX = maxX - minX
	const lengthY = maxY - minY
	const lengthZ = maxZ - minZ

	const max = Math.max(lengthX, lengthY, lengthZ)
	if (max === lengthY) return 'Y'
	if (max === lengthZ) return 'Z'
	return 'X'
}
