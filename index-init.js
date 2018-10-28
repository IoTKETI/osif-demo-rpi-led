var GPIO = require('onoff').Gpio;

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


function onStatusChanged(err, state) {
  if(state === 0) {
    g_SensorControlState ++;
    if(g_SensorControlState > 3)
      g_SensorControlState = 1;
    controlLED(g_SensorControlState);
  }
  else {
    return;
  }
}



function serviceStart() {
  controlLED(LED_OFF);


  button.watch(onStatusChanged);

  console.log('Service start...');
}


function serviceShutdown() {
  controlLED(LED_OFF);

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