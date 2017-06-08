'use strict'

let audio
let currAudioFile

let width = window.innerWidth - 20,
	height = window.innerHeight - 20

let svg = d3.select('svg')
	.attr('width', width)
	.attr('height', height)

let simulation = d3.forceSimulation()
	.force('link', d3.forceLink().id(function(d) {
		return d.id
	}).distance(function(d) {
		return d.value * 300
	}).strength(function(d) {
		return 1 - d.value
	}))
	.force('charge', d3.forceManyBody())
	.force('center', d3.forceCenter(width / 2, height / 2))
	.stop()

function color(val, domain) {

	let col = d3.scaleLinear()
		.domain(domain)
		.range(['#ff0000', '#0029ff'])

	return col(val)

}

d3.json('src/data/birdcalls.json', function(error, graph) {
	if (error) throw error

	simulation
		.nodes(graph.nodes)

	simulation.force('link')
		.links(graph.links)

	for (let i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n * 1; ++i) {
		simulation.tick()
	}

	let link = svg.append('g')
		.attr('class', 'links')
		.selectAll('line')
		.data(graph.links)
		.enter().append('line')
		.attr('stroke-width', function(d) {
			let val = 1 - d.value
			return (val * val * val) // * 0.6
			//return 0.1
		}).style('stroke', function(d) {
			return color(1 - d.value, [0, 1])
			//return 'black'
		})
		.attr('x1', function(d) {
			return d.source.x
		})
		.attr('y1', function(d) {
			return d.source.y
		})
		.attr('x2', function(d) {
			return d.target.x
		})
		.attr('y2', function(d) {
			return d.target.y
		})

	let node = svg.append('g')
		.attr('class', 'nodes')
		.selectAll('circle')
		.data(graph.nodes)
		.enter().append('circle')
		.attr('r', 5)
		.attr('fill', function(d) {

			let totalSimilarity = 0
			let totalLinks = 0

			graph.links.forEach(function(link) {
				if (link.source.id === d.id) {
					totalSimilarity += link.value
					totalLinks++
				}
			})

			let val = 1 - (totalSimilarity / totalLinks)

			return color(val, [0, 0.3])

		})
		.on('mouseover', mouseOver)
		.on('mouseout', mouseOut)
		.attr('cx', function(d) {
			return d.x
		})
		.attr('cy', function(d) {
			return d.y
		})

	let text = svg.append('g')
		.attr('class', 'nodeText')
		.selectAll('text')
		.data(graph.nodes)
		.enter().append('text')
		.attr('class', function(d) { return 'text' + d.id })
		.text(function(d) {
			return d.commonName + ' (' + d.scientificName + ')'
		})
		.style('display', 'none')
		.on('mouseover', mouseOver)
		.on('mouseout', mouseOut)
		.attr('x', function(d) {
			return d.x
		})
		.attr('y', function(d) {
			return d.y
		})

	function mouseOver(d) {

		if (d.filename !== currAudioFile) {
			if (audio) audio.pause()
			currAudioFile = d.filename
			audio = new Audio('src/data/birdcall-mp3s/' + d.filename)
			audio.play()
		}

		d3.select(document.body).style('cursor', 'pointer')
		d3.select('.text' + d.id).style('display', 'block')
	}

	function mouseOut(d) {
		d3.select(document.body).style('cursor', 'auto')
		d3.select('.text' + d.id).style('display', 'none')
	}

})

window.addEventListener('resize', function() {
	width = window.innerWidth - 20
	height = window.innerHeight - 20
	svg.attr('width', width)
		.attr('height', height)
})

window.addEventListener('selectstart', function(e) {
	e.preventDefault()
})
