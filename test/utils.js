// @flow
import test from 'tape'
import {parse} from '../src/parse'
import {serialize} from '../src/serialize'
import {getSubPaths, makeDataRelative, makeDataAbsolute, makeCommandRelative, isSubPathClosed} from '../src/utils'
import type {TAbsoluteData} from '../src/types'

test('applyRelativeCommand: make relative command, which is already relative', (t) => {
    t.deepEquals(makeCommandRelative({x: 30, y: 40}, {c: 'l', dx: 50, dy: 100}), {c: 'l', dx: 50, dy: 100})
    t.end()
})

test('applyRelativeCommand: make relative line commands', (t) => {
    t.deepEquals(makeCommandRelative({x: 0, y: 0}, {c: 'L', x: 100, y: 0}), {c: 'l', dx: 100, dy: 0})
    t.deepEquals(makeCommandRelative({x: 100, y: 0}, {c: 'L', x: 100, y: 100}), {c: 'l', dx: 0, dy: 100})
    t.deepEquals(makeCommandRelative({x: 100, y: 100}, {c: 'L', x: 0, y: 100}), {c: 'l', dx: -100, dy: 0})
    t.end()
})

test('makeDataRelative: making empty data relative should return empty data', (t) => {
    t.deepEquals(serialize(makeDataRelative(parse(''))), '')
    t.end()
})

test('makeDataRelative: making relative the data which is already relative should do nothing', (t) => {
    t.deepEquals(serialize(makeDataRelative(parse('l0 0'))), 'l0 0')
    t.deepEquals(serialize(makeDataRelative(parse('m50 372l42 53 58 92z'))), 'm50 372l42 53 58 92z')
    t.end()
})

test('makeDataRelative: should properly make relative series of absolute commands', (t) => {
    t.deepEquals(serialize(makeDataRelative(parse('L0 0'))), 'l0 0')
    t.deepEquals(serialize(makeDataRelative(parse('M0 0 L 100 0 L 100 100 L 0 100 Z'))), 'm0 0l100 0 0 100-100 0z')
    t.end()
})

test('makeDataRelative: multi-segments data', (t) => {
    t.deepEquals(
        serialize(makeDataRelative(parse('M0 0 L 100 0 L 100 100 Z M 200 200 L 300 200 L 300 300 Z'))),
        'm0 0l100 0 0 100zm200 200l100 0 0 100z'
    )
    t.end()
})


test('makeDataAbsolute: making empty data relative should return empty data', (t) => {
    t.deepEquals(serialize(makeDataAbsolute(parse(''))), '')
    t.end()
})

test('makeDataAbsolute: making absolute the data which is already absolute should do nothing', (t) => {
    t.deepEquals(serialize(makeDataAbsolute(parse('l0 0'))), 'L0 0')
    t.deepEquals(serialize(makeDataAbsolute(parse('L50 372 42 53 58 92Z'))), 'L50 372 42 53 58 92Z')
    t.end()
})

test('makeDataAbsolute: should properly make absolute series of relative commands', (t) => {
    t.deepEquals(serialize(makeDataAbsolute(parse('L0 0'))), 'L0 0')
    t.deepEquals(serialize(makeDataAbsolute(parse('m0 0l100 0 0 100-100 0z'))), 'M0 0L100 0 100 100 0 100Z')
    t.end()
})

test('makeDataAbsolute: multi-segments data', (t) => {
    t.deepEquals(
        serialize(makeDataAbsolute(parse('M 20 20 l 100 0 l 0 100 Z l 200 0 l 0 200 z'))),
        'M20 20L120 20 120 120ZL220 20 220 220Z'
    )
    t.deepEquals(
        serialize(makeDataAbsolute(parse('M 20 20 l 100 0 l 0 100 l -100 0 Z l 200 0 l 0 200 l -200 0 z'))),
        'M20 20L120 20 120 120 20 120ZL220 20 220 220 20 220Z'
    )
    t.deepEquals(
        serialize(makeDataAbsolute(parse('m0 0l100 0 0 100zm200 200l100 0 0 100z'))),
        'M0 0L100 0 100 100ZM200 200L300 200 300 300Z'
    )
    t.end()
})

