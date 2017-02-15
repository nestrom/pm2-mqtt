
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
      meta    : true,

      // Custom metrics to put in BIG
      main_probes : ['MQTT']
    }

  }

}, function(err, conf) {
console.log(conf)
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
      uptime : {type:"metric", topic: '$SYS/broker/uptime' , value:0, clean:(data)=>{return data.split(' ')[0]/(60*60)}} ,
      clientsTotal : {type:"histogram", topic: '$SYS/broker/clients/total' , value:0 , clean:(data)=>{return data}},
      clientsMax : {type:"metric", topic: '$SYS/broker/clients/maximum' , value:0 , clean:(data)=>{return data}},
      clientsConnected : {type:"histogram", topic: '$SYS/broker/clients/connected' , value:0 , clean:(data)=>{return data}},
      messagesStored : {type:"histogram", topic: '$SYS/broker/messages/stored' , value:0 , clean:(data)=>{return data}},
      messagesRecived : {type:"histogram", topic: '$SYS/broker/messages/received' , value:0 , clean:(data)=>{return data}},
      messagesSent : {type:"metric", topic: '$SYS/broker/messages/sent' , value:0 , clean:(data)=>{return data}},
      retainedMsgsCount : {type:"metric", topic: '$SYS/broker/retained messages/count' , value:0 , clean:(data)=>{return data}},
      heapCurrent : {type:"histogram", topic: '$SYS/broker/heap/current' , value:0 , clean:(data)=>{return data / 1048576}},
      heapMaximum : {type:"metric", topic: '$SYS/broker/heap/maximum' , value:0 , clean:(data)=>{return data / 1048576}},
      mbRecived :{type:"metric", topic: '$SYS/broker/bytes/received' , value:0 , clean:(data)=>{return data / 1048576}},
      mbSent : {type:"metric", topic: '$SYS/broker/bytes/sent' , value:0 , clean:(data)=>{return data / 1048576}},
      msgRecPer15min : {type:"metric", topic: '$SYS/broker/load/messages/received/15min' , value:0 , clean:(data)=>{return data}},
      msgSentPer15min : {type:"metric", topic: '$SYS/broker/load/messages/sent/15min' , value:0 , clean:(data)=>{return data}},
      connectionsPer15min : {type:"metric", topic: '$SYS/broker/load/connections/15min' , value:0 , clean:(data)=>{return data}}
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
            name : x
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
                msg = parseFloat(message.toString()).toFixed(2);
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
