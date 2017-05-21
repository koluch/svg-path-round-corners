// @flow
import test from 'tape'
import {parse, } from '../src/parse'
import {serialize} from '../src/serialize'

//todo: test new lines

test('parse move command', (t) => {
    t.deepEquals(parse('M10 315'), [{c: 'M', x: 10, y: 315}])
    t.deepEquals(parse('M 10 315'), [{c: 'M', x: 10, y: 315}])
    t.deepEquals(parse('M10 315 43 17'), [{c: 'M', x: 10, y: 315}, {c: 'M', x: 43, y: 17}])
    t.deepEquals(parse('M 10 315 43 17 9 217'), [{c: 'M', x: 10, y: 315}, {c: 'M', x: 43, y: 17}, {c: 'M', x: 9, y: 217}])
    t.end()
})

test('bad move commands', (t) => {
    t.throws(() => parse('M 10 315 12'))
    t.end()
})

test('parse two moves command', (t) => {
    t.deepEquals(parse('M 10 315 M 78 35'), [{c: 'M', x: 10, y: 315}, {c: 'M', x: 78, y: 35}])
    t.end()
})

test('parse several commands with bezier curves', (t) => {
    t.deepEquals(parse('M100,200 C100,100 250,100 250,200 S400,300 400,200 z'), [
        {c: 'M', x: 100, y: 200},
        {c: 'C', x1: 100, y1: 100, x2: 250, y2: 100, x: 250, y: 200},
        {c: 'S', x2: 400, y2: 300, x: 400, y: 200},
        {c: 'z'},
    ])
    t.end()
})

test('parse command with negative coordinate', (t) => {
    t.deepEquals(parse('M10 -315 Z'), [{c: 'M', x: 10, y: -315}, {c: 'Z'}])
    t.deepEquals(parse('M -10 315 Z'), [{c: 'M', x: -10, y: 315}, {c: 'Z'}])
    t.deepEquals(parse('M-10 315 Z'), [{c: 'M', x: -10, y: 315}, {c: 'Z'}])
    t.deepEquals(parse('M 10-315 Z'), [{c: 'M', x: 10, y: -315}, {c: 'Z'}])
    t.deepEquals(parse('M-10-315 Z'), [{c: 'M', x: -10, y: -315}, {c: 'Z'}])
    t.deepEquals(parse('M -10 -315 Z'), [{c: 'M', x: -10, y: -315}, {c: 'Z'}])
    t.end()
})

test('parse command with decimal coordinate', (t) => {
    t.deepEquals(parse('M10.5 -315 Z'), [{c: 'M', x: 10.5, y: -315}, {c: 'Z'}])
    t.deepEquals(parse('M-10.5 -315 Z'), [{c: 'M', x: -10.5, y: -315}, {c: 'Z'}])
    t.end()
})

test('parse command with wrong coordinate format', (t) => {
    t.throws(() => parse('M10- Z'))
    t.throws(() => parse('M10--10 Z'))
    t.throws(() => parse('M10-- Z'))
    t.throws(() => parse('M-10.5.5 -315 Z'))
    t.end()
})

test('parse and serialize commands', (t) => {
    t.deepEquals(serialize(parse('M10 315')), 'M10 315')
    t.deepEquals(serialize(parse('M 10 315')), 'M10 315')
    t.deepEquals(serialize(parse('M 10-315')), 'M10-315')
    t.deepEquals(serialize(parse('M-10-315')), 'M-10-315')
    t.deepEquals(serialize(parse('M-10 -315')), 'M-10-315')
    t.deepEquals(serialize(parse('M -10 -315Z')), 'M-10-315Z')
    t.deepEquals(serialize(parse('M100,200 C100,100 250,100 250,200 S400,300 400,200 z')), 'M100 200C100 100 250 100 250 200S400 300 400 200z')
    t.end()
})

test('parse and serialize multiple same commands', (t) => {
    t.deepEquals(serialize(parse('M10 315 78 35Z')), 'M10 315 78 35Z')
    t.end()
})
