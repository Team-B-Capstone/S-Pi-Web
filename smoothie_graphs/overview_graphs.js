// JavaScript function for calling the api to get the graph data
// points and populating the flot graphs. This fucntion is specifically.
// for the ecg graphs on the overview page.
function ecg_graph(eb) {
    var currentBuffers = {};
    var currentGraphs = [];
    var neededGraphs = [];
    var counter = 0;
    neededGraphs.push(['waveform', 'bp', 1]);
    neededGraphs.push(['waveform', 'bp', 2]);
    neededGraphs.push(['waveform', 'bp', 3]);
    neededGraphs.push(['waveform', 'bp', 4]);

    console.log("hi")
        console.log(neededGraphs)
        var startGraph = function (stream, type, id) {
            $.when($.ajax('http://api.s-pi-demo.com/stream/'+stream+'/'+type+'/'+id)).done(
                function (data) {
                    var channelName = data;
                    var startTime = Date.now();
                    currentBuffers[channelName] = new Array();
                    var series = makeSmoothie('chart' + id);
                    currentGraphs.push({"channel": channelName,
                        "startTime": startTime,
                        "buffer": currentBuffers[channelName],
                        "graph": series});
                    eb.registerHandler(channelName, function(msg) {
                        currentBuffers[channelName].push(msg.data);
                    });
                }
            )
        }



    var makeSmoothie = function (id) {
        var chart = new SmoothieChart({millisPerPixel:8, strokeStyle:'green'});
        var canvas = document.getElementById(id);
        var series = new TimeSeries();
        chart.addTimeSeries(series, {lineWidth:0.7,strokeStyle:'green'});
        chart.streamTo(canvas, 1720);
        return series;
    }

    var drawIt = function () {
        currentGraphs.forEach(function (item, idx, thisArray) {
            var data = item["buffer"].shift();
            if (typeof data !== 'undefined') {
                for (var i = data.length - 1; i >= 0; i--) {
                    item["graph"].append(item["startTime"], data[i].SIGNAL);
                    item["startTime"] += 8;
                };
            }
        });
    }

    eb.onopen = function () {
        for (var i = neededGraphs.length - 1; i >= 0; i--) {
            startGraph(neededGraphs[i][0], neededGraphs[i][1], neededGraphs[i][2]);
        };

        setInterval(drawIt, 400);

        $.when($.ajax("http://api.s-pi-demo.com/alerts/1"),
                $.ajax("http://api.s-pi-demo.com/alerts/2"),
                $.ajax("http://api.s-pi-demo.com/alerts/3"),
                $.ajax("http://api.s-pi-demo.com/alerts/4")
              ).done(get_alert);

    }

    function get_alert(dat1, dat2, dat3, dat4) { 

        eb.registerHandler(dat1[0], function(msg) {
            make_alert(msg);
        });  
    }

    function make_alert(msg) {

        var Alert = {};
        Alert.alert_msg = msg.alert_msg;
        Alert.action_msg = msg.action_msg;
        Alert.alert_status = "Active Warning";
        Alert.alert_time = new Date(msg.ts);
        Alert.id = msg.patient_id;
        Alert.interval = msg.interval;
        Alert.signame = msg.signame;

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

        $.getJSON('/patients.json', function(data) {
            Alert.name = data['patients'][(Alert.id)]['name'];
            Alert.age =  data['patients'][(Alert.id)]['age'];
            Alert.bed =  data['patients'][(Alert.id)]['bed'];
            render_alert();

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

