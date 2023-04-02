let currentFn = null;
let currentCirc = null;
let radius = 5;
let hoverRadius = 8;
let circleData = [];

let SCALING_FACTOR = 1000;

let tHover = d3.transition()
  .duration(500)
  .ease(d3.easeLinear);

  function modeToggle(){
    if(document.getElementById('modeSwitch').checked){
      localStorage.setItem('mode', 'op-mode');
    } else {
      localStorage.setItem('mode', '');
    }
    location.reload();
  }

document.addEventListener("DOMContentLoaded", function() {

  let tSwitcher = document.getElementById('modeSwitch');
  let element = document.body;

  let onpageLoad = localStorage.getItem("mode") || "";
  if (onpageLoad != null && onpageLoad  == 'op-mode'){
    tSwitcher.checked = true;
    document.getElementById("title-header").innerHTML = "Function OpCounter"
    SCALING_FACTOR = 1;
  }

  setUpFunctions();
  d3.select(".btn-primary").dispatch("click");
  setUpGraph();

  d3.select("#plot")
    .on("submit", function() {
      d3.event.preventDefault();
      let button = d3.select("#plot > button");
      let calculating = d3.select(".calculating");
      if (!button.classed("disabled")) {
        button.classed("disabled", true);
        calculating.classed("hidden", false);
        let value = +d3.event.target.fn_input.value;
        let worker = createWorker(currentFn.fn.name, value);
        worker.onmessage = function(event) {
          button.classed("disabled", false);
          calculating.classed("hidden", true);

        if (document.getElementById('modeSwitch').checked) {
          circleData.push({
            x: value,
            y: currentFn.bigOh(value),
            //y: event.data.time,
            color: event.data.color
          });
        }
        else {
          circleData.push({
            x: value,
            y: event.data.time,
            color: event.data.color
          });
        }

          updateGraph(
            d3.select("svg"),
            circleData,
            currentFn
          );

        };
      }
    });

  d3.select("body")
    .on("keydown", function() {
      if (currentCirc) {
        handleXAdd();
      }
    });

  d3.select("body")
    .on("keyup", function() {
      handleXRemove();
    });
});

function setUpFunctions() {
  d3.select(".btn-area")
    .selectAll("button")
    .data(functions)
    .enter()
    .append("button")
      .attr("type", "button")
      .attr("class", d => `btn btn-${d.className}`)
      .html(d => `<pre><code>${d.fn.name}</code></pre>`)
      .on("click", setCurrentFunction);
}

function setCurrentFunction(d) {
  currentFn = d;
  let codeBlock = d3.select(".js").text(d.fnJavaScript);
  hljs.highlightBlock(codeBlock.node());
}

function setUpGraph() {
  let width = document.querySelector(".col-6").offsetWidth - 30;
  let height = width * 3 / 4;
  let padding = {
    top: 10,
    right: 10,
    bottom: 40,
    left: 60
  };

  let svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
    .datum({ padding: padding });

  svg
    .append("g")
    .attr("transform", "translate(0, " + (height - padding.bottom) + ")")
    .classed("x-axis", true);

  svg
    .append("g")
    .attr("transform", "translate(" + padding.left + ", 0)")
    .classed("y-axis", true);

  svg
    .append("text")
    .classed("label", true)
    .attr("transform", "translate(" + (width / 2) + ", " + (height - padding.bottom / 4) +")")
    .text("n (tamaño del input)");

    if (document.getElementById('modeSwitch').checked) {
      svg
      .append("text")
      .classed("label", true)
      .attr("transform", "rotate(-90)")
      .attr("x", (-height + padding.top + padding.bottom ) / 2)
      .attr("y", 15)
      .text("Número de operaciones aprox.");
    }
    else {
      svg
      .append("text")
      .classed("label", true)
      .attr("transform", "rotate(-90)")
      .attr("x", (-height + padding.top + padding.bottom ) / 2)
      .attr("y", 15)
      .text("Tiempo (segundos)");
    }
}

