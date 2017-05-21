// @flow
import test from 'tape'
import {parse,} from '../src/parse'
import {serialize} from '../src/serialize'
import {roundCorners} from '../src/index'
import {getSubPaths} from '../src/utils'

//todo: test new lines
test('round corners should do nothing when there are no double lines', (t) => {
    t.deepEquals(serialize(roundCorners(parse('M0 0C100 100 250 100 250 200S400 300 400 200Z'), 30)), 'M0 0C100 100 250 100 250 200S400 300 400 200Z')
    t.deepEquals(serialize(roundCorners(parse('M0 0L100 0C100 100 250 100 250 200'), 30)), 'M0 0L100 0C100 100 250 100 250 200')
    t.end()
})

test('unclosed path, single corner', (t) => {
    t.deepEquals(serialize(roundCorners(parse('M0 0L100 0 100 100'), 30)), 'M0 0L70 0Q100 0 100 30L100 100')
    t.deepEquals(serialize(roundCorners(parse('M50 30L150 30 150 130'), 30)), 'M50 30L120 30Q150 30 150 60L150 130')
    t.end()
})

test('unclosed path, single corner, use relative coordinates', (t) => {
    t.deepEquals(serialize(roundCorners(parse('M50 30l100 0 0 100'), 30)), 'M50 30L120 30Q150 30 150 60L150 130')
    t.end()
})

test('unclosed path, two corners', (t) => {
    t.deepEquals(serialize(roundCorners(parse('M50 50l 100 0 0 100 -100 0'), 30)), 'M50 50L120 50Q150 50 150 80L150 120Q150 150 120 150L50 150')
    t.end()
})

test('unclosed path, three corners', (t) => {
    t.deepEquals(serialize(roundCorners(parse('M50 50l 100 0 0 100 -100 0 0-50'), 30)), 'M50 50L120 50Q150 50 150 80L150 120Q150 150 120 150L80 150Q50 150 50 120L50 100')
    t.end()
})

test('closed path, square, just lines', (t) => {
    t.deepEquals(
        serialize(roundCorners(parse('M 0 0L 100 0 L 100 100 L 0 100 L 0 0'), 20)),
        'M20 0L80 0Q100 0 100 20L100 80Q100 100 80 100L20 100Q0 100 0 80L0 20Q0 0 20 0'
    )
    t.end()
})

test('square with Z command', (t) => {
    t.deepEquals(
        serialize(roundCorners(parse('M 0 0L 100 0 L 100 100 L 0 100 Z'), 20)),
        'M20 0L80 0Q100 0 100 20L100 80Q100 100 80 100L20 100Q0 100 0 80L0 20Q0 0 20 0'
    )
    t.end()
})

test('two closed sub-pathes', (t) => {
    t.deepEquals(
        serialize(roundCorners(parse('M 0 0L 100 0 L 100 100 L 0 100 Z M 200 200 l 100 0 l 0 100 l -100 0 z'), 20)),
        'M20 0L80 0Q100 0 100 20L100 80Q100 100 80 100L20 100Q0 100 0 80L0 20Q0 0 20 0M220 200L280 200Q300 200 300 220L300 280Q300 300 280 300L220 300Q200 300 200 280L200 220Q200 200 220 200'
    )
    t.end()
})

test('two squares, without explicit M command', (t) => {
    t.deepEquals(
        serialize(roundCorners(parse('M 0 0L 100 0 L 100 100 L 0 100 Z l 200 0 l 0 200 l -200 0 z'), 20)),
        'M20 0L80 0Q100 0 100 20L100 80Q100 100 80 100L20 100Q0 100 0 80L0 20Q0 0 20 0M20 0L180 0Q200 0 200 20L200 180Q200 200 180 200L20 200Q0 200 0 180L0 20Q0 0 20 0'
    )
    t.end()
})

test('two squares, with single M command on first sub-path', (t) => {
    t.deepEquals(
        serialize(roundCorners(parse('M 20 20 l 100 0 l 0 100 l -100 0 Z l 200 0 l 0 200 l -200 0 z'), 20)),
        'M40 20L100 20Q120 20 120 40L120 100Q120 120 100 120L40 120Q20 120 20 100L20 40Q20 20 40 20M40 20L200 20Q220 20 220 40L220 200Q220 220 200 220L40 220Q20 220 20 200L20 40Q20 20 40 20'
    )
    t.end()
})


