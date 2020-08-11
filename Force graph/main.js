
//Global references
var svg, g, node, simulation;
var nodes = [],
    repulseStrength = -500,
    smartphoneCapable = false,
    nodeNames = [],
    nodeID = 0,
    links = [],
    buttons = [],
    //Other variables
    numPress = 0,
    numPressCountInAction = false,
    btnVisible = false,
    needTorestart = false;

window.onload=start;

function start(){
  initializeListeners()
  handleModal()
  handleSVG()
  initializeSVGComponents()
}

function initializeListeners(){
  window.addEventListener("keydown", function(e) {
      // space and arrow keys
      if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
          e.preventDefault();
      }
  }, false);

  var checkbox = document.querySelector("input[name=checkbox]");

  checkbox.addEventListener( 'change', function() {
      if(this.checked) {
          smartphoneCapable = true;
          console.log("enabled");
      } else {
          smartphoneCapable = false;
      }
  });
}

function handleModal(){
  modal = document.getElementById('myModal');

  d3.select('#callInst').on('click', function(){
    modal.style.display = "block";
  })

  document.getElementById('modalClose').onclick = function() {
    modal.style.display = "none";
  }

  window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
  }
  modal.style.display = 'none';
}

function handleSVG(){
  d3.select("body").select("#forSVG").append("svg").attr("height", window.innerHeight/1.1).attr("width", window.innerWidth/1.1);

  svg = d3.select("svg").attr("class", "framed"),
  width = +svg.attr("width"),
  height = +svg.attr("height"),
  color = d3.scaleOrdinal(d3.schemeCategory10);

   simulation = d3.forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(repulseStrength))
      .force("link", d3.forceLink(links).distance(function(d){return d.distance}))
  		.force('collision', d3.forceCollide().radius(function(d) {return d.r}))
      .force("x", d3.forceX())
      .force("y", d3.forceY())

      .alphaTarget(1)
      .on("tick", ticked);

  	svg.on("mousedown", addNode)
  		.attr("focusable", false)
      .on("keydown", function() { keydown();})
  	  .on("focus", function(){});
}

function initializeSVGComponents(){
  g = svg.append("g").attr("transform", "translate(" + width/2 + "," + height/2 + ")");
  link = g.append("g").attr("stroke", "#000").attr("stroke-width", 1.5).selectAll(".link");
  node = g.append("g").attr("stroke", "#fff").attr("stroke-width", 1.5).selectAll(".node");
  label = g.append("g").attr("stroke", "#000"). attr("stroke-width", 1.5).selectAll(".name");
  button = g.append("g").attr("stroke", "#000").attr("class", "buttons").attr("stroke-width", 1.5).selectAll(".button");
}

  function consoleLogNetwork(){
  console.log("button function")
  for(var i = 0; i < nodes.length; i++){
      console.log(nodes[i])
  }
  for(var i = 0; i < links.length; i++){
      console.log(links[i])
  }

}

