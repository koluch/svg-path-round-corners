// @flow
import test from 'tape'
import {parse} from '../src/parse'
import {serialize} from '../src/serialize'
import {getSubPaths, normalizeData, isSubPathClosed} from '../src/utils'
import type {TAbsoluteData} from '../src/types'

const subPathPrep = (str) => getSubPaths(normalizeData(parse(str)))

//todo: add tests for normalizeData

test('getSubPaths: should do nothing with empty data', (t) => {
    t.deepEquals(subPathPrep(''), [])
    t.end()
})

test('getSubPaths: should fail when first command is not Move command', (t) => {
    t.throws(() => subPathPrep('L 100 100'))
    t.end()
})

test('getSubPaths: parse data with single sub-path', (t) => {
    t.deepEquals(subPathPrep('M 48 0'), [[{c: 'M', x: 48, y: 0}]])
    t.end()
})

test('getSubPaths: should copy last M command to the next sub-path', (t) => {
    t.deepEquals(
        subPathPrep('M 50 50 L 100 100 Z L 100 100 Z'),
        [
            [{c: 'M', x: 50, y: 50}, {c: 'L', x: 100, y: 100}, {c: 'Z'}],
            [{c: 'M', x: 50, y: 50}, {c: 'L', x: 100, y: 100}, {c: 'Z'}],
        ]
    )
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
    t.deepEquals(subPathPrep('M 0 0 L10 315 Z'), [
        [{c: 'M', x: 0, y: 0}, {c: 'L', x: 10, y: 315}, {c: 'Z'}],
    ])
    t.end()
})

test('getSubPaths: should add M command for sub-path automatically', (t) => {
    t.deepEquals(subPathPrep('M 0 0 L10 315 Z L 400 500 Z'), [
        [{c: 'M', x: 0, y: 0}, {c: 'L', x: 10, y: 315}, {c: 'Z'}],
        [{ c: 'M', x: 0, y: 0 }, {c: 'L', x: 400, y: 500}, {c: 'Z'}],
    ])
    t.end()
})

test('isSubPathClosed: examples of closed path', (t) => {
    t.true(isSubPathClosed({x: 0, y: 0}, normalizeData(parse('M 0 0 L 100 100 L 200 200 Z'))))
    t.true(isSubPathClosed({x: 0, y: 0}, normalizeData(parse('M 0 0 L 100 100 L 200 200 L 0 0'))))
    t.true(isSubPathClosed({x: 0, y: 0}, normalizeData(parse('l 200 0 l 0 200 l -200 -200'))))
    t.end()
})

test('isSubPathClosed: examples of unclosed path', (t) => {
    t.false(isSubPathClosed({x: 0, y: 0}, normalizeData(parse('M 0 0 L 100 100 L 200 200'))))
    // t.false(isSubPathClosed({x: 0, y: 0}, normalizeData(parse('l 200 0 l 0 200 l -200 -199'))))
    t.end()
})