test('makeDataAbsolute: real-data test', (t) => {
    t.deepEquals(
        serialize(makeDataAbsolute(parse('m170.587487,323.440013l0,-129.374998l0,0c0,-55.573651 43.484345,-100.625008 97.125012,-100.625008l0,0l0,0c25.759147,0 50.463273,10.601535 68.677764,29.472382c18.214476,18.870847 28.44724,44.465213 28.44724,71.152626l0,14.375002l27.749981,0l-55.499969,57.500025l-55.500022,-57.500025l27.750003,0l0,-14.375002c0,-23.817276 -18.636157,-43.124991 -41.62499,-43.124991l0,0l0,0c-22.988863,0 -41.625005,19.307716 -41.625005,43.124991l0,129.374998l-55.500014,0z'))),
        'M170.587487 323.440013L170.587487 194.06501500000002 170.587487 194.06501500000002C170.587487 138.49136400000003 214.071832 93.44000700000002 267.712499 93.44000700000002L267.712499 93.44000700000002 267.712499 93.44000700000002C293.47164599999996 93.44000700000002 318.175772 104.04154200000002 336.390263 122.91238900000002 354.604739 141.78323600000002 364.837503 167.37760200000002 364.837503 194.06501500000002L364.837503 208.440017 392.587484 208.440017 337.087515 265.940042 281.587493 208.440017 309.337496 208.440017 309.337496 194.06501500000002C309.337496 170.24773900000002 290.70133899999996 150.94002400000002 267.71250599999996 150.94002400000002L267.71250599999996 150.94002400000002 267.71250599999996 150.94002400000002C244.72364299999995 150.94002400000002 226.08750099999997 170.24774000000002 226.08750099999997 194.06501500000002L226.08750099999997 323.440013 170.58748699999998 323.440013Z'
    )
    t.end()
})

const subPathPrep = (str) => getSubPaths(makeDataAbsolute(parse(str)))

test('getSubPaths: should do nothing with empty data', (t) => {
    t.deepEquals(subPathPrep(''), [])
    t.end()
})

test('getSubPaths: should fail when first command is not Move command', (t) => {
    t.throws(() => subPathPrep('L 0 0'))
    t.end()
})

test('getSubPaths: parse data with single subpath', (t) => {
    t.deepEquals(subPathPrep('M 48 0'), [[{c: 'M', x: 48, y: 0}]])
    t.end()
})

test('getSubPaths: split path to subpathes by M command', (t) => {
    t.deepEquals(subPathPrep('M10 315 78 35'), [
        [{c: 'M', x: 10, y: 315}],
        [{c: 'M', x: 78, y: 35}],
    ])
    t.deepEquals(subPathPrep('M10 315 L 31 48 M78 35'), [
        [{c: 'M', x: 10, y: 315}, {c: 'L', x: 31, y: 48}],
        [{c: 'M', x: 78, y: 35}],
    ])
    t.deepEquals(subPathPrep('m10 315 78 35'), [
        [{c: 'M', x: 10, y: 315}],
        [{c: 'M', x: 88, y: 350}],
    ])
    t.end()
})

test('getSubPaths: split path to subpathes by Z command', (t) => {
    t.deepEquals(subPathPrep('M10 315 Z'), [
        [{c: 'M', x: 10, y: 315}, {c: 'Z'}],
    ])
    t.deepEquals(subPathPrep('M10 315 Z Z'), [
        [{c: 'M', x: 10, y: 315}, {c: 'Z'}],
        [{c: 'Z'}],
    ])
    t.deepEquals(subPathPrep('M10 315 M 30 15 Z'), [
        [{c: 'M', x: 10, y: 315}],
        [{c: 'M', x: 30, y: 15}, {c: 'Z'}],
    ])
    t.end()
})


test('isSubPathClosed: examples of closed path', (t) => {
    t.true(isSubPathClosed({x: 0, y: 0}, makeDataAbsolute(parse('M 0 0 L 100 100 L 200 200 Z'))))
    t.true(isSubPathClosed({x: 0, y: 0}, makeDataAbsolute(parse('M 0 0 L 100 100 L 200 200 L 0 0'))))
    t.true(isSubPathClosed({x: 0, y: 0}, makeDataAbsolute(parse('l 200 0 l 0 200 l -200 -200'))))
    t.end()
})

test('isSubPathClosed: examples of unclosed path', (t) => {
    t.false(isSubPathClosed({x: 0, y: 0}, makeDataAbsolute(parse('M 0 0 L 100 100 L 200 200'))))
    t.false(isSubPathClosed({x: 0, y: 0}, makeDataAbsolute(parse('l 200 0 l 0 200 l -200 -199'))))
    t.end()
})
