const crc = require('crc')




const STX = 0x02
const ETX = 0x03
const EOT = 0x04


const allocBuf = Buffer.alloc(7)

allocBuf.writeUInt8(STX, 0)
console.log('allocBuf', allocBuf)
allocBuf.write('R001', 1)
console.log('allocBuf', allocBuf)
allocBuf.writeUInt8(ETX, 5)
console.log('allocBuf', allocBuf)
allocBuf.writeUInt8(EOT, 6)
console.log('allocBuf', allocBuf)

let first =  allocBuf.slice(1, 5)
let second =  allocBuf.slice(0, 5)
let third =  allocBuf.slice(1)
let fourth =  allocBuf.slice(1, 6)
let fifth =  allocBuf.slice(2, 5)
let final =  allocBuf.slice(0, 6)

let arr = [allocBuf, first, second, third, fourth, fifth, final]

arr.forEach(ele => {
  console.log('Value String => ', ele.toString())
  let value = crc.crc8(ele.toString())
  console.log('crc8', value.toString('16'))
   value = crc.crc16(ele.toString())
  console.log('crc16', value.toString('16'))
   value = crc.crc16ccitt(ele.toString())
  console.log('crc16ccitt', value.toString('16'))
   value = crc.crc16kermit(ele.toString())
  console.log('crc16kermit', value.toString('16'))
   value = crc.crc16modbus(ele.toString())
  console.log('crc16modbus', value.toString('16'))
   value = crc.crc16xmodem(ele.toString())
  console.log('crc16xmodem', value.toString('16'))
  // console.log('value',value, value.toString('16'))

})
