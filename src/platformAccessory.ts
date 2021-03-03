import { Service, PlatformAccessory } from 'homebridge';

import { ShellyConsumptionHomebridgePlatform } from './platform';

import * as http from 'http';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class ShellyConsumptionPlatformAccessory {
  private service: Service;

  constructor(
    private readonly platform: ShellyConsumptionHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly device,
  ) {

    http.get('http://' + platform.config.user + ':' + platform.config.password + '@' + device.ipAddress + '/shelly', (res) => {
      res.setEncoding('utf-8');
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk; 
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);

          // set accessory information
          this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Shelly')
            .setCharacteristic(this.platform.Characteristic.Model, parsedData.type)
            .setCharacteristic(this.platform.Characteristic.SerialNumber, parsedData.mac)
            .setCharacteristic(this.platform.Characteristic.FirmwareRevision, parsedData.fw);




        } catch (e) {
          //console.log('Got error' + e.message);
        }
      });

    })/*.on('error', (e) => {
      console.error(`Got error: ${e.message}`);
    })*/;

    /* add light sensor for power value */
    // get the LightSensor service if it exists, otherwise create a new LightSensor service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.LightSensor) || 
      this.accessory.addService(this.platform.Service.LightSensor);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    if(accessory.context.device.name !== '') {
      this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);
    } else {
      this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.ipAddress);
    }

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel)
      .on('get', this.handleCurrentAmbientLightLevelGet.bind(this));               
    // GET - bind to the `handleCurrentAmbientLightLevelGet` method below

    this.service.getCharacteristic(this.platform.Characteristic.StatusActive)
      .on('get', this.handleCurrentStatusActive.bind(this));              
    // GET - bind to the `handleCurrentAmbientLightLevelGet` method below
  }


  /**
   * Handle requests to get the current value of the "Current Ambient Light Level" characteristic
   */
  handleCurrentAmbientLightLevelGet(callback) {
    this.platform.log.debug('Triggered GET CurrentAmbientLightLevel');

    http.get('http://' + this.platform.config.user + ':' + this.platform.config.password + '@' 
        + this.device.ipAddress + '/status', (res) => {
      res.setEncoding('utf-8');
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk; 
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);

          let power = 0;
          if (this.device.emeterChannel1) {
            power += parsedData.emeters[0].power;
          }
          if (this.device.emeterChannel2) {
            power += parsedData.emeters[1].power;
          }
          if (this.device.emeterChannel3) {
            power += parsedData.emeters[2].power;
          }

          if (power === 0) {
            power = 0.0001;
          }

          // set this to a valid value for CurrentAmbientLightLevel
          callback(null, Math.abs(power));

        } catch (e) {
          //console.log('Got error' + e.message);
        }
      });

    })/*.on('error', (e) => {
      //console.error(`Got error: ${e.message}`);
    })*/;

  }


  handleCurrentStatusActive(callback) {
    this.platform.log.debug('Triggered GET PowerPolarity');

    http.get('http://' + this.platform.config.user + ':' + this.platform.config.password + '@' 
        + this.device.ipAddress + '/status', (res) => {
      res.setEncoding('utf-8');
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);

          let power = 0;
          if (this.device.emeterChannel1) {
            power += parsedData.emeters[0].power;
          }
          if (this.device.emeterChannel2) {
            power += parsedData.emeters[1].power;
          }
          if (this.device.emeterChannel3) {
            power += parsedData.emeters[2].power;
          }

          let polarity;
          if (power >= 0) {
            polarity = true;
          } else if (power < 0) {
            polarity = false;
          }

          // set this to a valid value for CurrentAmbientLightLevel
          callback(null, polarity);

        } catch (e) {
          //console.log('Got error' + e.message);
        }
      });

    })/*.on('error', (e) => {
      //console.error(`Got error: ${e.message}`);
    })*/;
  }
}