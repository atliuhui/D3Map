/* global $ */
/* global d3 */

$(function(){
    var width  = 800;
    var height = 600;
    var scaleNum = 1;
    var svg = d3.select('#map').append('svg')
        .attr('width', width)
        .attr('height', height);
    var map = svg.append('g')
        .attr('transform', 'translate(0,0)');
    var map2 = svg.append('g')
        .attr('transform', 'translate(0,0)');
    var place = svg.append('g')
        .attr('transform', 'translate(0,0)');
    var place2 = svg.append('g')
        .attr('transform', 'translate(0,0)');
    var place3 = svg.append('g')
        .attr('transform', 'translate(0,0)');
    
    var projection = d3.geo.mercator().scale(1).translate([0,0]).precision(0);
    var path = d3.geo.path().projection(projection);
    
    d3.json('/data/china-geo.json', function(error, mapgeo) {
        var bounds = path.bounds(mapgeo);
        var scale = scaleNum / Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height);
        var translate = [(width - scale * (bounds[1][0] + bounds[0][0])) / 2, (height - scale * (bounds[1][1] + bounds[0][1])) / 2];
        projection.scale(scale).translate(translate);
        
        // var color = d3.scale.ordinal()
        // 	.range(['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026']);
        
        map.selectAll('path').data(mapgeo.features).enter().append('path')
            .attr('d', path)
            .style('stroke', '#d9d9d9')
            .style('stroke-width', 1)
            .style('fill', '#f0f0f0');

        d3.xml('/data/southchinasea.svg', function(error, mapsvg) {
            var w = parseInt(mapsvg.getElementsByTagName('svg')[0].attributes['width'].value);
            var h = parseInt(mapsvg.getElementsByTagName('svg')[0].attributes['height'].value);
            var g = mapsvg.getElementById('southsea').outerHTML;
            var scaleNum2 = scaleNum / 1.2;
            map2.html(g)
                .select('#southsea')
                .attr('transform', 'translate({w},{h})scale({s})'
                    .replace(/{w}/g, width - w * scaleNum2)
                    .replace(/{h}/g, height - h * scaleNum2)
                    .replace(/{s}/g, scaleNum2))
                .style('stroke', '#d9d9d9')
                .style('stroke-width', 1)
                .style('fill', '#f0f0f0');
        });
        d3.json('/data/city-geo.json', function(placegeo) {
            place2.selectAll('circle').data(placegeo.features).enter().append('circle')
                .attr('transform', function(d){ return 'translate(' + projection(d.geometry.coordinates) + ')'; })
                .attr('r', 3)
                .style('fill', function(d,i){
                    return '#08519c';
                });
            place3.selectAll('circle').data(placegeo.features).enter().append('circle')
                .attr('transform', function(d){ return 'translate(' + projection(d.geometry.coordinates) + ')'; })
                .attr('r', 8)
                .style('opacity', 0.3)
                .style('fill', function(d,i){
                    return '#08519c';
                });
        });
        d3.json('/data/petro-geo.json', function(placegeo) {
            place.selectAll('image').data(placegeo.features).enter().append('image')
                .attr('xlink:href', '/images/favicon.ico')
                .attr('width', 16)
                .attr('height', 16)
                .attr('x', function(d,i){return projection(d.geometry.coordinates)[0];})
                .attr('y', function(d,i){return projection(d.geometry.coordinates)[1];})
                .on('click',function(d,i){
                    $('#popover').find('#popover-title').text(d.properties.name);
                    $('#popover').find('#popover-content-oil span').text(d.properties.oil);
                    $('#popover').find('#popover-content-gas span').text(d.properties.gas);
                    $('#popover').find('#popover-content-rate span').text(d.properties.rate);
                    $('#popover').show()
                        .css('left', (d3.event.offsetX - $('#popover').width() / 2 - 5) + "px")
                        .css('top', (d3.event.offsetY - $('#popover').height() - 5) + "px");
                });
            place.selectAll('text').data(placegeo.features).enter().append('text')
                .text(function(d,i){return d.properties.name;})
                .style('font', 'normal normal normal 14px "微软雅黑 Bold","微软雅黑"')
                .attr('x', function(d,i){
                    switch(d.properties.id){
                        case '09':
                            return projection(d.geometry.coordinates)[0]+20-80;
                        case '10':
                            return projection(d.geometry.coordinates)[0]+20-80;
                        case '15':
                            return projection(d.geometry.coordinates)[0]+20-65;
                        default:
                            return projection(d.geometry.coordinates)[0]+20;
                    }
                })
                .attr('y', function(d,i){return projection(d.geometry.coordinates)[1]+13;});
            $('body').on('click', function(){
                if(window.event.target.nodeName !== 'image'){
                    $('#popover').hide();
                }
            });
        });
    });
});