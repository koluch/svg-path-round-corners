// @flow
import test from 'tape'
import {parse, } from '../src/parse'
import {serialize} from '../src/serialize'
import {roundCorners} from '../src/index'
import {getSubPaths} from '../src/utils'

//todo: test new lines
test('round corners should do nothing when there are no double lines', (t) => {
    t.deepEquals(serialize(roundCorners(parse('M0 0C100 100 250 100 250 200S400 300 400 200z'))), 'M0 0C100 100 250 100 250 200S400 300 400 200z')
    t.deepEquals(serialize(roundCorners(parse('M0 0L100 0C100 100 250 100 250 200'))), 'M0 0L100 0C100 100 250 100 250 200')
    t.end()
})

test('single corner', (t) => {
    t.deepEquals(serialize(roundCorners(parse('M0 0L100 0 100 100'), 30)), 'M0 0l70 0q30 0 30 30l0 70')
    t.deepEquals(serialize(roundCorners(parse('M50 30L150 30 150 130'), 30)), 'M50 30l70 0q30 0 30 30l0 70')
    t.end()
})

test('single corner, use relative coordinates', (t) => {
    t.deepEquals(serialize(roundCorners(parse('M50 30l100 0 0 100'), 30)), 'M50 30l70 0q30 0 30 30l0 70')
    t.end()
})

test('two corners', (t) => {
    t.deepEquals(serialize(roundCorners(parse('M50 50l 100 0 0 100 -100 0'), 30)), 'M50 50l70 0q30 0 30 30l0 40q0 30-30 30l-70 0')
    t.end()
})

test('three corners', (t) => {
    t.deepEquals(serialize(roundCorners(parse('M50 50l 100 0 0 100 -100 0 0-50'), 30)), 'M50 50l70 0q30 0 30 30l0 40q0 30-30 30l-40 0q-30 0-30-30l0-20')
    t.end()
})

// test('combine lines with Z command', (t) => {
//     t.deepEquals(serialize(roundCorners(parse('M50 50l 100 0 0 100 -100 0Z'), 30)), 'M80 50l40 0q30 0 30 30l0 40q0 30-30 30l-40 0q-30 0-30 -30l0 -40q0 -30 30 -30')
//     t.end()
// })
