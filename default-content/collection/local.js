var infoDataMap = {}

var getCountryCode = function(d) {
    var cnt = d["properties"]["ISO2"]
    return cnt
}

var createGeoMap = function(mapData, cv, filterlist) {

    // filter some countries 
    mapData["features"] = mapData["features"].filter(function(d) {
        var code = d["properties"]["ISO2"]
        if (filterlist.includes(code)) {
            return false;
        }
        return true;
    })

    var geoMap = wbGeoMap()
        .width(cv.width)
        .height(cv.height)
        .mapFill("#DBDBDB")
        .mapStroke("#FFFFFF")
        .allowZoom(false)
    cv.datum(mapData).call(geoMap)

    return geoMap
}

var addTitle = function(cv, title1, title2) {

    var title = cv.append("text")
        .style("fill", "#E20074")
        .style("font-size", "160%")
        .style("font-weight", "bold")
        .style("dominant-baseline", "hanging")
        .attr("y", -cv.mar.top)
    title.append("tspan").text(title1)
    title.append("tspan").attr("x", "0").attr("y", -cv.mar.top + 35).text(title2)
}

var prepareData = function(infoData) {
    infoData.forEach(function(d) {
        d["nga-coverage"] = +d["nga-coverage"]
        if (d["nga-coverage"] > 80) {
            d["nga-group"] = 0
            d["nga-color"] = "#E20074"
        } else if (d["nga-coverage"] > 75) {
            d["nga-group"] = 1
            d["nga-color"] = "#FF55AC"
        } else if (d["nga-coverage"] > 70) {
            d["nga-group"] = 2
            d["nga-color"] = "#FF8DC8"
        } else {
            d["nga-group"] = 3
            d["nga-color"] = "#FFC6E3"
        }
        infoDataMap[d["country"]] = d
    })
    return infoDataMap
}

var addLegendA = function(cv, xshift, y, texts, colors, stroke) {
    var lgroup = cv.append("g")
        .attr("transform", "translate(" + (cv.wid - xshift) + "," + y + ")")
    var text = lgroup.append("text")
        .style("dominant-baseline", "hanging")
        .style("font-size", "80%")
    text.append("tspan").text("NGA Abdeckung")
        .style("font-weight", "bold")
    text.append("tspan").attr("x", "0").attr("y", 15).text("in % der Haushalte")

    
    var leg = d3wb.add.legend()
        .text(texts)
        .colors(colors)
        .color("black")
        .y(45).x(5)
        .symbol(d3.symbolSquare)
    if (stroke) {
        leg.stroke("grey")
    }
    lgroup.call(leg)
    return lgroup
}

var addLegendB = function(lgroup, y2, t1, t2) {
    var text2 = lgroup.append("text")
        .style("dominant-baseline", "hanging")
        .style("font-size", "80%")
        .attr("transform", "translate(22," + y2 + ")")
    text2.append("tspan").text(t1)
        .style("font-weight", "bold")
    text2.append("tspan").attr("x", "0").attr("y", 15).text(t2)
    lgroup.append("circle")
        .attr("transform", "translate(5," + (y2 + 8) + ")")
        .attr("fill", "#6BB324")
        .attr("stroke", "white")
        .attr("stroke-width", 0.5)
        .attr("r", 7)
}

var addLegendC = function(lgroup, scale, yshift, vals) {
    var text2 = lgroup.append("text")
        .style("dominant-baseline", "hanging")
        .style("font-size", "80%")
        .attr("transform", "translate(0," + (200 + yshift) + ")")
    text2.append("tspan").text(
            d3wb.symbol.mean + " 3G/LTE Abdeckung"
        )
        .style("font-weight", "bold")
    text2.append("tspan").attr("x", "0").attr("y", 15)
        .text("in % der Haushalte")
    var colors = []
    var texts = []
    for (val in vals) {
        colors.push(scale(vals[val]))
        texts.push(vals[val] + "%")
    }
    colors.reverse()
    texts.reverse()
    var g2 = lgroup.append("g")
    g2.call(d3wb.add.legend()
        .text(texts)
        .colors(colors)
        .color("black")
        .y(245+yshift).x(5)
        .stroke("grey")
        .symbol(d3.symbolCircle)
    )
}


var correctPosition = function(bbc, cnt, test, x, y) {
    if (cnt != test) {
        return bbc
    }
    bbc[0] = bbc[0] + x
    bbc[1] = bbc[1] + y
    return bbc
}