function svgToPng() {

  // **** saveSvgAsPng ****
  saveSvgAsPng(d3.select('svg').node(), 'img.png');
}

  function keydown(){
		switch(d3.event.keyCode){
    case 32:

      break;
		case 37:
			alterBredth("decrease")
			break;
		case 38:
			alterSize("increase");
			break;
		case 39:
			alterBredth("increase");
			break;
		case 40:
			alterSize("decrease");
			break;
		case 66:
			alterLinkClass("syblings");
			break;
		case 76:
			alterLinkClass("children");
			break;
		case 82:
		  alterLinkClass("parents");
			break;
		}
	}

	function alterSize(direction){

		var linkNodeSelected = linkOrNodeSelected();

		switch (linkNodeSelected){
			case 1:
				for(var i = 0; i < nodes.length; i++){
					if(nodes[i].selected){
						if(direction == "decrease"){
							if(nodes[i].size > 5){
							nodes[i].size -= 2;
							}
						}else{
							nodes[i].size += 2;
						}
					}
				}
			break;
			case 2:
			for(var i = 0; i < links.length; i++){
				if(links[i].selected){
					if(direction == "decrease"){
						if(links[i].distance > 5){
						links[i].distance -= 5;
						}
					}else{
						links[i].distance += 5;
					}
				}
			}
			break;
			default:
			console.log("error, no links or nodes selected by called to: " + direction);
		}
		restart();
	}

	function linkOrNodeSelected(){
		for (var i = 0; i < nodes.length; i++){
			if(nodes[i].selected){
				return 1;
			}
		}
		for(var i = 0; i < links.length; i++){
			if(links[i].selected){
				return 2;
			}
		}
		return 3;
	}

	function deselectNode(){
		for (var i = 0; i < nodes.length; i++){
			nodes[i].selected = false;
		}
	}

	function deselectLink(){
		for (var i = 0; i < links.length; i++){
			links[i].selected = false;
		}
	}

	function removeButtons(){
		if(btnVisible){
			svg.selectAll(".toDelete").remove()
		}
	}

	function alterBredth(direction){
		console.log("alterBredth: " + direction);
		if(direction == "decrease"){
			for (var i = 0; i <links.length; i++){
				if(links[i].selected){
					links[i].size -=1;
				}
			}
		}else{
			for (var i = 0; i <links.length; i++){
				if(links[i].selected){
					links[i].size +=1;
				}
			}
		}
	}

	function alterLinkClass (direction){
    needTorestart = false;
			for (var i = 0; i < links.length; i++){
				if(links[i].selected){
					links[i].relation = direction;
					needTorestart = true;
					break;
				}
			}
			if(needTorestart){
				restart();
			}
	}

  function addNode(){

  	removeButtons();

  	var name = prompt("insert name", "name")
    var novelName = true;
    for (var i = 0; i < nodes.length; i++){
      if (nodes[i].id == name){
        novelName = false
        break
      }
    }

  	if(novelName){
  		nodeNames.push(name)
  		nodes.push({id: name,
  			dragged: false,
  		  uniqueId: nodeID++,
  			size: 20,
  			selected:false}); // Re-add c.

  		restart();
  	}else{
  		alert("name already used");
  	}
  }

function mouseDownLink(d){
  if(d.selected){
    console.log("got this far 1");
      switch(d.relation){
        case "syblings":
          d.relation = "children";
          break;
        case "children":
          d.relation = "parents";
          break;
        case "parents":
          d.relation = "syblings";
          break;
      }
      restart();
  }else{
    deselectNode();
    deselectLink();
  d.selected = true;
  }
}

function establishIfLinksToBeDeleted (node){
  	for (var j = 0; j < links.length; j++){
  		if(links[j].targetID == node || links[j].sourceID == node){
  			return true;
  		}
  	}
  	return false;
  }

function doubleClick(d, target){

  	if(target == "node"){
  		for(var i = 0; i < nodes.length; i++) {
  		    if (nodes[i].uniqueId == d.uniqueId) {
              var nodeName = nodes[i].id;
  						var uniqueIdOfNode = nodes[i].uniqueId;
  						console.log("node to be removed ID: " + uniqueIdOfNode)
  						nodes.splice(i, 1);

  						//are there any nodes with the target or source of the node to be deleted?
  						var linksToBeDeleted = establishIfLinksToBeDeleted(uniqueIdOfNode);

  						var toSplice = links.filter(function(l) {
  							return (l.sourceID === uniqueIdOfNode || l.targetID === uniqueIdOfNode);
  						});

  						//identify what has to be spliced.

  							toSplice.map(function(l) {
  						    links.splice(links.indexOf(l), 1);
  						  });
  						break;
					}
	    }
      /*

      for (var j = 0; j < nodeNames.length; j++){
        if (d.id == nodesName[j]){
            nodesName.splice[j,1]
        }
      }
      */
  	}else{
  		var toSplice = links.filter(function(l) {
  			return (l.sourceID === d.sourceID && l.targetID === d.targetID);
  		});

  		//identify what has to be spliced.
  		console.log("toSplice");
  			for (a = 0; a < toSplice.length; a++){
  				console.log(toSplice[a]);
  			}

  			toSplice.map(function(l) {
  				links.splice(links.indexOf(l), 1);
  			});
  	}

			restart();
	}

function checkForOverlaps(d){
	for(var i = 0; i < nodes.length; i++){
		if(nodes[i].id != d.id){
	    var x = nodes[i].x - d.x,
	        y = nodes[i].y - d.y;
			if(Math.sqrt(x * x + y * y) < 50){
				 links.push({source: d,
					 sourceID: d.uniqueId,
					  target: nodes[i],
						targetID: nodes[i].uniqueId,
					  size:10,
					 distance: 150,
				 	 relation: "syblings"});
				 restart();
			}
		}
	}
}

