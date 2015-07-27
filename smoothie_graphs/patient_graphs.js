// JavaScript function for calling the api to get the graph data
// points and populating the flot graphs. This fucntion is specifically.
// for the ecg graphs on the patient graphs.
var currentGraphs = [];
var graphOff = 0;
var patient_id;
var count_alert = ( function() {
    var alertcount = 0;
    return function() {return alertcount += 1;}
})();

function detail_graphs(eb) {
    var currentBuffers = {};
    var neededGraphs = [];
    patient_id  = window.location.hash.substring(1);
    neededGraphs.push(['waveform', 'ECG', 1]);
    neededGraphs.push(['waveform', 'ABP', 2]);
    neededGraphs.push(['waveform', 'PAP', 3]);
    neededGraphs.push(['waveform', 'RESP', 4]);

    $("#graphs").click(function() {
        var egraph = document.getElementById("graphs");
        var i = currentGraphs.length-1;
        if (graphOff === 0) {
            for (; i >= 0; i--) {
                currentGraphs[i].chart.stop();
            }
            graphOff = 1;
            egraph.innerHTML = "Turn Graphs ON";
            alert('Graphs have been turned OFF');
        }
        else {
            for (; i >= 0; i--) {
                currentGraphs[i].chart.start();
            }
            graphOff = 0;
            egraph.innerHTML = "Turn Graphs OFF";
            alert('Graphs have been turned ON');
        }
    });


    var startGraph = function (stream, type, id) {
        $.when($.ajax('http://api.s-pi-demo.com/stream/'+stream+'/'+type+'/'+ patient_id)).done(
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
                handleResize(currentGraphs.length -1);
            }
        );
    };

    var makeSmoothie = function (id) {
        var chart = new SmoothieChart({millisPerPixel:8, strokeStyle:'green'});
        var canvas = document.getElementById(id);
        var series = new TimeSeries();
        chart.addTimeSeries(series, {lineWidth:0.7,strokeStyle:'green'});
        chart.streamTo(canvas, 1720);
        return {"series": series, "chart": chart};
    };

    var drawIt = function () {
        currentGraphs.forEach(function (item, idx, thisArray) {
            var data = item["buffer"].shift();
            if (typeof data !== 'undefined') {
                for (var i = data.length - 1; i >= 0; i--) {
                    item.graph.append(item.startTime, data[i].SIGNAL);
                    item.startTime += 8;
                }
            }
        });
    };

    eb.onopen = function () {
        neededGraphs.forEach(function(element){
            startGraph(element[0], element[1], element[2]);
        });
        var graph_interval = setInterval(drawIt, 1000);

        $.when($.ajax("http://api.s-pi-demo.com/alerts/" + patient_id )).done(get_alert);
    };

    function get_alert(dat1, dat2, dat3) {
            console.log('dat1: ' + dat1 + ' dat2: ' + dat2 + ' dat3: ' + dat3);
            eb.registerHandler(dat1, function(msg) {
                // temporary to test against debug mode data
                make_alert(msg);
                // Test this against live data
                // array.data.forEach(makeAlert);
            });
    }
    function make_alert(msg) {
        console.log('in makeAlert');
        var Alert = {};
        Alert.alert_msg = msg.alert_msg; //ALERT_MSG;
        Alert.action_msg = msg.action_msg; //ACTION_MSG;
        Alert.alert_status = "Active Warning";
        Alert.alert_time = new Date(msg.ts); //TS);
        Alert.id = patient_id; //PATIENT_ID;
        Alert.interval = msg.interval; //INTERVAL;
        Alert.signame = msg.signame; //SIGNAME;


        $.getJSON('/patients.json', function(data) {
            Alert.name = data['patients'][(Alert.id)]['name'];
            Alert.age =  data['patients'][(Alert.id)]['age'];
            Alert.bed =  data['patients'][(Alert.id)]['bed'];
            render_alert();

        });
        function render_alert(){
            console.log('in render_alert');
            $('#alertPanel').removeClass('panel-success').addClass('panel-danger');
            $('#alertPanelTitle').text(count_alert() + ' Alerts!');
            $('#alert_message_row').text('Last Alert Msg: ' + Alert.alert_msg);
        }
    }
}
var handleResize = function (graph_id) {
    var mycanvas;
    if (graph_id === undefined) {
        for (var i = 0; i < currentGraphs.length; i++) {
            mycanvas = currentGraphs[i].chart.canvas;
            mycanvas.width = mycanvas.parentNode.offsetWidth;
            currentGraphs[i].chart.resize();
        }
    } else {
        console.log('in resize graph: ' + graph_id);
        mycanvas = currentGraphs[graph_id].chart.canvas;
        mycanvas.width = mycanvas.parentNode.offsetWidth;
        currentGraphs[graph_id].chart.resize();
    }
};