var drawCircles = function(d, thisP, cv, users, circles, circleRads, circleCnts, circleTexts, circleY, figIndex, nf, fill) {
    fill = fill || function() {
        return "#6BB324"
    }
    var cnt = getCountryCode(d)
    var bbc = d3wb.util.getBoundingBoxCenter(thisP)
    // manually move some circles 
    if (figIndex <= 2) {
        bbc = correctPosition(bbc, cnt, "NL", 0, -20)
    }
    if (figIndex == 2) {
        bbc = correctPosition(bbc, cnt, "NO", -20, 0)
    }
    if (figIndex > 2) {
        bbc = correctPosition(bbc, cnt, "NO", -20, 0)
        bbc = correctPosition(bbc, cnt, "LV", 30, 0)
        bbc = correctPosition(bbc, cnt, "NL", 0, -10)
        bbc = correctPosition(bbc, cnt, "BE", -20, -5)
        bbc = correctPosition(bbc, cnt, "SK", 0, -10)
        bbc = correctPosition(bbc, cnt, "HU", 0, 10)
        bbc = correctPosition(bbc, cnt, "SI", 0, 8)
        bbc = correctPosition(bbc, cnt, "HR", 5, 10)

    }

    var info = infoDataMap[cnt]
    if (info === undefined || info[users] === "") {
        return;
    }
    info[users] = +info[users]
    var circle = circles.append("g")
        .attr("class", "green-circles")
        .attr("pointer-events", "none")
        .attr("transform", "translate(" + bbc[0] + "," +
            bbc[1] + ")")
    circle.append("circle")
        .attr("fill", function() {
            return fill(info[users])
        })
        .attr("stroke", "white")
        .attr("stroke-width", 0.5)
        .attr("r", function(d) {
            return circleRads(info[users])
        })

    circle.append("text")
        .attr("fill", "white")
        .attr("text-anchor", "middle")
        .attr("font-size", function() {
            return circleCnts(info[users]) + "%"
        })
        .attr("dominant-baseline", "ideographic")
        .text(info["country"])
    circle.append("text")
        .attr("transform", function() {
            return "translate(0," + circleY(info[users]) + ")"
        })
        .attr("fill", "white")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "ideographic")
        .style("font-weight", "bold")
        .attr("font-size", function() {
            return circleTexts(info[users])
        })
        .text(d3.format(nf)(info[users]))
}

var tt = wbCooltip()
    .selector(function(d) {
        var cnt = getCountryCode(d)
        var info = infoDataMap[cnt]
        var ttext = d["properties"]["ISO2"] + " - " +
            d["properties"]["NAME"]
        if (info === undefined) {
            return ttext
        }
        ttext = ttext + "\nNGA: " +
            info["nga-coverage"] + "%"
        return ttext
    })

var tt2 = wbCooltip()
    .selector(function(d) {
        var cnt = getCountryCode(d)
        var info = infoDataMap[cnt]
        var ttext = d["properties"]["ISO2"] + " - " +
            d["properties"]["NAME"]
        if (info === undefined) {
            return ttext
        }
        ttext = ttext + "\nNGA: " +
            d3.format(".2f")(info["nga-coverage"]) + "%\n" +
            d3wb.symbol.mean + " 3G/LTE: " +
            d3.format(".2f")(info["3g-lte-coverage"]) + "%\n"
            + "3G: " +
            d3.format(".2f")(info["3g-coverage"]) + "%\n" +
            "LTE: " +
            d3.format(".2f")(info["lte-coverage"]) + "%"
        return ttext
    })

var tt3 = wbCooltip()
    .selector(function(d) {
        var cnt = getCountryCode(d)
        var info = infoDataMap[cnt]
        var ttext = d["properties"]["ISO2"] + " - " +
            d["properties"]["NAME"]
        if (info === undefined) {
            return ttext
        }
        ttext = ttext + "\nNGA: " +
            d3.format(".2f")(info["nga-coverage-rural"]) + "%\n" +
            d3wb.symbol.mean + " 3G/LTE: " +
            d3.format(".2f")(info["3g-lte-coverage-rural"]) + "%\n"
            + "3G: " +
            d3.format(".2f")(info["3g-coverage-rural"]) + "%\n" +
            "LTE: " +
            d3.format(".2f")(info["lte-coverage-rural"]) + "%"
        return ttext
    })