function countNumPress(d, target){
	switch(numPress){
	case 0:
		console.log("zero clicks");
		break;
	case 1:
		//call one click function
		if(target == "node"){
      console.log("target node")
		onNodeSelected(d)
	}else{
    mouseDownLink(d)
	}
		console.log("single click")
		break;
	case 2:
		//call double click function
		doubleClick(d, target)

		console.log("double click")
		break;
	default:
		alert("problem with program")
		break;
	}
	numPressCountInAction = false;
}

function onNodeSelected(d){
	deselectNode();
	deselectLink();
	console.log("onNodeSelected")
	d.selected = true;
	console.log(d)

if(smartphoneCapable){
	addSmartphoneNodeButtons()
  }
}

function addSmartphoneNodeButtons(){
  var recHeight = 50,
		  recWidth = 100;
		    btnVisible = true;

	var xPosition = 10,
		  yPosition = 70;

  buttons = ["increase", "decrease"];

  svg.selectAll("rect")
  .data(buttons)
  .enter()
  .append("rect")
  .on("mousedown", function(d) {
d3.event.stopPropagation();
    return alterSize(d)})
  .attr("class", "toDelete")
  .attr("x", 40)
  .attr("y", function(d,i) {return (i * 100 ) +  recHeight})
  .attr("width", recWidth)
  .attr("height", recHeight)
  .attr("fill", "grey");

  svg.append("text")
    .attr("x", 65)
    .attr("y", function() {return (25) + recHeight})
    .attr("class", "toDelete")
    .text("increase")
    .on("mousedown", function(d) {
  d3.event.stopPropagation();
      return alterSize(d)})

    svg.append("text")
      .attr("x", 65)
      .attr("y", function() {return (125) + recHeight})
      .attr("class", "toDelete")
      .text("decrease")
      .on("mousedown", function(d) {
    d3.event.stopPropagation();
        return alterSize("decrease")})
}

function addSmartphoneLinkoptions(){

	if(smartphoneCapable){
		//start adding in the buttons
	//*
		var recHeight = 50,
			recWidth = 150;
			btnVisible = true;
		var xPosition = width - recWidth - 60;
			yPosition = 40;

		svg.append("rect")
    		.attr("class", "toDelete")
    		.attr("height", recHeight)
    		.attr("width", recWidth)
    		.attr("x", xPosition)
    		.attr("y", yPosition)
    		.on("mousedown", function(){
    			d3.event.stopPropagation();
    			alterNodeSize("decrease")
    				})
    		.style("fill", "grey")

		svg.append("text").text("increase" + "\n" + "distance").attr("x", (xPosition + (recHeight/2.5))).attr("y", (yPosition + (recHeight/2))).attr("class", "toDelete").on("mousedown", function(){
			d3.event.stopPropagation();
			alterSize("increase")
				})

		svg
      .append("rect")
			.attr("class", "toDelete")
			.attr("height", recHeight)
			.attr("width", recWidth)
			.attr("x", xPosition)
			.attr("y", yPosition)
			.on("mousedown", function(){
				d3.event.stopPropagation();
				alterSize("increase")
					})
			.style("opacity", 0.0001)

		yPosition = (recWidth );

			svg
		.append("rect").attr("class", "toDelete")
		.attr("height", recHeight)
		.attr("width", recWidth)
		.attr("x", xPosition)
		.attr("y", yPosition)
		.on("mousedown", function(){
			d3.event.stopPropagation();
			alterSize("decrease");
		})
		.style("fill", "grey")

		  svg
    .append("text")
		.text("decrease\ndistance")
		.attr("x", xPosition+(recHeight/2)).attr("y", yPosition+ (recHeight/2)).attr("class", "toDelete").on("mousedown", function(){
        d3.event.stopPropagation();
	      alterSize("decrease");
	      })

			svg
		.append("rect").attr("class", "toDelete")
		.attr("height", recHeight)
		.attr("width", recWidth)
		.attr("x", xPosition)
		.attr("y", yPosition)
		.on("mousedown", function(){
			d3.event.stopPropagation();
			alterSize("decrease");
		})
		.style("opacity", 0.0001)

    yPosition = yPosition*2

    svg
  .append("rect").attr("class", "toDelete")
  .attr("height", recHeight)
  .attr("width", recWidth)
  .attr("x", xPosition)
  .attr("y", yPosition)
  .on("mousedown", function(){
    d3.event.stopPropagation();
    alterBredth("decrease");
  })
  .style("fill", "grey")

  svg.append("text")
  .text("decrease\nbredth")
  .attr("x", xPosition+(recHeight/2)).attr("y", yPosition+ (recHeight/2)).attr("class", "toDelete").on("mousedown", function(){
    d3.event.stopPropagation();
    alterSize("decrease");
  })

  svg
  .append("rect").attr("class", "toDelete")
  .attr("height", recHeight)
  .attr("width", recWidth)
  .attr("x", xPosition)
  .attr("y", yPosition)
  .on("mousedown", function(){
    d3.event.stopPropagation();
    alterBredth("decrease");
  })
  .style("opacity", 0.0001)


  yPosition = yPosition*1.25

    svg
  .append("rect").attr("class", "toDelete")
  .attr("height", recHeight)
  .attr("width", recWidth)
  .attr("x", xPosition)
  .attr("y", yPosition)
  .on("mousedown", function(){
    d3.event.stopPropagation();
    alterBredth("increase");
  })
  .style("fill", "grey")

    svg
  .append("text")
  .text("increase\nbredth")
  .attr("x", xPosition+(recHeight/2)).attr("y", yPosition+ (recHeight/2)).attr("class", "toDelete").on("mousedown", function(){
    d3.event.stopPropagation();
    alterSize("decrease");
  })

    svg
  .append("rect").attr("class", "toDelete")
  .attr("height", recHeight)
  .attr("width", recWidth)
  .attr("x", xPosition)
  .attr("y", yPosition)
  .on("mousedown", function(){
    d3.event.stopPropagation();
    alterBredth("increase");
  })
  .style("opacity", 0.0001)
  }
}

