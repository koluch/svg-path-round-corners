// @flow
import test from 'tape'
import {parse, } from '../src/parse'
import {getSubPaths} from '../src/utils'

test('should do nothing with empty data', (t) => {
    t.deepEquals(getSubPaths(parse('')), [])
    t.end()
})

test('should fail when first command is not Move command', (t) => {
    t.throws(() => getSubPaths(parse('L 0 0')))
    t.end()
})

test('parse data with single subpath', (t) => {
    t.deepEquals(getSubPaths(parse('M 48 0')), [[{command: 'M', x: 48, y: 0}]])
    t.end()
})

test('split path to subpathes by M command', (t) => {
    t.deepEquals(getSubPaths(parse('M10 315 78 35')), [
        [{command: 'M', x: 10, y: 315}],
        [{command: 'M', x: 78, y: 35}],
    ])
    t.deepEquals(getSubPaths(parse('M10 315 L 31 48 M78 35')), [
        [{command: 'M', x: 10, y: 315},{command: 'L', x: 31, y: 48}],
        [{command: 'M', x: 78, y: 35}],
    ])
    t.deepEquals(getSubPaths(parse('m10 315 78 35')), [
        [{command: 'm', dx: 10, dy: 315}],
        [{command: 'm', dx: 78, dy: 35}],
    ])
    t.end()
})

test('split path to subpathes by M command', (t) => {
    t.deepEquals(getSubPaths(parse('M10 315 Z')), [
        [{command: 'M', x: 10, y: 315}, {command: 'Z'}],
    ])
    t.deepEquals(getSubPaths(parse('M10 315 Z Z')), [
        [{command: 'M', x: 10, y: 315}, {command: 'Z'}],
        [{command: 'Z'}],
    ])
    t.deepEquals(getSubPaths(parse('M10 315 M 30 15 Z')), [
        [{command: 'M', x: 10, y: 315}],
        [{command: 'M', x: 30, y: 15}, {command: 'Z'}],
    ])
    t.end()
})
