// JavaScript function for calling the api to get the graph data
// points and populating the flot graphs. This fucntion is specifically.
// for the ecg graphs on the overview page.
var currentGraphs = [];
function ecg_graph(eb) {
    var currentBuffers = {};
    var neededGraphs = [];
    var counter = 0;
    neededGraphs.push(['waveform', 'ECG', 1]);
    neededGraphs.push(['waveform', 'ECG', 2]);
    neededGraphs.push(['waveform', 'ECG', 3]);
    neededGraphs.push(['waveform', 'ECG', 4]);
    var graphOff = 0;
    var alertOff = 0;
    var chartArray = [];

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

    $("#graph").click(function() {
      var egraph = document.getElementById("graph");
      if (graphOff == 0) {
         for (var i = chartArray.length-1; i >= 0; i--) {
            chartArray[i].stop();
         }
         graphOff = 1;
         egraph.innerHTML = "Turn Graphs ON";
         alert('Graphs have been turned OFF');
      }
      else {
         for (var i = chartArray.length-1; i >= 0; i--) {
            chartArray[i].start();
         }
         graphOff = 0;
         egraph.innerHTML = "Turn Graphs OFF";
         alert('Graphs have been turned ON');
      }
    });

    $("#alerts").click(function() {
      var ealert = document.getElementById("alerts");
      if (alertOff == 0) {
         alertOff = 1;
         ealert.innerHTML = "Turn Alerts ON";
         alert('Alerts have been turned OFF');
      }
      else {
         alertOff = 0;
         ealert.innerHTML = "Turn Alerts OFF";
         alert('Alerts have been turned ON');
      }

    });

    var makeSmoothie = function (id) {
        var chart = new SmoothieChart({millisPerPixel:8, strokeStyle:'green'});
        var canvas = document.getElementById(id);
        var series = new TimeSeries();
        chart.addTimeSeries(series, {lineWidth:2,strokeStyle:'green'});
        chart.streamTo(canvas, 1720);
        chartArray[chartArray.length] = chart;
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
      eb.registerHandler("restart", handleRestart);
      for (var i = neededGraphs.length - 1; i >= 0; i--) {
        startGraph(neededGraphs[i][0], neededGraphs[i][1], neededGraphs[i][2]);
      }
      clearTimeout(timer);
      timer = setTimeout(handleResize, 100);
      setInterval(drawIt, 400);

      console.log("Onopen");
      $.when($.ajax("http://api.s-pi-demo.com/alerts/1"),
              $.ajax("http://api.s-pi-demo.com/alerts/2"),
              $.ajax("http://api.s-pi-demo.com/alerts/3"),
              $.ajax("http://api.s-pi-demo.com/alerts/4")
            ).done(get_alert);

    }

    function get_alert(dat1, dat2, dat3, dat4) {

        eb.registerHandler(dat1[0], function(array) {
            array.data.forEach(make_alert);
        });
    }

    function make_alert(msg) {
      console.log("make_alert");
      console.log(msg);
        var Alert = {};
        Alert.alert_msg = msg.ALERT_MSG;
        Alert.action_msg = msg.ACTION_MSG;
        Alert.alert_status = "Active Warning";
        Alert.alert_time = new Date(msg.TS);
        Alert.id = msg.PATIENT_ID;
        Alert.interval = msg.INTERVAL;
        Alert.signame = msg.SIGNAME;

      console.log(Alert.id);
        function render_alert() {
            console.log(Alert);
            $("#alert_table").html("\
                <div class='panel-heading'> Alert:  " + Alert.name + " -  " + Alert.alert_msg + " at "+ Alert.alert_time +"  </div>\
                <div  class='panel-body'>\
                    <table class='table'>\
                        <tr>\
                        <tr>\
                            <td> <b>Name:</b> </td>\
                            <td>" + Alert.name + "</td>\
                        </tr>\
                        <tr>\
                            <td> <b>Age:</b> </td>\
                            <td>" + Alert.age + "</td>\
                        </tr>\
                        <tr>\
                            <td> <b>Bed:</b>  </td>\
                            <td>" + Alert.bed + "</td>\
                        </tr>\
                        <tr>\
                            <td> <b>Code:</b>  </td>\
                            <td>" + Alert.signame + "</td>\
                        </tr>\
                        <tr>\
                            <td> <b>Status:</b>  </td>\
                            <td>" + Alert.alert_status + "</td>\
                        </tr>\
                        <tr>\
                            <td> <b>Alert Length:</b>  </td>\
                            <td>" + Alert.interval + "</td>\
                        </tr>\
                        <tr>\
                            <td> <b>Alert message:</b>  </td>\
                            <td>" + Alert.alert_msg + "</td>\
                        </tr>\
                    </table>\
                </div>\
            ");
             $('#alertModal').modal('show');
        }

        $.getJSON('http://api.s-pi-demo.com/patients', function(data) {
            Alert.name = data[(Alert.id)]['name'];
            Alert.age =  data[(Alert.id)]['age'];
            Alert.bed =  data[(Alert.id)]['bed'];
            if (alertOff == 0) {
              render_alert();
            }

            counter = counter +1;

            $("<div class='panel panel-danger alert-notification' data-target='#alertModal'>\
                <div class='panel-heading'>\
                    <div class='panel-title'>\
                        CODE: " + Alert.signame + " \
                    </div>\
                </div>\
                <div class='panel-body'>\
                    "+ Alert.name + "  "+ Alert.alert_msg + "\
                </div>\
            </div>"
            ).prependTo("#alert_summaries").click(render_alert);

            if(counter > 4)
            {
                $("#alert_summaries").find(".alert-notification").last().remove();
            }

        });
    }

}
var handleResize = function () {
  for (var i = 0; i < currentGraphs.length; i++) {
    var mycanvas = currentGraphs[i].chart.canvas;
    mycanvas.width = mycanvas.parentNode.offsetWidth;
    currentGraphs[i].chart.resize();
  }
};

var handleRestart = function (newtime) {
  currentGraphs.forEach(function(item, idx, thisArray) {
    item.startTime = newtime;
  });
}
