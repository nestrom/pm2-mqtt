
var pmx = require('pmx');

var mqtt = require('mqtt')
var _ = require("lodash");

pmx.initModule({

  // Options related to the display style on Keymetrics
  widget : {

    // Logo displayed
    logo : 'http://www.guillier.org/blog/img/2015/mqttorg.png',

    // Module colors
    // 0 = main element
    // 1 = secondary
    // 2 = main border
    // 3 = secondary border
    theme : ['#141A1F', '#222222', '#3ff', '#3ff'],

    // Section to show / hide
    el : {
      probes  : true,
      actions : false
    },

    // Main block to show / hide
    block : {
      actions : false,
      issues  : true,
      meta    : false,

      // Custom metrics to put in BIG
      main_probes : ['Up Time', 'Clients Max','Clients Connected','Messages Sent','Messages Received','Current Heap','Messages Stored']
    }

  }

}, function(err, conf) {

    conf.host = "mqtt://gpstracker.nestrom.farm";
    conf.port = "1883";
    conf.username = "nestrom";
    conf.password = "apps@Nestrom@2017";

  /**
   * Module specifics like connecting to a database and
   * displaying some metrics
   */

  /**
   *                      Custom Metrics
   *
   * Let's expose some metrics that will be displayed into Keymetrics
   *   For more documentation about metrics: http://bit.ly/1PZrMFB
   */
  var Probe = pmx.probe();
  var params = {
      uptime : {name:"Up Time", type:"metric", topic: '$SYS/broker/uptime' , value:0, clean:(data)=>{return round(data.split(' ')[0]/(60*60),2)}} ,
      clientsTotal : {name:"Clients Total", type:"histogram", topic: '$SYS/broker/clients/total' , value:0 , clean:(data)=>{return data}},
      clientsMax : {name:"Clients Max", type:"metric", topic: '$SYS/broker/clients/maximum' , value:0 , clean:(data)=>{return data}},
      clientsConnected : {name:"Clients Connected", type:"histogram", topic: '$SYS/broker/clients/connected' , value:0 , clean:(data)=>{return data}},
      messagesStored : {name:"Messages Stored", type:"histogram", topic: '$SYS/broker/messages/stored' , value:0 , clean:(data)=>{return data}},
      messagesRecived : {name:"Messages Received", type:"histogram", topic: '$SYS/broker/messages/received' , value:0 , clean:(data)=>{return data}},
      messagesSent : {name:"Messages Sent", type:"metric", topic: '$SYS/broker/messages/sent' , value:0 , clean:(data)=>{return data}},
      retainedMsgsCount : {name:"Retained Messages", type:"metric", topic: '$SYS/broker/retained messages/count' , value:0 , clean:(data)=>{return data}},
      heapCurrent : {name:"Current Heap", type:"histogram", topic: '$SYS/broker/heap/current' , value:0 , clean:(data)=>{return round(parseFloat(data) / 1048576,2)}},
      heapMaximum : {name:"Max. Heap", type:"metric", topic: '$SYS/broker/heap/maximum' , value:0 , clean:(data)=>{return round(parseFloat(data) / 1048576,2)}},
      mbRecived :{name:"MBs Received", type:"metric", topic: '$SYS/broker/bytes/received' , value:0 , clean:(data)=>{return round(parseFloat(data) / 1048576,2)}},
      mbSent : {name:"MBs Sent", type:"metric", topic: '$SYS/broker/bytes/sent' , value:0 , clean:(data)=>{return round(data / 1048576,2)}},
      msgRecPer15min : {name:"Received Msgs / 15min", type:"metric", topic: '$SYS/broker/load/messages/received/15min' , value:0 , clean:(data)=>{return data}},
      msgSentPer15min : {name:"Sent Msgs / 15min", type:"metric", topic: '$SYS/broker/load/messages/sent/15min' , value:0 , clean:(data)=>{return data}},
      connectionsPer15min : {name:"Connections / 15min", type:"metric", topic: '$SYS/broker/load/connections/15min' , value:0 , clean:(data)=>{return data}}
  }

    /**
     * .metric, .counter, .meter, .histogram are also available (cf doc)
     */

    var client  = mqtt.connect(conf.host, {username:conf.username, password:conf.password, port:conf.port});

    client.on('connect', function () {
        client.subscribe('$SYS/#');
    });

    for (x in params)
    {
        params[x].probe = Probe[params[x].type]({
            name : params[x].name
        });
    }

    client.on('message', function (topic, message) {
        var key = _.findKey(params, {topic:topic})
        if(key != undefined) {
            var msg;
            if(isNaN(message.toString()))
            {
                msg = message.toString();
            }
            else
            {
                msg = parseFloat( message.toString() );

            }

            var value = params[key].clean(msg);
            if(params[key].type == "metric")
            {
                params[key].probe.set(value);
            }
            else if(params[key].type == "histogram")
            {
                params[key].probe.update(value);
            }
        }
    })


});

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}