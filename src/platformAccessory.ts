import { access } from 'fs';
import { Service, PlatformAccessory, CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';

import { ExampleHomebridgePlatform } from './platform';

import * as http from 'http';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class ExamplePlatformAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private exampleStates = {
    On: false,
    Brightness: 100,
  };

  constructor(
    private readonly platform: ExampleHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly device,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Shelly')
      .setCharacteristic(this.platform.Characteristic.Model, this.device.deviceType)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'none');;

    // get the LightSensor service if it exists, otherwise create a new LightSensor service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.LightSensor) || this.accessory.addService(this.platform.Service.LightSensor);


    //// get information from shelly module
    /*const req = http.request(
      {
      host: 'http://admin:sara97@192.168.1.19',
      path: '/shelly',
      method: 'GET',
    },
    response => {
      console.log(response.);
      this.platform.log.debug(response);
    });

    req.end();
    */
    
    
    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel)
      .on('get', this.handleCurrentAmbientLightLevelGet.bind(this));               // GET - bind to the `handleCurrentAmbientLightLevelGet` method below


  }

  

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   * 
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   * 
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */





  /**
   * Handle requests to get the current value of the "Current Ambient Light Level" characteristic
   */
  handleCurrentAmbientLightLevelGet(callback) {
    this.platform.log.debug('Triggered GET CurrentAmbientLightLevel');

    // set this to a valid value for CurrentAmbientLightLevel
    const currentValue = 1;

    callback(null, currentValue);
  }


}
