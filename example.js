// U78784426
// Load CSV data
d3.csv('mock_stock_data.csv').then(data => {
    data.forEach(d => {
        d.date = new Date(d.date);
        d.value = +d.value;});

    const stockNames = Array.from(new Set(data.map(d => d.stock)));

    // Populate stock selector
    const stockSelector = d3.select('#stockSelector');
    stockSelector.selectAll('option')
        .data(stockNames)
        .enter()
        .append('option')
        .text(d => d);

    // Initial rendering
    renderChart(data);

    // Add event listeners for controls
    stockSelector.on('change', () => filterAndRender(data));
    d3.select('#startDate').on('change', () => filterAndRender(data));
    d3.select('#endDate').on('change', () => filterAndRender(data));
});

function filterAndRender(data) {
    const selectedStock = d3.select('#stockSelector').property('value');
    const startDate = new Date(d3.select('#startDate').property('value'));
    const endDate = new Date(d3.select('#endDate').property('value'));

    const filteredData = data.filter(d => {
        return (!selectedStock || d.stock === selectedStock) &&
               (!isNaN(startDate) || d.date >= startDate) &&
               (!isNaN(endDate) || d.date <= endDate);
    });

    renderChart(filteredData);
}

function renderChart(data) {
    d3.select('#chart').html(''); // Clear previous chart

    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', 600)
        .attr('height', 600);

    const margin = {top: 20, right: 20, bottom: 30, left: 50};
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value));

    x.domain(d3.extent(data, d => d.date));
    y.domain(d3.extent(data, d => d.value));

    g.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

    g.append('g')
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(y))
        .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .text('Value');

    g.append('path')
        .datum(data)
        .attr('class', 'line')
        .attr('d', line);

    // Tooltip
    const tooltip = d3.select('body').append('div').attr('class', 'tooltip');

    svg.selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('r', 5)
        .attr('cx', d => x(d.date) + margin.left)
        .attr('cy', d => y(d.value) + margin.top)
        .on('mouseover', d => {
            tooltip.transition().duration(200).style('opacity', .9);
            tooltip.html(`Stock: ${d.stock}<br/>Value: ${d.value}<br/>Date: ${d.date.toLocaleDateString()}`)
                .style('left', `${d3.event.pageX + 5}px`)
                .style('top', `${d3.event.pageY - 28}px`);
        })
        .on('mouseout', () => {
            tooltip.transition().duration(500).style('opacity', 0);
        });
}
