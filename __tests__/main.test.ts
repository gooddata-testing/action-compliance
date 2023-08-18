import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'
import {hasOnlySpecialAuthors, hasSpecialTitle, matchesTicketRegex} from '../src/checks'


// test('throws invalid number', async () => {
//   const input = parseInt('foo', 10)
//   await expect(wait(input)).rejects.toThrow('milliseconds not a number')
// })

// test('wait 500 ms', async () => {
//   const start = new Date()
//   await wait(500)
//   const end = new Date()
//   var delta = Math.abs(end.getTime() - start.getTime())
//   expect(delta).toBeGreaterThan(450)
// })

// shows how the runner will run a javascript action with env / stdout protocol
// test('test runs', () => {
//   process.env['INPUT_MILLISECONDS'] = '500'
//   const np = process.execPath
//   const ip = path.join(__dirname, '..', 'lib', 'main.js')
//   const options: cp.ExecFileSyncOptions = {
//     env: process.env
//   }
//   console.log(cp.execFileSync(np, [ip], options).toString())
// })

test('Special title check works', async () => {
  expect(hasSpecialTitle("^TRIVIAL\\b.*", "TRIVIAL: Typo fix")).toEqual(true)
  expect(hasSpecialTitle("^TRIVIAL\\b.*", "Some normal title")).toEqual(false)
})

test('Ticket regex check works', async () => {
  expect(matchesTicketRegex(".*\\b[A-Z]{2,}-[0-9]+\\b.*", "INFRA-1234: Blah blah", "Description of blah")).toEqual(true)
  expect(matchesTicketRegex(".*\\b[A-Z]{2,}-[0-9]+\\b.*", "Blah blah", "Resolves GD-888")).toEqual(true)
  expect(matchesTicketRegex(".*\\b[A-Z]{2,}-[0-9]+\\b.*", "No ticket in title", "No ticket in description")).toEqual(false)
})