function drag_start(d) {

	if(btnVisible){
		svg.selectAll(".toDelete").remove()
	}

	if(!numPressCountInAction){
		numPress = 0;
		numPressCountInAction = true;
	setTimeout(function(){countNumPress(d, "node")},500);
	}

	d.dragged = true;
	simulation.force("charge", d3.forceManyBody().strength(function (d){
		if(d.dragged){return -10;}else{return -1000;}
	}
	));

 if (!d3.event.active) simulation.alphaTarget(0.3).restart();
   d.fx = d.x;
   d.fy = d.y;
}

function drag_drag(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function drag_end(d) {
	//detect to determine if it was a double click
	restartRequired = false;
	numPress++;
	checkForOverlaps(d)

  simulation.force("charge", d3.forceManyBody().strength(repulseStrength));
  d.dragged = false;

  d.fx = null;
  d.fy = null;
}

function addLines(){
    svg
  .append("svg:defs")
  .append("svg:marker")
  .attr("id", "end-arrow")
  .attr('viewBox', '0 -5 10 10')
  .attr('refX', 12)
  .attr('markerWidth', 3)
  .attr('markerHeight', 3)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M0,-5L10,0L0,5')
  .attr('fill', '#000');

    svg
  .append('svg:defs').append('svg:marker')
	.attr('id', 'start-arrow')
	.attr('viewBox', '0 -5 10 10')
	.attr('refX', -4)
	.attr('markerWidth', 3)
	.attr('markerHeight', 3)
	.attr('orient', 'auto')
	.append('svg:path')
	.attr('d', 'M10,-5L0,0L10,5')
	.attr('fill', '#000');
}


function restart() {

  // Apply the general update pattern to the nodes.
  node = node.data(nodes, function(d) { return d;});
  console.log(node)
  node.exit().remove();
  node = node
    .enter().append("circle")
    .attr("fill", function(d) { return color(d.id); })
    .attr("r", function(d){ return d.size;})
    .merge(node);

	var drag_handler = d3.drag().on("start", drag_start).on("drag", drag_drag).on("end", drag_end);
	drag_handler(node)

  // Apply the general update pattern to the links.
	link = link.data(links, function(d) {return d.source.id + "-" + d.target.id; });
  link.exit().remove();
  link = link
    .enter()
    .append("line")
    .merge(link)
    .on('mousedown', function(d) {
  		removeButtons();
  		addSmartphoneLinkoptions();
  		if(!numPressCountInAction){
  			numPress = 0;
  			numPressCountInAction = true;
  		setTimeout(function(){countNumPress(d, "link")},250);
  		}
		numPress++;
    d3.event.stopPropagation();
  })
	.attr("strength", function(d) {return d.distance})
  .attr("stroke-width", function(d) { return d.size})
	.attr("marker-end", function(d) {
		if(d.relation == "children" || d.relation == "syblings"){
			return "url(#end-arrow)";
		}else{
			return '';
		}
	})
	.attr("marker-start", function(d){
		if(d.relation == "parents" || d.relation == "syblings"){
			return "url(#start-arrow)";
		}else{
			return '';
		}
	});

  addLines()
	//.attr("marker-start", "url(#triangle)");

  simulation.nodes(nodes);
  simulation.force("link");
  //simulation.linkDistance(function(d) return d.distance)


	//update labelslabel = label.data(labels, function(d) { return d.id;});
  console.log(nodes)
    label = label.data(nodes);
    label
    .exit()
    .remove()
    label = label.enter()
    .append("text")
    .attr("font-size", "1.5em")
    .attr("font-family", "Comic Sans MS")
    .text(function(d) { return d.uniqueId})
    .attr("x", function(d) {
      for(var i = 0; i < nodes.length; i++){
  		  if(nodes[i].uniqueId == d.uniqueId){
  			  return (nodes[i].x+nodes[i].size);
  		  }
  	  }
  	  return 300;
    })
    .attr("y", function(d) {
  	  for(var i = 0; i < nodes.length; i++){
  		  if(nodes[i].uniqueId == d.uniqueId){
  			  return (nodes[i].y+nodes[i].size);
  		  }
  	  }
  	  return 300;
    })
  	.style("fill", "white")
    .merge(label)

	// build the arrow.
simulation.alpha(1).restart();

}

function ticked() {
  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
	  	.attr("class", function(d){
			  if(d.selected){
				  return "selected_node";
			  }else{
				  return "not_selected_node";
			  }})
	  	.attr("r", function(d){return d.size;})

  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
			.attr("strength", function(d) {return d.distance;})
			.attr("class", function (d){
				var classString = "";
				if(d.selected){
					classString = "selected_link"
				}else{
					classString = "not_selected_link"
				}
				return classString += " "+ d.relation;

			})
			.attr("stroke-width", function(d){return d.size;})

  label
  .attr("x", function(d) {
    for(var i = 0; i < nodes.length; i++){
      if(nodes[i].uniqueId == d.uniqueId){
        return (nodes[i].x+nodes[i].size);
      }
    }
    return 300;
  })
  .attr("y", function(d) {
    for(var i = 0; i < nodes.length; i++){
      if(nodes[i].uniqueId == d.uniqueId){
        return (nodes[i].y+nodes[i].size);
      }
    }
    return 300;
  })
  .text(function(d) { return d.id})
}

function exportData(){
  var colNames = ["person", " node-size", "associates"],
    row = [];

      for (var i = 0; i < nodes.length; i++){
        var person = nodes[i].id;
        var nodeSize = nodes[i].size;
        var associates =[];
        //identify links which are connected with the current node.
        var interestingLinks = links.filter(function(l) {
          return (l.source.id === person || l.target.id === person);
        });
        //for each interestingLinks establish the relationship, the distance and the bredth of the link
        interestingLinks.forEach(function(currentLink){

          switch(currentLink.relation){
            case "syblings":
            var targetNode;
            if(currentLink.source.id==person){
              targetNode = currentLink.target;
            }else{
              targetNode = currentLink.source;
            }
              associates.push(targetNode.id + " - " + currentLink.distance + " - " + currentLink.size)
              break;
            case "children":
              associates.push(currentLink.source.id + " - " + currentLink.distance + " - " + currentLink.size)
              break;
            case "parents":
              associates.push(currentLink.target.id + " - " + currentLink.distance + " - " + currentLink.size)
              break;
            default:
              associates.push("error");
          }
        })
        row.push({
          person: person,
          nodeSize: nodeSize,
          associates: associates
        })
      }

        var csv = "person, node size, associates";
        csv += "\n"

      for (var i = 0; i < row.length; i++){
        csv += (row[i].person + ",")

        if(row[i].associates.length > 0){
                  csv += (row[i].nodeSize + ",")
          for (var j= 0; j < row[i].associates.length; j++){
          csv+= row[i].associates[j]
          }
        }else{
          csv += row[i].nodeSize
        }
        csv += "\n";
      }

       var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          if (navigator.msSaveBlob) { // IE 10+
              navigator.msSaveBlob(blob, "network.csv");
          } else {
              var hLink = document.createElement("a");
              if (hLink.download !== undefined) { // feature detection
                  // Browsers that support HTML5 download attribute
                  var url = URL.createObjectURL(blob);
                  hLink.setAttribute("href", url);
                  hLink.setAttribute("download", "network.csv");
                  hLink.style = "visibility:hidden";
                  document.body.appendChild(hLink);
                  hLink.click();
                  document.body.removeChild(hLink);
              }
            }
        svgToPng()
}
