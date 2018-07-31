const { Devices, Initialize } = require('./lights');

const devices = new Devices()
const uid = process.env.UID || 1

Initialize(devices)

async function setLights(event) {
  if (event == 'media.play' || event == 'media.resume') {
    console.log('Setting brightness: ', 20)
    await devices.control(1, true, 20)
  } else if (event == 'media.stop' || event == 'media.pause') {
    console.log('Setting brightness: ', 100)
    await devices.control(1, true, 100)
  }
}

module.exports = async (req, res) => {
  let payload = JSON.parse(req.body.payload);

  if (payload.Account.id != uid) return

  await setLights(payload.event)
}
