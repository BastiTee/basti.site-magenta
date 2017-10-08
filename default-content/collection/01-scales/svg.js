(function() {

    var cv = d3wb.config()
        .attr("margin", "70 20 20 20")
        .data(["../europe.json", "../data.csv"])
        .toCanvas()

    d3.queue()
        .defer(d3.json, cv.data[0])
        .defer(d3.csv, cv.data[1])
        .await(function(error, mapData, infoData) {
            visualize(mapData, infoData)
        })

    function visualize(mapData, infoData) {

        var geoMap = createGeoMap(mapData, cv, ["TR", "CY", "IL", "GE", "AZ", "AM"])
        addTitle(cv, "SCHNELLES INTERNET IN EUROPA: DEUTSCHLAND",
            "IM MITTELFELD")
        var infoDataMap = prepareData(infoData)
        var users = "households-rel"
        var usersMinMax = d3.extent(infoData.filter(function(d) {
            return d[users] !== ""
        }), function(d) {
            return +d[users]
        })
        var colorScale = d3wb.color.linearGradient([40, 100], ["#FFC6E3", "#E20074"])
        var ltexts = ["100%", "90%", "80%", "70%", "60%", "50%", "40%"]
        var lcolors = [
            colorScale(100),
            colorScale(90),
            colorScale(80),
            colorScale(70),
            colorScale(60),
            colorScale(50),
            colorScale(40)
        ]
        var lg = addLegendA(
            cv, 100, 0, ltexts, lcolors)
        addLegendB(lg, 200, "Haushalte", "pro NGA Anschl.")
        
        var circles = cv.append("g")
        var circleRads = d3.scaleLinear().domain(usersMinMax)
            .range([13, 27].reverse())
        var circleCnts = d3.scaleLinear().domain(usersMinMax)
            .range([60, 120].reverse())
        var circleTexts = d3.scaleLinear().domain(usersMinMax)
            .range([12, 24].reverse())
        var circleY = d3.scaleLinear().domain(usersMinMax)
            .range([10, 22].reverse())

        cv.selectAll(".wb-feature-paths")
            .style("fill", function(d) {
                var cnt = getCountryCode(d)
                var info = infoDataMap[cnt]
                if (info === undefined) {
                    return "#DBDBDB"
                } else {
                    return colorScale(info["nga-coverage"])
                }
            })
            .call(tt)
            .each(function(d) {
                drawCircles(d, this, cv, users, circles, circleRads, circleCnts, circleTexts, circleY, 2, ".1f")
            })

        cv.call(d3wb.html.button()
            .options(["Haushalte ausblenden", "Haushalte einblenden"])
            .callback(function(value, index) {
                var opacity = index == 0 ? 0.0 : 1.0
                cv.selectAll(".green-circles")
                    .transition().duration(1000)
                    .attr("opacity", opacity)
            })
            .style("bottom", cv.mar.bottom + "px")
            .style("right", "0px")
            .style("font-size", "75%")
            
            
        )


    }

})()