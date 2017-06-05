'use strict'

let svg = d3.select('svg'),
	width = +svg.attr('width'),
	height = +svg.attr('height')

let color = d3.scaleOrdinal(d3.schemeCategory20)

let simulation = d3.forceSimulation()
	.force('link', d3.forceLink().id(function(d) {
		return d.id
	}).distance(function(d) {
		//let neg = d.value < 0.5 ? -1 : 1
		return d.value * 300
	}).strength(function(d) {
		return 1 - d.value
	}))
	.force('charge', d3.forceManyBody())
	.force('center', d3.forceCenter(width / 2, height / 2))
	.stop()

function linkColor(val) {

	let col = d3.scaleLinear()
		.domain([0, 1])
		.range(['#dadada', '#000000'])

	return col(val)

}

d3.json('src/data/birdcalls.json', function(error, graph) {
	if (error) throw error

	simulation
		.nodes(graph.nodes)
		//.on('tick', ticked)

	simulation.force('link')
		.links(graph.links)

	let loading = svg.append('text')
		.attr('dy', '1em')
		.attr('font-family', 'sans-serif')
		.attr('font-size', 10)
		.text('Simulating. One moment please…');

	for (let i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n * 1; ++i) {
		simulation.tick()
	}

	let link = svg.append('g')
		.attr('class', 'links')
		.selectAll('line')
		.data(graph.links)
		.enter().append('line')
		.attr('stroke-width', function(d) {
			//return (1 - d.value) * 0.3
			return 0.1
		}).style('stroke', function(d) {
			return linkColor(1 - d.value)
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
			return color(d.group)
		})
		.on('mouseover', function() {
			d3.select(document.body).style('cursor', 'pointer')
		})
		.on('mouseout', function() {
			d3.select(document.body).style('cursor', 'auto')
		})
		.attr('cx', function(d) {
			console.log(d)
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
		.text(function(d) {
			return d.commonName
		})
		.on('mouseover', function() {
			d3.select(document.body).style('cursor', 'pointer')
		})
		.on('mouseout', function() {
			d3.select(document.body).style('cursor', 'auto')
		})
		.attr('x', function(d) {
			return d.x
		})
		.attr('y', function(d) {
			return d.y
		})

	loading.remove()

	function ticked() {
		link
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

		node
			.attr('cx', function(d) {
				return d.x
			})
			.attr('cy', function(d) {
				return d.y
			})

		text
			.attr('x', function(d) {
				return d.x
			})
			.attr('y', function(d) {
				return d.y
			})
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
