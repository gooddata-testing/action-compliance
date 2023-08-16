import * as core from '@actions/core'
import {wait} from './wait'

async function run(): Promise<void> {
  try {
    core.debug(new Date().toTimeString())
    core.info("Hello from action-compliance")
    await wait(1000)
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
