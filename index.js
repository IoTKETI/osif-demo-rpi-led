var GPIO = require('onoff').Gpio;
var CiotDatabusClient = require('./lib/ciot.databus.client.js');

var ledRPinBCM    = 18;    //  Phy 12, wPi 1, BCM 18
var ledGPinBCM    = 17;    //  Phy 11, wPi 0, BCM 17
var ledBPinBCM    = 27;    //  Phy 13, wPi 2, BCM 27


var ledR = new GPIO(ledRPinBCM, 'out');
var ledG = new GPIO(ledGPinBCM, 'out');
var ledB = new GPIO(ledBPinBCM, 'out');


var LED_OFF = 0;


function controlLED(ledState) {

  console.log( "controlLED: ", ledState)

  switch(ledState) {
    case  0:
      ledR.writeSync(1);
      ledG.writeSync(1);
      ledB.writeSync(1);
      break;

    case  1:
      ledR.writeSync(0);
      ledG.writeSync(1);
      ledB.writeSync(1);
      break;

    case  2:
      ledR.writeSync(1);
      ledG.writeSync(0);
      ledB.writeSync(1);
      break;

    case  3:
      ledR.writeSync(1);
      ledG.writeSync(1);
      ledB.writeSync(0);
      break;
  }
}

var serviceOptions = require('./ciotservice.json');
var client1 = new CiotDatabusClient(serviceOptions);


var ledState = LED_OFF;



function serviceStart() {


  client1.init()
    .then(function(client){
      client.startService()
        .then(function(value){
          console.log( 'startService', value );


          //  LED Off
          controlLED(LED_OFF);

          var listener = {
            'updated':     function listener(key) {
              console.log('LOCAL OPENDATA UPDATED : value : ', key);

              client1.getLocalOpendata(key)
                .then((value)=>{
                  console.log('LISTENER : getLocalAppData : ', value);

                  var temp = value.t;

                  temp = temp * 10;
                  ledState = temp % 4;

                  controlLED(ledState);
                })
            }
          };

          client.subscribeToLocalOpendata('iotweek-sensor-value', listener);

        })

      ;
    });





  console.log('Service start...');
}


function serviceShutdown() {


  client1.stopService()
    .then((result)=>{

      process.exit(0);
    });

}

process.on('SIGINT', function () {
    serviceShutdown();
});
process.on('SIGTERM', function () {
    serviceShutdown();
});




//
serviceStart();