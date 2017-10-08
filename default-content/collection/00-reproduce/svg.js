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

        var geoMap = createGeoMap(mapData, cv, ["IS", "TR", "CY", "IL", "GE", "AZ", "AM"])
        addTitle(cv, "SCHNELLES INTERNET IN EUROPA: DEUTSCHLAND IN",
            "FÜHRENDER POSITION")
        var infoDataMap = prepareData(infoData)
        var users = "telekom-users"
        var usersMinMax = d3.extent(infoData, function(d) {
            return +d[users]
        })
        var ltexts = ["> 80%", "> 75%", "> 70%", "< 70%"]
        var lcolors = ["#E20074", "#FF55AC", "#FF8DC8", "#FFC6E3"]
        var lg = 
            addLegendA(cv, 100, 120, ltexts, lcolors)
        addLegendB(lg, 130, "NGA Kunden", "in Millionen")

        var circles = cv.append("g")
        var circleRads = d3.scaleLinear().domain(usersMinMax)
            .range([13, 27])
        var circleCnts = d3.scaleLinear().domain(usersMinMax)
            .range([60, 120])
        var circleTexts = d3.scaleLinear().domain(usersMinMax)
            .range([12, 24])
        var circleY = d3.scaleLinear().domain(usersMinMax)
            .range([10, 22])

        cv.selectAll(".wb-feature-paths")
            .style("fill", function(d) {
                var cnt = getCountryCode(d)
                var info = infoDataMap[cnt]
                if (info === undefined) {
                    return "#DBDBDB"
                } else {
                    return info["nga-color"]
                }
            })
            .call(tt)
            .each(function(d) {
                drawCircles(d, this, cv, users, circles, circleRads, circleCnts, circleTexts, circleY, 1, ".1f")
            })

        cv.call(
            d3wb.add.infoBox(
                "Deutschland: mehr\nNGA Nutzer als Frank-\nreich, Italien, Schweden,\nFinnland und Belgien\nzusammengenommen")
            .fill("#FF9A1E")
            .roundCorners(3)
            .x(cv.wid)
            .y(cv.mar.top)
            .rotate(-10)
        )
    }
})()