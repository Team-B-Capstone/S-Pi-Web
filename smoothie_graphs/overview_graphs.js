// JavaScript function for calling the api to get the graph data
// points and populating the flot graphs. This fucntion is specifically.
// for the ecg graphs on the overview page.
function ecg_graph(eb) {
  var currentBuffers = {};
  var currentGraphs = [];
  var neededGraphs = [];
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
    console.log("id" + id)
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
        console.log("alert")

        eb.registerHandler(dat1[0], function(msg) {
            make_alert(msg);
        });  
        eb.registerHandler(dat2[0], function(msg) {
            make_alert(msg);
        });
       eb.registerHandler(dat3[0], function(msg) {
            make_alert(msg);
        });
       eb.registerHandler(dat4[0], function(msg) {
            make_alert(msg);
        });

    }

    function make_alert(msg) {
        
        var self = this;
        this.alert_msg = msg.alert_msg;
        this.action_msg = msg.action_msg;
        this.alert_status = "Active Warning";
        this.alert_time = new Date(msg.ts);
        this.id = msg.patient_id;
        this.interval = msg.interval;
        this.signame = msg.signame;
        
        $.getJSON('/patients.json', function(data) {
            self.name = data['patients'][(self.id)]['name'];
            self.age =  data['patients'][(self.id)]['age'];
            self.bed =  data['patients'][(self.id)]['bed'];
        });
        
        $("#alert_table").html("\
               <div class='panel-heading'> Alert:  " + this.name + " -  " + this.alert_msg + " at "+ this.alert_time +"  </div>\
                 <div  class='panel-body'>\
                  <table class='table'>\
                     <tr>\
                        <tr>\
                           <td> <b>Name:</b> </td>\
                           <td>" + this.name + "</td>\
                        </tr>\
                        <tr>\
                           <td> <b>Age:</b> </td>\
                           <td>" + this.age + "</td>\
                        </tr>\
                        <tr>\
                           <td> <b>Bed:</b>  </td>\
                           <td>" + this.bed + "</td>\
                        </tr>\
                        <tr>\
                           <td> <b>Code:</b>  </td>\
                           <td>" + this.signame + "</td>\
                        </tr>\
                        <tr>\
                           <td> <b>Status:</b>  </td>\
                           <td>" + this.alert_status + "</td>\
                        </tr>\
                        <tr>\
                           <td> <b>Alert Length:</b>  </td>\
                           <td>" + this.interval + "</td>\
                        </tr>\
                        <tr>\
                           <td> <b>Alert message:</b>  </td>\
                           <td>" + this.alert_msg + "</td>\
                        </tr>\
                    </table>\
                   </div>\
                 ");    
           

        $('#alertModal').modal('show');
    }

}

