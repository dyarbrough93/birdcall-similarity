'use strict'

let svg = d3.select('svg'),
    width = +svg.attr('width'),
    height = +svg.attr('height');

let color = d3.scaleOrdinal(d3.schemeCategory20);

let simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(function(d) {
        return d.id;
    }).distance(function(d) {
        let neg = d.value < 0.5 ? -1 : 1
        return d.value * 250 * neg
    }).strength(function(d) {
        return d.value
    }))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2));

function linkColor(val) {

    let col = d3.scaleLinear()
        .domain([0, 1])
        .range(['#000000', '#0021ff'])

    return col(val)

}

d3.json('src/data/birdcalls.json', function(error, graph) {
    if (error) throw error;

    let link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(graph.links)
        .enter().append('line')
        .attr('stroke-width', function(d) {
            return d.value * 0.05
        }).style('stroke', function(d) {
            return linkColor(d.value)
        })

    let node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(graph.nodes)
        .enter().append('circle')
        .attr('r', 5)
        .attr('fill', function(d) {
            return color(d.group);
        })
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

    node.append('title')
        .text(function(d) {
            return d.id;
        });

    simulation
        .nodes(graph.nodes)
        .on('tick', ticked);

    simulation.force('link')
        .links(graph.links);

    function ticked() {
        link
            .attr('x1', function(d) {
                return d.source.x;
            })
            .attr('y1', function(d) {
                return d.source.y;
            })
            .attr('x2', function(d) {
                return d.target.x;
            })
            .attr('y2', function(d) {
                return d.target.y;
            });

        node
            .attr('cx', function(d) {
                return d.x;
            })
            .attr('cy', function(d) {
                return d.y;
            });
    }
});

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
