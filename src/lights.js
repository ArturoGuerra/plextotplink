const { Client } = require('tplink-smarthome-api');

const client = new Client();
const TRANSITION_TIME = process.env.TRANSITION_TIME || 100

let config
try {
  config = require('./config.js');
} catch (e) {
  console.error('Config file is required')
  process.exit(1)
}

class Group {
  constructor (name, id, items) {
    this.name = name
    this.id = id
    this.items = items
  }
}

function Devices () {
  this.groups = []
  this.init = async function () {
    for (let i = 0; i < config.lights.length; i++) {
      let group = config.lights[i]
      let items = []
      for (let i = 0; i < group.items.length; i++) {
        try {
          items.push(await client.getBulb({ host: group.items[i].host }))
        } catch (e) {
          console.error(e.message)
        }
      }
      this.groups.push(new Group(group.name, group.id, items))
    }
  }


  this.set = async function (gid, state) {
    let group
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].id == gid) {
        group = this.groups[i]
        break
      }
    }

    group.items.forEach(async (bulb) => {
      await bulb.lighting.setLightState({
        on_off: state,
        transition_period: TRANSITION_TIME
      })
    })
  }

  this.control = async function (gid, state, brightness) {
    let group
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].id == gid) {
        group = this.groups[i]
        break
      }
    }

    group.items.forEach(async (bulb) => {
      let lightstate = await bulb.lighting.getLightState()
      let currentbrightness = lightstate.brightness ? lightstate.brightness : 100
      if (lightstate.on_off && brightness != currentbrightness) {
        await bulb.lighting.setLightState({
          on_off: state,
          brightness: brightness,
          transition_period: TRANSITION_TIME
        })
      }
    })
  }
}

async function Initialize (devices) {
  await devices.init()
  //await devices.set(1, true)
}

module.exports.Initialize = Initialize
module.exports.Devices = Devices
