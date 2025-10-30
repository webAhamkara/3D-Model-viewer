export async function getObj(url) {
	try {
		const response = await fetch(url)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		const data = await response.text()
		const { vertices, polygons } = parseObjText(data)
		return { vertices, polygons }
	} catch (error) {
		console.error('Ошибка загрузки модели:', error)
		return null
	}
}

function parseObjText(text) {
	const vertices = []
	const polygons = []
	const lines = text.split('\n')
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].startsWith('v ')) {
			const parts = lines[i].split(' ')
			vertices.push({
				x: parseFloat(parts[1]),
				y: parseFloat(parts[2]),
				z: parseFloat(parts[3]),
			})
		}
	}
	for (let j = 0; j < lines.length; j++) {
		if (lines[j].startsWith('f ')) {
			const polygon = lines[j].split(' ')
			const firstPoint = parseFloat(polygon[1].split('/')[0]) - 1
			const secondPoint = parseFloat(polygon[2].split('/')[0]) - 1
			const thirdPoint = parseFloat(polygon[3].split('/')[0]) - 1
			polygons.push([firstPoint, secondPoint, thirdPoint])
		}
	}
	return { vertices, polygons }
}