function updateGraph(svg, circleData, currentFn) {

  let width = +svg.attr("width");
  let height = +svg.attr("height");
  let padding = svg.datum().padding;
  let t = d3.transition().duration(1000);
  let tNew = d3.transition()
    .delay(500)
    .duration(1000)
    .ease(d3.easeElasticOut);

  let xScale = d3.scaleLinear()
    .domain(d3.extent(circleData, d => d.x))
    .range([padding.left, width - padding.right]);

  let yScale = d3.scaleLinear()
    .domain(d3.extent(circleData, d => d.y / SCALING_FACTOR))
    .range([height - padding.bottom, padding.top]);

  // update axes
  svg
    .select(".x-axis")
    .transition(t)
    .call(
      d3.axisBottom(xScale)
        .tickFormat(d3.format(".2s"))
        .tickSize(-height + padding.top + padding.bottom)
        .tickSizeOuter(0)
    );



    if (document.getElementById('modeSwitch').checked) {
      svg
      .select(".y-axis")
      .transition(t)
      .call(
        d3.axisLeft(yScale)
        .tickFormat(d3.format(",.2r"))
        .tickSize(-width + padding.left + padding.right)
        .tickSizeOuter(0)
      );
    }
    else {
      svg
      .select(".y-axis")
      .transition(t)
      .call(
        d3.axisLeft(yScale)
        .tickFormat(d3.format(".2s"))
        .tickSize(-width + padding.left + padding.right)
        .tickSizeOuter(0)
      );

    }


  // update circles
  let circles = svg
    .selectAll("circle")
    .data(circleData, d => `${d.x}-${d.y}-${d.color}`);

  circles
    .exit()
    .remove();

  circles
    .transition(t)
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y / SCALING_FACTOR));

  circles
    .enter()
    .append("circle")
      .attr("fill", d => d.color)
      .attr("r", 0)
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y / SCALING_FACTOR))
      .on("mousemove", handleHover)
      .on("mouseout", handleMouseOut)
      .on("click", handleClick)
    .transition(tNew)
      .attr("r", radius);

  // update lines
  let lines = svg
    .selectAll("path.line")
    .data(getLineData(circleData), d => d.key);

  lines
    .exit()
    .remove();

  lines
    .enter()
    .append("path")
      .classed("line", true)
      .attr("stroke", d => d.key)
    .merge(lines)
      .transition(t)
      .attr("d", d => d3
        .line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y / SCALING_FACTOR))
        (d.value.sort((d1, d2) => d1.x - d2.x))
      );

}

function handleHover(d) {
  currentCirc = d3.select(this);
  currentCirc
    .interrupt()
    .transition(tHover)
    .attr("r", hoverRadius);

  handleXAdd();
}

function handleMouseOut(d) {
  currentCirc = null;
  d3.selectAll("circle")
    .interrupt()
    .transition(tHover)
    .attr("r", radius);

  handleXRemove();
}

function handleClick() {
  let selection;
  if (d3.event.metaKey) selection = currentCirc;
  if (d3.event.shiftKey) selection = d3.selectAll(
    `circle[fill="${currentCirc.attr('fill')}"]`
  );
  if (selection) {
    let data = selection.data();
    data.forEach(d => {
      let idx = circleData.findIndex(c => c === d);
      circleData.splice(idx, 1);
    });
    updateGraph(
      d3.select("svg"),
      circleData,
      currentFn
    );
  }
  currentCirc = null;
  handleXRemove();
}

function handleXAdd() {
  let selection;
  if (d3.event.metaKey) selection = currentCirc;
  if (d3.event.shiftKey) selection = d3.selectAll(
    `circle[fill="${currentCirc.attr('fill')}"]`
  );
  if (selection) {
    selection.each(function(d, i) {
      let circle = d3.select(this);
      let newX = d3.select("svg").append("g")
        .classed("circle-remove", true);
      let stroke = circle.attr("fill") === "#dc3545" ? "#343a40" : "#dc3545";
      newX.append("line")
        .attr("x1", +circle.attr("cx") - hoverRadius)
        .attr("x2", +circle.attr("cx") + hoverRadius)
        .attr("y1", +circle.attr("cy") + hoverRadius)
        .attr("y2", +circle.attr("cy") - hoverRadius)
        .attr("stroke", stroke)
        .attr("stroke-width", hoverRadius / 3);
      newX.append("line")
        .attr("x1", +circle.attr("cx") - hoverRadius)
        .attr("x2", +circle.attr("cx") + hoverRadius)
        .attr("y1", +circle.attr("cy") - hoverRadius)
        .attr("y2", +circle.attr("cy") + hoverRadius)
        .attr("stroke", stroke)
        .attr("stroke-width", hoverRadius / 3);
      newX
        .interrupt()
        .transition(tHover)
        .style("opacity", 1);
    });
  }
}

function handleXRemove() {
  let e = d3.event;
  let isMouseOut = e.type === "mouseout";
  let isClick = e.type === "click";
  let metaOff = e.type === "keyup" && !e.metaKey;
  let shiftOff = e.type === "keyup" && !e.shiftKey;
  if (isMouseOut || isClick || shiftOff) {
    d3.selectAll(".circle-remove")
      .interrupt()
      .transition(tHover)
      .style("opacity", 0)
      .remove();
  }
  if (!metaOff && !isClick) handleXAdd();
}

function getLineData(circleData) {
  return d3.nest()
    .key(d => d.color)
    .rollup(points => (
      points.reduce((avgs, pt) => {
        let cur = avgs.find(d => d.x === pt.x);
        if (!cur) avgs.push({
          x: pt.x,
          y: d3.mean(points, d => d.x === pt.x ? d.y : undefined)
        });
        return avgs;
      }, [])
    ))
    .entries(circleData);
}

function createWorker(name, input) {
  let worker = new Worker("worker.js");
  worker.postMessage({ name: name, input: input});
  return worker;
}
