import { readFileSync } from 'fs'
import { resolve } from 'path'
import axios from 'axios'
import * as schedule from 'node-schedule'

const config = JSON.parse(
  readFileSync(resolve(__dirname, '../config.json'), { encoding: 'utf8' })
)

const http = axios.create({
  baseURL: 'https://api.name.com/v4',
  auth: {
    username: config.username,
    password: config.token,
  },
})

async function run() {
  try {
    const { data } = await http.get(`/domains/${config.domain}/records`)
    const { records } = data
    const targetRecord = records.find(
      (record: any) => record.fqdn === `${config.domain}.`
    )
    const currentIP = await getCurrentIP()
    let res = null
    if (!targetRecord) {
      // create record to current ip
      res = await createRecord(currentIP)
    } else {
      // update record
      res = await updateRecord(targetRecord.id, currentIP)
    }

    console.log(
      `[${new Date().toLocaleString()}] update success: ${JSON.stringify(res)}`
    )
  } catch (e) {
    console.log(
      `[${new Date().toLocaleString()}] update failed: ${JSON.stringify(e)}`
    )
  }
}

function runWithSchedule() {
  // run every 5 minutes
  schedule.scheduleJob('*/5 * * * *', () => {
    run()
  })
}

runWithSchedule()

// 获取当前ip
async function getCurrentIP() {
  const { data } = await http.get('https://api.ip.sb/ip')
  return data.replace(/\n|\s/g, '')
}

// 创建dns解析
async function createRecord(targetIP: string) {
  const { data } = await http.post(`/domains/${config.domain}/records`, {
    host: '',
    type: 'A',
    answer: targetIP,
    ttl: 300,
  })
  return data
}

// 更新dns解析
async function updateRecord(id: number, targetIP: string) {
  const { data } = await http.put(`/domains/${config.domain}/records/${id}`, {
    host: '',
    type: 'A',
    answer: targetIP,
    ttl: 300,
  })
  return data
}