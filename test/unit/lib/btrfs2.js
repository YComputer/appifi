const Promise = require('bluebird')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

const rimrafAsync = Promise.promisify(require('rimraf'))
const mkdirpAsync = Promise.promisify(require('mkdirp'))
const UUID = require('uuid')

const chai = require('chai').use(require('chai-as-promised'))
const expect = chai.expect
const should = chai.should()

const debug = require('debug')('test-btrfs')

const fingerprint = require('src/lib/fingerprintSync')
const { btrfsConcat, btrfsClone } = require('src/lib/btrfs')
// const btrfsConcat = btrfsConcat2
const { FILES } = require('test/agent/lib')

const cwd = process.cwd()
const tmptest = path.join(cwd, 'tmptest')

describe(path.basename(__filename), () => {

  beforeEach(async () => {
    await rimrafAsync(tmptest)
    await mkdirpAsync(tmptest)
  })

  it('clone one giga', function (done) {
    this.timeout(0)
    let target = path.join(tmptest, UUID.v4())

    btrfsConcat(target, [FILES.oneGiga.path], err => {
      done(err)
    })
  })

  it('clone one twice (output incorrect)', function (done) {
    this.timeout(0)
    let target = path.join(tmptest, UUID.v4())

    btrfsConcat(target, [FILES.oneGiga.path], err => {
      if (err) return done(err)

      btrfsConcat(target, [FILES.oneGiga.path], err => {
        done(err) 
      })
    })
  })

  it('clone one twice (output)', function (done) {
    this.timeout(0)
    let target = path.join(tmptest, UUID.v4())
    btrfsConcat(target, [FILES.oneGiga.path, FILES.oneGiga.path], done)
  })

  it('clone one twice (newly written)', function (done) {
    this.timeout(0)
    let target = path.join(tmptest, UUID.v4())

    const buf = Buffer.allocUnsafe(1024 * 1024 * 1024)

    let tmpfile = path.join(tmptest, UUID.v4())
    let ws = fs.createWriteStream(tmpfile)
    ws.write(buf)
    ws.end(() => btrfsConcat(target, [FILES.oneGiga.path, tmpfile], err => done(err)))
  })

  it('clone one twice (copied file)', function (done) {
    this.timeout(0)
    let target = path.join(tmptest, UUID.v4())
    let tmpfile = path.join(tmptest, UUID.v4())
    fs.copyFile(FILES.oneGiga.path, tmpfile, err => {
      if (err) return done(err)

      btrfsConcat(target, [FILES.oneGiga.path, tmpfile], err => done(err))
    })
  })
})
