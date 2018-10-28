var GPIO = require('onoff').Gpio;
var OSIFClient = require('osif-client').Client;

var ledRPinBCM    = 18;    //  Phy 12, wPi 1, BCM 18
var ledGPinBCM    = 17;    //  Phy 11, wPi 0, BCM 17
var ledBPinBCM    = 27;    //  Phy 13, wPi 2, BCM 27
var buttonPinBCM  = 22;    //  Phy 15, wPi 3, BCM 22


var ledR = new GPIO(ledRPinBCM, 'out');
var ledG = new GPIO(ledGPinBCM, 'out');
var ledB = new GPIO(ledBPinBCM, 'out');
var button = new GPIO(buttonPinBCM, 'in', 'both');


var LED_OFF = 0;
var LED_ON = 2;

var serviceOptions = require('./ciotservice.json');
var client1 = new OSIFClient(serviceOptions);

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

var g_SensorControlState = 0;


function onButtonPushed(err, state) {
  if(state === 0) {
    g_SensorControlState ++;
    if(g_SensorControlState > 3)
      g_SensorControlState = 1;

    client1.setLocalAppData("iotweek-sensor-control", g_SensorControlState);
  }
  else {
    return;
  }
}


function serviceStart() {
  controlLED(LED_OFF);


  button.watch(onButtonPushed);

  console.log('Service start...');

  client1.init()
    .then(function(client) {
      return client.startService();

    })

    .then(function(value) {
      console.log('startService', value);

      return client1.getLocalAppData("iotweek-sensor-control");
    })

    .then(function(value){
      //  초기값 읽어오기
      controlLED(value);


      var listener = function (key) {
        console.log('LOCAL OPENDATA UPDATED : value : ', key);

        client1.getLocalOpendata(key)
          .then((value) => {
            console.log('LISTENER : getLocalAppData : ', value);

            controlLED(value);
          })
      };


      client1.subscribeToLocalOpendata('iotweek-sensor-control', listener);
    })



}


function serviceShutdown() {
  controlLED(LED_OFF);

  client1.stopService();
  
  process.exit(0);
}

process.on('SIGINT', function () {
    serviceShutdown();
});
process.on('SIGTERM', function () {
    serviceShutdown();
});




//
serviceStart();