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
        var users = "3g-lte-coverage"
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
        var fillScale = d3wb.color.linearGradient([86, 100], ["#DBDBDB", "#6BB324"])
        var fill = function(val) {
            return fillScale(val);
        }

        var lg = addLegendA(cv, 130, 0, ltexts, lcolors, true)
        addLegendC(lg, fillScale, 0, [85, 90, 95, 100])


        var circles = cv.append("g")
        var circleRads = d3.scaleLinear().domain(usersMinMax)
            .range([11, 20])
        var circleCnts = d3.scaleLinear().domain(usersMinMax)
            .range([60, 90])
        var circleTexts = d3.scaleLinear().domain(usersMinMax)
            .range([12, 20])
        var circleY = d3.scaleLinear().domain(usersMinMax)
            .range([10, 20])



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
            .call(tt2)
            .each(function(d) {
                drawCircles(d, this, cv, users, circles, circleRads, circleCnts, circleTexts, circleY, 3, ".0f", fill)
            })

        cv.call(d3wb.html.button()
            .options(["3G/LTE ausblenden", "3G/LTE einblenden"])
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

        cv.call(
            d3wb.add.infoBox(
                "National")
            .fill("#FF9A1E")
            .roundCorners(3)
            .x(cv.mar.left + 50)
            .y(cv.mar.top + 20)
            .rotate(-15)
        )
    }

})()