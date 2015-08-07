// JavaScript function for calling the api to get the graph data
// points and populating the flot graphs. This fucntion is specifically.
// for the ecg graphs on the patient graphs.
var currentGraphs = [];
var graphOff = 0;

function detail_graphs(eb) {
  var currentBuffers = {};
  var neededGraphs = [];
  neededGraphs.push(['waveform', 'ECG', 1]);
  neededGraphs.push(['waveform', 'ABP', 2]);
  neededGraphs.push(['waveform', 'RESP', 3]);
  neededGraphs.push(['waveform', 'PAP', 4]);

  console.log("hi");
  console.log(neededGraphs);

$("#graphs").click(function() {
  var egraph = document.getElementById("graphs");
  if (graphOff == 0) {
     for (var i = currentGraphs.length-1; i >= 0; i--) {
        currentGraphs[i].chart.stop();
     }
     graphOff = 1;
     egraph.innerHTML = "Turn Graphs ON";
     alert('Graphs have been turned OFF');
  }
  else {
     for (var i = currentGraphs.length-1; i >= 0; i--) {
        currentGraphs[i].chart.start();
     }
     graphOff = 0;
     egraph.innerHTML = "Turn Graphs OFF";
     alert('Graphs have been turned ON');
  }
});


  var startGraph = function (stream, type, id) {
    $.when($.ajax('http://api.s-pi-demo.com/stream/'+stream+'/'+type+'/'+(id-1))).done(
      function (data) {
        var channelName = data;
        var startTime = Date.now();
        currentBuffers[channelName] = new Array();
        var chart = makeSmoothie('chart' + id);
        currentGraphs.push({"channel": channelName,
          "startTime": startTime,
          "buffer": currentBuffers[channelName],
          "graph": chart.series,
          "chart": chart.chart});
        eb.registerHandler(channelName, function(msg) {
          currentBuffers[channelName].push(msg.data);
        });
      }
    )
  };

  var makeSmoothie = function (id) {
    console.log("id" + id)
    if (id == "chart1") {
        color = "red";
    } else if (id == "chart2") {
        color = "green";
    } else if (id == "chart3") {
        color = "blue";
    } else {
        color = "yellow";
    }

    var chart = new SmoothieChart({millisPerPixel:8, strokeStyle:color});
    var canvas = document.getElementById(id);
    var series = new TimeSeries();
    chart.addTimeSeries(series, {lineWidth:0.7,strokeStyle:color});
    chart.streamTo(canvas, 1720);
    return {"series": series, "chart": chart};
  };

  var drawIt = function () {
    currentGraphs.forEach(function (item, idx, thisArray) {
      var data = item["buffer"].shift();
      if (typeof data !== 'undefined') {
        for (var i = data.length - 1; i >= 0; i--) {
          item["graph"].append(item["startTime"], data[i].SIGNAL);
          item["startTime"] += 8;
        }
      }
    });
  };

  eb.onopen = function () {
    var timer;
    for (var i = neededGraphs.length - 1; i >= 0; i--) {
      startGraph(neededGraphs[i][0], neededGraphs[i][1], neededGraphs[i][2]);
    }
    clearTimeout(timer);
    timer = setTimeout(handleResize, 100);
    setInterval(drawIt, 400);
  }
}
var handleResize = function () {
  for (var i = 0; i < currentGraphs.length; i++) {
    console.log('resized' + i);
    var mycanvas = currentGraphs[i].chart.canvas;
    mycanvas.width = mycanvas.parentNode.offsetWidth;
    currentGraphs[i].chart.resize();
  }
};
